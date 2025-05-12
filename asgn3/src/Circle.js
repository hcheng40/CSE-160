class Circle {
  constructor() {
    this.type = 'circle';
    this.position = [0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 5.0;
    this.segments = 10;
  }
  
  render() {
    var xy = this.position;
    var rgba = this.color;
    var size = this.size;
  
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
  
    // Calculate the size
    var d = size / 200.0;  

    // Calculate the vertices of each traingle in the circle and draw
    let angleStep = 360 / this.segments;
    for (var angle = 0; angle < 360; angle += angleStep) {
      let center = [xy[0], xy[1]];
      let angle1 = angle;
      let angle2 = angle + angleStep;
      let v1 = [Math.cos(angle1 * Math.PI / 180)*d, Math.sin(angle1 * Math.PI / 180)*d];
      let v2 = [Math.cos(angle2 * Math.PI / 180)*d, Math.sin(angle2 * Math.PI / 180)*d];
      let p1 = [center[0] + v1[0], center[1] + v1[1]];
      let p2 = [center[0] + v2[0], center[1] + v2[1]];  
      
      drawTriangle( [xy[0], xy[1], p1[0], p1[1], p2[0], p2[1]] );
    }
  }
}