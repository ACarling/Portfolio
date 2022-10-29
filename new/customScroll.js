// on apple devices the thingo at the top is coloured red -> should change background color
// add inertia to mobile
// if mobile switch section change from scolling thing to a card flicking -> like a deck of cards
// revisit idea where can scroll up too -> stops at page 0

// down arrow scrolling is naive revisit add some acceleration or something

// make about page
//      -> when click about have animation of a diagonal slash go over the page then expand to cover 

// maybe in event calculate speed
//      instead of in touchend using posiiton to change slide
//      use speed aswell

// make a loading screen


var isMobile = false;
if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    isMobile = true;
} else {
    isMobile = false;
}



var pageUpButton = document.getElementById("upPage");

var scrollSpeed = .1;
var scrollPos = 0;
var sections = [...document.getElementsByClassName("section")];
var activeSection = 0;

var isDark = true;


var maxStickAmount = 50;
var currentStickAmount = 0;
var stickTimeout = 4000;


function changeSection(toSection) {
    document.getElementsByClassName("staged-section")[0].style.top = null;

    let currentStaged = (activeSection + 1) % sections.length;
    var nextStaged = (toSection + 1) % sections.length;

    sections[activeSection].classList.remove("active-section");
    sections[activeSection].classList.add("inactive-section");

    sections[currentStaged].classList.remove("staged-section");
    sections[currentStaged].classList.add("inactive-section");


    sections[toSection].classList.add("active-section");
    sections[nextStaged].classList.add("staged-section");
    sections[toSection].classList.remove("inactive-section");
    sections[nextStaged].classList.remove("inactive-section");

    activeSection = toSection;

    isDark = sections[activeSection].classList.contains("dark") ? true : false

    scrollPos = 0;
    var displayNumber = Math.floor(scrollPos).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});
    document.getElementById("scrollPos").innerText = displayNumber;

    currentStickAmount = maxStickAmount;
    setTimeout(() => {
        currentStickAmount = 0;
    }, stickTimeout);
}

pageUpButton.onclick = () => {
    changeSection(activeSection-1);
    if(activeSection > 0) {
        pageUpButton.style.visibility = "visible"
    } else {
        pageUpButton.style.visibility = "hidden"
    }
}


function verticalScrollDesktop(deltaY) {
    if (currentStickAmount > 0) {
        currentStickAmount -= Math.max(0 ,scrollPos + (deltaY * scrollSpeed))
        return;
    }
    scrollPos = Math.min(100, Math.max(0 ,scrollPos + (deltaY * scrollSpeed)));
    var displayNumber = Math.floor(scrollPos).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});
    document.getElementById("scrollPos").innerText = displayNumber;
    document.getElementsByClassName("staged-section")[0].style.top = `${100 - (scrollPos)}vh`;

    if(scrollPos < 15 && activeSection > 0) {
        pageUpButton.style.visibility = "visible"
    } else {
        pageUpButton.style.visibility = "hidden"
    }

    //SWAP OUT
    if(scrollPos == 100) {
        changeSection((activeSection+1) % sections.length)
    }
}

function scrollMobile(deltaY) {
    scrollPos = Math.min(100, Math.max(0 ,(deltaY * scrollSpeed)));
    var displayNumber = Math.floor(scrollPos).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});
    document.getElementById("scrollPos").innerText = displayNumber;
    document.getElementsByClassName("staged-section")[0].style.top = `${100 - (scrollPos)}vh`;

    if(scrollPos < 15 && activeSection > 0) {
        pageUpButton.style.visibility = "visible"
    } else {
        pageUpButton.style.visibility = "hidden"
    }

    //SWAP OUT
    if(scrollPos == 100) {
        changeSection((activeSection+1) % sections.length)
        return true;
    }
    return false;
}



var touchStart = [0,0];

if(!isMobile) {
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


    window.addEventListener("touchmove", (event) => {
        var touchVec = [event.touches[0].screenX, event.touches[0].screenY]
        var delta = [touchStart[0] - touchVec[0], touchStart[1] - touchVec[1]];
        
        var needTouchReset = scrollMobile(delta[1] * 2);
        if(needTouchReset) {
            touchStart = touchVec
        }
    });

    window.addEventListener("touchstart", (event) => {
        touchStart = [event.touches[0].screenX, event.touches[0].screenY]
    });

    window.addEventListener("touchend", (event) => {
        if(scrollPos < 60) {
            scrollMobile(0)
        } else {
            changeSection((activeSection+1) % sections.length)
        }
        touchStart = [0,0]
    });

}

