let camera, scene, renderer, controls;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

init();
animate();

function init() {
    // Create a scene
    scene = new THREE.Scene();

    // Create a camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 0, 100);

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

        // Load the first model
        const loader = new THREE.GLTFLoader();
        loader.load(
            'assets/warehouse_fbx_model_free/scene.gltf',
            function(gltf) {
                const model = gltf.scene;
                model.traverse(function(node) {
                    if (node.isMesh) {
                        node.castShadow = true;
                        node.receiveShadow = true;
                        node.material.envMap = envMap;
                        node.material.needsUpdate = true;
                    }
                });
                scene.add(model);

                // Check if the model is added to the scene
                console.log("Model loaded and added to the scene");

                // Calculate model bounding box
                const box = new THREE.Box3().setFromObject(model);
                const boxCenter = box.getCenter(new THREE.Vector3());

                // Load the second model
                loader.load(
                    'assets/sony_gv-8_video_walkman/scene.gltf',
                    function(gltf2) {
                        const model2 = gltf2.scene;
                        model2.traverse(function(node) {
                            if (node.isMesh) {
                                node.castShadow = true;
                                node.receiveShadow = true;
                                node.material.envMap = envMap;
                                node.material.needsUpdate = true;
                            }
                        });

                        // Position and scale the second model
                        model2.position.copy(boxCenter);
                        model2.scale.set(2, 2, 2); // Scale up the second model by a factor of 2

                        scene.add(model2);

                        // Check if the second model is added to the scene
                        console.log("Second model loaded and added to the scene");

                        // Set camera position to center of the first model and adjust controls target
                        controls.target.copy(boxCenter);
                        camera.lookAt(boxCenter);

                        // Log the bounding box size and center
                        console.log("Bounding Box Center:", boxCenter);
                    },
                    undefined,
                    function(error) {
                        console.error('Error loading second model:', error);
                    }
                );
            },
            undefined,
            function(error) {
                console.error('Error loading model:', error);
            }
        );
    });

    // Add ambient light to the scene
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add directional light to the scene
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
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
    controls.minDistance = 10; // Minimum zoom distance
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
