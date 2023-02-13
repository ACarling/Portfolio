// ======================= animation loop =======================
let time = 0;

import * as THREE from 'three';
import { OrbitalObject } from './OrbitalObject';
import { PlanetShader } from './Shaders/PlanetShader';
import { AsteroidField } from './GenerateAsteroids';


class PlanetIndex {

	scene = new THREE.Scene(); 
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); 
	renderer = new THREE.WebGLRenderer({antialias : true, alpha : true}); 
	


	constructor() {
		resizeFunctions.push(() => {
			var ctx = document.querySelector("#planet-container>canvas");
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
		const directionalLight = new THREE.DirectionalLight( window.palletLight, 1 );
		this.scene.add( directionalLight );

		// const SunGeom = new THREE.SphereGeometry(1.8, 32, 16); 
		// const SunMat = SunShader.getSunMaterial(window.palletLight);
		// const Sun = new THREE.Mesh( SunGeom, SunMat ); 
		const Sun = new THREE.Object3D();
		this.scene.add( Sun ); 
		Sun.parent = directionalLight;
		// Sun.position = new THREE.Vector3(0,0,0);

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
		directionalLight.shadow.camera.far = 50; // default
		
		
		const al = new THREE.AmbientLight( window.palletDark ); // soft white light
		this.scene.add( al );
	}

	sceneSetup(sectionID) {
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
		this.renderer.setClearColor( window.palletDark, 0 );
		this.renderer.setSize( window.innerWidth, window.innerHeight ); 
		
		document.getElementById("planet-container").appendChild( this.renderer.domElement );	

		const geometry = new THREE.SphereGeometry(1.8, 128, 64); 

		const material = new THREE.ShaderMaterial({
			...PlanetShader,
			fog: true,
			lights: true,
			dithering: true
		});
		material.uniforms.colora.value = new THREE.Color(window.palletHero)
		material.uniforms.colorb.value = new THREE.Color(window.palletDarkmod)
		material.uniforms.colorDark.value = new THREE.Color(window.palletDark)
		material.uniforms.colorDark2.value = new THREE.Color(window.palletDarkmod)

		const planet = new THREE.Mesh( geometry, material ); 
		planet.castShadow = true; //default is false
		// planet.receiveShadow = true;
		this.scene.add( planet ); 



		this.generateField(numberOfAsteroids);


		this.camera.position.z = 18;
		// this.camera.position.y = -3;
		this.camera.lookAt(0,-5,0);
		this.camera.translateY(2);
		

		window.animationQueue[sectionID].animationFunction = (delta) => {
			material.uniforms.time.value += delta;
			AsteroidField.fields.forEach(field => {
				field.instance.rotation.y += field.orbitSpeed;
			})
			
			sunRotation -= delta;
			OrbitalObject.orbitalObjects.forEach(oo => {
				oo.calcPos(sunRotation);
			});
		}
		window.animationQueue[sectionID].rendererFunction = () => {
			planetBootstrapper.renderer.render( planetBootstrapper.scene, planetBootstrapper.camera ); 
		}


		OrbitalObject.orbitalObjects.forEach(oo => {
			oo.calcPos(sunRotation);
		});
		planetBootstrapper.renderer.render( planetBootstrapper.scene, planetBootstrapper.camera ); 


		// planetAnimate();
	}


	generateField(totalAsteroids) {
		AsteroidField.fields.forEach(field => {
			this.scene.remove(field.instance);
			field.instance.dispose();
		});
		AsteroidField.fields = [];

		let a = Math.round(totalAsteroids * (150/2150));
		let b = Math.round((totalAsteroids - a)/2);
		new AsteroidField(this.scene, 4, b + 10, .0002, .1, .5);
		new AsteroidField(this.scene, 5.5, a, -.0001, .1, .1);
		new AsteroidField(this.scene, 8, b, .0002, .1, 1.5);
	}
}



export var planetBootstrapper = new PlanetIndex();


function planetAnimate() { 
	requestAnimationFrame( animate );
	planetBootstrapper.renderer.render( planetBootstrapper.scene, planetBootstrapper.camera ); 
} 

// ======================= gen the planet mesh =======================





// ======================= setup functions =======================





