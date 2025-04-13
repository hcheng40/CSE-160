// Vertex shader
var VSHADER_SOURCE = 
  'attribute vec4 a_Position;' + 
  'uniform float u_Size;' + 
  'void main() {' +
  '  gl_Position = a_Position;' +
  '  gl_PointSize = u_Size;' +
  '}';

// Fragment shader
var FSHADER_SOURCE = 
  'precision mediump float;' + 
  'uniform vec4 u_FragColor;' + 
  'void main() {' + 
  '  gl_FragColor = u_FragColor;' + 
  '}';


// Const Variables
const POINT = 0
const TRIANGLE = 1
const CIRCLE = 2

// Global variables
let canvas
let gl
let a_Position
let u_FragColor
let u_Size
let g_selectedColor = [1.0, 1.0, 1.0, 1.0]
let g_selectedSize = 5.0
let g_selectedType = POINT
let g_selectedSeg = 10

// Main
function main() {
  // Setup
  setupWebGL();

  // Connect variables to GLSL
  connectVariablesToGLSL();

  // HTML UI
  addActionsForHtmlUI();
  
  // Call function to draw when mouse click
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if (ev.buttons == 1) click(ev);};

  // Clear Canvas
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

// Shapes List
var g_shapesList = [];

// Click event (Draw)
function click(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  // Create a shape
  let point;
  if (g_selectedType == POINT) {
    point = new Point();
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  } else if (g_selectedType == CIRCLE) {
    point = new Circle();
    point.segments = g_selectedSeg;
  }
  point.position = [x, y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);

  // Render
  renderAllShapes();
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
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

// Render function
function renderAllShapes() {
  var startTime = performance.now();

  // Clear Canvas
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Render all shapes in shapes list
  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }

  // FPS
  var duration = performance.now() - startTime;
  sendTextToHtml("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration));
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

// Actions for HTML UI
function addActionsForHtmlUI() {
  // Clear Canvas
  document.getElementById('clear').onclick = function(){g_shapesList = []; renderAllShapes();};

  // Drawing Mode
  document.getElementById('squares').onclick = function(){g_selectedType = POINT;};
  document.getElementById('triangles').onclick = function(){g_selectedType = TRIANGLE;};
  document.getElementById('circles').onclick = function(){g_selectedType = CIRCLE;};

  // Color
  document.getElementById('redSlider').addEventListener('mouseup', function() {g_selectedColor[0] = this.value/100;});
  document.getElementById('greenSlider').addEventListener('mouseup', function() {g_selectedColor[1] = this.value/100;});
  document.getElementById('blueSlider').addEventListener('mouseup', function() {g_selectedColor[2] = this.value/100;});

  // Size and Segments
  document.getElementById('sizeSlider').addEventListener('mouseup', function() {g_selectedSize = this.value;});
  document.getElementById('segSlider').addEventListener('mouseup', function() {g_selectedSeg = this.value;});

  // My Graph
  document.getElementById('myButton').onclick = function(){myGraph();};
}

// My Graph function
function myGraph() {
  const vListGreen = [
    [50, 300, 75, 325, 100, 300], 
    [50, 300, 100, 300, 100, 250], 
    [50, 300, 100, 250, 50, 250],
    [50, 250, 100, 250, 75, 200],
    [75, 200, 100, 250, 125, 225],
    [75, 200, 125, 225, 137.5, 175],

    [300, 325, 325, 350, 350, 325],
    [300, 325, 350, 325, 325, 275],
    [275, 275, 300, 325, 325, 275],
    [275, 275, 325, 275, 275, 225],

    [150, 362.5, 200, 375, 250, 362.5],
    [150, 362.5, 250, 362.5, 150, 300],
    [150, 300, 250, 362.5, 250, 300], 
    [125, 300, 150, 362.5, 150, 300],
    [250, 300, 250, 362.5, 275, 300],
    [125, 300, 200, 300, 125, 225],
    [125, 225, 200, 300, 275, 225],
    [200, 300, 275, 300, 275, 225],
    [125, 225, 200, 225, 150, 125],
    [150, 125, 200, 225, 250, 125],
    [200, 225, 275, 225, 250, 125],
  ];

  const vListBrown = [
    [100, 125, 300, 125, 100, 75], 
    [100, 75, 300, 75, 300, 125], 
    [125, 75, 275, 75, 125, 25], 
    [125, 25, 275, 75, 275, 25], 
  ];

  let newList = [];

  for (var i = 0; i < vListGreen.length; i++) {
    let triangles = new Triangle();
    let v = vListGreen[i];
    triangles.position = convertPosition(v).slice();
    if (i < 10) {
      triangles.color = [0.0, 0.5, 0.0, 1.0];
    } else {
      triangles.color = [0.0, 0.6, 0.0, 1.0];
    }
    newList.push(triangles);
  }
  for (var i = 0; i < vListBrown.length; i++) {
    let triangles = new Triangle();
    let v = vListBrown[i];
    triangles.position = convertPosition(v).slice();
    if (i < 2) {
      triangles.color = [0.4, 0.2, 0.16, 0.9];
    } else {
      triangles.color = [0.4, 0.2, 0.16, 1.0];
    }
    newList.push(triangles);
  }

  g_shapesList = [];
  gl.clear(gl.COLOR_BUFFER_BIT);
  for(var i = 0; i < newList.length; i++) {
    gl.uniform4f(u_FragColor, newList[i].color[0], newList[i].color[1], newList[i].color[2], newList[i].color[3]);
    drawTriangle(newList[i].position);
  }
}
function convertPosition(v) {
  let x1 = (v[0] - canvas.width / 2) / (canvas.width / 2);
  let y1 = (v[1] - canvas.height / 2) / (canvas.height / 2);
  let x2 = (v[2] - canvas.width / 2) / (canvas.width / 2);
  let y2 = (v[3] - canvas.height / 2) / (canvas.height / 2);
  let x3 = (v[4] - canvas.width / 2) / (canvas.width / 2);
  let y3 = (v[5] - canvas.height / 2) / (canvas.height / 2);
  return [x1, y1, x2, y2, x3, y3];
}