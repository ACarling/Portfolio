const scene = new THREE.Scene(); 
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); 
const renderer = new THREE.WebGLRenderer({antialias : true, alpha : true}); 
var boidController;

// lightSetup();

function animate() { 
	updateValues();

    boidController.animationLoop();

	requestAnimationFrame( animate );
	renderer.render( scene, camera ); 
} 

document.body.onresize = (ev) => {
	camera.aspect = window.innerWidth/window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function sceneSetup() {
	boidController = new BoidController();
	camera.lookAt(0,0,0)
	
	renderer.setClearColor( palletBackground, 0 );
	
	renderer.setSize( window.innerWidth, window.innerHeight ); 
	console.log(document.getElementById("heroiframe"));
	document.getElementById("heroiframe").appendChild( renderer.domElement );
	
	animate();
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