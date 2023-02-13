import * as THREE from './THREE';

export let asteroidField = [];
        
export let valueChange = true;

export const noise = new SimplexNoise();

export let cssDark = getComputedStyle(document.documentElement).getPropertyValue('--dark')
export let cssLight = getComputedStyle(document.documentElement).getPropertyValue('--light')
export let cssHero = getComputedStyle(document.documentElement).getPropertyValue('--hero')
export let cssDarkMod = getComputedStyle(document.documentElement).getPropertyValue('--dark-mod')
export let cssLightMod = getComputedStyle(document.documentElement).getPropertyValue('--light-mod')



export let palletDark = Number("0x" + cssDark.split("#")[1]);
export let palletFieldColour =   Number("0x" + cssLight.split("#")[1]);
export let palletHero = Number("0x" + cssHero.split("#")[1]);
export let palletDarkmod = Number("0x" + cssDarkMod.split("#")[1]);
export let palletLightmod = Number("0x" + cssLightMod.split("#")[1]);

export let palletWaterDeep = 0x1a5b9c;
export let palletWaterShallow = 0xa4e0da;


export var mousePos = new THREE.Vector2();
window.addEventListener("mousemove", (event) => {
    mousePos.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mousePos.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
})

export let fieldRadius = 7;
export let planetSize = 5;

export let sunRotation = 0;


export let reloadAsteroids = false;
export let numberOfAsteroids = 1000



export let valueChanged = false;

export let palletLight = 0x5e84ab
export let palletGround = 0xa1a1a1
export let palletFish = palletHero
export let avoidFactor = 0.1; 
export let turnFactor = .1; 
export let centeringFactor = 0.002;
export let matchingFactor = 0.01;
export let homingFactor = 0.0005;

export let initial_palletLight = 0x5e84ab
export let initial_palletGround = 0xa1a1a1
export let initial_palletFish = 0x91D3D1
export let initial_avoidFactor = 0.1; 
export let initial_turnFactor = .1; 
export let initial_centeringFactor = 0.002;
export let initial_matchingFactor = 0.01;
export let initial_homingFactor = 0.0005;


export let isMobile = false
if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    isMobile = true;
} else {
    isMobile = false;
}

export const remove_loader_animation = [
    {backgroundColor : "red"},
    {backgroundColor : "green"}
]
export const remove_loader_animation_timing = {
    duration: 2000,
    iterations: 1
}