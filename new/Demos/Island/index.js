class IslandIndex {

	scene = new THREE.Scene(); 
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); 
	renderer = new THREE.WebGLRenderer({antialias : true, alpha : true}); 
	boidController = null;







	constructor() {
		resizeFunctions.push(() => {
			var ctx = document.querySelector("#island-container>canvas");
			ctx.width  = window.innerWidth;
			ctx.height = window.innerHeight;

			this.camera.aspect = window.innerWidth/window.innerHeight;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize( window.innerWidth, window.innerHeight );
		})
	}


	sceneSetup(sectionID) {
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
		this.renderer.setClearColor( palletDark, 0 );
		this.renderer.setSize( window.innerWidth, window.innerHeight ); 

		
		this.camera.position.z = 5;
		this.camera.position.y = 5;

		this.camera.lookAt(0,-5,0);
		this.camera.translateY(1.5);

        var plane = this.genIslands(1,1);
		
		
		document.getElementById("island-container").appendChild( this.renderer.domElement );  

		animationQueue[sectionID].animationFunction = (delta) => {
			plane.rotation.z += delta / 500;
			// TODO: parent camera to some object and rotate that instead of island
		};
		animationQueue[sectionID].rendererFunction =() => {
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


    genIslands(noiseScale, height) {

        // let noiseVal = noise.get(noiseScale,noiseScale,noiseScale) * 5;
        
        const geometry = new THREE.PlaneGeometry( 4, 4, 128, 128 );
		const material = new THREE.ShaderMaterial({
			...IslandShader,
			fog: true,
			lights: true,
			dithering: true,
			transparent: true,
		});
        const plane = new THREE.Mesh( geometry, material );


        const positions = plane.geometry.attributes.position.array;
        let x, y, z, index;
        x = y = z = index = 0;
        for (let i = 0; i < positions.length; i++) {
            x = positions[index ++ ];
            y = positions[index ++ ];
            z = positions[index ++ ];

            let wl = .4;
            let amp = 2;
			//TODO: circle mask here for islands
			let circleRaw = new THREE.Vector3(x,y,z).distanceTo(new THREE.Vector3(0,0,0));
			let circle = (Math.pow(2.0 - circleRaw, 4)) / 120;
            z = noise.noise2D(x / wl, y / wl) * amp * (circle);
			if(circleRaw > 1.6) {
				z = 0;
			}
            plane.geometry.attributes.position.setZ(i,z);
        }
        plane.geometry.computeVertexNormals();
        plane.geometry.computeTangents();
        plane.geometry.attributes.position.needsUpdate = true;





		console.log(plane)

		plane.rotation.x = -90;
        this.scene.add( plane );
		plane.receiveShadow = true;
		console.log(plane.scale);
		plane.scale.set(5,5,5);
		console.log(plane.scale);

		return plane;
    }


}

var islandBootstrapper = new IslandIndex();