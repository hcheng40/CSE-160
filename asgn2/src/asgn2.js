// Vertex shader
var VSHADER_SOURCE = 
  'attribute vec4 a_Position;' + 
  'uniform mat4 u_ModelMatrix;' + 
  'uniform mat4 u_GlobalRotateMatrix;' +
  'void main() {' +
  '  gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;' +
  '}';

// Fragment shader
var FSHADER_SOURCE = 
  'precision mediump float;' + 
  'uniform vec4 u_FragColor;' + 
  'void main() {' + 
  '  gl_FragColor = u_FragColor;' + 
  '}';


// Global variables
let canvas
let gl
let a_Position
let u_FragColor
let u_Size
let u_ModelMatrix
let u_GlobalRotateMatrix

let g_globalAngleX = 0
let g_globalAngleY = 0
let g_headAngleX = 0
let g_headAngleY = 0
let g_earAngle = 0
let g_leg1Angle = 0
let g_leg2Angle = 0
let g_leg3Angle = 0
let g_leg4Angle = 0
let g_tailAngle = 0
let g_orangeAngle = 0
let g_tongueAngle = 0
let g_eyelidAngle = 0

let g_headXAnimation = false
let g_headYAnimation = false
let g_earAnimation = false
let g_leg1Animation = false
let g_leg2Animation = false
let g_leg3Animation = false
let g_leg4Animation = false
let g_tailAnimation = false
let g_orangeAnimation = false

let shiftKey = false


