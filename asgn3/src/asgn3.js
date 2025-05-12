// Vertex shader
var VSHADER_SOURCE = 
  'precision mediump float;' + 
  'attribute vec4 a_Position;' + 
  'attribute vec2 a_UV;' + 
  'varying vec2 v_UV;' + 
  'uniform mat4 u_ModelMatrix;' + 
  'uniform mat4 u_GlobalRotateMatrix;' +
  'uniform mat4 u_ViewMatrix;' + 
  'uniform mat4 u_ProjectionMatrix;' + 
  'void main() {' +
  '  gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;' +
  '  v_UV = a_UV;' +
  '}';

// Fragment shader
var FSHADER_SOURCE = 
  'precision mediump float;' + 
  'varying vec2 v_UV;' + 
  'uniform vec4 u_FragColor;' + 
  'uniform sampler2D u_Sampler0;' +  
  'uniform sampler2D u_Sampler1;' +  
  'uniform sampler2D u_Sampler2;' +  
  'uniform int u_whichTexture;' + 
  'void main() {' + 
  '  if (u_whichTexture == -4) {' + 
  '    gl_FragColor = vec4(v_UV, 1.0, 1.0);' + 
  '  } else if (u_whichTexture == -3) {' + 
  '    vec3 color = mix(texture2D(u_Sampler1, v_UV).rgb, u_FragColor.rgb, 0.8);' + 
  '    gl_FragColor = vec4(color, 1.0);' + 
  '  } else if (u_whichTexture == -2) {' + 
  '    gl_FragColor = u_FragColor;' + 
  '  } else if (u_whichTexture == -1) {' + 
  '    vec3 color = mix(texture2D(u_Sampler0, v_UV).rgb, u_FragColor.rgb, 0.7);' + 
  '    gl_FragColor = vec4(color, 1.0);' + 
  '  } else if (u_whichTexture == 0) {' + 
  '    gl_FragColor = texture2D(u_Sampler0, v_UV);' + 
  '  } else if (u_whichTexture == 1) {' + 
  '    gl_FragColor = texture2D(u_Sampler1, v_UV);' + 
  '  } else if (u_whichTexture == 2) {' + 
  '    gl_FragColor = texture2D(u_Sampler2, v_UV);' + 
  '  } else {' + 
  '    gl_FragColor = vec4(1, 0.2, 0.2, 1);' + 
  '  }' +
  '}';


// Global variables
let canvas
let gl
let a_Position
let a_UV
let u_FragColor
let u_Size
let u_ModelMatrix
let u_ProjectionMatrix
let u_ViewMatrix
let u_GlobalRotateMatrix
let u_Sampler0
let u_Sampler1
let u_Sampler2
let u_whichTexture
let u_texColorWeight

let g_camera = new Camera();
let g_cell = null

let oranges = [];
for (let i = 0; i < 20; i++) {
  oranges.push([(Math.random() - 0.5) * 40, (Math.random() * 3) - 1, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 60]);
}

