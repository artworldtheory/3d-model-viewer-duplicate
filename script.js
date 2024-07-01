// script.js

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);

// Add light to the scene
const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Audio setup
const listener = new THREE.AudioListener();
camera.add(listener);
const sound = new THREE.PositionalAudio(listener);

const audioLoader = new THREE.AudioLoader();
audioLoader.load('assets/your_audio_file.mp3', function(buffer) {
    sound.setBuffer(buffer);
    sound.setRefDistance(20);
    sound.setLoop(true);
});

// Load the model
const loader = new THREE.GLTFLoader();
loader.load(
    'assets/model.gltf',
    function (gltf) {
        const model = gltf.scene;

        // Modify materials to add custom shaders
        model.traverse(function (child) {
            if (child.isMesh) {
                child.material = new THREE.ShaderMaterial({
                    vertexShader: ` 
                        varying vec3 vNormal;

                        void main() {
                            vNormal = normalize(normalMatrix * normal);
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        }
                    `,
                    fragmentShader: ` 
                        varying vec3 vNormal;

                        void main() {
                            float intensity = dot(vNormal, vec3(0.0, 0.0, 1.0));
                            gl_FragColor = vec4(intensity, intensity, intensity, 1.0);
                        }
                    `,
                    uniforms: {}
                });
            }
        });

        // Add the model to the scene
        scene.add(model);

        // Add positional audio to a specific part of the model
        const targetMesh = model.getObjectByName('target_mesh_name'); // Replace with the actual mesh name
        if (targetMesh) {
            targetMesh.add(sound);
        }

        animate();
    },
    undefined,
    function (error) {
        console.error(error);
    }
);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

