import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { ColorGUIHelper, RadToDegHelper } from './helpers.js';

// Global Variable
let canvas, camera, scene, renderer, controls, stats;

let raycaster;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
let isRunning = false;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

let canCreate = true;
let canSwitch = true;
let lightMode = false;
let started = false;
let prevTime = performance.now();

const floorSize = 30;
const floorCount = 5;
const floorTiles = new Map();
const objectTiles = new Map();
let currentCenterTile = new THREE.Vector2();

let ambientLight;
let hemisphereLight;
let spotLight;

let skybox;
let skyColor = 0;

let crosshair;
let bullets = [];
let bulletSpeed = 150;
let canShoot = true;

const objects = [];
let animatedShapes = [];

let score = 0;
let scoreUI;

const shapes = [
    {
        name: 'cube',
        create: () => {return new THREE.BoxGeometry(5, 5, 5).toNonIndexed();},
        color: () => {return new THREE.Color(Math.random(), Math.random(), Math.random());}
    },
    {
        name: 'sphere',
        create: () => {return new THREE.SphereGeometry(2.5, 16, 16);},
        color: () => {return new THREE.Color(Math.random(), Math.random(), Math.random());}
    }
];

function init() {
	// Canvas
    canvas = document.querySelector( '#canvas' );
    
	// Camera
    const fov = 60;
	const aspect = window.innerWidth / window.innerHeight;
	const near = 0.1;
	const far = 1000;
	camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.set(0, 12, 30);

	// Scene
    scene = new THREE.Scene();
	scene.background = new THREE.Color( 'black' );
    scene.fog = new THREE.Fog(0x000000, 1, 150);

	// Controls
    controls = new PointerLockControls(camera, document.body);
	const blocker = document.getElementById('blocker');
	const instructions = document.getElementById('instructions');
    document.addEventListener('click', () => {
        if (started && !controls.isLocked) {
            controls.lock();
        } else if (started && controls.isLocked && canShoot) {
            createBullet();
        }
    });
	instructions.addEventListener('click', () => {
        controls.lock();
        started = true;
	});
	controls.addEventListener('lock', () => {
		instructions.style.display = 'none';
		blocker.style.display = 'none';
	});
	controls.addEventListener('unlock', () => {
		if (!started) {
			blocker.style.display = 'block';
			instructions.style.display = '';
		}
	});
	scene.add(controls.object);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3( 0, -1, 0 ), 0, 10);

	// Renderer
	renderer = new THREE.WebGLRenderer({
		canvas,
		logarithmicDepthBuffer: true,
		antialias: true
	});
    renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth - 20, window.innerHeight - 20);
	renderer.setAnimationLoop(animate);
	document.body.appendChild(renderer.domElement);

    window.addEventListener('resize', resizeWindow);

    // Stats
    stats = new Stats();
    document.body.appendChild(stats.dom);

    // Lights
    {
        // Ambient Light
        ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.01);
        scene.add(ambientLight);

        // Hemisphere Light
        hemisphereLight = new THREE.HemisphereLight(0xB1E1FF, 0x000000, 0.01);
        scene.add(hemisphereLight);

        // Spot Light
        spotLight = new THREE.SpotLight(0xffffaa, 500);
        spotLight.position.set(0, 10, 0);
        spotLight.target.position.set(0, 10, -5);
        spotLight.distance = 200;
        spotLight.angle = Math.PI / 5;
        spotLight.decay = 1.4;
		spotLight.penumbra = 0.3;
        scene.add(spotLight);
        scene.add(spotLight.target);
    }

    // GUI
    {
        const gui = new GUI();

        // Light On Mode
        const lightButton = {
            lightOnOff: () => {
                if (canSwitch) {
                if (!lightMode) turnLightOn();
                else if (lightMode) turnLightoff();
            }
            }
        };
        const allLightOn = gui.addFolder('Light Mode');
        allLightOn.add(lightButton, 'lightOnOff').name('Light On/Off (or Press T)');

        // Spawn Object
        const spawnButton = {
            OBJ: () => {
                spawnObj();
            }, 

            animated: () => {
                createAnimatedShape();
            }
        };
        const spawnFolder = gui.addFolder('Spawn');
        spawnFolder.add(spawnButton, 'OBJ').name('Spawn OBJ (or Press F)');
        spawnFolder.add(spawnButton, 'animated').name('Spawn Animated Shape (or Press R)');

        // Ambient Light
        const ambientFolder = gui.addFolder('Ambient Settings');
        ambientFolder.addColor(new ColorGUIHelper(ambientLight, 'color'), 'value').name('color');
        ambientFolder.add(ambientLight, 'intensity', 0, 5, 0.01);
        ambientFolder.close();

        // Hemisphere Light
        const hemisphereFolder = gui.addFolder('Hemisphere Settings');
        hemisphereFolder.addColor(new ColorGUIHelper(hemisphereLight, 'groundColor'), 'value').name('groundColor');
        hemisphereFolder.add(hemisphereLight, 'intensity', 0, 5, 0.01);
        hemisphereFolder.close();
        
        // Spotlight
        const spotlightFolder = gui.addFolder('Spotlight Settings');
        spotlightFolder.addColor(new ColorGUIHelper(spotLight, 'color'), 'value').name('color');
        spotlightFolder.add(spotLight, 'intensity', 0, 1000, 1);
        spotlightFolder.add(spotLight, 'distance', 0, 300);
        spotlightFolder.add(new RadToDegHelper(spotLight, 'angle'), 'value', 0, 90).name('angle');
        spotlightFolder.add(spotLight, 'penumbra', 0, 1, 0.01);
        spotlightFolder.close();
    }

    // Sky Box
    {
		const loader = new THREE.CubeTextureLoader();
		const texture = loader.load([
			'https://threejs.org/manual/examples/resources/images/cubemaps/computer-history-museum/pos-x.jpg',
			'https://threejs.org/manual/examples/resources/images/cubemaps/computer-history-museum/neg-x.jpg',
			'https://threejs.org/manual/examples/resources/images/cubemaps/computer-history-museum/pos-y.jpg',
			'https://threejs.org/manual/examples/resources/images/cubemaps/computer-history-museum/neg-y.jpg',
			'https://threejs.org/manual/examples/resources/images/cubemaps/computer-history-museum/pos-z.jpg',
			'https://threejs.org/manual/examples/resources/images/cubemaps/computer-history-museum/neg-z.jpg',
		]);
        const skyboxMaterial = new THREE.MeshPhongMaterial({
            envMap: texture,
            side: THREE.BackSide
        });
        const skyboxSize = floorSize * (floorCount * 1.5);
        const skyboxGeo = new THREE.BoxGeometry(skyboxSize, skyboxSize, skyboxSize);
        skybox = new THREE.Mesh(skyboxGeo, skyboxMaterial);
        scene.add(skybox);
	}

    // Shapes
    {
        updateMap();
    }

    // OBJ
    {
        spawnObj();
    }

    // Animated Shape
    {
        createAnimatedShape();
        animatedShapes.forEach((shape) => {
            shape.position.x -= 20;
            shape.position.z -= 10;
        });
    }

    // Crosshair
    {
        const crosshairGeo = new THREE.BufferGeometry();
        const crosshairMaterial = new THREE.LineBasicMaterial();
        
        const crosshairSize = 0.02;
        const crosshairGap = 0.005;
        const v = new Float32Array([
            -crosshairSize, 0, 0,
            -crosshairGap, 0, 0,
            crosshairGap, 0, 0,
            crosshairSize, 0, 0,
            0, -crosshairSize, 0,
            0, -crosshairGap, 0,
            0, crosshairGap, 0,
            0, crosshairSize, 0
        ]);
        crosshairGeo.setAttribute('position', new THREE.BufferAttribute(v, 3));
        crosshair = new THREE.LineSegments(crosshairGeo, crosshairMaterial);
        crosshair.position.z = -0.5;
        camera.add(crosshair);
    }

    // 創建分數顯示元素
    scoreUI = document.createElement('div');
    scoreUI.style.position = 'absolute';
    scoreUI.style.top = '20px';
    scoreUI.style.left = '50%';
    scoreUI.style.transform = 'translateX(-50%)';
    scoreUI.style.color = 'white';
    scoreUI.style.fontSize = '30px';
    scoreUI.style.fontFamily = 'Arial';
    scoreUI.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
    scoreUI.textContent = 'Score: 0';
    document.body.appendChild(scoreUI);
}

