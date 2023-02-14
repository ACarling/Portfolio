// on apple devices the thingo at the top is coloured red -> should change background color
// add inertia to mobile
// if mobile switch section change from scolling thing to a card flicking -> like a deck of cards

// down arrow scrolling is naive revisit add some acceleration or something

// make about page
//      -> when click about have animation of a diagonal slash go over the page then expand to cover 

// maybe in event calculate speed
//      instead of in touchend using posiiton to change slide
//      use speed aswell

// make a loading screen


// scroll up works on desktop but not on phone

// make boids avoid cursor or touch
// come up with some interaction for planet 

// procedural jellyfish 3js -> tutorial from that ik dude
// island 3js 
//      make island camera rotate when moving mouse
//      make water for island (should fade into white)


export var pageUpButton = document.getElementById("upPage");
export var pageDownButton = document.getElementById("downPage");


export var scrollSpeed = .1;
export var scrollPos = 0;
export var sections = [...document.getElementsByClassName("section")];
export var activeSection = 0;

export var isDark = true;


export var maxStickAmount = 50;
export var currentStickAmount = 0;
export var stickTimeout = 4000;
export var touchStart = [0,0];




export function setSectionPosition(scrollPos) {
    if(scrollPos) {
        document.getElementsByClassName("staged-section")[0].style.top = `${100 - (scrollPos)}vh`;
        if(document.getElementsByClassName("prior-section")[0]) {
            document.getElementsByClassName("prior-section")[0].style.top = `${-100 - (scrollPos)}vh`;
        }
    } else {
        document.getElementsByClassName("staged-section")[0].style.top = null;
        if(document.getElementsByClassName("prior-section")[0]) {
            document.getElementsByClassName("prior-section")[0].style.top = null;
        }    
    }
}


export function changeSection(toSection) {
    setSectionPosition(null);
    let currentStaged = (activeSection + 1) % sections.length;
    var nextStaged = (toSection + 1) % sections.length;

    sections[activeSection].classList.remove("active-section");
    sections[activeSection].classList.add("inactive-section");

    sections[currentStaged].classList.remove("staged-section");
    sections[currentStaged].classList.add("inactive-section");

    if(activeSection != 0) {
        sections[activeSection - 1].classList.remove("prior-section");
        sections[activeSection - 1].classList.add("inactive-section");
    }
    if(toSection != 0) {
        sections[toSection - 1].classList.add("prior-section");
        sections[toSection - 1].classList.remove("inactive-section");
    }


    sections[toSection].classList.add("active-section");
    sections[nextStaged].classList.add("staged-section");
    sections[toSection].classList.remove("inactive-section");
    sections[nextStaged].classList.remove("inactive-section");

    activeSection = toSection;

    isDark = sections[activeSection].classList.contains("dark") ? true : false
    
    if(isDark) {
        document.body.style.backgroundColor = window.cssDark;
        document.querySelector(":root").style.setProperty("--current-font-color", window.cssLight)
    } else {
        document.body.style.backgroundColor = window.cssLight;
        document.querySelector(":root").style.setProperty("--current-font-color", window.cssDark)
    }

    scrollPos = 0;
    var displayNumber = Math.floor(scrollPos).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});
    if(!isMobile) {
        document.getElementById("scrollPos").innerText = displayNumber;
    }

    currentStickAmount = maxStickAmount;
    setTimeout(() => {
        currentStickAmount = 0;
    }, stickTimeout);



    if(isMobile) {
        if(activeSection > 0) {
            pageUpButton.style.visibility = "visible"
        } else {
            pageUpButton.style.visibility = "hidden"
        }    
    }
}




export function verticalScrollDesktop(deltaY) {
    if (currentStickAmount > 0) {
        currentStickAmount -= Math.max(0, scrollPos + (Math.abs(deltaY) * scrollSpeed))
        return;
    }
    scrollPos = Math.min(100, Math.max(activeSection == 0 ? 0 : -100, scrollPos + (deltaY * scrollSpeed)));
    var displayNumber = Math.floor(scrollPos).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});
    document.getElementById("scrollPos").innerText = displayNumber;
    setSectionPosition(scrollPos);

    //SWAP OUT
    if(scrollPos == 100) {
        changeSection((activeSection+1) % sections.length)
        return true;
    } else if (scrollPos == -100) {
        changeSection((activeSection - 1));
        return true;
    } else if (Math.floor(scrollPos) == 0) {
        currentStickAmount = maxStickAmount;
        setSectionPosition(null);
    }
    return false;
}


export function initCustomScroll() {
    
    if(!window.isMobile) {
        pageUpButton.style.visibility = "collapse"
        pageDownButton.style.visibility = "collapse"

        console.log("Not mobile");
    
        window.addEventListener("wheel", (event) => {
            verticalScrollDesktop(event.deltaY);
        });
        
        var keyDown = 0;
        window.addEventListener("keydown", (event) => {
            var deltaY = 0;
            if (event.key == "ArrowDown") {
                deltaY += scrollSpeed * 400;
            } else if (event.key == "ArrowUp") {
                deltaY -= scrollSpeed * 400;
            }
            verticalScrollDesktop(deltaY);
        });    
    } else {
        console.log("Is mobile");
        pageUpButton.onclick = () => {
            changeSection(activeSection-1);
        }
        pageDownButton.onclick = () => {
            changeSection((activeSection+1) % sections.length);
        }
        document.getElementById("scrollPos").style.visibility = 'hidden'
    }
    
}




