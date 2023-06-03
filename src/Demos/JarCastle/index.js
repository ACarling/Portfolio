import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import {BaseShader} from './Shaders/BaseShader'

const FOV = 20;
class CastleIndex {

	initx = 0
	inity = 0
	initz = 0
	distanceFromCenter = 0

	scene = new THREE.Scene(); 
	camera = new THREE.PerspectiveCamera( FOV, window.innerWidth / window.innerHeight, 0.1, 1000 ); 
	renderer = new THREE.WebGLRenderer({antialias : true, alpha : true}); 
	controls = null;
	directionalLight = null;

	childScene;

	composer;

	constructor() {
		resizeFunctions.push(() => {
			var ctx = document.querySelector("#castle-container>canvas");
			ctx.width  = window.innerWidth;
			ctx.height = window.innerHeight;

			this.camera.aspect = window.innerWidth/window.innerHeight;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize( window.innerWidth, window.innerHeight );
			this.renderer.setPixelRatio(window.devicePixelRatio);

		});
		this.lightSetup();
	}
	lightSetup() {
		this.directionalLight = new THREE.DirectionalLight( window.palletLight, 1 );
		this.scene.add( this.directionalLight );


		this.directionalLight.position.set( -20, 20, 0 ); //default; light shining from top
		this.directionalLight.lookAt(0,0,0);
		this.directionalLight.shadow.camera.updateProjectionMatrix();

		this.directionalLight.castShadow = true; // default false
		let side = 8.5;
		this.directionalLight.shadow.camera.top = side;
		this.directionalLight.shadow.camera.bottom = -side;
		this.directionalLight.shadow.camera.left = side;
		this.directionalLight.shadow.camera.right = -side;
		
		this.directionalLight.shadow.mapSize.width = 1024; // default
		this.directionalLight.shadow.mapSize.height = 1024; // default
		this.directionalLight.shadow.camera.near = 0.1; // default
		this.directionalLight.shadow.camera.far = 80; // default

		this.directionalLight.shadow.normalBias = 0.006;
		this.directionalLight.shadow.bias = -0.0002;
		this.directionalLight.shadow.radius = 0.001;
		this.directionalLight.shadow.blurSamples = 2;

		const al = new THREE.AmbientLight( window.palletDark ); // soft white light
		this.scene.add( al );
	}

	async sceneSetup(sectionID) {

		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
		
		this.camera.position.x = 2.7797715830893774;
		this.camera.position.y = 2.18750242280980764;
		this.camera.position.z = -19.8321569582452666;
		this.camera.lookAt(0,0,0)


		if (window.isMobile) {
			this.camera.position.x = 2.7797715830893774;
			this.camera.position.y = 2.18750242280980764;
			this.camera.position.z = -22.8321569582452666;
			this.camera.translateY(.5);
			this.camera.lookAt(0,.5,0)
		}

		this.renderer.setClearColor( window.palletDark, 0 );
		
		this.renderer.setSize( window.innerWidth, window.innerHeight ); 
		document.getElementById("castle-container").appendChild( this.renderer.domElement );  

		window.animationQueue[sectionID].animationFunction = (delta) => {
		};

		window.animationQueue[sectionID].rendererFunction =() => {
			this.controls.update()
			this.renderer.render( this.scene, this.camera );
		};
		this.renderer.render( this.scene, this.camera ); 
		
		this.controls = new OrbitControls(this.camera, this.renderer.domElement)
		this.controls.enableZoom = false;
		this.controls.maxPolarAngle = Math.PI / 2
		this.controls.enablePan = false;
		this.controls.touches.ONE = THREE.TOUCH.DOLLY_ROTATE;	
		this.controls.autoRotate = true
		this.controls.autoRotateSpeed = -1.5
		this.loadGLB();
	}





	async loadGLB() {
		
		let glb = await new Promise(resolve => {
			new GLTFLoader().load('/robot_Scene.glb', resolve)
		})


		glb.scene.position.y -= 1
		this.scene.add(glb.scene);
		console.log(glb.scene.children);

		const baseMat = new THREE.ShaderMaterial({
			...BaseShader,
			fog: true,
			lights: true,
			dithering: true,
			transparent: true,
		});
		baseMat.uniforms.paintTex.value.flipY = false
		baseMat.uniforms.baseTex.value.flipY = false

		baseMat.uniforms.paintColor.value = new THREE.Color(window.palletHero);
		baseMat.uniforms.rustColor.value = new THREE.Color(0x8f8672);
		baseMat.uniforms.warningColor.value = new THREE.Color(window.palletDarkmod);
		// baseMat.uniforms.rus.value = new THREE.Color(0x5ba852)


		function rmat(child) {
			child.material = baseMat;
			child.castShadow = true
			child.receiveShadow = true

			child.children.forEach(rchild => {
				rmat(rchild)
			});
		}
		glb.scene.children.forEach(child => {
			rmat(child)
		});
	}
}


export var castleBootstrapper = new CastleIndex();