function onKeyDown(ev) {
    switch (ev.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = true;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = true;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = true;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = true;
            break;
        case 'Space':
            if (canJump) velocity.y += 65;
            canJump = false;
            break;
        case 'ShiftLeft':
            if (!isRunning) isRunning = true;
            break;
        case 'KeyR':
            if (canCreate) createAnimatedShape();
            canCreate = false;
            break;
        case 'KeyF':
            if (canCreate) spawnObj();
            canCreate = false;
            break;
        case 'KeyT':
            if (canSwitch) {
                if (!lightMode) turnLightOn();
                else if (lightMode) turnLightoff();
            }
            canSwitch = false;
            break;
    }
}
function onKeyUp(ev) {
    switch (ev.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = false;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = false;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = false;
            break;
        case 'ShiftLeft':
            isRunning = false;
            break;
        case 'KeyR':
            canCreate = true;
            break;
        case 'KeyF':
            canCreate = true;
            break;
        case 'KeyT':
            canSwitch = true;
            break;
    }
}

function turnLightOn() {
    ambientLight.intensity = 5;
    hemisphereLight.intensity = 3;
    lightMode = true;
}

function turnLightoff() {
    ambientLight.intensity = 0.01;
    hemisphereLight.intensity = 0.01;
    lightMode = false;
}
// Animation (tick)
function animate() {
	const time = performance.now();
	const delta = (time - prevTime) / 1000;
	
	// Player Movement
	if (controls.isLocked === true) {
		raycaster.ray.origin.copy(controls.object.position);
		raycaster.ray.origin.y -= 10;
		const intersections = raycaster.intersectObjects(objects, false);
		const onObject = intersections.length > 0;
		velocity.x -= velocity.x * 15.0 * delta;
		velocity.z -= velocity.z * 15.0 * delta;
		velocity.y -= 9.8 * 20.0 * delta;
		direction.z = Number(moveForward) - Number(moveBackward);
		direction.x = Number(moveRight) - Number(moveLeft);
		direction.normalize();
		const moveSpeed = isRunning ? 700.0 : 400.0;
		if (moveForward || moveBackward) velocity.z -= direction.z * moveSpeed * delta;
		if (moveLeft || moveRight) velocity.x -= direction.x * moveSpeed * delta;
		if (onObject === true) {
			velocity.y = Math.max(0, velocity.y);
		}
        if (velocity.y == 0) {
            canJump = true;
        }
		controls.moveRight( -velocity.x * delta );
		controls.moveForward( -velocity.z * delta );
		controls.object.position.y += ( velocity.y * delta );
		if ( controls.object.position.y < 12 ) {
			velocity.y = 0;
			controls.object.position.y = 12;
			canJump = true;
		}

        // SpotLight Location
        const offset = new THREE.Vector3(0, 0, -7);
        offset.applyQuaternion(camera.quaternion);
        spotLight.position.copy(camera.position).add(offset);
        const target = new THREE.Vector3(0, 0, -1);
        target.applyQuaternion(camera.quaternion);
        target.multiplyScalar(50).add(spotLight.position);
        spotLight.target.position.copy(target);
        spotLight.target.updateMatrixWorld();

		// Hemisphere Color Animation
		skyColor = (skyColor + 0.0001) % 1;
		const c = new THREE.Color().setHSL(skyColor, 1, 0.5);
		scene.getObjectByProperty('type', 'HemisphereLight').color.copy(c);

        // Floor Tiles
        const playerX = Math.floor(camera.position.x / floorSize);
        const playerZ = Math.floor(camera.position.z / floorSize);
        if (playerX !== currentCenterTile.x || playerZ !== currentCenterTile.y) {
            updateMap();
        }

        // Sky Box Animation
        if (skybox) {
            skybox.position.copy(controls.object.position);
        }

        // Animated Shape
        animatedShapes.forEach((shape) => {
            const t = time + shape.userData.timeOffset;
            shape.position.y = 15 + 2 * Math.sin(t / 800);
            shape.rotation.x = t / 3000;
            shape.rotation.y = t / 3000;
  
            const pulse = Math.sin(t / 1000) / 2.0 + 0.5;
            const dynamicHue = THREE.MathUtils.lerp(0.1, 0.9, pulse);
            shape.material.color.setHSL(dynamicHue, 0.9, 0.3);
            const emissiveStrength = THREE.MathUtils.lerp(0, 0.8, pulse);
            const emissiveColor = new THREE.Color().setHSL(dynamicHue, 0.3, 0.1);
            emissiveColor.multiplyScalar(emissiveStrength);
            shape.material.emissive.copy(emissiveColor);
        });

        // Bullets
        updateBullets(delta);
	}
	prevTime = time;
	renderer.render(scene, camera);

    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }
    
    stats.update();
}

