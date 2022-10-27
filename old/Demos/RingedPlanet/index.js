const scene = new THREE.Scene(); 
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); 
const renderer = new THREE.WebGLRenderer({antialias : true}); 

sceneSetup();
lightSetup();




// ======================= gen the planet mesh =======================

const geometry = new THREE.SphereGeometry(1.8, 32, 16); 

const material = new THREE.ShaderMaterial({
	...PlanetShader,
	fog: true,
	lights: true,
	dithering: true,
});

const planet = new THREE.Mesh( geometry, material ); 
planet.castShadow = true; //default is false
scene.add( planet ); 



// scene.children.forEach(c => {
// 	c.position.y += 2;
// })

generateField(numberOfAsteroids);


camera.position.z = 13;
camera.position.y = 3;

camera.lookAt(0,-5,0);

camera.translateY(1);


// ======================= animation loop =======================
let time = 0;
function animate() { 
	AsteroidField.fields.forEach(field => {
		field.instance.rotation.y += field.orbitSpeed;
	})
	// asteroidField.rotation.y += .0002;
	if(valueChange) {
		// AsteroidField.fields.forEach(field => {
		// 	field.instance.material.uniforms.color.value = new THREE.Color(palletFieldColour);
		// });
		asteroidMaterial.uniforms.color.value = new THREE.Color(palletFieldColour);
		planet.material.uniforms.colora.value = new THREE.Color(palletPlanetColoura);
		planet.material.uniforms.colorb.value = new THREE.Color(palletPlanetColourb);

		valueChange = false;
	}
	if(reloadAsteroids) {
		generateField(numberOfAsteroids);
		reloadAsteroids = false;
	}


	let time = Date.now()/60;
	OrbitalObject.orbitalObjects.forEach(oo => {
		oo.calcPos(sunRotation);
	});
	requestAnimationFrame( animate );
	renderer.render( scene, camera ); 
} 
animate();




// ======================= setup functions =======================

document.body.onresize = (ev) => {
	camera.aspect = window.innerWidth/window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}


function lightSetup() {
	const directionalLight = new THREE.DirectionalLight( palletLight, 1 );
	scene.add( directionalLight );

	const SunGeom = new THREE.SphereGeometry(1.8, 32, 16); 
	const SunMat = SunShader.getSunMaterial(palletLight);
	const Sun = new THREE.Mesh( SunGeom, SunMat ); 
	scene.add( Sun ); 
	Sun.parent = directionalLight;
	Sun.position = new THREE.Vector3(0,0,0);

	OrbitalObject.orbitalObjects.push(new OrbitalObject(directionalLight, 1, .02, 25));


	directionalLight.position.set( 0, 0, -25 ); //default; light shining from top
	directionalLight.lookAt(0,0,0);
	directionalLight.shadow.camera.updateProjectionMatrix();

	directionalLight.castShadow = true; // default false
	let side = 40;
	directionalLight.shadow.camera.top = side;
	directionalLight.shadow.camera.bottom = -side;
	directionalLight.shadow.camera.left = side;
	directionalLight.shadow.camera.right = -side;
	
	directionalLight.shadow.mapSize.width = 512; // default
	directionalLight.shadow.mapSize.height = 512; // default
	directionalLight.shadow.camera.near = 0.1; // default
	directionalLight.shadow.camera.far = 500; // default
	
	
	const al = new THREE.AmbientLight( palletBackground ); // soft white light
	scene.add( al );
}

function sceneSetup() {
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
	renderer.setClearColor( palletBackground, 1 );
	
	renderer.setSize( window.innerWidth, window.innerHeight ); 
	document.body.appendChild( renderer.domElement );	

	scene.fog = new THREE.Fog(new THREE.Color(palletBackground), 10, 100);
}


function generateField(totalAsteroids) {
	AsteroidField.fields.forEach(field => {
		scene.remove(field.instance);
		field.instance.dispose();
	});
	AsteroidField.fields = [];

	let a = Math.round(totalAsteroids * (150/2150));
	let b = Math.round((totalAsteroids - a)/2);
	new AsteroidField(4, b, palletFieldColour + 10, .0002, .1, .5);
	new AsteroidField(5.5, a, palletFieldColour + 25, -.0001, .1, .1);
	new AsteroidField(8, b, palletFieldColour, .0002, .1, 1.5);
}

