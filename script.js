let camera, scene, renderer, controls;
let prevTime = performance.now();
let initialZoomComplete = false;
let userInteracted = false;

init();
animate();

function isWebGLAvailable() {
    try {
        const canvas = document.createElement('canvas');
        return !!window.WebGLRenderingContext && (
            canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
        );
    } catch (e) {
        return false;
    }
}

function init() {
    if (!isWebGLAvailable()) {
        alert('WebGL is not available on your browser.');
        return;
    }

    // Create a loading manager
    const loadingManager = new THREE.LoadingManager(
        // Loaded callback
        () => {
            console.log("All assets loaded");
            const loadingScreen = document.getElementById('loading-screen');
            loadingScreen.style.display = 'none';
        },
        // Progress callback
        (url, itemsLoaded, itemsTotal) => {
            console.log(`Loading file: ${url}. Loaded ${itemsLoaded} of ${itemsTotal} files.`);
            const percentage = Math.round((itemsLoaded / itemsTotal) * 100);
            document.getElementById('loading-percentage').innerText = percentage;
        },
        // Error callback
        (url) => {
            console.error(`There was an error loading ${url}`);
            alert(`Error loading ${url}`);
        }
    );

    // Create a scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff); // Set the scene background to white

    // Create a camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 10, 300); // Set the camera position slightly lower

    // Create a renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('container').appendChild(renderer.domElement);

    // Add a basic cube to the scene
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

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

    // Add raycaster for detecting clicks on objects
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onMouseClick(event) {
        userInteracted = true;
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
            const object = intersects[0].object;
            if (object.userData.type) {
                handleButtonClick(object.userData.type);
            }
        }
    }

    window.addEventListener('click', onMouseClick, false);

    // Handle touch events for mobile
    function onTouchStart(event) {
        userInteracted = true;
        if (event.touches.length === 1) {
            event.preventDefault();
            mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);

            const intersects = raycaster.intersectObjects(scene.children, true);

            if (intersects.length > 0) {
                const object = intersects[0].object;
                if (object.userData.type) {
                    handleButtonClick(object.userData.type);
                }
            }
        }
    }

    window.addEventListener('touchstart', onTouchStart, false);
}

function handleButtonClick(type) {
    switch (type) {
        case 'play':
            playAudio(audioFiles[currentAudioIndex]);
            break;
        case 'pause':
            pauseAudio();
            break;
        case 'forward':
            nextAudio();
            break;
        case 'backward':
            previousAudio();
            break;
    }
}

function playAudio(url) {
    if (!sound) {
        sound = new THREE.Audio(listener);
        audioLoader.load(url, function(buffer) {
            sound.setBuffer(buffer);
            sound.setLoop(false);
            sound.setVolume(0.5);
            if (userInteracted) {
                sound.play();
            }
        });
    } else {
        if (sound.isPlaying) {
            sound.stop();
        }
        audioLoader.load(url, function(buffer) {
            sound.setBuffer(buffer);
            if (userInteracted) {
                sound.play();
            }
        });
    }
}

function pauseAudio() {
    if (sound && sound.isPlaying) {
        sound.pause();
    }
}

function nextAudio() {
    currentAudioIndex = (currentAudioIndex + 1) % audioFiles.length;
    playAudio(audioFiles[currentAudioIndex]);
}

function previousAudio() {
    currentAudioIndex = (currentAudioIndex - 1 + audioFiles.length) % audioFiles.length;
    playAudio(audioFiles[currentAudioIndex]);
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
