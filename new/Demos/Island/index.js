class IslandIndex {

	scene = new THREE.Scene(); 
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 50 ); 
	renderer = new THREE.WebGLRenderer({antialias : true, alpha : true}); 
	boidController = null;
	cameraAnchor = null;
	waterplane;

	// perspective cam doesnt work properly for this one, try get it to work with orth
	depthCam = new THREE.OrthographicCamera( 15, -15, 15, -15, 0, 50 ); 
	depthScene;
	depthRenderTarget;



	constructor() {
		resizeFunctions.push(() => {
			var ctx = document.querySelector("#island-container>canvas");
			ctx.width  = window.innerWidth;
			ctx.height = window.innerHeight;

			let width = window.innerWidth / 80;
			let height = window.innerHeight / 80;
			this.depthCam.left = -width/2;
			this.depthCam.right = width/2;
			this.depthCam.top = -height/2;
			this.depthCam.bottom = height/2;
			this.depthCam.clearViewOffset();
			this.depthCam.updateProjectionMatrix();



			this.camera.aspect = window.innerWidth/window.innerHeight;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize( window.innerWidth, window.innerHeight );
			this.renderer.setPixelRatio(window.devicePixelRatio);

		})
	}


	sceneSetup(sectionID) {
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
		this.renderer.setClearColor( palletDark, 0 );
		this.renderer.setSize( window.innerWidth, window.innerHeight ); 

		
		
		this.camera.position.z = 15;
		this.camera.position.y = -15;


		// this.camera.position.x = 8;
		// this.camera.rotation.x = -Math.PI/4;
		// this.camera.translateZ(15);

		this.camera.lookAt(0,0,0);

		// this.camera.rotation.x = Math.PI/4;





		const cursorGeom = new THREE.SphereGeometry( 1, 32, 16 );
		const cursorMat = new THREE.MeshBasicMaterial( { color: palletHero } );
		const obj = new THREE.Object3D(cursorGeom, cursorMat);

		this.depthCam.position.x = 0;
		this.depthCam.position.y = -2;
		this.depthCam.position.z = 0;
		this.depthCam.rotation.x = Math.PI/4;
 
	
        var plane = this.genIslands()
		document.getElementById("island-container").appendChild( this.renderer.domElement );  

		// === setup for depth texture

		this.depthScene = new THREE.Scene();
		const testMat = new THREE.MeshBasicMaterial();
		var tmp = plane.clone();
		tmp.material = testMat;
		this.depthScene.add(tmp);


		const dpr = this.renderer.getPixelRatio();
		this.depthRenderTarget = new THREE.WebGLRenderTarget( window.innerWidth * dpr, window.innerWidth * dpr );
		this.depthRenderTarget.texture.minFilter = THREE.NearestFilter;
		this.depthRenderTarget.texture.magFilter = THREE.NearestFilter;		
		this.depthRenderTarget.depthTexture = new THREE.DepthTexture( window.innerWidth * dpr, window.innerWidth * dpr );
		this.depthRenderTarget.depthTexture.format = THREE.DepthFormat;
		this.depthRenderTarget.depthTexture.type = THREE.UnsignedShortType;
	


		animationQueue[sectionID].animationFunction = (delta) => {
			this.waterplane.material.uniforms.time.value += delta;
			// TODO: parent camera to some object and rotate that instead of island
			// this.depthCam.position.x -= delta / 5;
		};
		animationQueue[sectionID].rendererFunction =() => {
			this.renderer.setRenderTarget(this.depthRenderTarget);
			this.renderer.render(this.depthScene, this.depthCam);

			this.waterplane.material.uniforms['tDiffuse'].value = this.depthRenderTarget.texture;
			this.waterplane.material.uniforms['tDepth'].value = this.depthRenderTarget.depthTexture;
			this.waterplane.material.uniforms['cameraNear'].value = this.depthCam.near;
			this.waterplane.material.uniforms['cameraFar'].value = this.depthCam.far;

			this.renderer.setRenderTarget(null);
			this.renderer.render( this.scene, this.camera ); 
		};
		this.lightSetup();
		this.renderer.render( this.scene, this.camera ); 
	}


	// TODO: this light stuff literally just doesnt work
	lightSetup() {
		const directionalLight = new THREE.DirectionalLight( palletLight, 1 );
		this.scene.add( directionalLight );

		const Sun = new THREE.Object3D();
		this.scene.add( Sun ); 
		Sun.parent = directionalLight;

		directionalLight.position.set( 0, 10, -25 ); //default; light shining from top
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
		
		
		const al = new THREE.AmbientLight( new THREE.Color(0xffffff) ); // soft white light
		this.scene.add( al );
	}


	getNoise(x, y, frequency, octaves, lucunarity, high, low) {
		let maxAmp = 0;
		let amp = 1;
		let noiseVal = 0;
		let freq = frequency;

		for (let i = 0; i < octaves; i++) {
			noiseVal += noise.noise2D(x * freq, y * freq) * amp;
			maxAmp += amp;
			amp *= lucunarity;
			freq *= 2;
		}
		noiseVal = (noiseVal / maxAmp);
		return noiseVal * (high - low) / 2 + (high + low) / 2
	}


    genIslands() {

        // let noiseVal = noise.get(noiseScale,noiseScale,noiseScale) * 5;
        
        const islandgeometry = new THREE.PlaneGeometry( 4, 4, 128*2, 128*2 );
		const islandmaterial = new THREE.ShaderMaterial({
			...IslandShader,
			fog: true,
			lights: true,
			dithering: true,
			transparent: true,
			// alphaTest: .4,
		});
        const islandplane = new THREE.Mesh( islandgeometry, islandmaterial );

        const watergeometry = new THREE.PlaneGeometry( 4, 4, 1, 1 );
		const watermaterial = new THREE.ShaderMaterial({
			...WaterShader,
			lights: true,
			dithering: true,
			transparent: true,
		});
        this.waterplane = new THREE.Mesh( watergeometry, watermaterial );


		let freq = 1;
		let amp = .4;
		let transformDown = 0;

		let circleMaskFalloff = 8;
		let circleMaskSize = 1;

		// this.waterplane.position.z = -.68;


		// this.waterplane.rotation.x = -Math.PI/4;
        // this.scene.add( this.waterplane );
		this.waterplane.scale.set(5,5,5);


		// this.disaplacePlane(this.waterplane, freq, amp, transformDown, circleMaskFalloff, circleMaskSize)
		return this.disaplacePlane(islandplane, freq, amp, transformDown, circleMaskFalloff, circleMaskSize);
    }


	disaplacePlane(plane, freq, amp, transformDown, circleMaskFalloff, circleMaskSize) {

        const positions = plane.geometry.attributes.position.array;
        let x, y, z, index;
        x = y = z = index = 0;
        for (let i = 0; i < positions.length; i++) {
            x = positions[index ++ ];
            y = positions[index ++ ];
            z = positions[index ++ ];

			//TODO: circle mask here for islands
			let circleRaw = new THREE.Vector3(x,y,z).distanceTo(new THREE.Vector3(0,0,0));

			
			let circle = TMath.lerp(1,0,Math.pow(-(circleRaw / circleMaskSize), circleMaskFalloff));

			z = (1 - Math.abs(this.getNoise(x, y, freq, 8, .5, amp, 1, 0) * amp));
			z -= transformDown;
			
            plane.geometry.attributes.position.setZ(i,z);
        }
        plane.geometry.computeVertexNormals();
        plane.geometry.computeTangents();
        plane.geometry.attributes.position.needsUpdate = true;






		plane.rotation.x = -Math.PI/4;
		plane.position.y = -2;
        this.scene.add( plane );
		plane.receiveShadow = true;
		plane.scale.set(5,5,5);

		return plane;
	}


}

var islandBootstrapper = new IslandIndex();