let asteroidField = [];
        
let valueChange = true;

const noise = new SimplexNoise();
let palletDark = Number("0x" + getComputedStyle(document.documentElement).getPropertyValue('--dark').split("#")[1]);
let palletFieldColour =   Number("0x" + getComputedStyle(document.documentElement).getPropertyValue('--light').split("#")[1]);
let palletHero = Number("0x" + getComputedStyle(document.documentElement).getPropertyValue('--hero').split("#")[1]);
let palletDarkmod = Number("0x" + getComputedStyle(document.documentElement).getPropertyValue('--dark-mod').split("#")[1]);

let palletWaterDeep = 0x1a5b9c;
let palletWaterShallow = 0xa4e0da;


var mousePos = new THREE.Vector2();
window.addEventListener("mousemove", (event) => {
    mousePos.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mousePos.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
})

let fieldRadius = 7;
let planetSize = 5;

let sunRotation = 0;


let reloadAsteroids = false;
let numberOfAsteroids = 1000



let valueChanged = false;

let palletLight = 0x5e84ab
let palletGround = 0xa1a1a1
let palletFish = 0xE59500
let avoidFactor = 0.1; 
let turnFactor = .1; 
let centeringFactor = 0.002;
let matchingFactor = 0.01;
let homingFactor = 0.0005;

let initial_palletLight = 0x5e84ab
let initial_palletGround = 0xa1a1a1
let initial_palletFish = 0x91D3D1
let initial_avoidFactor = 0.1; 
let initial_turnFactor = .1; 
let initial_centeringFactor = 0.002;
let initial_matchingFactor = 0.01;
let initial_homingFactor = 0.0005;
