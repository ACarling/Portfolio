import { initGlobalVars } from './src/Demos/GlobalVar';
initGlobalVars();



import {sections, changeSection, initCustomScroll} from './src/customScroll'

import {boidBootstrapper} from './src/Demos/Boids/index'
import {planetBootstrapper} from './src/Demos/RingedPlanet/index'
import {waveBootstrapper} from './src/Demos/Waves/index'
import {castleBootstrapper} from './src/Demos/JarCastle/index'
import {initAnimationDispatcher} from './src/animationDispatcher';



resizeFunctions.push(() => {
    var screenHeight = `${window.innerHeight}px`;
    document.documentElement.style.setProperty('--display-height', screenHeight);
})

document.body.onload = function init() {
    // add numbers and set up scenese
    initCustomScroll();
    initAnimationDispatcher();
    for (let i = 0; i < sections.length; i++) {
        var displayNumber = (i+1).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});
        var bn = document.createElement("p");
        bn.classList.add("background-number");
        bn.classList.add("text-outline");
        bn.innerText = displayNumber;
        var pn = document.createElement("p");
        pn.classList.add("page-number");
        pn.innerText = `${i + 1} of ${sections.length}`


        var crossDecor = document.createElement("div")
        crossDecor.classList.add("border-lines");
        for (let j = 0; j < 6; j++) {
            let cross = document.createElement("div");
            crossDecor.appendChild(cross)                    
        }
        sections[i].prepend(pn)
        sections[i].prepend(bn)
        sections[i].prepend(crossDecor)
    }


    boidBootstrapper.sceneSetup(0);
    planetBootstrapper.sceneSetup(2);
    waveBootstrapper.sceneSetup(1);
    castleBootstrapper.sceneSetup(3);

    resizeFunctions.forEach(u => {
        u();
    })
    
    document.getElementById("loader").classList.add("hidden")

    //TODO: remove, just for testing
    changeSection(2)
}

window.onresize = function() {
    resizeFunctions.forEach(u => {
        u();
    })
}

window.onclick = function(event) {
    if(event.target.classList.contains("write-up")) {
        console.log("write up")
    }
}
// <p class="background-number">00</p>
// <p class="page-number">1 : 4</p>