// RenderScene function
function renderAllShapes() {
  var startTime = performance.now();

  // Pass the matrix to u_ModelMatrix attribute
  var globalRotMat = new Matrix4().rotate(g_globalAngleX, 0, 1, 0).rotate(-g_globalAngleY, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear Canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Body
  var body = new Cube();
  body.color = [0.75, 0.4, 0.13, 1];
  body.matrix.translate(-0.3, 0, 0.0);
  body.matrix.scale(0.6, 0.5, 0.8);
  body.render();

  // Neck
  var neck = new Cube();
  neck.color = [0.75, 0.4, 0.13, 1];
  neck.matrix.rotate(-g_headAngleX, 0, 0, 1);
  neck.matrix.translate(-0.225, 0.25, -0.111);
  neck.matrix.scale(0.45, 0.25, 0.111);
  neck.render();

  // Head
  var head = new Cube();
  head.color = [0.75, 0.4, 0.13, 1];
  head.matrix.rotate(-g_headAngleX, 0, 0, 1);
  head.matrix.rotate(g_headAngleY, 1, 0, 0);
  head.matrix.translate(-0.225, 0.18, -0.45);
  var headNoseMat = new Matrix4(head.matrix);
  var headEarLMat = new Matrix4(head.matrix);
  var headEarRMat = new Matrix4(head.matrix);
  var headEyeMat = new Matrix4(head.matrix);
  var headOrangeMat = new Matrix4(head.matrix);
  var headTongueMat = new Matrix4(head.matrix);
  var headEyelidLMat = new Matrix4(head.matrix);
  var headEyelidRMat = new Matrix4(head.matrix);
  head.matrix.scale(0.45, 0.4, 0.55);
  head.render();
  
  // Nose
  var nose = new Cube();
  nose.color = [0.55, 0.2, 0.05, 1];
  nose.matrix = headNoseMat;
  nose.matrix.translate(0.09, 0.03, -0.02);
  nose.matrix.scale(0.6, 0.6, 0.1);
  nose.matrix.scale(0.45, 0.4, 0.6);
  nose.render();
  var nose2 = new Cube();
  nose2.color = [0, 0, 0, 1];
  nose2.matrix = headNoseMat;
  nose2.matrix.translate(0.45, 0.12, -0.0251);
  nose2.matrix.scale(0.1, 0.5, 0.1);
  var headNose2Mat = new Matrix4(nose2.matrix);
  nose2.render();
  var nose3 = new Cube();
  nose3.color = [0, 0, 0, 1];
  nose3.matrix = headNoseMat;
  nose3.matrix.translate(1, 0.8, -0.01);
  nose3.matrix.rotate(10, 0, 0, 1);
  nose3.matrix.scale(2.5, 0.3, 0.1);
  nose3.render();
  var nose4 = new Cube();
  nose4.color = [0, 0, 0, 1];
  nose4.matrix = headNose2Mat;
  nose4.matrix.translate(-2.5, 1.2, -0.01);
  nose4.matrix.rotate(-10, 0, 0, 1);
  nose4.matrix.scale(2.5, 0.3, 0.1);
  nose4.render();

  // Left Ear
  var earL = new Sphere();
  earL.color = [0.55, 0.2, 0.05, 1];
  earL.matrix = headEarLMat;
  earL.matrix.translate(0.08, 0.38, 0.45);
  earL.matrix.rotate(g_earAngle, 0, 0, 1);
  earL.matrix.translate(0, 0.1, 0);
  earL.matrix.scale(0.08, 0.1, 0.06);
  earL.render();
  // Right Ear
  var earR = new Sphere();
  earR.color = [0.55, 0.2, 0.05, 1]
  earR.matrix = headEarRMat;
  earR.matrix.translate(0.37, 0.38, 0.45);
  earR.matrix.rotate(g_earAngle, 0, 0, 1);
  earR.matrix.translate(0, 0.1, 0);
  earR.matrix.scale(0.08, 0.1, 0.06);
  earR.render();

  // Left Eye
  var eyeL = new Sphere();
  eyeL.color = [0, 0, 0, 1];
  eyeL.matrix = headEyeMat;
  eyeL.matrix.translate(0, 0.27, 0.2);
  eyeL.matrix.scale(0.02, 0.05, 0.05);
  eyeL.render();
  // Right Eye
  var eyeR = new Sphere();
  eyeR.color = [0, 0, 0, 1];
  eyeR.matrix = headEyeMat;
  eyeR.matrix.translate(22.5, 0, 0);
  eyeR.render();

  // Legs (1 ~ 4)
  var legPos = [[-0.25, -0.25, 0.05], [0.13, -0.25, 0.05], [-0.25, -0.25, 0.6], [0.13, -0.25, 0.6]];
  var legAngles = [g_leg1Angle, g_leg2Angle, g_leg3Angle, g_leg4Angle];
  for (var i = 0; i < legPos.length; i++) {
    var leg = new Cube();
    leg.color = [0.55, 0.2, 0.05, 1];
    leg.matrix.translate(legPos[i][0], legPos[i][1], legPos[i][2]);
    leg.matrix.scale(1, -1, 1);
    leg.matrix.translate(0, -0.4, 0);
    leg.matrix.rotate(legAngles[i], 1, 0, 0);
    leg.matrix.scale(0.13, 0.4, 0.13);
    leg.render();
  };

  // Tail
  var tail = new Sphere();
  tail.color = [0.55, 0.2, 0.05, 1];
  tail.matrix.translate(0, 0.55, 0.85);
  tail.matrix.rotate(g_tailAngle, 0, 0, 1);
  tail.matrix.translate(0, -0.1, 0);
  tail.matrix.scale(0.1, 0.1, 0.1);
  tail.render();

  // Orange
  var orange = new Sphere();
  orange.color = [1, 0.36, 0.1, 1];
  orange.matrix = headOrangeMat;
  orange.matrix.translate(0.225, 0.5, 0.15);
  orange.matrix.rotate(g_orangeAngle, 0, 1, 0);
  orange.matrix.translate(0.05, 0, 0);
  var orangeeMat = new Matrix4(orange.matrix);
  orange.matrix.scale(0.13, 0.12, 0.13);
  orange.render();
  var orangee = new Cube();
  orangee.color = [0.2, 0.7, 0.1, 1];
  orangee.matrix = orangeeMat;
  orangee.matrix.translate(-0.04, 0.05, 0);
  orangee.matrix.rotate(-30, 0, 0, 1);
  orangee.matrix.scale(0.03, 0.15, 0.03);
  orangee.render();

  // Tongue
  var tongue = new Cube();
  tongue.color = [1, 0.25, 0.3, 1];
  tongue.matrix = headTongueMat;
  tongue.matrix.translate(0.175, 0.08, 0);
  tongue.matrix.rotate(-100, 1, 0, 0);
  tongue.matrix.rotate(90, 0, 1, 0);
  tongue.matrix.rotate(g_tongueAngle, 0, 0, 1);
  tongue.matrix.scale(0.04, 0.175, 0.1);
  if (shiftKey) {
    tongue.render();
  }

  // Eyelid
  var eyelidL = new Cube();
  eyelidL.color = [0.75, 0.4, 0.13, 1];
  eyelidL.matrix = headEyelidLMat;
  eyelidL.matrix.translate(-0.02, 0.32, 0.15);
  eyelidL.matrix.scale(0.02, 0.05, 0.1);
  eyelidL.matrix.scale(1, g_eyelidAngle, 1);
  eyelidL.render();
  var eyelidR = new Cube();
  eyelidR.color = [0.75, 0.4, 0.13, 1];
  eyelidR.matrix = headEyelidRMat;
  eyelidR.matrix.translate(0.45, 0.32, 0.15);
  eyelidR.matrix.scale(0.02, 0.05, 0.1);
  eyelidR.matrix.scale(1, g_eyelidAngle, 1);
  eyelidR.render();


  // FPS
  var duration = performance.now() - startTime;
  sendTextToHtml(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration));
}

