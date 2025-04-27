class Sphere {
  constructor() {
    this.type = 'sphere';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.segments = 30;
    this.buffer = null;
    this.vertices = null;
    this.color_v = this.color;
  }

  generateVertices() {
    let v = [];
    let c = [];
    let horizontalStep = this.segments;
    let verticalStep = this.segments;
    for (let latitude = 0; latitude < horizontalStep; latitude++) {
      let lat0 = Math.PI * (-0.5 + (latitude / horizontalStep));
      let lat1 = Math.PI * (-0.5 + ((latitude + 1) / horizontalStep));
      let sinLat0 = Math.sin(lat0);
      let cosLat0 = Math.cos(lat0);
      let sinLat1 = Math.sin(lat1);
      let cosLat1 = Math.cos(lat1);
      for (let longitude = 0; longitude < verticalStep; longitude++) {
        let lon0 = 2 * Math.PI * (longitude / verticalStep);
        let lon1 = 2 * Math.PI * ((longitude + 1) / verticalStep);
        let sinLon0 = Math.sin(lon0);
        let cosLon0 = Math.cos(lon0);
        let sinLon1 = Math.sin(lon1);
        let cosLon1 = Math.cos(lon1);

        let x0 = cosLat0 * cosLon0;
        let y0 = sinLat0;
        let z0 = cosLat0 * sinLon0;
        let x1 = cosLat1 * cosLon0;
        let y1 = sinLat1;
        let z1 = cosLat1 * sinLon0;
        let x2 = cosLat1 * cosLon1;
        let y2 = sinLat1;
        let z2 = cosLat1 * sinLon1;
        let x3 = cosLat0 * cosLon1;
        let y3 = sinLat0;
        let z3 = cosLat0 * sinLon1;

        if (x0 >= y0 || x1 >= y1 || x2 >= y2) {
          c.push([this.color[0]*0.98, this.color[1]*0.98, this.color[2]*0.98, this.color[3]]);
        } else {
          c.push([this.color[0], this.color[1], this.color[2], this.color[3]]);
        }
        v.push([x0, y0, z0, x1, y1, z1, x2, y2, z2]);

        if (x0 >= y0 || x2 >= y2 || x3 >= y3) {
          c.push([this.color[0]*0.98, this.color[1]*0.98, this.color[2]*0.98, this.color[3]]);
        } else {
          c.push([this.color[0], this.color[1], this.color[2], this.color[3]]);
        }
        v.push([x0, y0, z0, x2, y2, z2, x3, y3, z3]);
      }
    }
    this.vertices = v;
    this.color_v = c;
  }
  
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

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // Paass the matrix to u_ModelMatrix attribute
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Generate vertices
    if (this.vertices === null) {
      this.generateVertices();
    }
    
    // Draw two triangles for each segment
    for (let i = 0; i < this.vertices.length; i+=2) {
      gl.uniform4f(u_FragColor, this.color_v[i][0], this.color_v[i][1], this.color_v[i][2], this.color_v[i][3]);
      drawTriangle3D(this.vertices[i], this.buffer);
      gl.uniform4f(u_FragColor, this.color_v[i+1][0], this.color_v[i+1][1], this.color_v[i+1][2], this.color_v[i+1][3]);
      drawTriangle3D(this.vertices[i+1], this.buffer);
    }
  }
}