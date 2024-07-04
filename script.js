let camera, scene, renderer, controls;
let prevTime = performance.now();

init();
animate();

function init() {
    // Create a scene
    scene = new THREE.Scene();

    // Create a camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 20, 300); // Set the camera position further back to account for larger model

    // Create a renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('container').appendChild(renderer.domElement);

    // Load the second model directly
    const loader = new THREE.GLTFLoader();
    loader.load(
        'assets/sony_gv-8_video_walkman/scene.gltf',
        function(gltf2) {
            const model2 = gltf2.scene;
            model2.traverse(function(node) {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                    node.material.envMap = null; // Remove environment map
                    node.material.needsUpdate = true;
                }
            });

            // Position, scale and rotate the second model
            model2.position.set(0, 0, 0); // Set initial position to the origin
            model2.scale.set(100, 100, 100); // Scale up the second model by a factor of 100
            model2.rotation.y = Math.PI / 8; // Rotate slightly towards the viewer

            // Create plain white lighting for the second model
            const model2AmbientLight = new THREE.AmbientLight(0xffffff, 1);
            scene.add(model2AmbientLight);

            const model2DirectionalLight = new THREE.DirectionalLight(0xffffff, 1);
            model2DirectionalLight.position.set(5, 10, 7.5);
            model2DirectionalLight.castShadow = true;
            scene.add(model2DirectionalLight);

            scene.add(model2);

            // Check if the second model is added to the scene
            console.log("Second model loaded and added to the scene");

            // Set the camera's target to the center of the second model
            controls.target.copy(model2.position);

        },
        undefined,
        function(error) {
            console.error('Error loading second model:', error);
        }
    );

    // Add ambient light to the scene
    const ambientLight = new THREE.AmbientLight(0x888888, 1); // Change to plain grey light
    scene.add(ambientLight);

    // Add directional light to the scene
    const directionalLight = new THREE.DirectionalLight(0x888888, 1); // Change to plain grey light
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);

    // Add OrbitControls for navigation
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Enable smooth damping
    controls.dampingFactor = 0.25; // Damping factor
    controls.screenSpacePanning = true; // Allow panning
    controls.minDistance = 1; // Minimum zoom distance to allow close zoom
    controls.maxDistance = 2000; // Maximum zoom distance
    controls.maxPolarAngle = Math.PI; // Allow full vertical movement
    controls.zoomSpeed = 1.0; // Set zoom speed

    // Handle window resize
    window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Update orbit controls
    renderer.render(scene, camera); // Render the scene
}

// Start the animation loop
animate();