let g_map = [
  [4, 3, 4, 0, 4, 2, 4, 3, 4, 3, 3, 4, 4, 4, 5, 2, 3, 2, 3, 5, 4, 3, 4, 2, 3, 3, 4, 5, 5, 3, 4, 2],
  [3, 4, 4, 3, 4, 4, 4, 4, 1, 2, 3, 3, 4, 3, 3, 3, 1, 5, 3, 4, 3, 3, 1, 1, 4, 4, 4, 3, 3, 2, 3, 4],
  [5, 4, 4, 3, 3, 1, 3, 1, 4, 2, 3, 4, 1, 3, 3, 4, 4, 1, 4, 3, 2, 4, 5, 3, 1, 5, 5, 2, 3, 3, 3, 2],
  [3, 3, 3, 3, 3, 3, 5, 4, 4, 2, 3, 3, 3, 4, 3, 4, 3, 3, 4, 3, 3, 4, 5, 4, 4, 1, 3, 2, 3, 4, 4, 4],
  [3, 5, 4, 3, 0, 3, 3, 3, 4, 2, 4, 4, 3, 2, 3, 2, 5, 3, 3, 3, 4, 5, 1, 3, 3, 4, 3, 3, 3, 4, 4, 3],
  [2, 3, 3, 1, 3, 3, 4, 1, 1, 2, 4, 3, 4, 4, 3, 3, 4, 5, 3, 2, 4, 3, 3, 4, 2, 4, 1, 4, 4, 3, 3, 4],
  [3, 5, 1, 3, 3, 1, 4, 5, 1, 3, 4, 4, 4, 3, 4, 2, 2, 2, 3, 2, 3, 3, 4, 2, 2, 4, 3, 2, 3, 3, 1, 4],
  [3, 3, 4, 3, 3, 3, 2, 3, 3, 3, 1, 5, 3, 4, 3, 2, 3, 4, 1, 4, 2, 4, 4, 3, 1, 5, 3, 4, 1, 2, 3, 2],
  [3, 2, 2, 4, 1, 3, 4, 4, 3, 1, 4, 3, 4, 3, 3, 4, 3, 1, 4, 3, 3, 1, 4, 4, 3, 3, 4, 3, 3, 4, 4, 4],
  [3, 4, 4, 1, 3, 4, 4, 4, 1, 4, 3, 3, 3, 3, 1, 4, 1, 4, 2, 2, 1, 3, 4, 1, 3, 2, 1, 1, 3, 2, 4, 3],
  [3, 2, 4, 3, 3, 3, 4, 4, 4, 3, 4, 3, 4, 3, 3, 2, 4, 2, 4, 3, 2, 2, 2, 4, 3, 3, 3, 3, 3, 2, 4, 3],
  [2, 3, 3, 4, 4, 4, 1, 3, 2, 1, 3, 4, 4, 3, 4, 3, 3, 3, 4, 3, 3, 4, 3, 4, 4, 3, 3, 4, 4, 2, 4, 4],
  [1, 3, 2, 3, 4, 1, 3, 3, 3, 3, 1, 2, 2, 1, 3, 3, 1, 2, 3, 3, 2, 3, 4, 3, 2, 4, 2, 4, 3, 3, 2, 3],
  [4, 2, 4, 3, 4, 3, 4, 3, 3, 2, 3, 3, 1, 3, 3, 3, 3, 3, 2, 2, 2, 3, 4, 3, 1, 3, 3, 4, 4, 2, 3, 3],
  [3, 4, 4, 4, 3, 4, 4, 4, 2, 4, 3, 2, 3, 3, 3, 3, 3, 4, 3, 0, 0, 0, 0, 3, 4, 3, 4, 3, 2, 4, 3, 3],
  [3, 3, 3, 4, 4, 4, 3, 4, 4, 4, 3, 2, 4, 4, 3, 3, 4, 3, 3, 0, 0, 0, 0, 4, 3, 3, 4, 3, 4, 3, 2, 3],
  [4, 3, 3, 3, 3, 3, 2, 3, 4, 3, 2, 3, 3, 3, 4, 2, 2, 3, 2, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 2, 2],
  [3, 3, 2, 3, 4, 2, 3, 3, 4, 3, 3, 3, 4, 2, 4, 3, 3, 4, 2, 0, 0, 0, 0, 3, 3, 3, 3, 4, 4, 3, 3, 3],
  [4, 3, 3, 3, 2, 3, 3, 4, 3, 4, 4, 2, 4, 4, 3, 3, 4, 3, 4, 3, 3, 2, 3, 4, 4, 3, 3, 3, 3, 2, 2, 3],
  [3, 3, 3, 3, 2, 4, 2, 4, 3, 3, 4, 3, 4, 3, 4, 3, 3, 4, 2, 3, 4, 2, 3, 4, 3, 4, 2, 2, 2, 3, 2, 4],
  [2, 3, 3, 2, 3, 4, 3, 2, 3, 3, 3, 2, 3, 3, 4, 3, 3, 3, 3, 4, 4, 3, 4, 3, 4, 3, 3, 4, 4, 3, 2, 3],
  [3, 3, 3, 4, 3, 3, 2, 2, 4, 4, 3, 3, 3, 3, 2, 2, 3, 4, 3, 2, 3, 4, 3, 4, 2, 3, 2, 4, 3, 3, 3, 4],
  [3, 3, 4, 4, 3, 3, 2, 3, 3, 2, 3, 2, 4, 3, 3, 3, 4, 3, 3, 3, 4, 2, 3, 3, 3, 3, 2, 2, 3, 3, 3, 2],
  [2, 2, 2, 4, 2, 3, 3, 3, 4, 3, 3, 4, 3, 2, 3, 3, 3, 4, 2, 3, 4, 3, 3, 2, 2, 3, 3, 3, 4, 4, 2, 3],
  [3, 4, 3, 2, 3, 3, 3, 4, 3, 2, 4, 2, 2, 2, 4, 3, 4, 3, 2, 3, 3, 2, 2, 3, 4, 3, 4, 2, 2, 4, 4, 3],
  [2, 4, 4, 2, 3, 3, 3, 3, 3, 2, 3, 4, 2, 2, 2, 4, 2, 3, 4, 2, 3, 3, 3, 3, 2, 2, 2, 3, 4, 4, 3, 3],
  [3, 2, 2, 3, 3, 2, 3, 3, 4, 2, 3, 3, 2, 2, 4, 2, 3, 3, 3, 3, 3, 4, 2, 3, 2, 3, 2, 3, 4, 3, 4, 3],
  [3, 4, 3, 2, 3, 3, 3, 4, 3, 2, 4, 2, 2, 2, 4, 3, 4, 3, 2, 3, 3, 2, 2, 3, 4, 3, 4, 2, 2, 4, 4, 3],
  [2, 4, 4, 2, 3, 3, 3, 3, 3, 2, 3, 4, 2, 2, 2, 4, 2, 3, 4, 2, 3, 3, 3, 3, 2, 2, 2, 3, 4, 4, 3, 3],
  [3, 2, 2, 3, 3, 2, 3, 3, 4, 2, 3, 3, 2, 2, 4, 2, 3, 3, 3, 3, 3, 4, 2, 3, 2, 3, 2, 3, 4, 3, 4, 3], 
  [3, 2, 2, 3, 3, 2, 3, 3, 4, 2, 3, 3, 2, 2, 4, 2, 3, 3, 3, 3, 3, 4, 2, 3, 2, 3, 2, 3, 4, 3, 4, 3], 
  [3, 2, 2, 3, 3, 2, 3, 3, 4, 2, 3, 3, 2, 2, 4, 2, 3, 3, 3, 3, 3, 4, 2, 3, 2, 3, 2, 3, 4, 3, 4, 3], 
];

