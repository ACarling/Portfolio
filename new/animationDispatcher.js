var animationQueue = [];

var stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );
stats.dom.classList.add("stat-counter")
stats.dom.style.left = null
stats.dom.style.right = null
stats.dom.style.visibility = "hidden"
document.getElementById("scrollPos").addEventListener("click", e => {
    if(stats.dom.style.visibility == "visible") {
        stats.dom.style.visibility = "hidden"
    } else {
        stats.dom.style.visibility = "visible"
    }
})

class RenderFunction {
    animationFunction = null;
    rendererFunction = null;
}

sections.forEach(() => {
    animationQueue.push(new RenderFunction);
});

var lastDate = Date.now() / 60;
function animate() {
    stats.begin();
    let delta = lastDate - Date.now() / 60;
    lastDate = Date.now() / 60;

    if(animationQueue[activeSection].animationFunction) {
        animationQueue[activeSection].animationFunction(delta);
    }
    if(animationQueue[activeSection].animationFunction) {
        animationQueue[activeSection].rendererFunction();
    }

    stats.end();
	requestAnimationFrame( animate );

}

animate();