let asteroidField = [];
        
let valueChange = true;


let palletFieldColour =   Number("0x" + getComputedStyle(document.documentElement).getPropertyValue('--light').split("#")[1]);
let palletPlanetColoura = Number("0x" + getComputedStyle(document.documentElement).getPropertyValue('--hero').split("#")[1]);
let palletPlanetColourb = Number("0x" + getComputedStyle(document.documentElement).getPropertyValue('--hero').split("#")[1]);

let fieldRadius = 7;
let planetSize = 5;

let sunRotation = 0;


let reloadAsteroids = false;
let numberOfAsteroids = 1000
