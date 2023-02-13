import { BoidController } from "./boids";
import * as THREE from 'three';

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
			this.renderer.setPixelRatio(window.devicePixelRatio);

		})
	}


	sceneSetup(sectionID) {

		// const cursorGeom = new THREE.SphereGeometry( 1, 32, 16 );
		// const cursorMat = new THREE.MeshBasicMaterial( { color: window.palletHero } );
		const cursorObj = new THREE.Object3D();
		this.scene.add( cursorObj );
		

		this.boidController = new BoidController(this.camera, this.scene, cursorObj);
		this.camera.lookAt(0,0,0)
		
		this.renderer.setClearColor( window.palletDark, 0 );
		
		this.renderer.setSize( window.innerWidth, window.innerHeight ); 
		document.getElementById("boid-container").appendChild( this.renderer.domElement );  

		window.animationQueue[sectionID].animationFunction = (delta) => {

			var vector = new THREE.Vector3(window.mousePos.x, window.mousePos.y, 0.5);
			vector.unproject( this.camera );
			var dir = vector.sub( this.camera.position ).normalize();
			var distance = - this.camera.position.z / dir.z;
			var pos = this.camera.position.clone().add( dir.multiplyScalar( distance ) );
			cursorObj.position.x = pos.x;
			cursorObj.position.y = pos.y;

			boidBootstrapper.boidController.animationLoop();
		};
		window.animationQueue[sectionID].rendererFunction =() => {
			this.renderer.render( this.scene, this.camera ); 
		};
		this.renderer.render( this.scene, this.camera ); 
	}
}


export var boidBootstrapper = new BoidIndex();