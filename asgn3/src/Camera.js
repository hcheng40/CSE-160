class Camera {
  constructor() {
    this.eye = new Vector3([0, 0, 7]);
    this.at = new Vector3([0, 0, -100]);
    this.up = new Vector3([0, 1, 0]);
    this.speed = 0.3;
    this.alpha = 5;
    this.x = 0;
    this.y = 0;
    this.z = 0;
  }

  forward() {
    var f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    f.normalize();
    f.mul(this.speed);
    this.eye.add(f);
    this.at.add(f);
    this.boundary();
  }

  backward() {
    var f = new Vector3();
    f.set(this.eye);
    f.sub(this.at);
    f.normalize();
    f.mul(this.speed);
    this.eye.add(f);
    this.at.add(f);
    this.boundary();
  }

  left() {
    var f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    var s = Vector3.cross(this.up, f);
    s.normalize();
    s.mul(this.speed);
    this.eye.add(s);
    this.at.add(s);
    this.boundary();
  }

  right() {
    var f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    var s = Vector3.cross(f, this.up);
    s.normalize();
    s.mul(this.speed);
    this.eye.add(s);
    this.at.add(s);
    this.boundary();
  }

  panLeft() {
    var f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    var rotationMat = new Matrix4().setRotate(this.alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    var ff = rotationMat.multiplyVector3(f);
    this.at = new Vector3();
    this.at.set(this.eye)
    this.at.add(ff);
  }
  
  panRight() {
    var f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    var rotationMat = new Matrix4();
    rotationMat.setRotate(-this.alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    var ff = rotationMat.multiplyVector3(f);
    this.at = new Vector3();
    this.at.set(this.eye)
    this.at.add(ff)
  }

  panUp() {
    var direction = new Vector3().set(this.at).sub(this.eye).normalize();
    const currentAngle = Math.asin(direction.elements[1]) * 180 / Math.PI;
    if (currentAngle + this.alpha >= 89) return;
    var f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    var s = Vector3.cross(f, this.up);
    s.normalize();
    var rotationMat = new Matrix4().setRotate(this.alpha, s.elements[0], s.elements[1], s.elements[2]);
    var ff = rotationMat.multiplyVector3(f);
    this.at = new Vector3();
    this.at.set(this.eye);
    this.at.add(ff);
  }

  panDown() {
    var direction = new Vector3().set(this.at).sub(this.eye).normalize();
    const currentAngle = Math.asin(direction.elements[1]) * 180 / Math.PI;
    if (currentAngle - this.alpha <= -89) return;
    var f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    var s = Vector3.cross(f, this.up);
    s.normalize();
    var rotationMat = new Matrix4().setRotate(-this.alpha, s.elements[0], s.elements[1], s.elements[2]);
    var ff = rotationMat.multiplyVector3(f);
    this.at = new Vector3();
    this.at.set(this.eye);
    this.at.add(ff);
  }

  boundary(min = -24, max = 24, ground = -0.6) {
    this.eye.elements[0] = Math.max(min, Math.min(max, this.eye.elements[0]));
    this.eye.elements[1] = Math.max(ground, Math.min(max, this.eye.elements[1]));
    this.eye.elements[2] = Math.max(min, Math.min(max, this.eye.elements[2]));
    this.at.elements[0] = Math.max(min, Math.min(max, this.at.elements[0]));
    this.at.elements[1] = Math.max(ground, Math.min(max, this.at.elements[1]));
    this.at.elements[2] = Math.max(min, Math.min(max, this.at.elements[2]));
  }
}