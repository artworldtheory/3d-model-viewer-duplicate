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

// Add OrbitControls for touch interaction
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Enable smooth damping
controls.dampingFactor = 0.25; // Damping factor
controls.screenSpacePanning = false; // No panning allowed
controls.minDistance = 1; // Minimum zoom distance
controls.maxDistance = 500; // Maximum zoom distance

// Custom shader material to invert colors
const invertColorShader = {
    uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib['lights'],
        {
            'tDiffuse': { value: null }
        }
    ]),
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        varying vec2 vUv;
        void main() {
            vec4 color = texture2D(tDiffuse, vUv);
            gl_FragColor = vec4(1.0 - color.rgb, color.a); // Invert the colors
        }
    `
};

// Load the model
const loader = new THREE.GLTFLoader();
loader.load(
    'assets/model.gltf',
    function (gltf) {
        const model = gltf.scene;

        // Modify materials to use custom shader for color inversion
        model.traverse(function (child) {
            if (child.isMesh) {
                child.material = new THREE.ShaderMaterial(invertColorShader);
                child.material.lights = true;
            }
        });

        scene.add(model);
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
