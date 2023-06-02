import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import {BaseShader} from './Shaders/BaseShader'
import { GroundShader } from './Shaders/GroundShader';
import { RockShader } from './Shaders/RockShader';
import { TreeLeafShader } from './Shaders/TreeLeafShader';
class CastleIndex {

	initx = 0
	inity = 0
	initz = 0
	distanceFromCenter = 0

	scene = new THREE.Scene(); 
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); 
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


		this.directionalLight.position.set( 0, 2, 2 ); //default; light shining from top
		this.directionalLight.lookAt(0,0,0);
		this.directionalLight.shadow.camera.updateProjectionMatrix();

		this.directionalLight.castShadow = true; // default false
		let side = 1.5;
		this.directionalLight.shadow.camera.top = side;
		this.directionalLight.shadow.camera.bottom = -side;
		this.directionalLight.shadow.camera.left = side;
		this.directionalLight.shadow.camera.right = -side;
		
		this.directionalLight.shadow.mapSize.width = 1024; // default
		this.directionalLight.shadow.mapSize.height = 1024; // default
		this.directionalLight.shadow.camera.near = 0.1; // default
		this.directionalLight.shadow.camera.far = 50; // default

		this.directionalLight.shadow.normalBias = 0.006;
		this.directionalLight.shadow.bias = -0.0002;
		this.directionalLight.shadow.radius = 0.001;
		this.directionalLight.shadow.blurSamples = 5;

		const al = new THREE.AmbientLight( window.palletDark ); // soft white light
		this.scene.add( al );
	}

	async sceneSetup(sectionID) {

		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
		
		this.camera.position.x = 0.7797715830893774;
		this.camera.position.y = 0.18750242280980764;
		this.camera.position.z = 1.8321569582452666;
		this.camera.lookAt(0,0,0)


		if (window.isMobile) {
			this.camera.position.x = 0.7797715830893774;
			this.camera.position.y = 0.18750242280980764;
			this.camera.position.z = 2.8321569582452666;
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
			new GLTFLoader().load('/Castle.glb', resolve)
		})


		glb.scene.position.y -= .5
		this.scene.add(glb.scene);
		console.log(glb.scene.children);



		// const treeLeafMat = new THREE.MeshLambertMaterial( { color: 0x639153 } );
		const treeStumpMat = new THREE.MeshBasicMaterial( { color: 0x785930 } );

		//UV gradient
		const rockMat = new THREE.ShaderMaterial({
			...RockShader,
			fog: true,
			lights: true,
			dithering: true,
			transparent: true,
		});

		const treeLeafMat = new THREE.ShaderMaterial({
			...TreeLeafShader,
			fog: true,
			lights: true,
			dithering: true,
			transparent: true,
		});

		const groundMat = new THREE.ShaderMaterial({
			...GroundShader,
			fog: true,
			lights: true,
			dithering: true,
			transparent: true,
		});

		const baseMat = new THREE.ShaderMaterial({
			...BaseShader,
			fog: true,
			lights: true,
			dithering: true,
			transparent: true,
		});

		baseMat.uniforms.color.value = new THREE.Color(0x5ba852)
		groundMat.uniforms.color.value = new THREE.Color(0x5ba852)

		treeLeafMat.uniforms.colora.value = new THREE.Color(0x2f9e56)
		treeLeafMat.uniforms.colorb.value = new THREE.Color(0x5ba852)

		rockMat.uniforms.colora.value = new THREE.Color(0xcccccc)
		rockMat.uniforms.colorb.value = new THREE.Color(0x777777)
		rockMat.uniforms.lightPosition.value = this.directionalLight.position

		this.childScene = glb.scene;
		glb.scene.children[1].children.forEach(terrainChild => {
			if(terrainChild.material.name == "Ground") {
				terrainChild.material = groundMat;
				terrainChild.receiveShadow = true

			}
			if(terrainChild.material.name == "TreeStump") {
				terrainChild.material = treeStumpMat;
				terrainChild.castShadow = true
				terrainChild.receiveShadow = true
			}
			if(terrainChild.material.name == "TreeLeaf") {
				terrainChild.material = treeLeafMat;
				terrainChild.castShadow = true
				terrainChild.receiveShadow = true
			}
		});

		glb.scene.children.forEach(child => {
			if(child.material) {
				if(child.name == "Base") {
					child.material = baseMat;
					child.receiveShadow = true
				}
				if(child.material.name == "Rock") {
					child.material = rockMat;
					child.castShadow = true
					child.receiveShadow = true
				}
			}
		});
	}
}


export var castleBootstrapper = new CastleIndex();