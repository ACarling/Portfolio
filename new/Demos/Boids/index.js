const scene = new THREE.Scene(); 
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); 
const renderer = new THREE.WebGLRenderer({antialias : true, alpha : true}); 

sceneSetup();
lightSetup();

const boidController = new BoidController();

camera.lookAt(0,0,0)

function animate() { 

	// FishShader.uniforms.time.value = performance.now() / 2400;

	updateValues();

    boidController.animationLoop();

	requestAnimationFrame( animate );
	renderer.render( scene, camera ); 
} 
animate();

document.body.onresize = (ev) => {
	camera.aspect = window.innerWidth/window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

var directionalLight;
function lightSetup() {
	// directionalLight = new THREE.DirectionalLight( palletLight, .5 );
	// scene.add( directionalLight );
	// directionalLight.position.set( 3, 10, 6 ); //default; light shining from top
	// directionalLight.lookAt(50,500,0);
	// directionalLight.shadow.camera.updateProjectionMatrix();

	// // FishShader.uniforms.sunWorldMatrix.value = directionalLight.shadow.camera.matrixWorld;

	// directionalLight.castShadow = true; // default false
	// let side = 40;
	// directionalLight.shadow.camera.top = side;
	// directionalLight.shadow.camera.bottom = -side;
	// directionalLight.shadow.camera.left = side;
	// directionalLight.shadow.camera.right = -side;
	
	// directionalLight.shadow.mapSize.width = 512*2; // default
	// directionalLight.shadow.mapSize.height = 512*2; // default
	// directionalLight.shadow.camera.near = 0.1; // default
	// directionalLight.shadow.camera.far = 500; // default
	
}

function sceneSetup() {
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
	renderer.setClearColor( palletBackground, 0 );
	
	renderer.setSize( window.innerWidth, window.innerHeight ); 
	document.body.appendChild( renderer.domElement );	

}



function updateValues() {
	if(valueChanged) {
		boidController.avoidFactor = avoidFactor; 
		boidController.centeringFactor = centeringFactor; 
		boidController.matchingFactor = matchingFactor; 
		boidController.homingFactor = homingFactor; 

		boidMaterial.color = new THREE.Color(palletFish);
		tankMaterial.color = new THREE.Color(palletGround);
		directionalLight.color = new THREE.Color(palletLight);

		boidMaterial.needsUpdate = true;
		tankMaterial.needsUpdate = true;

		valueChanged = false;
	}
}