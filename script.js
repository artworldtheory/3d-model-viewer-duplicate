// script.js

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 10); // Lower the camera position significantly

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
            controls.maxPolarAngle = Math.PI / 2.5; // Limit vertical rotation
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
controls.minDistance = 0.1; // Minimum zoom distance
controls.maxDistance = 1000; // Maximum zoom distance
controls.autoRotate = false; // Disable auto rotation

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
