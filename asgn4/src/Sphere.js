class Sphere {
  constructor() {
    this.type = 'sphere';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.NormalMatrix = new Matrix4();
    this.segments = 20;
    this.buffer = null;
    this.uvBuffer = null;
    this.normalBuffer = null;
    this.textureNum = -2;
    this.sphereV32 = null;
    this.sphereUV32 = null;
    this.sphereN32 = null;
    this.vertexCount = 0
    this.generateSphere();
    this.initBuffers();
  }

  generateSphere() {
    let vertices = [];
    let uvs = [];
    let normals = [];
    
    const latitude = this.segments;
    const longitude = this.segments;
    
    for (let lat = 0; lat <= latitude; lat++) {
      const theta = (lat * Math.PI) / latitude;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);
      
      for (let lon = 0; lon <= longitude; lon++) {
        const p = (lon * 2 * Math.PI) / longitude;
        const sinPhi = Math.sin(p);
        const cosPhi = Math.cos(p);
        
        const x = cosPhi * sinTheta;
        const y = cosTheta;
        const z = sinPhi * sinTheta;
        
        const u = 1 - (lon / longitude);
        const v = 1 - (lat / latitude);
        
        vertices.push(x, y, z);
        uvs.push(u, v);
        normals.push(x, y, z);
      }
    }
    
    let indices = [];
    for (let lat = 0; lat < latitude; lat++) {
      for (let lon = 0; lon < longitude; lon++) {
        const first = lat * (longitude + 1) + lon;
        const second = first + longitude + 1;
        
        indices.push(first, second, first + 1);
        indices.push(second, second + 1, first + 1);
      }
    }
    
    let v = [];
    let uv = [];
    let n = [];
    for (let i = 0; i < indices.length; i++) {
      const index = indices[i];
      v.push(vertices[index * 3], vertices[index * 3 + 1], vertices[index * 3 + 2]);
      uv.push(uvs[index * 2], uvs[index * 2 + 1]);
      n.push(normals[index * 3], normals[index * 3 + 1], normals[index * 3 + 2]);
    }
    
    this.sphereV32 = new Float32Array(v);
    this.sphereUV32 = new Float32Array(uv);
    this.sphereN32 = new Float32Array(n);
    this.vertexCount = v.length / 3;
  }

  initBuffers() {
    if (this.buffer === null) {
      this.buffer = gl.createBuffer();
      this.uvBuffer = gl.createBuffer();
      this.normalBuffer = gl.createBuffer();
      if (!this.buffer || !this.uvBuffer || !this.normalBuffer) {
        console.log('Failed to create sphere buffer objects');
        return false;
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.sphereV32, gl.STATIC_DRAW);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.sphereUV32, gl.STATIC_DRAW);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.sphereN32, gl.STATIC_DRAW);
    }
  }

  render() {
    var rgba = this.color;

    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    gl.uniformMatrix4fv(u_NormalMatrix, false, this.NormalMatrix.elements);

    initVertexBuffers(this.buffer);

    initUVBuffers(this.uvBuffer);

    initNormalBuffers(this.normalBuffer);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
  }
}