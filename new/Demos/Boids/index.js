

// function animate() { 
// 	boidBootstrapper.boidController.animationLoop();	
// 	requestAnimationFrame( animate );
// 	boidBootstrapper.renderer.render( boidBootstrapper.scene, boidBootstrapper.camera ); 
// } 


class BoidIndex {

	scene = new THREE.Scene(); 
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); 
	renderer = new THREE.WebGLRenderer({antialias : true, alpha : true}); 
	boidController = null;

	constructor() {
		resizeFunctions.push(() => {
			var ctx = document.querySelector("#boid-container>canvas");
			ctx.width  = window.innerWidth;
			ctx.height = window.innerHeight;

			this.camera.aspect = window.innerWidth/window.innerHeight;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize( window.innerWidth, window.innerHeight );
		})
	}


	sceneSetup(sectionID) {
		this.boidController = new BoidController(this.camera, this.scene);
		this.camera.lookAt(0,0,0)
		
		this.renderer.setClearColor( palletDark, 0 );
		
		this.renderer.setSize( window.innerWidth, window.innerHeight ); 
		document.getElementById("boid-container").appendChild( this.renderer.domElement );  

		animationQueue[sectionID].animationFunction = (delta) => {
			boidBootstrapper.boidController.animationLoop();
		};
		animationQueue[sectionID].rendererFunction =() => {
			this.renderer.render( this.scene, this.camera ); 
		};
		this.renderer.render( this.scene, this.camera ); 
	}
}


var boidBootstrapper = new BoidIndex();