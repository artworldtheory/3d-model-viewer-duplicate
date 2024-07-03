let camera, scene, renderer;
let controls, pointerControls;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let canJump = false;
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
    camera.position.set(0, -20, 100); // Set the initial camera position much lower and further away

    // Create a renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
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

        // Load the first model
        const loader = new THREE.GLTFLoader();
        loader.load(
            'assets/warehouse_fbx_model_free/scene.gltf',
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

                // Load the second model
                loader.load(
                    'assets/sony_gv-8_video_walkman/scene.gltf',
                    function (gltf2) {
                        const model2 = gltf2.scene;
                        model2.traverse(function (node) {
                            if (node.isMesh) {
                                node.castShadow = true; // Enable shadows for meshes
                                node.receiveShadow = true;
                                node.material.envMap = envMap; // Apply environment map to materials
                                node.material.needsUpdate = true;
                            }
                        });

                        // Position and scale the second model
                        model2.position.copy(boxCenter);
                        model2.scale.set(10, 10, 10); // Increase the size of the second model by 10 times

                        scene.add(model2);

                        // Check if the second model is added to the scene
                        console.log("Second model loaded and added to the scene");

                        // Set camera position to center of the first model and adjust controls target
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
                        console.error('Error loading second model:', error);
                    }
                );
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
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Enable smooth damping
    controls.dampingFactor = 0.25; // Damping factor
    controls.screenSpacePanning = true; // Allow panning
    controls.minDistance = 10; // Minimum zoom distance
    controls.maxDistance = 2000; // Maximum zoom distance
    controls.maxPolarAngle = Math.PI / 2; // Lock vertical movement
    controls.zoomSpeed = 1.0; // Set zoom speed

    // Add PointerLockControls for first-person navigation
    pointerControls = new THREE.PointerLockControls(camera, document.body);

    // Handle Pointer Lock
    const blocker = document.getElementById('blocker');
    const instructions = document.getElementById('instructions');

    instructions.addEventListener('click', function () {
        pointerControls.lock();
    });

    pointerControls.addEventListener('lock', function () {
        instructions.style.display = 'none';
        blocker.style.display = 'none';
    });

    pointerControls.addEventListener('unlock', function () {
        blocker.style.display = 'block';
        instructions.style.display = '';
    });

    scene.add(pointerControls.getObject());

    // Keyboard Controls
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
            case 'Space':
                if (canJump === true) velocity.y += 350;
                canJump = false;
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

    // Handle window resize
    window.addEventListener('resize', function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    const time = performance.now();
    const delta = (time - prevTime) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;
    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveLeft) - Number(moveRight);
    direction.normalize(); // this ensures consistent movements in all directions

    if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

    pointerControls.moveRight(-velocity.x * delta);
    pointerControls.moveForward(-velocity.z * delta);

    if (pointerControls.getObject().position.y < 10) {
        velocity.y = 0;
        pointerControls.getObject().position.y = 10;
        canJump = true;
    }

    pointerControls.getObject().position.y += (velocity.y * delta); // new behavior

    controls.update(); // Update orbit controls
    TWEEN.update(); // Update tween animations
    renderer.render(scene, camera); // Render the scene

    prevTime = time;
}

// Start the animation loop
animate();
