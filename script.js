// Initialize the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

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

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

// Load the model
const loader = new THREE.GLTFLoader();
loader.load(
    'assets/model.glb',
    function(gltf) {
        const model = gltf.scene;
        scene.add(model);

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

// Handle window resize
window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();
