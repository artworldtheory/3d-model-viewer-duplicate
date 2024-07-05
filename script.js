let camera, scene, renderer, controls;
let prevTime = performance.now();
let initialZoomComplete = false;

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

    // PMREMGenerator for environment maps
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    // Load HDR environment map
    const rgbeLoader = new THREE.RGBELoader();
    rgbeLoader.setDataType(THREE.UnsignedByteType);
    rgbeLoader.load('assets/metro_noord_1k.hdr', function(texture) {
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        scene.environment = envMap;
        texture.dispose();
        pmremGenerator.dispose();

        // Load the first model (sony_gv-8_video_walkman)
        const loader = new THREE.GLTFLoader();
        loader.load(
            'assets/sony_gv-8_video_walkman/scene.gltf',
            function(gltf2) {
                const model2 = gltf2.scene;
                model2.traverse(function(node) {
                    if (node.isMesh) {
                        node.castShadow = true;
                        node.receiveShadow = true;
                        node.material.envMap = envMap; // Use environment map
                        node.material.needsUpdate = true;
                    }
                });

                // Position, scale and rotate the second model
                model2.position.set(0, 0, 0); // Set initial position to the origin
                model2.scale.set(200, 200, 200); // Scale up the second model by a factor of 200
                model2.rotation.y = Math.PI / 8; // Rotate slightly towards the viewer

                scene.add(model2);

                // Check if the second model is added to the scene
                console.log("Second model loaded and added to the scene");

                // Set the camera's target to the center of the second model
                controls.target.copy(model2.position);

                // Load the additional model
                loader.load(
                    'assets/model.gltf',
                    function(gltf) {
                        const model = gltf.scene;
                        model.traverse(function(node) {
                            if (node.isMesh) {
                                node.castShadow = true;
                                node.receiveShadow = true;
                                node.material.envMap = envMap; // Use environment map
                                node.material.needsUpdate = true;
                            }
                        });

                        // Position the additional model around the second model
                        model.position.set(50, 0, 50); // Adjust the position as needed
                        model.scale.set(0.1, 0.1, 0.1); // Scale down the model by a factor of 0.1 (10 times smaller)

                        scene.add(model);

                        // Check if the additional model is added to the scene
                        console.log("Additional model loaded and added to the scene");

                        // Set initial camera position for zooming effect
                        new TWEEN.Tween(camera.position)
                            .to({ x: 0, y: 100, z: 100 }, 2000)
                            .easing(TWEEN.Easing.Quadratic.InOut)
                            .onComplete(() => {
                                initialZoomComplete = true; // Enable free roaming after zoom in
                            })
                            .start();
                    },
                    undefined,
                    function(error) {
                        console.error('Error loading additional model:', error);
                    }
                );
            },
            undefined,
            function(error) {
                console.error('Error loading second model:', error);
            }
        );
    });

    // Add ambient light to the scene
    const ambientLight = new THREE.AmbientLight(0x888888, 1); // Change to plain grey light
    scene.add(ambientLight);

    // Add directional light to the scene
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // White light
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

    // Add additional point lights for better illumination
    const pointLight1 = new THREE.PointLight(0xffffff, 1, 1000);
    pointLight1.position.set(50, 50, 50);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 1, 1000);
    pointLight2.position.set(-50, -50, 50);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xffffff, 1, 1000);
    pointLight3.position.set(50, -50, -50);
    scene.add(pointLight3);

    const pointLight4 = new THREE.PointLight(0xffffff, 1, 1000);
    pointLight4.position.set(-50, 50, -50);
    scene.add(pointLight4);

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
    TWEEN.update(); // Update TWEEN animations
    controls.update(); // Update orbit controls
    renderer.render(scene, camera); // Render the scene
}

// Start the animation loop
animate();