function spawnObj() {
    const mtlLoader = new MTLLoader();
    mtlLoader.load('cactus.mtl', (mtl) => {
        mtl.preload();
        for (const mat of Object.values(mtl.materials)) {
            mat.side = THREE.DoubleSide;
            mat.alphaMap = null;
            mat.transparent = false;
            mat.specular = new THREE.Color(0.2,0.2,0.2);
            mat.shininess = 50;
        }
        const objLoader = new OBJLoader();
        objLoader.setMaterials(mtl);
        objLoader.load('cactus.obj', (root) => {
            root.scale.set(0.5, 0.5, 0.5);
            const dir = new THREE.Vector3();
            camera.getWorldDirection(dir);
            dir.normalize();
            const pos = new THREE.Vector3();
            pos.copy(camera.position).add(dir.multiplyScalar(50));
            pos.y = 0;
            root.position.copy(pos);
            scene.add(root);
            objects.push(root);
        });
    });
}

function createAnimatedShape() {
    const animatedGeo = new THREE.IcosahedronGeometry(10);
    const animatedMaterial = new THREE.MeshPhongMaterial({
        color: 0x00AAFF,
        emissive: 0x002244,
        emissiveIntensity: 0.5,
        shininess: 150
    });
    animatedMaterial.color.setRGB(0, 1, 1);
    animatedMaterial.colorSpace = THREE.SRGBColorSpace;
    const mesh = new THREE.Mesh(animatedGeo, animatedMaterial);
    mesh.userData.timeOffset = Math.random() * 10000;
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    dir.normalize();
    const pos = new THREE.Vector3();
    pos.copy(camera.position).add(dir.multiplyScalar(50));
    pos.y = 15;
    mesh.position.copy(pos);
    animatedShapes.push(mesh);
    objects.push(mesh);
    scene.add(mesh);
}

