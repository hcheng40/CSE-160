// Vertex shader
var VSHADER_SOURCE = `
  precision mediump float; 
  attribute vec4 a_Position; 
  attribute vec2 a_UV; 
  attribute vec3 a_Normal; 
  varying vec2 v_UV; 
  varying vec3 v_Normal; 
  varying vec4 v_VertPos; 
  uniform mat4 u_ModelMatrix; 
  uniform mat4 u_NormalMatrix; 
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix; 
  uniform mat4 u_ProjectionMatrix; 

  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = normalize((u_NormalMatrix * vec4(a_Normal, 0.0)).xyz);
    v_VertPos = u_ModelMatrix * a_Position;
  }`;

// Fragment shader
var FSHADER_SOURCE = `
  precision mediump float; 
  varying vec2 v_UV; 
  varying vec3 v_Normal; 
  uniform vec4 u_FragColor; 
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform int u_whichTexture; 
  uniform vec3 u_lightPos;
  uniform vec3 u_cameraPos;
  varying vec4 v_VertPos; 
  uniform bool u_lightOn; 
  uniform bool u_spotlightOn; 
  uniform float u_ka; 
  uniform float u_kd; 
  uniform float u_ks;

  uniform vec3 u_spotPos;
  uniform vec3 u_spotDir;
  uniform float u_spotCosCutoff;
  uniform float u_spotExp;

  void main() { 
    if (u_whichTexture == -3) { 
      gl_FragColor = vec4((v_Normal + 1.0) / 2.0, 1.0); 
    } else if (u_whichTexture == -1) { 
      vec3 color = mix(texture2D(u_Sampler0, v_UV).rgb, u_FragColor.rgb, 0.7); 
      gl_FragColor = vec4(color, 1.0); 
    } else if (u_whichTexture == 0) { 
      gl_FragColor = texture2D(u_Sampler0, v_UV); 
    } else if (u_whichTexture == 1) { 
      gl_FragColor = texture2D(u_Sampler1, v_UV); 
    } else if (u_whichTexture == 2) { 
      gl_FragColor = texture2D(u_Sampler2, v_UV); 
    } else { 
      gl_FragColor = u_FragColor; 
    }

    vec4 baseColor = gl_FragColor;
    vec3 finalColor = vec3(baseColor);

    if (u_lightOn) {
      vec3 L = normalize(u_lightPos - vec3(v_VertPos));
      vec3 N = normalize(v_Normal);
      float nDotL = max(dot(L, N), 0.0);
      vec3 R = reflect(-L, N);
      vec3 E = normalize(u_cameraPos - vec3(v_VertPos));
      float specular = pow(max(dot(E, R), 0.0), 50.0) * u_ks;
      vec3 diffuse = vec3(baseColor) * nDotL * u_kd;
      vec3 ambient = vec3(baseColor) * u_ka;
      
      finalColor = vec3(diffuse + ambient + vec3(specular));
    }

    if (u_spotlightOn) {
      vec3 spotL = normalize(u_spotPos - vec3(v_VertPos));
      vec3 spotN = normalize(v_Normal);
      float spotnDotL = max(dot(spotL, spotN), 0.0);
      vec3 spotDir = normalize(u_spotDir);
      float spotCos = dot(-spotL, spotDir);
      
      float spotFactor = 0.0;
      if (spotCos >= u_spotCosCutoff) {
        spotFactor = pow(spotCos, u_spotExp);
      }
      
      if (spotnDotL > 0.0 && spotFactor > 0.0) {
        vec3 spotR = reflect(-spotL, spotN);
        vec3 spotE = normalize(u_cameraPos - vec3(v_VertPos));
        float spotspecular = pow(max(dot(spotE, spotR), 0.0), 50.0) * u_ks;
        vec3 spotdiffuse = vec3(baseColor) * spotnDotL * u_kd;
        vec3 spotambient = vec3(baseColor) * u_ka;
        
        finalColor += (spotdiffuse + spotambient + vec3(spotspecular)) * spotFactor;
      }
    }

    gl_FragColor = vec4(finalColor, baseColor.a);
  }`;


