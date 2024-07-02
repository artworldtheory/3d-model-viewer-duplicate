// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set background color
renderer.setClearColor(0xffffff, 1); // White background

// PMREMGenerator for environment maps
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

// Load HDR environment texture
const rgbeLoader = new THREE.RGBELoader();
rgbeLoader.load('assets/metro_noord_1k.hdr', function (texture) {
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;
    scene.environment = envMap;
    texture.dispose();
    pmremGenerator.dispose();

    // Load the GLTF model
    const loader = new THREE.GLTFLoader();
    loader.load('assets/model.glb', function (gltf) {
        const model = gltf.scene;
        scene.add(model);

        // Center the model
        const box = new THREE.Box3().setFromObject(model);
        const boxCenter = box.getCenter(new THREE.Vector3());
        const boxSize = box.getSize(new THREE.Vector3()).length();
        model.position.x += (model.position.x - boxCenter.x);
        model.position.y += (model.position.y - boxCenter.y);
        model.position.z += (model.position.z - boxCenter.z);

        // Adjust the camera to fit the model
        camera.position.copy(boxCenter);
        camera.position.x += boxSize / 2.0;
        camera.position.y += boxSize / 5.0;
        controls.target.copy(boxCenter);

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set background color
renderer.setClearColor(0xffffff, 1); // White background

// PMREMGenerator for environment maps
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

// Load HDR environment texture
const rgbeLoader = new THREE.RGBELoader();
rgbeLoader.load('assets/metro_noord_1k.hdr', function (texture) {
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;
    scene.environment = envMap;
    texture.dispose();
    pmremGenerator.dispose();

    // Load the GLTF model
    const loader = new THREE.GLTFLoader();
    loader.load('assets/model.glb', function (gltf) {
        const model = gltf.scene;
        scene.add(model);

        // Center the model
        const box = new THREE.Box3().setFromObject(model);
        const boxCenter = box.getCenter(new THREE.Vector3());
        const boxSize = box.getSize(new THREE.Vector3()).length();
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
            const offset = camera.position.clone().sub(controls