// Update animationo angles function
function updateAnimationAngles() {
  if (g_headXAnimation) {
    g_headAngleX = 15 * Math.sin(g_seconds);
  }
  if (g_headYAnimation) {
    g_headAngleY = 25 * Math.sin(g_seconds * 1.5);
  }
  if (g_earAnimation) {
    g_earAngle = 45 * Math.sin(g_seconds * 1.4);
  }
  if (g_leg1Animation) {
    g_leg1Angle = 40 * Math.sin(g_seconds * 1.3) - 15;
  }
  if (g_leg2Animation) {
    g_leg2Angle = 40 * Math.sin((g_seconds + Math.PI / 2) * 1.3) - 15;
  }
  if (g_leg3Animation) {
    g_leg3Angle = 45 * Math.sin((g_seconds + Math.PI / 3 * 2) * 1.3);
  }
  if (g_leg4Animation) {
    g_leg4Angle = 45 * Math.sin((g_seconds + Math.PI / 2 * 3) * 1.3);
  }
  if (g_tailAnimation) {
    g_tailAngle = 90 * Math.sin(g_seconds * 1.3);
  }
  if (g_orangeAnimation) {
    g_orangeAngle = 150 * g_seconds;
  }
  if (shiftKey) { 
    g_tongueAngle = 45 * Math.sin(g_seconds * 1.3);
    g_eyelidAngle = -1.5 * Math.sin(g_seconds * 1.2);
  }
}

let g_startTime = performance.now()/1000.0;
let g_seconds = performance.now()/1000.0 - g_startTime;

// tick function called by browser repeatedly whenever its time
function tick() {
  g_seconds = performance.now()/1000.0 - g_startTime;
  
  // Update animation angles
  updateAnimationAngles();

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
  canvas.onmousedown = function(ev) { if (ev.shiftKey == 1 && ev.buttons == 1) { shiftClick(ev); } else { lastPosition(ev); } };
  canvas.onmouseup = function() { is_dragging = false; };
  canvas.onmousemove = function(ev) { if (ev.buttons == 1) drag(ev); };

  // Clear color for canvas
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // tick
  requestAnimationFrame(tick);
}

let is_dragging = false
let preX = 0
let preY = 0

// Last position
function lastPosition(ev) {
  is_dragging = true;
  preX = ev.clientX;
  preY = ev.clientY;
}

// Drag event
function drag(ev) {
  if (!is_dragging) return;
  g_globalAngleX = (g_globalAngleX - (ev.clientX - preX) / 2) % 360;
  g_globalAngleY = (g_globalAngleY - (ev.clientY - preY) / 2) % 360;
  preX = ev.clientX;
  preY = ev.clientY;
}

// Shift click event
function shiftClick(ev) {
  shiftKey = !shiftKey;
}


// Actions for HTML UI
function addActionsForHtmlUI() {
  // Animation buttons
  document.getElementById('animationHeadXOnButton').onclick = function() {g_headXAnimation = true;};
  document.getElementById('animationHeadXOffButton').onclick = function() {g_headXAnimation = false;};
  document.getElementById('animationHeadYOnButton').onclick = function() {g_headYAnimation = true;};
  document.getElementById('animationHeadYOffButton').onclick = function() {g_headYAnimation = false;};

  document.getElementById('animationEarOnButton').onclick = function() {g_earAnimation = true;};
  document.getElementById('animationEarOffButton').onclick = function() {g_earAnimation = false;};

  document.getElementById('animationLeg1OnButton').onclick = function() {g_leg1Animation = true;};
  document.getElementById('animationLeg1OffButton').onclick = function() {g_leg1Animation = false;};
  document.getElementById('animationLeg2OnButton').onclick = function() {g_leg2Animation = true;};
  document.getElementById('animationLeg2OffButton').onclick = function() {g_leg2Animation = false;};
  document.getElementById('animationLeg3OnButton').onclick = function() {g_leg3Animation = true;};
  document.getElementById('animationLeg3OffButton').onclick = function() {g_leg3Animation = false;};
  document.getElementById('animationLeg4OnButton').onclick = function() {g_leg4Animation = true;};
  document.getElementById('animationLeg4OffButton').onclick = function() {g_leg4Animation = false;};

  document.getElementById('animationTailOnButton').onclick = function() {g_tailAnimation = true;};
  document.getElementById('animationTailOffButton').onclick = function() {g_tailAnimation = false;};

  document.getElementById('animationOrangeOnButton').onclick = function() {g_orangeAnimation = true;};
  document.getElementById('animationOrangeOffButton').onclick = function() {g_orangeAnimation = false;};
  
  // Angle sliders
  document.getElementById('headXSlider').addEventListener('mousemove', function() {g_headAngleX = this.value;});
  document.getElementById('headYSlider').addEventListener('mousemove', function() {g_headAngleY = this.value;});
  document.getElementById('earSlider').addEventListener('mousemove', function() {g_earAngle = this.value;});
  document.getElementById('leg1Slider').addEventListener('mousemove', function() {g_leg1Angle = this.value;});
  document.getElementById('leg2Slider').addEventListener('mousemove', function() {g_leg2Angle = this.value;});
  document.getElementById('leg3Slider').addEventListener('mousemove', function() {g_leg3Angle = this.value;});
  document.getElementById('leg4Slider').addEventListener('mousemove', function() {g_leg4Angle = this.value;});
  document.getElementById('tailSlider').addEventListener('mousemove', function() {g_tailAngle = this.value;});
  document.getElementById('orangeSlider').addEventListener('mousemove', function() {g_orangeAngle = this.value;});

  // Global angle slider
  document.getElementById('angleSlider').addEventListener('input', function() {g_globalAngleX = this.value; });
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