// Global variables
let canvas
let gl
let a_Position
let a_UV
let u_FragColor
let u_Size
let u_ModelMatrix
let u_NormalMatrix
let u_ProjectionMatrix
let u_ViewMatrix
let u_GlobalRotateMatrix
let u_Sampler0
let u_Sampler1
let u_Sampler2
let u_whichTexture
let u_texColorWeight
let u_lightPos
let u_cameraPos
let u_lightOn
let u_spotlightOn
let u_ka
let u_kd
let u_ks
let u_spotPos
let u_spotDir
let u_spotCosCutoff
let u_spotExp

let g_globalAngleX = 0
let g_globalAngleY = 0
let g_lightPos = [0, 1, -2]
let g_normalOn = false
let g_lightOn = false
let g_lightMovingOn = false
let g_spotlightOn = false
let g_spotlightPos = [-5, 8, 2]
let g_spotDir = [0.5, -1, -0.3]
let g_ka = 0.3
let g_kd = 0.7
let g_ks = 1.0
let g_showCapybara = false
let g_camera = new Camera();

let g_map = [
  [1, 0, 0, 0, 0, 0, 0, 0],
  [2, 0, 0, 0, 0, 0, 0, 0],
  [2, 0, 0, 0, 0, 0, 0, 0],
  [2, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0],
  [2, 2, 2, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
]

// Draw map
function drawMap() {
  for (i=0; i<g_map.length; i++) {
    for (j=0; j<g_map[i].length; j++) {
      for (k=0; k<g_map[i][j]; k++) {
        const block = new Cube();
        block.matrix.translate(-7, 0, -5);
        block.matrix.scale(2, 2, 2);
        block.textureNum = 1;
        if (k == g_map[i][j] - 1) block.textureNum = 2;
        if (g_normalOn) block.textureNum = -3;
        block.matrix.translate(i-0.5, k-0.25001, j-0.5);
        block.render();
      }
    }
  }
}

// RenderScene function
function renderAllShapes() {
  var startTime = performance.now();

  // Pass the projection matrix
  var projMat = new Matrix4();
  projMat.setPerspective(90, 1 * canvas.width / canvas.height, 0.1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  // Pass the view matrix
  var viewMat = new Matrix4();
  viewMat.setLookAt(
    g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2], 
    g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2], 
    g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]
  );
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  // Pass the matrix to u_ModelMatrix attribute
  var globalRotMat = new Matrix4();
  globalRotMat.rotate(g_globalAngleX, 0, 1, 0).rotate(-g_globalAngleY, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  
  // Clear Canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  gl.uniform3f(u_cameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);
  gl.uniform1i(u_lightOn, g_lightOn);
  gl.uniform1f(u_ka, g_ka);
  gl.uniform1f(u_kd, g_kd);
  gl.uniform1f(u_ks, g_ks);
  gl.uniform1i(u_spotlightOn, g_spotlightOn);
  gl.uniform3f(u_spotPos, g_spotlightPos[0], g_spotlightPos[1], g_spotlightPos[2]);
  const dirD = Math.sqrt(g_spotDir[0]*g_spotDir[0] + g_spotDir[1]*g_spotDir[1] + g_spotDir[2]*g_spotDir[2]);
  gl.uniform3f(u_spotDir, g_spotDir[0]/dirD, g_spotDir[1]/dirD, g_spotDir[2]/dirD);
  gl.uniform1f(u_spotCosCutoff, Math.cos(10  *Math.PI / 180));
  gl.uniform1f(u_spotExp, 20.0);

  // Sky
  const sky = new Cube();
  sky.color = [0.0, 0.1, 0.8, 1.0];
  sky.textureNum = -1;
  if (g_normalOn) sky.textureNum = -3;
  sky.matrix.scale(20, 20, 20);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.render();

  // Floor
  const floor = new Cube();
  floor.color = [0.5, 0.75, 0.2, 1.0];
  floor.textureNum = -2;
  if (g_normalOn) floor.textureNum = -3;
  floor.matrix.translate(0, -0.5, 0);
  floor.matrix.scale(20, 0.01, 20);
  floor.matrix.translate(-0.5, 0, -0.5);
  floor.render();

  // Light
  if (g_lightOn) {
    const light = new Cube();
    light.color = [2, 2, 0, 1];
    if (g_normalOn) light.textureNum = -3;
    light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    light.matrix.scale(-0.2, -0.2, -0.2);
    light.matrix.translate(-0.5, -0.5, -0.5);
    light.render();
  }

  // Spotlight
  if (g_spotlightOn) {
    const spotlight = new Cube();
    spotlight.color = [2, 2, 0, 1];
    if (g_normalOn) spotlight.textureNum = -3;
    spotlight.matrix.translate(g_spotlightPos[0], g_spotlightPos[1], g_spotlightPos[2]);
    spotlight.matrix.scale(-0.3, -0.3, -0.3);
    spotlight.render();
  }

  // Ball
  const ball = new Sphere();
  ball.color = [0.8, 0.2, 0.2, 1.0];
  if (g_normalOn) ball.textureNum = -3;
  ball.matrix.translate(-1, 0.5, -1);
  ball.render();

  // Map
  drawMap();

  // Capybara
  if (g_showCapybara) {
    capybara(-2, 0, -3, 180);
    capybara(5, 0, -2, 190);
  }

  // FPS
  var duration = performance.now() - startTime;
  sendTextToHtml(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration));
}