function createGeo(x, z) {
    const meshes = [];
    const numObjects = 5;
    for (let i = 0; i < numObjects; i++) {
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const geometry = shape.create();
        const material = new THREE.MeshPhongMaterial();
        material.color.copy(shape.color());
        material.colorSpace = THREE.SRGBColorSpace;
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = x * floorSize + Math.floor((Math.random() - 0.5) * 20) * 2;
        mesh.position.y = Math.floor(Math.random() * 10) * 5 + 4;
        mesh.position.z = z * floorSize + Math.floor((Math.random() - 0.5) * 20) * 2;
        scene.add(mesh);
        meshes.push(mesh);
        objects.push(mesh);
    }
    return meshes;
}

function createPillars(x, z) {
    if (x % 3 !== 0 || z % 3 !== 0) {
        return null;
    }

    // top radius, bot radius, height, segments
    const height = 150
    const pillarGeo = new THREE.CylinderGeometry(3, 3, height, 16);

    const loader = new THREE.TextureLoader();
    const texture = loader.load('pillar.png');
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.x = 3;
    const pillarMaterial = new THREE.MeshPhongMaterial({
        map: texture
    });
    const mesh = new THREE.Mesh(pillarGeo, pillarMaterial);
    mesh.position.x = (x + 0.5) * floorSize;
    mesh.position.y = height / 2;
    mesh.position.z = (z + 0.5) * floorSize;
    scene.add(mesh);
    objects.push(mesh);
    return mesh;
}

