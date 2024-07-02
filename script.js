// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set background color
renderer.setClearColor(0xffffff, 1); // White background

// PMREMGenerator for environment maps
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

// Load HDR environment texture
const rgbeLoader = new THREE.RGBELoader();
rgbeLoader.load('assets/metro_noord_1k.hdr', function (texture) {
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;
    scene.environment = envMap;
    texture.dispose();
    pmremGenerator.dispose();

    // Load the GLTF model
    const loader = new THREE.GLTFLoader();
    loader.load('assets/model.glb', function (gltf) {
        const model = gltf.scene;
        scene.add(model);
        
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

// Handle window resize
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

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
controls.autoRotate = true; // Enable auto rotation
controls.autoRotateSpeed = 1.0; // Auto rotation speed

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

const onKeyDown = function(event) {
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

const onKeyUp = function(event) {
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

    camera.position.x += velocity.x * delta;
    camera.position.z += velocity.z * delta;

    // Constrain camera within the bounding box
    camera.position.x = Math.max(minPan.x, Math.min(maxPan.x, camera.position.x));
    camera.position.z = Math.max(minPan.z, Math.min(maxPan.z, camera.position.z));

    prevTime = time;

    controls.update();
    renderer.render(scene, camera);
}

animate();
