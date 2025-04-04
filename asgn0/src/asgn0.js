function main() {  
  canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  ctx = canvas.getContext('2d');

  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let v1 = new Vector3([2.25, 2.25, 0]);
  drawVector(v1, 'red');
}

function drawVector(v, color) {
  // console.log(v);
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(canvas.width/2, canvas.height/2);
  ctx.lineTo(canvas.width/2 + v.elements[0]*20, canvas.width/2 - v.elements[1]*20);
  ctx.stroke();
}

function handleDrawEvent() {
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; 
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let v1x = document.getElementById("v1x").value;
  let v1y = document.getElementById("v1y").value;
  let v1 = new Vector3([v1x, v1y, 0]);
  drawVector(v1, 'red');

  let v2x = document.getElementById("v2x").value;
  let v2y = document.getElementById("v2y").value;
  let v2 = new Vector3([v2x, v2y, 0]);
  drawVector(v2, 'blue');
}

function handleDrawOperationEvent() {
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; 
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let v1x = document.getElementById("v1x").value;
  let v1y = document.getElementById("v1y").value;
  let v1 = new Vector3([v1x, v1y, 0]);
  drawVector(v1, 'red');

  let v2x = document.getElementById("v2x").value;
  let v2y = document.getElementById("v2y").value;
  let v2 = new Vector3([v2x, v2y, 0]);
  drawVector(v2, 'blue');

  let op = document.getElementById("op-select").value;
  let s = document.getElementById("scalar").value;
  if (op == "add") {
    let v3 = v1.add(v2);
    drawVector(v3, 'green')
  } else if (op == "sub") {
    let v3 = v1.sub(v2);
    drawVector(v3, 'green')
  } else if (op == "mul") {
    let v3 = v1.mul(s);
    let v4 = v2.mul(s);
    drawVector(v3, 'green')
    drawVector(v4, 'green')
  } else if (op == "div") {
    let v3 = v1.div(s);
    let v4 = v2.div(s);
    drawVector(v3, 'green')
    drawVector(v4, 'green')
  } else if (op == "mag") {
    let m1 = v1.magnitude();
    let m2 = v2.magnitude();
    console.log("Magnitude v1: " + m1)
    console.log("Magnitude v2: " + m2)
  } else if (op == "nor") {
    let v3 = v1.normalize();
    let v4 = v2.normalize();
    drawVector(v3, 'green');
    drawVector(v4, 'green');
  } else if (op == "ang") {
    let a = angleBetween(v1, v2);
    console.log("Angle: " + a);
  } else if (op == "area") {
    let a = areaTriangle(v1, v2);
    console.log("Area of the triangle: " + a);
  }
}

function angleBetween(v1, v2) {
  let dp = Vector3.dot(v1, v2);
  let cosA = dp / (v1.magnitude() * v2.magnitude());
  return Math.acos(cosA) * (180 / Math.PI);
}

function areaTriangle(v1, v2) {
  return Vector3.cross(v1, v2).magnitude() / 2;
}