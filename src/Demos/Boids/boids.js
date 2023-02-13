
import * as THREE from 'three';


var b = [];
let boidMaterial;
export class BoidController {
    // Size of canvas. These get updated to fill the whole browser.
    width = 25*1.6;
    height = 25;
    depth = 15;
    margin = 4;
    tankMargin = 2;

    numBoids = 150;
    visualRange = 3;
    boidSize = .2;

    minDistance = .7;
    avoidFactor = 0.1; 
    turnFactor = .09; 
    centeringFactor = 0.002;
    matchingFactor = 0.01;
    homingFactor = 0.0005;
    speedMultiplyer = .1;
    speedLimit = 1;

    boids = [];

    camera;
    scene;
    mousePositionObject;


    constructor(camera, scene, mousePositionObject) {
        this.camera = camera;
        this.scene = scene;
        this.mousePositionObject = mousePositionObject;

        this.width = window.innerWidth/50;
        this.height = window.innerHeight/50;
        this.camera.position.z = this.depth + .5 * Math.min(this.height, this.width);

        let geometry = new THREE.ConeGeometry(1 * this.boidSize, 4 * this.boidSize,32); 
        boidMaterial = new THREE.MeshBasicMaterial( { color: window.palletFish } );

        for (var i = 0; i < this.numBoids; i += 1) {
            // let BoidGeom = new THREE.Mesh( geometry, Math.random() > .5 ? materialb : boidMaterial ); //new THREE.Mesh( geometry, boidMaterial);
           
            let BoidGeom = new THREE.Mesh( geometry, boidMaterial ); //

            this.scene.add( BoidGeom ); 
            BoidGeom.castShadow = true; //default is false
            BoidGeom.receiveShadow = false; //default
            

            this.boids[this.boids.length] = {
                x: Math.random() * 4 - 2, // * this.width - this.width/2,
                y: Math.random() * 4 - 2, // * this.height - this.height/2,
                z: Math.random() * 4 - 2, // * this.depth - this.depth/2,
                dx: Math.random() * this.speedLimit - this.speedLimit/2,
                dy: Math.random() * this.speedLimit - this.speedLimit/2,
                dz: Math.random() * this.speedLimit - this.speedLimit/2,
                threeObject: BoidGeom
            };
        }
    }




    distance(boid1, boid2) {
        return Math.sqrt(
            (boid1.x - boid2.x) * (boid1.x - boid2.x) +
            (boid1.y - boid2.y) * (boid1.y - boid2.y) + 
            (boid1.z - boid2.z) * (boid1.z - boid2.z),
        );
    }

    // TODO: This is naive and inefficient.
    nClosestBoids(boid, n) {
        // Make a copy
        const sorted = this.boids.slice();
        // Sort the copy by this.distance from `boid`
        sorted.sort((a, b) => this.distance(boid, a) - this.distance(boid, b));
        // Return the `n` closest
        return sorted.slice(1, n + 1);
    }


    // Constrain a boid to within the window. If it gets too close to an edge,
    // nudge it back in and reverse its direction.
    keepWithinBounds(boid) {
        
        // let dst = Math.sqrt(boid.x + boid.y + boid.z);

        let dst = new THREE.Vector3(boid.x,boid.y,boid.z).distanceTo(new THREE.Vector3(0,0,0)) / 15;
// chuck noise(boid.x,boid..y) on this homing factor
        // let noiseScale = .01;
        // let noiseVal = noise.noise3D(boid.x*noiseScale,boid.y+noiseScale,boid.z+noiseScale) / 50;

        boid.dx += (0 - boid.x) * this.homingFactor * dst;
        boid.dy += (2 - boid.y) * this.homingFactor * dst;
        boid.dz += (0 - boid.z) * this.homingFactor * dst;

        

        // if (boid.x < -halfWidth) {
        //     boid.dx += this.turnFactor;
        // }
        // if (boid.x > halfWidth) {
        //     boid.dx -= this.turnFactor
        // }
        // if (boid.y < -this.height/2) {
        //     boid.dy += this.turnFactor;
        // }
        // if (boid.y > this.height/2) {
        //     boid.dy -= this.turnFactor;
        // }
        // if (boid.z < -halfDepth) {
        //     boid.dz += this.turnFactor;
        // }
        // if (boid.z > halfDepth) {
        //     boid.dz -= this.turnFactor;
        // }
    }

