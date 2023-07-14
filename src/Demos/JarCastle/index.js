import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import {BaseShader} from './Shaders/BaseShader'
import {WaterShader} from './Shaders/StreamShader'
import {RockShader} from './Shaders/RockShader'

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


	waterMaterial



	reflectTarget;
	reflectScene = new THREE.Scene();






	constructor() {
		if(window.isMobile) {
			this.reflectTarget = new THREE.WebGLRenderTarget(512, 512)
		} else {
			this.reflectTarget = new THREE.WebGLRenderTarget(1024,1024)
		}
		resizeFunctions.push(() => {
			var ctx = document.querySelector("#castle-container>canvas");
			ctx.width  = window.innerWidth;
			ctx.height = window.innerHeight;

			this.camera.aspect = window.innerWidth/window.innerHeight;
			this.camera.updateProjectionMatrix();

			this.renderer.setSize( window.innerWidth, window.innerHeight );
			this.renderer.setPixelRatio(window.devicePixelRatio);
			this.renderer.outputEncoding = THREE.sRGBEncoding
		});
		this.lightSetup();
	}
	lightSetup() {
		this.directionalLight = new THREE.DirectionalLight( 0xd6efff, .4 );
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
		this.camera.position.y = 0.18750242280980764;
		this.camera.position.z = -25.8321569582452666;
		// this.camera.translateZ(.5);

		this.camera.lookAt(0,0,0)


		if (window.isMobile) {
			this.camera.position.x = 2.7797715830893774;
			this.camera.position.y = 0.18750242280980764;
			this.camera.position.z = -30.8321569582452666;
			this.camera.translateY(.5);
			this.camera.lookAt(0,.5,0)
		}

		this.renderer.setClearColor( window.palletDark, 0 );
		
		this.renderer.setSize( window.innerWidth, window.innerHeight ); 
		document.getElementById("castle-container").appendChild( this.renderer.domElement );  

		window.animationQueue[sectionID].animationFunction = (delta) => {
			// if(!window.isMobile) {
				try {
					this.waterMaterial.uniforms.uTime.value = ((Date.now() / 1200) % 5000)
				} catch (error) {
					console.log(error)
				}
			// }
		};

		window.animationQueue[sectionID].rendererFunction =() => {
			this.controls.update();
			this.renderer.setRenderTarget(this.reflectTarget);
			this.renderer.render( this.reflectScene, this.camera );

			this.renderer.setRenderTarget(null);
			this.renderer.render( this.scene, this.camera );
		};
		this.renderer.render( this.scene, this.camera ); 
		
		this.controls = new OrbitControls(this.camera, this.renderer.domElement)
		this.controls.enableZoom = false;
		this.controls.maxPolarAngle = Math.PI / 2
		this.controls.enablePan = false;
		this.controls.touches.ONE = THREE.TOUCH.DOLLY_ROTATE;	
		this.controls.autoRotate = true;
		this.controls.autoRotateSpeed = -.5
		if(window.isMobile) {
			this.controls.autoRotateSpeed = -1.5
		}
		this.loadGLB();
	}





	async loadGLB() {
		
		let glb = await new Promise(resolve => {
			new GLTFLoader().load('/robot_Scene.glb', resolve)
		})


		glb.scene.position.y -= 1
		this.scene.add(glb.scene);
		console.log(glb.scene.children);

		const robotBaseMaterial = new THREE.ShaderMaterial({
			...BaseShader,
			fog: true,
			lights: true,
			dithering: true,
			transparent: true,
		});
		robotBaseMaterial.uniforms.paintTex.value.flipY = false
		robotBaseMaterial.uniforms.baseTex.value.flipY = false

		robotBaseMaterial.uniforms.paintColor.value = new THREE.Color(window.palletHero);
		robotBaseMaterial.uniforms.rustColor.value = new THREE.Color(0x8f8672);
		robotBaseMaterial.uniforms.warningColor.value = new THREE.Color(window.palletDarkmod);
		robotBaseMaterial.uniforms.shadowColor.value = new THREE.Color(window.palletDarkmod);

		const rockMaterial = new THREE.ShaderMaterial({
			...RockShader,
			fog: true,
			lights: true,
			dithering: true,
			transparent: true,
		});
		rockMaterial.uniforms.shadowColor.value = new THREE.Color(window.palletDarkmod);


		const wmaterial = new THREE.ShaderMaterial({
			...WaterShader,
			fog: true,
			lights: true,
			dithering: true,
			transparent: true,
		});
		this.waterMaterial = wmaterial	
		this.waterMaterial.uniforms.sceneReflectionTexture.value = this.reflectTarget.texture;
		this.waterMaterial.uniforms.shadowColor.value = new THREE.Color(window.palletDarkmod);
		glb.scene.children.forEach(child => {
			child.receiveShadow = true;
			if(child.name == "Robot") {
				child.material = robotBaseMaterial;
				child.castShadow = true;
			}
			if(child.name == "Water") {
				child.material = wmaterial;
				this.waterPlane = child;
			}
			if(child.name == "Rock") {
				child.castShadow = true;
				rockMaterial.uniforms.baseTex.value = child.material.map;
				child.material = rockMaterial;
			}
		});
		


		//setup reflect scene (reckon i can just use base scene for this)
		this.reflectScene = this.scene.clone(true);

		this.reflectScene.children[0].position.set( -20, -20, 0 ); //default; light shining from top
		this.reflectScene.children[0].lookAt(0,0,0);

		this.reflectScene.children[2].remove(this.reflectScene.getObjectByName("Water"));
		this.reflectScene.children[2].children.forEach(gltfChild => {
			gltfChild.scale.y = -1;
		})
	}
}


export var castleBootstrapper = new CastleIndex();