// Draw map
const block = new Cube();
function drawMap() {
  for (i=0; i<g_map.length; i++) {
    for (j=0; j<g_map[i].length; j++) {
      for (k=0; k<g_map[i][j]; k++) {
        block.color = [0.5, 0.3, 0.0, 1.0];
        block.matrix.setTranslate(0, 0, 0);
        block.matrix.scale(1.5, 1.5, 1.5);
        block.textureNum = 1;
        if (k == g_map[i][j] - 1) {
          block.textureNum = 2;
        }
        block.matrix.translate(i-16, k-0.5001, j-16);
        block.renderFaster();
      }
    }
  }
}

// Current cell
function getCell(blockScale = 1.5, mapOffset = 16) {
  var eye = g_camera.eye.elements;
  var f = new Vector3().set(g_camera.at).sub(g_camera.eye).normalize();
  const dir = [f.elements[0], f.elements[1], f.elements[2]];

  let mapX = Math.floor(eye[0] / blockScale + mapOffset);
  let mapZ = Math.floor(eye[2] / blockScale + mapOffset);

  const stepX = dir[0] > 0 ? +1 : -1;
  const stepZ = dir[2] > 0 ? +1 : -1;

  const tDeltaX = dir[0] !== 0
    ? Math.abs(blockScale / dir[0])
    : Infinity;
  const tDeltaZ = dir[2] !== 0
    ? Math.abs(blockScale / dir[2])
    : Infinity;

  const worldStartX = (mapX - mapOffset) * blockScale;
  const worldStartZ = (mapZ - mapOffset) * blockScale;
  let tMaxX = dir[0] !== 0
    ? ((worldStartX + (stepX > 0 ? blockScale : 0)) - eye[0]) / dir[0]
    : Infinity;
  let tMaxZ = dir[2] !== 0
    ? ((worldStartZ + (stepZ > 0 ? blockScale : 0)) - eye[2]) / dir[2]
    : Infinity;

  while (mapX >= 0 && mapX < 32 && mapZ >= 0 && mapZ < 32) {
    if (tMaxX < tMaxZ) {
      mapX += stepX;
      tMaxX += tDeltaX;
    } else {
      mapZ += stepZ;
      tMaxZ += tDeltaZ;
    }
    return { x: mapX, z: mapZ };
  }

  return null;
}

function addBlock() {
  if (g_cell) {
    g_map[g_cell.x][g_cell.z] += 1;
  }
}

function deleteBlock() {
  if (g_cell && g_map[g_cell.x][g_cell.z] > 0) {
    g_map[g_cell.x][g_cell.z] -= 1;
  }
}