let g_startTime = performance.now()/1000.0;
let g_seconds = performance.now()/1000.0 - g_startTime;

// tick function called by browser repeatedly whenever its time
function tick() {
  g_seconds = performance.now()/1000.0 - g_startTime;
  
  // Update camera
  updateCamera();

  // Update light position
  updateLight();

  // Draw
  renderAllShapes();

  // Tell the browser to update again when has time
  requestAnimationFrame(tick);
}

function updateLight() {
  if (!g_lightMovingOn) return;
  g_lightPos[0] = Math.cos(g_seconds * 0.5) * 8;
  g_lightPos[2] = Math.sin(g_seconds * 0.5) * 8;
}

// Main
function main() {
  // Setup
  setupWebGL();

  // Connect variables to GLSL
  connectVariablesToGLSL();

  // HTML UI
  addActionsForHtmlUI();
  
  // Call function to draw when mouse click
  canvas.onmousedown = function(ev) { if (ev.buttons == 1) { lastPosition(ev); } };
  canvas.onmouseup = function() { is_dragging = false; };
  canvas.onmousemove = function(ev) { if (ev.buttons == 1) drag(ev); };

  document.addEventListener("keydown", (ev) => {
    keys.add(ev.keyCode);
    // console.log(ev.keyCode);
  });
  document.addEventListener("keyup", (ev) => {
    keys.delete(ev.keyCode);
  });
  
  document.addEventListener('wheel', (ev) => { 
    if (ev.dy < 0) { g_camera.forward(); } else if (ev.dy > 0) { g_camera.backward(); } 
  }, { passive: true });

  // Texture
  initTextures();

  // Clear color for canvas
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // tick
  requestAnimationFrame(tick);
}

let is_dragging = false
let preX = 0
let preY = 0
let dx = 0
let dy = 0

function lastPosition(ev) {
  is_dragging = true;
  preX = ev.clientX;
  preY = ev.clientY;
}
function drag(ev) {
  if (!is_dragging) return;
  dx = ev.clientX - preX;
  dy = ev.clientY - preY;
  preX = ev.clientX;
  preY = ev.clientY;
}

