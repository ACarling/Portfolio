import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';

export const noise = createNoise2D();
export const remove_loader_animation = [
    {backgroundColor : "red"},
    {backgroundColor : "green"}
]
export const remove_loader_animation_timing = {
    duration: 2000,
    iterations: 1
}


var possibleHeroColors = [
    "#00ff62",
    "#E59500",
    "#F93943",
    "#9e4af7",
    "#c3ff00",
    "#00ffe5",
];


export function initGlobalVars(dontChangeColor) {
    window.asteroidField = [];
            
    window.valueChange = true;


    let randCol;
    if(!dontChangeColor) {
        var storedHeroColor = localStorage.getItem("heroColor");
        if(storedHeroColor !== undefined && storedHeroColor !== null && !isNaN(storedHeroColor)) {
            storedHeroColor = parseInt(storedHeroColor);
            randCol = (storedHeroColor + 1);
            localStorage.setItem("heroColor", randCol % (possibleHeroColors.length - 1))
        } else {
            randCol = Math.round(Math.random() * (possibleHeroColors.length - 1));
            localStorage.setItem("heroColor",randCol)
        }
    } else {
        var storedHeroColor = localStorage.getItem("heroColor");
        if(storedHeroColor !== undefined && storedHeroColor !== null && !isNaN(storedHeroColor)) {
            randCol = parseInt(storedHeroColor);
        } else {
            randCol = Math.round(Math.random() * (possibleHeroColors.length - 1));
            localStorage.setItem("heroColor",randCol)
        }
    }

    document.documentElement.style.setProperty('--hero', possibleHeroColors[randCol]);

    window.cssDark = getComputedStyle(document.documentElement).getPropertyValue('--dark')
    window.cssLight = getComputedStyle(document.documentElement).getPropertyValue('--light')
    window.cssHero = getComputedStyle(document.documentElement).getPropertyValue('--hero')
    window.cssDarkMod = getComputedStyle(document.documentElement).getPropertyValue('--dark-mod')
    window.cssLightMod = getComputedStyle(document.documentElement).getPropertyValue('--light-mod')



    window.palletDark = Number("0x" + window.cssDark.split("#")[1]);
    window.palletFieldColour =   Number("0x" + window.cssLight.split("#")[1]);
    window.palletHero = Number("0x" + window.cssHero.split("#")[1]);
    window.palletDarkmod = Number("0x" + window.cssDarkMod.split("#")[1]);
    window.palletLightmod = Number("0x" + window.cssLightMod.split("#")[1]);

    window.palletWaterDeep = 0x1a5b9c;
    window.palletWaterShallow = 0xa4e0da;


    window.mousePos = new THREE.Vector2();
    addEventListener("mousemove", (event) => {
        window.mousePos.x = ( event.clientX / innerWidth ) * 2 - 1;
        window.mousePos.y = - ( event.clientY / innerHeight ) * 2 + 1;
    })

    window.fieldRadius = 7;
    window.planetSize = 5;

    window.sunRotation = 0;


    window.reloadAsteroids = false;
    window.numberOfAsteroids = 1000




    window.palletLight = 0x5e84ab
    window.palletGround = 0xa1a1a1
    window.palletFish = window.palletHero
    window.avoidFactor = 0.1; 
    window.turnFactor = .1; 
    window.centeringFactor = 0.002;
    window.matchingFactor = 0.01;
    window.homingFactor = 0.0005;


    window.isMobile = false
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        window.isMobile = true;
    } else {
        window.isMobile = false;
    }

}