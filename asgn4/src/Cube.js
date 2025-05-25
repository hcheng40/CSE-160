class Cube {
  static cubeV32 = new Float32Array([
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
    0,0,1,  0,0,0,  1,0,0 
  ]);
  static cubeUV32_1 = new Float32Array([
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
  static cubeUV32_2 = new Float32Array([
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
  static cubeN32 = new Float32Array([
    0,0,-1,  0,0,-1,  0,0,-1,
    0,0,-1,  0,0,-1,  0,0,-1,
    0,0,1,  0,0,1,  0,0,1, 
    0,0,1,  0,0,1,  0,0,1, 
    -1,0,0,  -1,0,0,  -1,0,0,
    -1,0,0,  -1,0,0,  -1,0,0,
    1,0,0,  1,0,0,  1,0,0,
    1,0,0,  1,0,0,  1,0,0,
    0,1,0,  0,1,0,  0,1,0,
    0,1,0,  0,1,0,  0,1,0,
    0,-1,0,  0,-1,0,  0,-1,0,
    0,-1,0,  0,-1,0,  0,-1,0
  ]);

  static buffer = null;
  static uvBuffer1 = null;
  static uvBuffer2 = null;
  static normalBuffer = null;
  static initialized = false;

  constructor() {
    if (!Cube.initialized) {
      Cube.initBuffers();
      Cube.initialized = true;
    }
    this.type = 'cube';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.NormalMatrix = new Matrix4();
    this.textureNum = -2;
  }

  static initBuffers() {
    Cube.buffer = gl.createBuffer();
    Cube.uvBuffer1 = gl.createBuffer();
    Cube.uvBuffer2 = gl.createBuffer();
    Cube.normalBuffer = gl.createBuffer();
    if (!Cube.buffer || !Cube.uvBuffer1 || !Cube.uvBuffer2 || !Cube.normalBuffer) {
      console.log('Failed to create sphere buffer objects');
      return false;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, Cube.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, Cube.cubeV32, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, Cube.uvBuffer1);
    gl.bufferData(gl.ARRAY_BUFFER, Cube.cubeUV32_1, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, Cube.uvBuffer2);
    gl.bufferData(gl.ARRAY_BUFFER, Cube.cubeUV32_2, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, Cube.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, Cube.cubeN32, gl.STATIC_DRAW);
  }

  render() {
    var rgba = this.color;

    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    gl.uniformMatrix4fv(u_NormalMatrix, false, this.NormalMatrix.elements);

    initVertexBuffers(Cube.buffer)

    const currentUVBuffer = (this.textureNum === 2) ? Cube.uvBuffer2 : Cube.uvBuffer1;
    initUVBuffers(currentUVBuffer);

    initNormalBuffers(Cube.normalBuffer)

    gl.drawArrays(gl.TRIANGLES, 0, 36);
  }
}