const keys = new Set();

// Key event
function updateCamera() {
  if (keys.has(87)) { // W
    g_camera.forward();
  }
  if (keys.has(83)) { // S
    g_camera.backward();
  }
  if (keys.has(65)) { // A
    g_camera.left();
  }
  if (keys.has(68)) { // D
    g_camera.right();
  }
  if (keys.has(37)) { // Left arrow
    g_camera.panLeft();
  }
  if (keys.has(39)) { // Right arrow
    g_camera.panRight();
  }
  if (keys.has(38)) { // Up arrow
    g_camera.panUp();
  }
  if (keys.has(40)) { // Down arrow
    g_camera.panDown();
  }

  if (is_dragging) {
    if (dx > 0) {
      g_camera.panRight();
    }
    else if (dx < 0) {
      g_camera.panLeft();
    }
    if (dy > 0) {
      g_camera.panDown();
    }
    else if (dy < 0) {
      g_camera.panUp();
    }
  }
  dx = 0;
  dy = 0;
}

// Actions for HTML UI
function addActionsForHtmlUI() {
  // Buttons
  document.getElementById('normalOn').onclick = function() {g_normalOn = true;};
  document.getElementById('normalOff').onclick = function() {g_normalOn = false;};
  document.getElementById('lightOn').onclick = function() {g_lightOn = true;};
  document.getElementById('lightOff').onclick = function() {g_lightOn = false;};
  document.getElementById('lightMovingOn').onclick = function() {g_lightMovingOn = true;};
  document.getElementById('lightMovingOff').onclick = function() {g_lightMovingOn = false;};
  document.getElementById('spotlightOn').onclick = function() {g_spotlightOn = true;};
  document.getElementById('spotlightOff').onclick = function() {g_spotlightOn = false;};
  document.getElementById('showCapybara').onclick = function() {g_showCapybara = !g_showCapybara;};
  
  // Angle sliders
  document.getElementById('lightXSlider').addEventListener('input', function() {g_lightPos[0] = this.value / 100;});
  document.getElementById('lightYSlider').addEventListener('input', function() {g_lightPos[1] = this.value / 100;});
  document.getElementById('lightZSlider').addEventListener('input', function() {g_lightPos[2] = this.value / 100;});
  document.getElementById('ambientSlider').addEventListener('input', function() {g_ka = this.value;});
  document.getElementById('diffuseSlider').addEventListener('input', function() {g_kd = this.value;});
  document.getElementById('specularSlider').addEventListener('input', function() {g_ks = this.value;});
  document.getElementById('angleSlider').addEventListener('input', function() {g_globalAngleX = this.value;});
}


// Setup WebGL
function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

