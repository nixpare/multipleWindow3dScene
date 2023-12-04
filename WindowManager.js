class WindowManager {
	bc;
	scene;
	cubes = new Map();
	cubeIndex;

	constructor() {
		let windowsCount = +localStorage.getItem('windowsCount') + 1;
		localStorage.setItem('windowsCount', windowsCount);

		this.bc = new BroadcastChannel('multiWindowChannel');
		this.bc.onmessage = (ev) => {
			let {type, data} = ev.data
			switch (type) {
				case 'update':
					this.updateCube(data.i, data.cube.x, data.cube.y);
					break;
				case 'exit':
					this.removeCube(data);
					break;
				case 'hello':
					let {c} = this.cubes.get(this.cubeIndex);
					this.bc.postMessage({
						type: 'update',
						data: {
							i: this.cubeIndex,
							cube: { x: c.x, y: c.y },
						}
					});
					break;
			}
		}

		window.addEventListener('beforeunload', (ev) => {
			this.bc.postMessage({
				type: 'exit',
				data: this.cubeIndex,
			});

			let windowsCount = +localStorage.getItem('windowsCount');
			localStorage.setItem('windowsCount', windowsCount-1);

			if (windowsCount == 1) {
				localStorage.setItem('cubesCount', 0);
			}

			this.bc.close();
		});
	}

	init(scene, x, y) {
		this.scene = scene;

		this.cubeIndex = +localStorage.getItem('cubesCount') + 1;
		localStorage.setItem('cubesCount', this.cubeIndex);

		this.updateCube(this.cubeIndex, x, y);
		this.bc.postMessage({ type: 'hello' });
	}

	create3DCube(i) {
		let color = new THREE.Color();
		color.setHSL(i * .1, 1.0, .5);

		let s = 100 + 1 * 50;
		return new THREE.Mesh(new THREE.BoxGeometry(s, s, s), new THREE.MeshBasicMaterial({ color: color, wireframe: true }));
	}

	updateCube(i, x, y) {
		let c3d;
		let storedCube = this.cubes.get(i);

		if (!storedCube) {
			c3d = this.create3DCube(i);
			this.scene.add(c3d);
		} else {
			c3d = storedCube.c3d;
		}

		this.cubes.set(i, {
			c: { x: x, y: y },
			c3d: c3d
		});

		if (i == this.cubeIndex) {
			this.bc.postMessage({
				type: 'update',
				data: {
					i: i,
					cube: { x: x, y: y },
				}
			});
		}
	}

	removeCube(i) {
		let {c3d} = this.cubes.get(i);
		this.scene.remove(c3d);
		this.cubes.delete(i);
	}

	getCubes() {
		return [...this.cubes.entries()];
	}

	getTime() {
		return (new Date()).getTime() / 1000.0;
	}

	getAbsoluteXY(x, y) {
		return {
			x: window.screenLeft + x,
			y: window.screenTop + y
		}
	}
}

export default WindowManager;
