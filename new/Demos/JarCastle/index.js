import { OrbitControls } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';


class CastleIndex {

	initx = 0
	inity = 0
	initz = 0
	distanceFromCenter = 0

	scene = new THREE.Scene(); 
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); 
	renderer = new THREE.WebGLRenderer({antialias : true, alpha : true}); 
	boidController = null;
	controls = null;

	constructor() {
		// resizeFunctions.push(() => {
		// 	var ctx = document.querySelector("#castle-container>canvas");
		// 	ctx.width  = window.innerWidth;
		// 	ctx.height = window.innerHeight;

		// 	this.camera.aspect = window.innerWidth/window.innerHeight;
		// 	this.camera.updateProjectionMatrix();
		// 	this.renderer.setSize( window.innerWidth, window.innerHeight );
		// 	this.renderer.setPixelRatio(window.devicePixelRatio);
		// })
	}


	sceneSetup(sectionID) {
		const cursorObj = new THREE.Object3D();
		this.scene.add( cursorObj );

		var resolution = isMobile ? 64 : 512
		const geometry = new THREE.BoxGeometry( 1, 1, 1 );
		const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

		const plane = new THREE.Mesh( geometry, material );
		this.scene.add( plane );


		

		// this.boidController = new BoidController(this.camera, this.scene, cursorObj);
		this.camera.lookAt(0,0,0)
		this.initCamControl()
		
		this.renderer.setClearColor( palletDark, 0 );
		
		this.renderer.setSize( window.innerWidth, window.innerHeight ); 
		document.getElementById("castle-container").appendChild( this.renderer.domElement );  
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);

		animationQueue[sectionID].animationFunction = (delta) => {
			if(!isMobile) {
				this.updateCameraPositionMouse(20, 10)
			}
		};
		animationQueue[sectionID].rendererFunction =() => {
			this.renderer.render( this.scene, this.camera ); 
		};
		this.renderer.render( this.scene, this.camera ); 
	}



	// initCamControl() {
	// 	this.camera.position.set(0, 15, -20);
	
	// 	this.initx = this.camera.position.x;
	// 	this.inity = this.camera.position.y;
	// 	this.initz = this.camera.position.z;
	
	// 	this.camera.lookAt(0,0,0);
	// 	this.distanceFromCenter = this.camera.position.distanceTo(new THREE.Vector3(0,0,0));
	
	// 	this.camera.position.z = this.initz;
	// 	this.camera.position.y = this.inity;
	
	// 	let newPos = this.camera.position.normalize();
	// 	newPos.multiplyScalar(this.distanceFromCenter);
	// 	this.camera.position.set(newPos.x,newPos.y,newPos.z);
	// 	this.camera.lookAt(0,0,0);
	// }

	// updateCameraPositionMouse(maxXSlide, maxYSlide) {
	// 	var x = mousePos.x;
	// 	var y = mousePos.y;
		
	// 	this.camera.position.x = this.initx + (x * maxXSlide - (maxXSlide/2));
	// 	this.camera.position.y = this.inity - (y * maxYSlide - (maxYSlide/2));
	// 	// camera.position.z = initz;
	
	// 	let newPos = this.camera.position.normalize();
	// 	newPos.multiplyScalar(this.distanceFromCenter);
	// 	this.camera.position.set(newPos.x,newPos.y,newPos.z);
	// 	this.camera.lookAt(0,0,0);
	// }
	
	
}


var castleBootstrapper = new CastleIndex();