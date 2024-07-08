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
        model2.position.set(0, 6, 0); // Adjusted: Set initial position to the origin and move up slightly

        model2.scale.set(150, 150, 150); // Scale down the second model slightly
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
                        console.log(`Loaded mesh: ${node.name}`);
                    }
                });

                // Position the additional model around the second model
                model.position.set(50, 0, 50); // Adjust the position as needed
                model.scale.set(0.1, 0.1, 0.1); // Scale down the model by a factor of 0.1 (10 times smaller)

                scene.add(model);

                // Check if the additional model is added to the scene
                console.log("Additional model loaded and added to the scene");
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
