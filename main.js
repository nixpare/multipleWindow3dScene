import WindowManager from './WindowManager.js'

if (new URLSearchParams(window.location.search).get("clear")) {
	localStorage.clear();
	window.location.href = window.location.toString().replace(window.location.search, '');
}

let camera, scene, renderer;
let pixR = window.devicePixelRatio ? window.devicePixelRatio : 1;

let windowManager = new WindowManager();
let initialized = false;

document.addEventListener("visibilitychange", () => {
	if (document.visibilityState != 'hidden' && !initialized) {
		init();
	}
});

window.onload = () => {
	if (document.visibilityState != 'hidden') {
		init();
	}
};

function init() {
	initialized = true;

	setupScene();
	resize();
	animate();
	window.addEventListener('resize', resize);
}

function setupScene() {
	camera = new THREE.OrthographicCamera(0, 0, window.innerWidth, window.innerHeight, -10000, 10000);
	camera.position.z = 2.5;

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0.0);
	scene.add(camera);

	renderer = new THREE.WebGLRenderer({ antialias: true, depthBuffer: true });
	renderer.setPixelRatio(pixR);

	renderer.domElement.setAttribute("id", "scene");
	document.body.appendChild(renderer.domElement);

	let {x, y} = windowManager.getAbsoluteXY(window.innerWidth / 2, window.innerHeight / 2);
	windowManager.init(scene, x, y);
}

function updateCubes() {
	let {x, y} = windowManager.getAbsoluteXY(window.innerWidth / 2, window.innerHeight / 2);
	windowManager.updateCube(windowManager.cubeIndex, x, y);

	let t = windowManager.getTime();

	windowManager.cubes.forEach(({c, c3d}) => {
		c3d.position.x = c.x - window.screenLeft;
		c3d.position.y = c.y - window.screenTop;
		c3d.rotation.x = t * .5;
		c3d.rotation.y = t * .3;
	})
}

function animate() {
	requestAnimationFrame(animate);

	updateCubes();
	renderer.render(scene, camera);
}

// resize the renderer to fit the window size
function resize() {
	let {x, y} = windowManager.getAbsoluteXY(window.innerWidth / 2, window.innerHeight / 2);
	windowManager.updateCube(windowManager.cubeIndex, x, y);

	camera = new THREE.OrthographicCamera(0, window.innerWidth, 0, window.innerHeight, -10000, 10000);
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}