function updateMap() {
    function createFloorTile(x, z) {
        const plane = new THREE.PlaneGeometry(floorSize, floorSize);
        const loader = new THREE.TextureLoader();
        const texture = loader.load('checker.png');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.NearestFilter;
        texture.colorSpace = THREE.SRGBColorSpace;
        const repeats = floorSize / 15;
        texture.repeat.set(repeats, repeats);
        const planeMat = new THREE.MeshPhongMaterial({
            map: texture
        });
        const mesh = new THREE.Mesh(plane, planeMat);
        mesh.rotation.x = Math.PI * -0.5;
        mesh.position.set(x * floorSize, 0, z * floorSize);
        scene.add(mesh);
        return mesh;
    }
    
    const playerX = Math.floor(camera.position.x / floorSize);
    const playerZ = Math.floor(camera.position.z / floorSize);
    currentCenterTile.set(playerX, playerZ);

    // Update floor tiles
    for (const [pos, mesh] of floorTiles.entries()) {
        const [tileX, tileZ] = pos.split(',').map(Number);
        if (Math.abs(tileX - playerX) > floorCount || Math.abs(tileZ - playerZ) > floorCount) {
            scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
            floorTiles.delete(pos);
        }
    }

    // Update object tiles
    for (const [pos, objs] of objectTiles.entries()) {
        const [tileX, tileZ] = pos.split(',').map(Number);
        if (Math.abs(tileX - playerX) > floorCount || Math.abs(tileZ - playerZ) > floorCount) {
            objs.forEach(obj => {
                scene.remove(obj);
                obj.geometry.dispose();
                obj.material.dispose();
                const index = objs.indexOf(obj);
                if (index > -1) {
                    objs.splice(index, 1);
                }
            });
            objectTiles.delete(pos);
        }
    }

    // Update animation Shapes
    for (let i = animatedShapes.length - 1; i >= 0; i--) {
        const shape = animatedShapes[i];
        const shapeX = Math.floor(shape.position.x / floorSize);
        const shapeZ = Math.floor(shape.position.z / floorSize);
        if (Math.abs(shapeX - playerX) > floorCount || Math.abs(shapeZ - playerZ) > floorCount) {
            scene.remove(shape);
            shape.geometry.dispose();
            shape.material.dispose();
            const objIndex = objects.indexOf(shape);
            if (objIndex > -1) {
                objects.splice(objIndex, 1);
            }
            animatedShapes.splice(i, 1);
        }
    }

    // Create new floor tiles and objects
    for (let x = playerX - floorCount; x <= playerX + floorCount; x++) {
        for (let z = playerZ - floorCount; z <= playerZ + floorCount; z++) {
            const pos = `${x},${z}`;
            if (!floorTiles.has(pos)) {
                floorTiles.set(pos, createFloorTile(x, z));
                createPillars(x, z);
            }
            if (!objectTiles.has(pos)) {
                objectTiles.set(pos, createGeo(x, z));
            }
        }
    }
}

function createBullet() {
    const coneGeo = new THREE.ConeGeometry(0.1, 0.3, 10);
    const cylinderGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 10);
    const bulletMaterial = new THREE.MeshPhongMaterial({
        color: 0xff0000,
    });
    const cone = new THREE.Mesh(coneGeo, bulletMaterial);
    const cylinder = new THREE.Mesh(cylinderGeo, bulletMaterial);
    cone.position.z = -0.45;
    cone.rotation.x = -Math.PI / 2;
    cylinder.rotation.x = -Math.PI / 2;

    const bullet = new THREE.Group();
    bullet.add(cylinder);
    bullet.add(cone);
    bullet.position.copy(camera.position);
    const dir = new THREE.Vector3(0, 0, -1);
    dir.applyQuaternion(camera.quaternion);
    bullet.userData.direction = dir;
    bullet.quaternion.copy(camera.quaternion);
    
    scene.add(bullet);
    bullets.push(bullet);
    canShoot = false;
    setTimeout(() => {canShoot = true;}, 300);
}

function updateBullets(delta) {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.position.add(bullet.userData.direction.clone().multiplyScalar(bulletSpeed * delta));
        
        const raycaster = new THREE.Raycaster(bullet.position, bullet.userData.direction, 0, 1);
        const intersects = raycaster.intersectObjects(objects, true);
        if (intersects.length > 0) {
            const objectHit = intersects[0].object;
            const parentObj = objectHit.parent;
            const removingObj = (parentObj && parentObj.type === 'Group') ? parentObj : objectHit;
            scene.remove(removingObj);
            const index = objects.indexOf(removingObj);
            if (index > -1) {
                objects.splice(index, 1);
            }
            scene.remove(bullet);
            bullets.splice(i, 1);
            score += 10;
            scoreUI.textContent = `Score: ${score}`;
        }
        if (bullet.position.distanceTo(camera.position) > floorSize * floorCount) {
            scene.remove(bullet);
            bullets.splice(i, 1);
        }
    }
}

function resizeWindow() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

function main() {
    init();
}

main();