class Cube {
  constructor() {
    this.type = 'cube';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.buffer = null;
    this.uvBuffer = null;
    this.textureNum = -2;
    this.cubeV = [
      0,0,0,  1,1,0,  1,0,0, 
      0,0,0,  0,1,0,  1,1,0, 
      1,0,1,  0,1,1,  0,0,1, 
      1,0,1,  1,1,1,  0,1,1, 
      0,0,0,  0,0,1,  0,1,0, 
      0,0,1,  0,1,1,  0,1,0, 
      1,0,0,  1,1,1,  1,0,1, 
      1,0,0,  1,1,0,  1,1,1, 
      0,1,0,  1,1,1,  1,1,0, 
      0,1,0,  0,1,1,  1,1,1, 
      0,0,1,  1,0,0,  1,0,1, 
      0,0,1,  0,0,0,  1,0,0 ];
    this.cubeV32 = new Float32Array(this.cubeV);
    this.cubeUV32_1 = new Float32Array([
      0,0,  1,1,  1,0, 
      0,0,  0,1,  1,1, 
      1,0,  0,1,  0,0, 
      1,0,  1,1,  0,1, 
      0,0,  1,0,  0,1, 
      1,0,  1,1,  0,1, 
      1,0,  0,1,  0,0, 
      1,0,  1,1,  0,1, 
      0,1,  1,0,  1,1, 
      0,1,  0,0,  1,0, 
      0,0,  1,1,  1,0, 
      0,0,  0,1,  1,1
    ]);
    this.cubeUV32_2 = new Float32Array([
      0,0,  0.5,1,  0.5,0,
      0,0,  0,1,  0.5,1,
      0.5,0,  0,1,  0,0,
      0.5,0,  0.5,1,  0,1,
      0,0,  0.5,0,  0,1,
      0.5,0,  0.5,1,  0,1,
      0.5,0,  0,1,  0,0,
      0.5,0,  0.5,1,  0,1,
      0.5,1,  1,0,  1,1,
      0.5,1,  0.5,0,  1,0,
      0,0,  0.5,1,  0.5,0,
      0,0,  0,1,  0.5,1
    ]);
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

    if (this.uvBuffer === null) {
      this.uvBuffer = gl.createBuffer();
      if (!this.uvBuffer) {
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
    
    if (this.textureNum == 2) {
      // Front of the cube
      drawTriangle3DUV([0,0,0,  1,1,0,  1,0,0], [0,0,  0.5,1,  0.5,0], this.buffer, this.uvBuffer);
      drawTriangle3DUV([0,0,0,  0,1,0,  1,1,0], [0,0,  0,1,  0.5,1], this.buffer, this.uvBuffer);
      // Back
      drawTriangle3DUV([1,0,1,  0,1,1,  0,0,1], [0.5,0,  0,1,  0,0], this.buffer, this.uvBuffer);
      drawTriangle3DUV([1,0,1,  1,1,1,  0,1,1], [0.5,0,  0.5,1,  0,1], this.buffer, this.uvBuffer);
      // Left
      drawTriangle3DUV([0,0,0,  0,0,1,  0,1,0], [0,0,  0.5,0,  0,1], this.buffer, this.uvBuffer);
      drawTriangle3DUV([0,0,1,  0,1,1,  0,1,0], [0.5,0,  0.5,1,  0,1], this.buffer, this.uvBuffer);
      // Right
      drawTriangle3DUV([1,0,0,  1,1,1,  1,0,1], [0.5,0,  0,1,  0,0], this.buffer, this.uvBuffer);
      drawTriangle3DUV([1,0,0,  1,1,0,  1,1,1], [0.5,0,  0.5,1,  0,1], this.buffer, this.uvBuffer);
      // Top
      drawTriangle3DUV([0,1,0,  1,1,1,  1,1,0], [0.5,1,  1,0,  1,1], this.buffer, this.uvBuffer);
      drawTriangle3DUV([0,1,0,  0,1,1,  1,1,1], [0.5,1,  0.5,0,  1,0], this.buffer, this.uvBuffer);
      // Bottom
      drawTriangle3DUV([0,0,1,  1,0,0,  1,0,1], [0,0,  0.5,1,  0.5,0], this.buffer, this.uvBuffer);
      drawTriangle3DUV([0,0,1,  0,0,0,  1,0,0], [0,0,  0,1,  0.5,1], this.buffer, this.uvBuffer);
    } else {

      // Front of the cube
      drawTriangle3DUV([0,0,0,  1,1,0,  1,0,0], [0,0,  1,1,  1,0], this.buffer, this.uvBuffer);
      drawTriangle3DUV([0,0,0,  0,1,0,  1,1,0], [0,0,  0,1,  1,1], this.buffer, this.uvBuffer);
      
      // Back
      drawTriangle3DUV([1,0,1,  0,1,1,  0,0,1], [1,0,  0,1,  0,0], this.buffer, this.uvBuffer);
      drawTriangle3DUV([1,0,1,  1,1,1,  0,1,1], [1,0,  1,1,  0,1], this.buffer, this.uvBuffer);
      
      // Left
      drawTriangle3DUV([0,0,0,  0,0,1,  0,1,0], [0,0,  1,0,  0,1], this.buffer, this.uvBuffer);
      drawTriangle3DUV([0,0,1,  0,1,1,  0,1,0], [1,0,  1,1,  0,1], this.buffer, this.uvBuffer);
      
      // Right
      drawTriangle3DUV([1,0,0,  1,1,1,  1,0,1], [1,0,  0,1,  0,0], this.buffer, this.uvBuffer);
      drawTriangle3DUV([1,0,0,  1,1,0,  1,1,1], [1,0,  1,1,  0,1], this.buffer, this.uvBuffer);
      
      // Top
      drawTriangle3DUV([0,1,0,  1,1,1,  1,1,0], [0,1,  1,0,  1,1], this.buffer, this.uvBuffer);
      drawTriangle3DUV([0,1,0,  0,1,1,  1,1,1], [0,1,  0,0,  1,0], this.buffer, this.uvBuffer);
      
      // Bottom
      drawTriangle3DUV([0,0,1,  1,0,0,  1,0,1], [0,0,  1,1,  1,0], this.buffer, this.uvBuffer);
      drawTriangle3DUV([0,0,1,  0,0,0,  1,0,0], [0,0,  0,1,  1,1], this.buffer, this.uvBuffer);
    }
  }

  // Render Fast
  renderFast() {
    var rgba = this.color;

    // Create a buffer object
    if (this.buffer === null) {
      this.buffer = gl.createBuffer();
      if (!this.buffer) {
        console.log('Failed to create the buffer object');
        return -1;
      }
    }
    if (this.uvBuffer === null) {
      this.uvBuffer = gl.createBuffer();
      if (!this.uvBuffer) {
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
    
    var allVerts = [];
    var allUVs = [];

    if (this.textureNum == 2) {
      // Front of the cube
      allVerts = allVerts.concat([0,0,0,  1,1,0,  1,0,0]);
      allUVs = allUVs.concat([0,0,  0.5,1,  0.5,0]);
      allVerts = allVerts.concat([0,0,0,  0,1,0,  1,1,0]);
      allUVs = allUVs.concat([0,0,  0,1,  0.5,1]);
      // Back
      allVerts = allVerts.concat([1,0,1,  0,1,1,  0,0,1]);
      allUVs = allUVs.concat([0.5,0,  0,1,  0,0]);
      allVerts = allVerts.concat([1,0,1,  1,1,1,  0,1,1]);
      allUVs = allUVs.concat([0.5,0,  0.5,1,  0,1]);
      // Left
      allVerts = allVerts.concat([0,0,0,  0,0,1,  0,1,0]);
      allUVs = allUVs.concat([0,0,  0.5,0,  0,1]);
      allVerts = allVerts.concat([0,0,1,  0,1,1,  0,1,0]);
      allUVs = allUVs.concat([0.5,0,  0.5,1,  0,1]);
      // Right
      allVerts = allVerts.concat([1,0,0,  1,1,1,  1,0,1]);
      allUVs = allUVs.concat([0.5,0,  0,1,  0,0]);
      allVerts = allVerts.concat([1,0,0,  1,1,0,  1,1,1]);
      allUVs = allUVs.concat([0.5,0,  0.5,1,  0,1]);
      // Top
      allVerts = allVerts.concat([0,1,0,  1,1,1,  1,1,0]);
      allUVs = allUVs.concat([0.5,1,  1,0,  1,1]);
      allVerts = allVerts.concat([0,1,0,  0,1,1,  1,1,1]);
      allUVs = allUVs.concat([0.5,1,  0.5,0,  1,0]);
      // Bottom
      allVerts = allVerts.concat([0,0,1,  1,0,0,  1,0,1]);
      allUVs = allUVs.concat([0,0,  0.5,1,  0.5,0]);
      allVerts = allVerts.concat([0,0,1,  0,0,0,  1,0,0]);
      allUVs = allUVs.concat([0,0,  0,1,  0.5,1]);
    } else {
      // Front of the cube
      allVerts = allVerts.concat([0,0,0,  1,1,0,  1,0,0]);
      allUVs = allUVs.concat([0,0,  1,1,  1,0]);
      allVerts = allVerts.concat([0,0,0,  0,1,0,  1,1,0]);
      allUVs = allUVs.concat([0,0,  0,1,  1,1]);
      
      // Back
      allVerts = allVerts.concat([1,0,1,  0,1,1,  0,0,1]);
      allUVs = allUVs.concat([1,0,  0,1,  0,0]);
      allVerts = allVerts.concat([1,0,1,  1,1,1,  0,1,1]);
      allUVs = allUVs.concat([1,0,  1,1,  0,1]);
      
      // Left
      allVerts = allVerts.concat([0,0,0,  0,0,1,  0,1,0]);
      allUVs = allUVs.concat([0,0,  1,0,  0,1]);
      allVerts = allVerts.concat([0,0,1,  0,1,1,  0,1,0]);
      allUVs = allUVs.concat([1,0,  1,1,  0,1]);
      
      // Right
      allVerts = allVerts.concat([1,0,0,  1,1,1,  1,0,1]);
      allUVs = allUVs.concat([1,0,  0,1,  0,0]);
      allVerts = allVerts.concat([1,0,0,  1,1,0,  1,1,1]);
      allUVs = allUVs.concat([1,0,  1,1,  0,1]);
      
      // Top
      allVerts = allVerts.concat([0,1,0,  1,1,1,  1,1,0]);
      allUVs = allUVs.concat([0,1,  1,0,  1,1]);
      allVerts = allVerts.concat([0,1,0,  0,1,1,  1,1,1]);
      allUVs = allUVs.concat([0,1,  0,0,  1,0]);
      
      // Bottom
      allVerts = allVerts.concat([0,0,1,  1,0,0,  1,0,1]);
      allUVs = allUVs.concat([0,0,  1,1,  1,0]);
      allVerts = allVerts.concat([0,0,1,  0,0,0,  1,0,0]);
      allUVs = allUVs.concat([0,0,  0,1,  1,1]);
    }

    drawTriangle3DUV(allVerts, allUVs, this.buffer, this.uvBuffer);
  }

  // Render Faster
  renderFaster() {
    var rgba = this.color;

    // Create a buffer object
    if (this.buffer === null) {
      this.buffer = gl.createBuffer();
      if (!this.buffer) {
        console.log('Failed to create the buffer object');
        return -1;
      }
    }
    if (this.uvBuffer === null) {
      this.uvBuffer = gl.createBuffer();
      if (!this.uvBuffer) {
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

    initVertexBuffers(this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.cubeV32, gl.DYNAMIC_DRAW);
    if (this.textureNum == 2) {
      initUVBuffers(this.uvBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.cubeUV32_2, gl.DYNAMIC_DRAW);
    } else {
      initUVBuffers(this.uvBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.cubeUV32_1, gl.DYNAMIC_DRAW);
    }

    gl.drawArrays(gl.TRIANGLES, 0, 36);
  }
}