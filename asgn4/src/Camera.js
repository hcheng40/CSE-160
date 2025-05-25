class Camera {
  constructor() {
    this.eye = new Vector3([0, 0, 7]);
    this.at = new Vector3([0, 0, -100]);
    this.up = new Vector3([0, 1, 0]);
    this.speed = 0.1;
    this.alpha = 4;
  }

  forward() {
    var f = new Vector3().set(this.at).sub(this.eye).normalize().mul(this.speed);
    this.eye.add(f);
    this.at.add(f);
    this.boundary();
  }

  backward() {
    var f = new Vector3().set(this.eye).sub(this.at).normalize().mul(this.speed);
    this.eye.add(f);
    this.at.add(f);
    this.boundary();
  }

  left() {
    var f = new Vector3().set(this.at).sub(this.eye);
    var s = Vector3.cross(this.up, f).normalize().mul(this.speed);
    this.eye.add(s);
    this.at.add(s);
    this.boundary();
  }

  right() {
    var f = new Vector3().set(this.at).sub(this.eye);
    var s = Vector3.cross(f, this.up).normalize().mul(this.speed);
    this.eye.add(s);
    this.at.add(s);
    this.boundary();
  }

  panLeft() {
    var f = new Vector3().set(this.at).sub(this.eye);
    var rotationMat = new Matrix4().setRotate(this.alpha * 0.4, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    var ff = rotationMat.multiplyVector3(f);
    this.at = new Vector3();
    this.at.set(this.eye).add(ff);
  }
  
  panRight() {
    var f = new Vector3().set(this.at).sub(this.eye);
    var rotationMat = new Matrix4().setRotate(-this.alpha * 0.4, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    var ff = rotationMat.multiplyVector3(f);
    this.at = new Vector3();
    this.at.set(this.eye).add(ff);
  }

  panUp() {
    var f = new Vector3().set(this.at).sub(this.eye);
    const currentAngle = Math.asin(f.normalize().elements[1]) * 180 / Math.PI;
    if (currentAngle + this.alpha >= 89) return;
    var s = Vector3.cross(f, this.up).normalize();
    var rotationMat = new Matrix4().setRotate(this.alpha * 0.3, s.elements[0], s.elements[1], s.elements[2]);
    var ff = rotationMat.multiplyVector3(f);
    this.at.set(this.eye).add(ff);
  }

  panDown() {
    var f = new Vector3().set(this.at).sub(this.eye);
    const currentAngle = Math.asin(f.normalize().elements[1]) * 180 / Math.PI;
    if (currentAngle - this.alpha <= -89) return;
    var s = Vector3.cross(f, this.up).normalize();
    var rotationMat = new Matrix4().setRotate(-this.alpha * 0.3, s.elements[0], s.elements[1], s.elements[2]);
    var ff = rotationMat.multiplyVector3(f);
    this.at = new Vector3().set(this.eye).add(ff);
  }

  boundary(min = -9.5, max = 9.5, ground = -0.35) {
    const f = new Vector3().set(this.at).sub(this.eye);
    const d = f.magnitude();
    const dir = f.normalize();
    const oldEye = new Vector3().set(this.eye);
    this.eye.elements[0] = Math.max(min, Math.min(max, this.eye.elements[0]));
    this.eye.elements[1] = Math.max(ground, Math.min(max, this.eye.elements[1]));
    this.eye.elements[2] = Math.max(min, Math.min(max, this.eye.elements[2]));

    if (oldEye != this.eye) {
      this.at.set(this.eye).add(dir.mul(d));
    }
    const currentD = new Vector3().set(this.at).sub(this.eye).magnitude();
    if (currentD < 0.1) {
      this.at.set(this.eye).add(dir.mul(0.1));
    }
  }
}