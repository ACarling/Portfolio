var lastDate = Date.now() / 60;
import { sections, activeSection } from "./customScroll";

// var stats = new Stats();
// stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
// document.body.appendChild( stats.dom );
// stats.dom.classList.add("stat-counter")
// stats.dom.style.left = null
// stats.dom.style.right = null
// stats.dom.style.visibility = "hidden"
// document.getElementById("scrollPos").addEventListener("click", e => {
//     if(stats.dom.style.visibility == "visible") {
//         stats.dom.style.visibility = "hidden"
//     } else {
//         stats.dom.style.visibility = "visible"
//     }
// })



let renderAll = false;

export class RenderFunction {
    animationFunction = null;
    rendererFunction = null;
}

export function animate() {
    // stats.begin();
    let delta = lastDate - Date.now() / 60;
    lastDate = Date.now() / 60;
    if(window.animationQueue[activeSection].animationFunction) {
        window.animationQueue[activeSection].animationFunction(delta);
    }
    if(window.animationQueue[activeSection].animationFunction) {
        window.animationQueue[activeSection].rendererFunction();
    }
    if (renderAll) {
        for(let i = 0; i < window.animationQueue.length; i++) {
            if (i == activeSection) { continue; }
            window.animationQueue[i].animationFunction(0);
            window.animationQueue[i].rendererFunction();    
        }
    }


    // stats.end();
	requestAnimationFrame( animate );
    renderAll = false
}


export function initAnimationDispatcher() {
    window.animationQueue = [];
    window.addEventListener("onColorChanged", (ev) => {
        renderAll = true
    })
    sections.forEach(() => {
        window.animationQueue.push(new RenderFunction);
    });
    animate();
}