// RenderScene function
function renderAllShapes() {
  var startTime = performance.now();

  // Pass the projection matrix
  var projMat = new Matrix4();
  projMat.setPerspective(90, 1 * canvas.width / canvas.height, 0.1, 200);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  // Pass the view matrix
  var viewMat = new Matrix4();
  viewMat.setLookAt(
    g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2], 
    g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2], 
    g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]
  );
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  // Pass the matrix to u_GlobalRotateMatrix attribute
  var globalRotMat = new Matrix4();
  // globalRotMat.rotate(g_globalAngleX, 0, 1, 0).rotate(-g_globalAngleY, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear Canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw map
  drawMap();

  // Floor
  var floor = new Cube();
  floor.color = [0.5, 0.8, 0.2, 1.0];
  floor.textureNum = -3;
  floor.matrix.translate(0, -0.75, 0);
  floor.matrix.scale(50, 0, 50);
  floor.matrix.translate(-0.5, 0, -0.5);
  floor.render();

  // Sky
  var sky = new Cube();
  sky.color = [0.0, 0.1, 0.8, 1.0];
  sky.textureNum = -1;
  sky.matrix.scale(50, 50, 50);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.render();

  // Oranges
  oranges.forEach(pos => {
    draworange(pos[0], pos[1], pos[2], pos[3]);
  });

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

  // Update cell
  g_cell = getCell();

  drawCrosshair();

  // Draw
  renderAllShapes();

  // Tell the browser to update again when has time
  requestAnimationFrame(tick);
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

  // document.onkeydown = keydown;
  document.addEventListener("keydown", (ev) => {
    keys.add(ev.keyCode);
    // console.log(ev.keyCode);
    if (ev.keyCode == 69) {
      addBlock();
    } else if (ev.keyCode == 81) {
      deleteBlock();
    }
  });
  document.addEventListener("keyup", (ev) => {
    keys.delete(ev.keyCode);
  });
  
  document.addEventListener('wheel', (ev) => { 
    if (ev.dy < 0) { g_camera.forward(); } else if (ev.dy > 0) { g_camera.backward(); } 
  }, { passive: true });

  document.addEventListener("keydown", (ev) => { 
    if (ev.keycode == 39) { addBlock(); } else if (ev.keycode == 81) { deleteBlock(); } 
  });

  // Textures
  initTextures();
  
  // Clear color for canvas
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  
  // tick
  requestAnimationFrame(updateCamera);
  requestAnimationFrame(tick);
}

let is_dragging = false
let preX = 0
let preY = 0
let dx = 0
let dy = 0

// Last position
function lastPosition(ev) {
  is_dragging = true;
  preX = ev.clientX;
  preY = ev.clientY;
}
// Drag event
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

  renderAllShapes();
}

// Actions for HTML UI
function addActionsForHtmlUI() {
  // Nothing to do here
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

  // Get the storage location of u_whichTexture
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_Size
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // Get the storage location of u_ProjectionMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  // Get the storage location of u_ViewMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  // Get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

  // Get the storage location of u_Sampler1
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  }

  // Get the storage location of u_Sampler2
  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
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
  // Create the image object
  var image0 = new Image();
  if (!image0) {
    console.log('Failed to create the image0 object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image0.onload = function() {sendTextureToGLSL(image0, 0);};
  // Tell the browser to load an image
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

// Oranges
const cube = new Cube();
const sphere = new Sphere();

function draworange(x, y, z, angle) {
  sphere.color = [0.9, 0.36, 0.1, 1];
  sphere.textureNum = -2;
  sphere.matrix.setTranslate(0.275, 0.5, 0.15);
  sphere.matrix.translate(x, y, z);
  sphere.matrix.scale(0.5, 0.45, 0.5);
  sphere.renderFaster();
  cube.color = [0.2, 0.7, 0.1, 1];
  cube.matrix.setTranslate(0.27, 0.9, 0.15);
  cube.matrix.translate(x, y, z);
  cube.matrix.rotate(angle, 0, 0, 1);
  cube.matrix.scale(0.08, 0.2, 0.08);
  cube.renderFaster();
}

// Crosshair
const crosshair = document.getElementById("crosshair");
const ctx = crosshair.getContext("2d");
crosshair.width = window.innerWidth;
crosshair.height = window.innerHeight;

function drawCrosshair() {
  const x = canvas.width / 2;
  const y = canvas.height / 2;
  ctx.clearRect(0, 0, crosshair.width, crosshair.height);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 5, y);
  ctx.lineTo(x + 5, y);
  ctx.moveTo(x, y - 5);
  ctx.lineTo(x, y + 5);
  ctx.stroke();
}
