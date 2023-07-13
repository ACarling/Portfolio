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
    

    var to_get_code = [...document.getElementsByClassName("random-code")];
    to_get_code.forEach(element => {
        let a = randomCode();
        element.innerText = randomCode();
    });


    document.getElementById("loader").classList.add("hidden")

    //TODO: remove, just for testing
    changeSection(0)
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



var safe2LetterCombos = [
"AX","SG","MR","AO","BL","KB","EI","MF","LH","NG","PT","UA","EF","WX","RN","QO","KC","CC","OS",
"CK","ET","LP","XE","GR","OX","BE","HG","PR","XT","BQ","CR","AC","TA","GM","QV","FX","FU","HL",
"OH","WW","LH","TG","FJ","QV","LG","CQ","RP","MC","MK","UP","IE","VP","DX","JL","WP","WJ","DC",
"ID","MC","US","RG","CL","BF","JC","SP","QI","AG","HF","RH","QO","YF","KM","QE","XV","YM","IC",
"EC","QB","HG","OV","VX","UB","PQ","UJ","YF","BJ","QP","CT","MP","VJ","PR","JN","AJ","EG","QB",
"HD","MN","BH","VN","WC"
];
var safe3LetterCombos = [
"OFL","OUY","YVH","WBQ","SKL","NNJ","THL","XKU","WPY","SOK","LNN","LGC","LBE","GBU","SRW","XGM",
"FCM","FOL","OBM","EVE","EKE","PVH","VXV","JEO","LQR","JXX","BBR","WEP","SKB","HLA","THI","VSK",
"DFF","NRD","ODI","OPO","PWJ","NHN","WUT","OCG","JBS","MLB","GOG","TFB","IVT","FQP","WXJ","KQV",
"QIF","OLI","EIG","RNU","QRP","JXP","UJN","WTO","HSI","OQG","PUQ","VJD","QLI","PIU","SNR","FCX",
"MQQ","NCE","LXS","LIO","REM","RUI","VKQ","ELD","ASM","BFS","LMR","CHW","YQU","EJF","MBS","FVV",
"YBH","GBK","GVD","PKU","BMG","SLD","GHH","UBN","FFS","VIP","ULY","WGR","IKH","FPT","VRH","UKH",
"NTX","UBP","PQS","IIX"
];

function randomCode() {
    var prefix = Math.round(Math.random() * 1000000);
    prefix = String(prefix).padStart(8, '0');
    
    var mid = safe2LetterCombos[Math.floor(Math.random() * safe2LetterCombos.length - 1)];
    var suffix = safe3LetterCombos[Math.floor(Math.random() * safe3LetterCombos.length - 1)] + "_" + String(Math.round(Math.random() * 999)).padStart(5, '0');
    
    return "SRN: " + prefix + " " + mid + " " + suffix
}
// <p class="background-number">00</p>
// <p class="page-number">1 : 4</p>
function randomLetter() {return String.fromCharCode(65 + Math.round(Math.random() * 24))}