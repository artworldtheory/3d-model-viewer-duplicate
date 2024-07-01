// script.js

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Create a renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1); // Set background color to white
document.getElementById('container').appendChild(renderer.domElement);

// Add ambient light to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Soft white light, increased intensity
scene.add(ambientLight);

// Add directional lights to the scene
const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight1.position.set(5, 10, 7.5);
scene.add(directionalLight1);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight2.position.set(-5, -10, -7.5);
scene.add(directionalLight2);

// Add point light to the scene
const pointLight = new THREE.PointLight(0xffffff, 2, 100);
pointLight.position.set(0, 10, 0);
scene.add(pointLight);

// Add OrbitControls for touch interaction
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Enable smooth damping
controls.dampingFactor = 0.25; // Damping factor
controls.screenSpacePanning = true; // Allow panning
controls.minDistance = 0.1; // Minimum zoom distance
controls.maxDistance = 1000; // Maximum zoom distance
controls.maxPolarAngle = Math.PI; // Allow full vertical rotation
controls.autoRotate = true; // Enable auto rotation
controls.autoRotateSpeed = 1.0; // Auto rotation speed

// Load the model
const loader = new THREE.GLTFLoader();
loader.load(
    'assets/model.gltf',
    function (gltf) {
        const model = gltf.scene;
        scene.add(model);

        // Calculate model bounding box
        const box = new THREE.Box3().setFromObject(model);
        const boxSize = box.getSize(new THREE.Vector3()).length();
        const boxCenter = box.getCenter(new THREE.Vector3());

        // Set camera position to center of the model and adjust controls target
        controls.target.copy(boxCenter);
        camera.position.copy(boxCenter);
        camera.position.x += boxSize / 2.0;
        camera.position.y += boxSize / 5.0;
        camera.position.z += boxSize / 2.0;

        // Set OrbitControls constraints
        controls.maxPolarAngle = Math.PI / 2; // Limit vertical rotation to 90 degrees
        controls.minAzimuthAngle = -Infinity; // Allow full horizontal rotation
        controls.maxAzimuthAngle = Infinity;
        
        // Define bounding box limits for camera
        const minPan = box.min.clone().sub(boxCenter);
        const maxPan = box.max.clone().sub(boxCenter);
        
        controls.addEventListener('change', function() {
            const offset = camera.position.clone().sub(controls.target);

            // Constrain the camera within the box limits
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

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Update controls
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
