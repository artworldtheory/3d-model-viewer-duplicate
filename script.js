// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, -20, 100); // Set the initial camera position much lower and further away

// Log the initial camera position to verify
console.log("Initial Camera Position:", camera.position);

// Create a renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1); // Set background color to white
renderer.shadowMap.enabled = true; // Enable shadows
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Shadow mapping type
document.getElementById('container').appendChild(renderer.domElement);

// PMREMGenerator for environment maps
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

// Load HDR environment map
const rgbeLoader = new THREE.RGBELoader();
rgbeLoader.setDataType(THREE.UnsignedByteType); // Fix CORB issue by setting data type
rgbeLoader.load('assets/metro_noord_1k.hdr', function(texture) {
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;
    scene.environment = envMap;
    texture.dispose();
    pmremGenerator.dispose();

    // Load the model
    const loader = new THREE.GLTFLoader();
    loader.load(
        'assets/model.gltf',
        function (gltf) {
            const model = gltf.scene;
            model.traverse(function (node) {
                if (node.isMesh) {
                    node.castShadow = true; // Enable shadows for meshes
                    node.receiveShadow = true;
                    node.material.envMap = envMap; // Apply environment map to materials
                    node.material.needsUpdate = true;
                }
            });
            scene.add(model);

            // Check if the model is added to the scene
            console.log("Model loaded and added to the scene");

            // Calculate model bounding box
            const box = new THREE.Box3().setFromObject(model);
            const boxSize = box.getSize(new THREE.Vector3()).length();
            const boxCenter = box.getCenter(new THREE.Vector3());

            // Set camera position to center of the model and adjust controls target
            controls.target.copy(boxCenter);
            camera.lookAt(boxCenter);

            // Log the bounding box size and center
            console.log("Bounding Box Size:", boxSize);
            console.log("Bounding Box Center:", boxCenter);

            // Create a tween to animate the camera position
            new TWEEN.Tween(camera.position)
                .to({ x: boxCenter.x + boxSize / 2.0, y: boxCenter.y - boxSize / 4.0, z: boxCenter.z + boxSize / 2.0 }, 2000) // Duration of 2 seconds
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate(function () {
                    camera.lookAt(boxCenter);
                })
                .start();

            animate();
        },
        undefined,
        function (error) {
            console.error('Error loading model:', error);
        }
    );
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
controls.minDistance = 10; // Minimum zoom distance
controls.maxDistance = 2000; // Maximum zoom distance
controls.maxPolarAngle = Math.PI / 2; // Lock vertical movement

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Update controls
    TWEEN.update(); // Update tween animations
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
