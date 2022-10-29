class OrbitalObject {
	static orbitalObjects = [];
	orbitSpeed;
	orbitalRad;
	instance;
	orbitPhase;
	constructor(instance, orbitPhase, orbitSpeed, orbitalRad) {
		this.orbitSpeed = orbitSpeed;
		this.orbitalRad = orbitalRad;
		this.instance = instance;
		this.orbitPhase = orbitPhase;
		OrbitalObject.orbitalObjects.push(this);
	}
	calcPos(time) {
        this.orbitPhase = (time * this.orbitSpeed) % (2 * Math.PI);
        var newPos = new THREE.Vector3(Math.sin(this.orbitPhase) * this.orbitalRad, 0, Math.cos(this.orbitPhase) * this.orbitalRad);        
        this.instance.position.x = newPos.x;
        this.instance.position.z = newPos.z;
		this.instance.position.y = 0;
    }
}