// Connect variables to GLSL
function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }

  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }
  
  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
    console.log('Failed to get the storage location of u_lightPos');
    return;
  }

  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) {
    console.log('Failed to get the storage location of u_cameraPos');
    return;
  }

  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
    console.log('Failed to get the storage location of u_lightOn');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if (!u_NormalMatrix) {
    console.log('Failed to get the storage location of u_NormalMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  }

  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
    return false;
  }

  u_ka = gl.getUniformLocation(gl.program, 'u_ka');
  if (!u_ka) {
    console.log('Failed to get the storage location of u_ka');
    return false;
  }

  u_kd = gl.getUniformLocation(gl.program, 'u_kd');
  if (!u_kd) {
    console.log('Failed to get the storage location of u_kd');
    return false;
  }

  u_ks = gl.getUniformLocation(gl.program, 'u_ks');
  if (!u_ks) {
    console.log('Failed to get the storage location of u_ks');
    return false;
  }

  u_spotPos = gl.getUniformLocation(gl.program, 'u_spotPos');
  if (!u_spotPos) {
    console.log('Failed to get the storage location of u_spotPos');
    return false;
  }

  u_spotlightOn = gl.getUniformLocation(gl.program, 'u_spotlightOn');
  if (!u_spotlightOn) {
    console.log('Failed to get the storage location of u_spotlightOn');
    return false;
  }

  u_spotDir = gl.getUniformLocation(gl.program, 'u_spotDir');
  if (!u_spotDir) {
    console.log('Failed to get the storage location of u_spotDir');
    return false;
  }

  u_spotCosCutoff = gl.getUniformLocation(gl.program, 'u_spotCosCutoff');
  if (!u_spotCosCutoff) {
    console.log('Failed to get the storage location of u_spotCosCutoff');
    return false;
  }

  u_spotExp = gl.getUniformLocation(gl.program, 'u_spotExp');
  if (!u_spotExp) {
    console.log('Failed to get the storage location of u_spotExp');
    return false;
  }

  // Set an initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Send text function
function sendTextToHtml(text, htmlID) {
  var htmlEle = document.getElementById('htmlID');
  if(!htmlEle) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlEle.innerHTML = text;
}

function initTextures() {
  var image0 = new Image();
  if (!image0) {
    console.log('Failed to create the image0 object');
    return false;
  }
  image0.onload = function() {sendTextureToGLSL(image0, 0);};
  image0.src = '../assets/sky.jpg';

  var image1 = new Image();
  if (!image1) {
    console.log('Failed to create the image1 object');
    return false;
  }
  image1.onload = function() {sendTextureToGLSL(image1, 1);};
  image1.src = '../assets/dirt.jpg';

  var image2 = new Image();
  if (!image2) {
    console.log('Failed to create the image2 object');
    return false;
  }
  image2.onload = function() {sendTextureToGLSL(image2, 2);};
  image2.src = '../assets/grass.png';

  return true;
}

function sendTextureToGLSL(image, n) {
  // Create a texture object
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  // Flip the image's y axis
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  // Enable texture unit n
  if (n == 0) {
    gl.activeTexture(gl.TEXTURE0);
  } else if (n == 1) {
    gl.activeTexture(gl.TEXTURE1);
  } else if (n == 2) {
    gl.activeTexture(gl.TEXTURE2);
  }
  // Bind the texxture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit n to the sampler
  if (n == 0) {
    gl.uniform1i(u_Sampler0, 0);
  } else if (n == 1) {
    gl.uniform1i(u_Sampler1, 1);
  } else if (n == 2) {
    gl.uniform1i(u_Sampler2, 2);
  }

  // console.log('finished sendTextureToGLSL');
}

function capybara(offsetX = 0, offsetY = 0, offsetZ = 0, rotation = 0) {
  const body = new Cube();
  body.color = [0.75, 0.4, 0.13, 1];
  body.matrix.rotate(rotation, 0, 1, 0);
  body.matrix.translate(-0.3 + offsetX, -0.25 + offsetY, 0.0 + offsetZ);
  body.matrix.scale(0.6, 0.5, 0.8);
  if (g_normalOn) body.textureNum = -3;
  body.render();

  const neck = new Cube();
  neck.color = [0.75, 0.4, 0.13, 1];
  neck.matrix.rotate(rotation, 0, 1, 0);
  neck.matrix.translate(-0.225 + offsetX, 0 + offsetY, -0.111 + offsetZ);
  neck.matrix.scale(0.45, 0.25, 0.111);
  if (g_normalOn) neck.textureNum = -3;
  neck.render();

  const headX = -0.225 + offsetX, headY = -0.07 + offsetY, headZ = -0.45 + offsetZ;
  const head = new Cube();
  head.color = [0.75, 0.4, 0.13, 1];
  head.matrix.rotate(rotation, 0, 1, 0);
  head.matrix.translate(headX, headY, headZ);
  head.matrix.scale(0.45, 0.4, 0.55);
  if (g_normalOn) head.textureNum = -3;
  head.render();
  
  const nose = new Cube();
  nose.color = [0.55, 0.2, 0.05, 1];
  nose.matrix.rotate(rotation, 0, 1, 0);
  nose.matrix.translate(headX + 0.1, headY + 0.05, headZ - 0.025);
  nose.matrix.scale(0.25, 0.2, 0.05);
  if (g_normalOn) nose.textureNum = -3;
  nose.render();

  const nostril1 = new Cube();
  nostril1.color = [0, 0, 0, 1];
  nostril1.matrix.rotate(rotation, 0, 1, 0);
  nostril1.matrix.translate(headX + 0.15, headY + 0.15, headZ - 0.028);
  nostril1.matrix.scale(0.03, 0.04, 0.01);
  if (g_normalOn) nostril1.textureNum = -3;
  nostril1.render();
  const nostril2 = new Cube();
  nostril2.color = [0, 0, 0, 1];
  nostril2.matrix.rotate(rotation, 0, 1, 0);
  nostril2.matrix.translate(headX + 0.25, headY + 0.15, headZ - 0.028);
  nostril2.matrix.scale(0.03, 0.04, 0.01);
  if (g_normalOn) nostril2.textureNum = -3;
  nostril2.render();

  const ear = new Sphere();
  ear.color = [0.55, 0.2, 0.05, 1];
  ear.matrix.rotate(rotation, 0, 1, 0);
  ear.matrix.translate(headX + 0.08, headY + 0.48, headZ + 0.4);
  ear.matrix.scale(0.08, 0.1, 0.06);
  if (g_normalOn) ear.textureNum = -3;
  ear.render();
  ear.matrix = new Matrix4();
  ear.matrix.rotate(rotation, 0, 1, 0);
  ear.matrix.translate(headX + 0.32, headY + 0.48, headZ + 0.4);
  ear.matrix.scale(0.08, 0.1, 0.06);
  ear.render();

  const eye = new Sphere();
  eye.color = [0, 0, 0, 1];
  eye.matrix.rotate(rotation, 0, 1, 0);
  eye.matrix.translate(headX - 0.0, headY + 0.28, headZ + 0.25);
  eye.matrix.scale(0.02, 0.05, 0.05);
  if (g_normalOn) eye.textureNum = -3;
  eye.render();
  eye.matrix = new Matrix4();
  eye.matrix.rotate(rotation, 0, 1, 0);
  eye.matrix.translate(headX + 0.45, headY + 0.28, headZ + 0.25);
  eye.matrix.scale(0.02, 0.05, 0.05);
  eye.render();

  const leg = new Cube();
  leg.color = [0.55, 0.2, 0.05, 1];
  if (g_normalOn) leg.textureNum = -3;
  const legPositions = [
    [-0.25 + offsetX, -0.65 + offsetY, 0.05 + offsetZ],
    [0.13 + offsetX, -0.65 + offsetY, 0.05 + offsetZ],
    [-0.25 + offsetX, -0.65 + offsetY, 0.6 + offsetZ],
    [0.13 + offsetX, -0.65 + offsetY, 0.6 + offsetZ]
  ];
  legPositions.forEach(pos => {
    leg.matrix = new Matrix4();
    leg.matrix.rotate(rotation, 0, 1, 0);
    leg.matrix.translate(pos[0], pos[1], pos[2]);
    leg.matrix.scale(0.13, 0.4, 0.13);
    leg.render();
  });

  const tail = new Sphere();
  tail.color = [0.55, 0.2, 0.05, 1];
  tail.matrix.rotate(rotation, 0, 1, 0);
  tail.matrix.translate(0 + offsetX, 0.25 + offsetY, 0.85 + offsetZ);
  tail.matrix.scale(0.1, 0.1, 0.1);
  if (g_normalOn) tail.textureNum = -3;
  tail.render();
}

function initVertexBuffers(buffer) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
}
function initUVBuffers(uvBuffer) {
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_UV);
}
function initNormalBuffers(normalBuffer) {
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Normal);
}