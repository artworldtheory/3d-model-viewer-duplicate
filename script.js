<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D Model Viewer</title>
    <style>
        body { margin: 0; }
        canvas { display: block; }
    </style>
</head>
<body>
    <script src="https://cdn.jsdelivr.net/npm/three@0.136.0/build/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.136.0/examples/js/controls/OrbitControls.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.136.0/examples/js/loaders/GLTFLoader.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.136.0/examples/js/loaders/RGBELoader.js"></script>
    <script>
        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 5, 10);

        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

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

        // Add OrbitControls for interaction
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.screenSpacePanning = true;
        controls.minDistance = 0.1;
        controls.maxDistance = 1000;
        controls.autoRotate = false;
        controls.maxPolarAngle = Math.PI / 2.5;

        // Load the GLB model
        const loader = new THREE.GLTFLoader();
        loader.load(
            'https://artworldtheory.github.io/3d-model-viewer/assets/model.glb',
            function (gltf) {
                const model = gltf.scene;
                scene.add(model);

                // Compute the bounding box of the model
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
    </script>
</body>
</html>
