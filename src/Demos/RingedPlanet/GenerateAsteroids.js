import * as THREE from 'three';
import {AsteroidShader} from './Shaders/AsteroidShader'
var asteroidMaterial;

function setAsteroidFieldPositions(instance, orbitRadius, fieldHeight, fieldWidth) {
    var dummy = new THREE.Object3D();
    for(let i = 0; i < instance.count; i++) {
        dummy.position.set(THREE.MathUtils.randFloat(-1,1), 0, THREE.MathUtils.randFloat(-1,1));

        dummy.position.normalize().multiplyScalar(orbitRadius + THREE.MathUtils.randFloat(-fieldWidth,fieldWidth));
        dummy.position.y = THREE.MathUtils.randFloat(-fieldHeight,fieldHeight);

        let scaleXYZ = THREE.MathUtils.randFloat(.02,.05);
        dummy.scale.set(scaleXYZ,scaleXYZ,scaleXYZ);

        dummy.updateMatrix();
        instance.setMatrixAt( i, dummy.matrix );
        instance.instanceMatrix.needsUpdate = true;
    }
}


export class AsteroidField {
    static fields = [];
    orbitRadius;
    colour;
    instance;
    orbitSpeed;
    fieldHeight;
    fieldWidth;
    numAsteroids;
    scene;

    
    constructor(scene, orbitRadius, numAsteroids, orbitSpeed, fieldHeight, fieldWidth) {
        this.scene = scene
        this.orbitSpeed = orbitSpeed;
        this.orbitRadius = orbitRadius;
        this.fieldHeight = fieldHeight;
        this.fieldWidth = fieldWidth;
        this.numAsteroids = numAsteroids;
        AsteroidField.fields.push(this);
        this.generateAsteroidField();
    }


    generateAsteroidField() {
        var asteroidGeometry = new THREE.SphereGeometry( 1, 8, 8 );

        asteroidMaterial = new THREE.ShaderMaterial({
            ...AsteroidShader,
            fog: false,
            lights: true,
            dithering: true,
        });
        asteroidMaterial.uniforms.color.value =  new THREE.Color(window.palletFieldColour);
        asteroidMaterial.uniforms.colorDark.value =  new THREE.Color(window.palletDark);
        asteroidMaterial.uniforms.colorDark2.value =  new THREE.Color(window.palletDarkmod);

        this.instance = new THREE.InstancedMesh(asteroidGeometry, asteroidMaterial, this.numAsteroids);
        this.instance.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame



        this.scene.add( this.instance );
    
        this.instance.receiveShadow = true;
        // this.instance.castShadow = true;

        setAsteroidFieldPositions(this.instance, this.orbitRadius, this.fieldHeight, this.fieldWidth);
    }
}


