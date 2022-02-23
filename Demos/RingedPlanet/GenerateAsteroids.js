function setAsteroidFieldPositions(instance, orbitRadius, fieldHeight, fieldWidth) {
    var dummy = new THREE.Object3D();
    for(let i = 0; i < instance.count; i++) {
        dummy.position.set(TMath.randFloat(-1,1), 0, TMath.randFloat(-1,1));

        dummy.position = dummy.position.normalize().multiplyScalar(orbitRadius + TMath.randFloat(-fieldWidth,fieldWidth));
        dummy.position.y = TMath.randFloat(-fieldHeight,fieldHeight);

        // dummy.scale = new THREE.Vector3(1,1,1).multiplyScalar(TMath.randFloat(.025,.075));
        let scaleXYZ = TMath.randFloat(.02,.05);
        dummy.scale.set(scaleXYZ,scaleXYZ,scaleXYZ);

        dummy.updateMatrix();
        instance.setMatrixAt( i, dummy.matrix );
    }
}

var asteroidMaterial;

class AsteroidField {
    static fields = [];
    orbitRadius;
    colour;
    instance;
    orbitSpeed;
    fieldHeight;
    fieldWidth;
    numAsteroids;

    
    constructor(orbitRadius, numAsteroids, colour, orbitSpeed, fieldHeight, fieldWidth) {
        this.orbitSpeed = orbitSpeed;
        this.orbitRadius = orbitRadius;
        this.colour = colour;
        this.fieldHeight = fieldHeight;
        this.fieldWidth = fieldWidth;
        this.numAsteroids = numAsteroids;
        AsteroidField.fields.push(this);
        this.generateAsteroidField();
    }


    generateAsteroidField() {
        const asteroidGeometry = new THREE.SphereGeometry( 1, 8, 8 );

        asteroidMaterial = new THREE.ShaderMaterial({
            ...AsteroidShader,
            fog: false,
            lights: true,
            dithering: true,
        });
    
        this.instance = new THREE.InstancedMesh(asteroidGeometry, asteroidMaterial, this.numAsteroids);
        this.instance.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame
        scene.add( this.instance );
    
        this.instance.receiveShadow = true;
        setAsteroidFieldPositions(this.instance, this.orbitRadius, this.fieldHeight, this.fieldWidth);
    }
}


