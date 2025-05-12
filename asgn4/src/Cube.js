class Cube {
  constructor() {
    this.type = 'cube';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.buffer = null;
    this.textureNum = 0;
  }

  // drawCube()
  render() {
    var rgba = this.color;

    // Create a buffer object
    if (this.buffer === null) {
      this.buffer = gl.createBuffer();
      if (!this.buffer) {
        console.log('Failed to create the buffer object');
        return -1;
      }
    }

    // Pass the texture number 
    gl.uniform1i(u_whichTexture, this.textureNum);
  
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // Paass the matrix to u_ModelMatrix attribute
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    

    // Front of the cube
    gl.uniform4f(u_FragColor, rgba[0]*0.95, rgba[1]*0.95, rgba[2]*0.95, rgba[3]);
    drawTriangle3DUVNormal(
      [0,0,0,  1,1,0,  1,0,0], 
      [0,0,  1,1,  1,0], 
      [0,0,-1,  0,0,-1,  0,0,-1], this.buffer);
    drawTriangle3D(
      [0,0,0,  0,1,0,  1,1,0], 
      [0,0,  0,1,  1,1], 
      [0,0,-1,  0,0,-1,  0,0,-1], this.buffer);

    // Back
    gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
    drawTriangle3D(
      [1,0,1,  0,1,1,  0,0,1]
      [0,0,  1,1,  1,0], 
      [0,0,1,  0,0,1,  0,0,1], this.buffer);
    drawTriangle3D(
      [1,0,1,  1,1,1,  0,1,1]
      [0,0,  0,1,  1,1], 
      [0,0,1,  0,0,1,  0,0,1], this.buffer);
    
    // Left
    gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
    drawTriangle3D(
      [0,0,0,  0,0,1,  0,1,0]
      [0,0,  1,1,  1,0], 
      [-1,0,0,  -1,0,0,  -1,0,0], this.buffer);
    drawTriangle3D(
      [0,0,1,  0,1,1,  0,1,0]
      [0,0,  0,1,  1,1], 
      [-1,0,0,  -1,0,0,  -1,0,0], this.buffer);
    
    // Right
    gl.uniform4f(u_FragColor, rgba[0]*0.85, rgba[1]*0.85, rgba[2]*0.85, rgba[3]);
    drawTriangle3D(
      [1,0,0,  1,1,1,  1,0,1], 
      [0,0,  1,1,  1,0], 
      [1,0,0,  1,0,0,  1,0,0], this.buffer);
    drawTriangle3D(
      [1,0,0,  1,1,0,  1,1,1], 
      [0,0,  0,1,  1,1], 
      [1,0,0,  1,0,0,  1,0,0], this.buffer);
    
    // Top
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    drawTriangle3D(
      [0,1,0,  1,1,1,  1,1,0]
      [0,0,  1,1,  1,0], 
      [0,1,0,  0,1,0,  0,1,0], this.buffer);
    drawTriangle3D(
      [0,1,0,  0,1,1,  1,1,1]
      [0,0,  0,1,  1,1], 
      [0,1,0,  0,1,0,  0,1,0], this.buffer);
    
    // Bottom
    gl.uniform4f(u_FragColor, rgba[0]*0.6, rgba[1]*0.6, rgba[2]*0.6, rgba[3]);
    drawTriangle3D(
      [0,0,1,  1,0,0,  1,0,1], 
      [0,0,  1,1,  1,0], 
      [0,-1,0,  0,-1,0,  0,-1,0], this.buffer);
    drawTriangle3D(
      [0,0,1,  0,0,0,  1,0,0], 
      [0,0,  0,1,  1,1], 
      [0,-1,0,  0,-1,0,  0,-1,0], this.buffer);


    // // Front of the cube
    // gl.uniform4f(u_FragColor, rgba[0]*0.95, rgba[1]*0.95, rgba[2]*0.95, rgba[3]);
    // drawTriangle3D([0,0,0,  1,1,0,  1,0,0], this.buffer);
    // drawTriangle3D([0,0,0,  0,1,0,  1,1,0], this.buffer);

    // // Back
    // gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
    // drawTriangle3D([1,0,1,  0,1,1,  0,0,1], this.buffer);
    // drawTriangle3D([1,0,1,  1,1,1,  0,1,1], this.buffer);
    
    // // Left
    // gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
    // drawTriangle3D([0,0,0,  0,0,1,  0,1,0], this.buffer);
    // drawTriangle3D([0,0,1,  0,1,1,  0,1,0], this.buffer);
    
    // // Right
    // gl.uniform4f(u_FragColor, rgba[0]*0.85, rgba[1]*0.85, rgba[2]*0.85, rgba[3]);
    // drawTriangle3D([1,0,0,  1,1,1,  1,0,1], this.buffer);
    // drawTriangle3D([1,0,0,  1,1,0,  1,1,1], this.buffer);
    
    // // Top
    // gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    // drawTriangle3D([0,1,0,  1,1,1,  1,1,0], this.buffer);
    // drawTriangle3D([0,1,0,  0,1,1,  1,1,1], this.buffer);
    
    // // Bottom
    // gl.uniform4f(u_FragColor, rgba[0]*0.6, rgba[1]*0.6, rgba[2]*0.6, rgba[3]);
    // drawTriangle3D([0,0,1,  1,0,0,  1,0,1], this.buffer);
    // drawTriangle3D([0,0,1,  0,0,0,  1,0,0], this.buffer);
  }
}