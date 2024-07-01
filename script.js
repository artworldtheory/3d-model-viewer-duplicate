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
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
document.getElementById('container').appendChild(renderer.domElement);

// Load the HDR environment map
const rgbeLoader = new THREE.RGBELoader();
rgbeLoader.load('path/to/your/hdr/file.hdr', function(texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    scene.background = texture;

    // Load the model
    const loader = new THREE.GLTFLoader();
    loader.load(
        'assets/model.gltf',
        function (gltf) {
            const model = gltf.scene;

            // Enhance materials
            model.traverse(function (child) {
                if (child.isMesh) {
                    child.material.envMap = texture;
                    child.material.needsUpdate = true;
                }
            });

            scene.add(model);
            animate();
        },
        undefined,
        function (error) {
            console.error(error);
        }
    );
});

// Add ambient light to the scene
const ambientLight = new THREE.AmbientLight(0x404040, 2); // Soft white light, increased intensity
scene.add(ambientLight);

// Add directional lights to the scene
const directionalLight1 = new THREE.DirectionalLight(0xffffff, 2);
directionalLight1.position.set(5, 10, 7.5);
scene.add(directionalLight1);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 2);
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
