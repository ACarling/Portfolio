class WaveIndex {

	scene = new THREE.Scene(); 
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); 
	renderer = new THREE.WebGLRenderer({antialias : true, alpha : true}); 
	boidController = null;

	constructor() {
		resizeFunctions.push(() => {
			var ctx = document.querySelector("#wave-container>canvas");
			ctx.width  = window.innerWidth;
			ctx.height = window.innerHeight;

			this.camera.aspect = window.innerWidth/window.innerHeight;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize( window.innerWidth, window.innerHeight );
		})
	}


	sceneSetup(sectionID) {
		const cursorObj = new THREE.Object3D();
		this.scene.add( cursorObj );
		

		// this.boidController = new BoidController(this.camera, this.scene, cursorObj);
		this.camera.lookAt(0,0,0)
		
		this.renderer.setClearColor( palletDark, 0 );
		
		this.renderer.setSize( window.innerWidth, window.innerHeight ); 
		document.getElementById("wave-container").appendChild( this.renderer.domElement );  

		// animationQueue[sectionID].animationFunction = (delta) => {
		// 	waveBootstrapper.boidController.animationLoop();
		// };
		animationQueue[sectionID].rendererFunction =() => {
			this.renderer.render( this.scene, this.camera ); 
		};
		this.renderer.render( this.scene, this.camera ); 
	}
}


var waveBootstrapper = new WaveIndex();