    // Find the center of mass of the other boids and adjust velocity slightly to
    // point towards the center of mass.
    flyTowardsCenter(boid) {

        let centerX = 0;
        let centerY = 0;
        let centerZ = 0;

        let numNeighbors = 0;

        for (let otherBoid of this.boids) {
            if (this.distance(boid, otherBoid) < this.visualRange) {
                centerX += otherBoid.x;
                centerY += otherBoid.y;
                centerZ += otherBoid.z;
                numNeighbors += 1;
            }
        }

        if (numNeighbors) {
            centerX = centerX / numNeighbors;
            centerY = centerY / numNeighbors;
            centerZ = centerZ / numNeighbors;

            boid.dx += (centerX - boid.x) * this.centeringFactor;
            boid.dy += (centerY - boid.y) * this.centeringFactor;
            boid.dz += (centerZ - boid.z) * this.centeringFactor;

        }
    }

    // Move away from other boids that are too close to avoid colliding
    avoidOthers(boid) {
        let moveX = 0;
        let moveY = 0;
        let moveZ = 0;
        for (let otherBoid of this.boids) {
            if (otherBoid !== boid) {
                if (this.distance(boid, otherBoid) < this.minDistance) {
                    moveX += boid.x - otherBoid.x;
                    moveY += boid.y - otherBoid.y;
                    moveZ += boid.z - otherBoid.z;
                }
            }
        }



        let moisePosAsBoid = {...this.mousePositionObject.position}
        moisePosAsBoid.z = 0;
        let boidNoZ = {...boid};
        boidNoZ.z = 0;

        if (this.distance(boidNoZ, moisePosAsBoid) < 1.5) {
            moveX += boid.x - this.mousePositionObject.position.x;
            moveY += boid.y - this.mousePositionObject.position.y;
            // moveZ += boid.z - this.mousePositionObject.position.z;
        }

        boid.dx += moveX * this.avoidFactor;
        boid.dy += moveY * this.avoidFactor;
        boid.dz += moveZ * this.avoidFactor;
    }

    // Find the average velocity (speed and direction) of the other boids and
    // adjust velocity slightly to match.
    matchVelocity(boid) {

        let avgDX = 0;
        let avgDY = 0;
        let avgDZ = 0;

        let numNeighbors = 0;

        for (let otherBoid of this.boids) {
            if (this.distance(boid, otherBoid) < this.visualRange) {
                avgDX += otherBoid.dx;
                avgDY += otherBoid.dy;
                avgDZ += otherBoid.dz;

                numNeighbors += 1;
            }
        }

        if (numNeighbors) {
            avgDX = avgDX / numNeighbors;
            avgDY = avgDY / numNeighbors;
            avgDZ = avgDZ / numNeighbors;

            boid.dx += (avgDX - boid.dx) * this.matchingFactor;
            boid.dy += (avgDY - boid.dy) * this.matchingFactor;
            boid.dz += (avgDZ - boid.dz) * this.matchingFactor;

        }
    }

    // Speed will naturally vary in flocking behavior, but real animals can't go
    // arbitrarily fast.
    limitSpeed(boid) {

        const speed = Math.sqrt(boid.dx * boid.dx + boid.dy * boid.dy + boid.dz * boid.dz);
        if (speed > this.speedLimit) {
            boid.dx = (boid.dx / speed) * this.speedLimit;
            boid.dy = (boid.dy / speed) * this.speedLimit;
            boid.dz = (boid.dz / speed) * this.speedLimit;
        }
    }


    // Main animation loop
    animationLoop() {
        // Update each boid
        for (let boid of this.boids) {
            // Update the velocities according to each rule
            this.flyTowardsCenter(boid);
            this.avoidOthers(boid);
            this.matchVelocity(boid);
            this.limitSpeed(boid);
            this.keepWithinBounds(boid);


            // Update the position based on the current velocity
            boid.x += boid.dx * this.speedMultiplyer;
            boid.y += boid.dy * this.speedMultiplyer;
            boid.z += boid.dz * this.speedMultiplyer;

            boid.threeObject.lookAt(boid.x,boid.y,boid.z);
            boid.threeObject.rotateX(Math.PI/2);

            // console.log()
            boid.threeObject.position.x = boid.x;
            boid.threeObject.position.y = boid.y;
            boid.threeObject.position.z = boid.z;

        }
    }
}

