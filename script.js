<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D Model Viewer</title>
    <style>
        body { margin: 0; }
        canvas { display: block; }
    </style>
</head>
<body>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/RGBELoader.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/pmrem/PMREMGenerator.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
    <script>
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // Load HDR environment map
        new THREE.RGBELoader()
            .setPath('assets/')
            .load('metro_noord_1k.hdr', function (texture) {
                const pmremGenerator = new THREE.PMREMGenerator(renderer);
                const envMap = pmremGenerator.fromEquirectangular(texture).texture;
                pmremGenerator.dispose();

                scene.background = envMap;
                scene.environment = envMap;

                // Load GLTF model
                const loader = new THREE.GLTFLoader();
                loader.load(
                    'assets/model.glb',
                    function (gltf) {
                        const model = gltf.scene;
                        scene.add(model);

                        // Compute bounding box for the model
                        const box = new THREE.Box3().setFromObject(model);
                        const boxCenter = box.getCenter(new THREE.Vector3());
                        const boxSize = box.getSize(new THREE.Vector3()).length();
                        
// Center the model
model.position.x += (model.position.x - boxCenter.x);
model.position.y += (model.position.y - boxCenter.y);
model.position.z += (model.position.z - boxCenter.z);

// Adjust the camera to fit the model
camera.position.copy(boxCenter);
camera.position.x += boxSize / 2.0;
camera.position.y += boxSize / 5.0;
controls.target.copy(boxCenter);

// Constrain the camera within the box limits
const minPan = box.min.clone().sub(boxCenter);
const maxPan = box.max.clone().sub(boxCenter);

controls.addEventListener('change', function () {
    const offset = camera.position.clone().sub(controls.target);
    offset.x = Math.max(minPan.x, Math.min(maxPan.x, offset.x));
    offset.y = Math.max(minPan.y, Math.min(maxPan.y, offset.y));
    offset.z = Math.max(minPan.z, Math.min(maxPan.z, offset.z));
    camera.position.copy(controls.target).add(offset);
    camera.lookAt(controls.target);
});

animate();
},
undefined,
function (error) {
    console.error(error);
}
);

// Add ambient light to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light, lower intensity
scene.add(ambientLight);

// Add directional light to the scene
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true; // Enable shadows for the light
directionalLight.shadow.mapSize.width = 2048; // Shadow map resolution
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
scene.add(directionalLight);

// Add OrbitControls for touch interaction
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Enable smooth damping
controls.dampingFactor = 0.25; // Damping factor
controls.screenSpacePanning = true; // Allow panning
controls.minDistance = 0.1; // Minimum zoom distance
controls.maxDistance = 1000; // Maximum zoom distance
controls.autoRotate = false; // Disable auto rotation

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

const onKeyDown = function (event) {
    switch (event.code) {
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
    }
};

const onKeyUp = function (event) {
    switch (event.code) {
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
    }
};

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

let prevTime = performance.now();

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    const time = performance.now();
    const delta = (time - prevTime) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveLeft) - Number(moveRight);
    direction.normalize();

    if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

    controls.target.x -= velocity.x * delta;
    controls.target.z -= velocity.z * delta;

    controls.update();
    renderer.render(scene, camera);

    prevTime = time;
}

animate();

// Handle window resize
window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
