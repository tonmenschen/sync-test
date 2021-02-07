﻿const fps = 25;
setInterval(sync, 1000 / fps);

var leftBeep;
var rightBeep;



function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function () {
        this.sound.play();
    }
}


function sync() {
    leftBeep = new sound("left.wav");
    rightBeep = new sound("right.wav");
    let date = new Date();
    let hrs = date.getHours();
    let mins = date.getMinutes();   
    let secs = date.getSeconds();
    let msec = date.getMilliseconds();
    let frames = Math.floor(msec / 1000 * fps);

    hrs = hrs < 10 ? `0${hrs}` : hrs;
    mins = mins < 10 ? `0${mins}` : mins;
    secs = secs < 10 ? `0${secs}` : secs;
    frames = frames < 10 ? `0${frames}` : frames;

    /* Update TC text */
    let time = `${hrs}:${mins}:${secs}:${frames}`;
    document.getElementById("timecode").innerText = time;


    /* Flash current dot */
    var dot = document.getElementsByClassName("dot");
    for (var i = 0; i < dot.length; i++)
    {
        dot.item(i).style.color = 'black';
    }
    document.getElementById(frames).style.color = 'red';

    /* Flash every second */
    if (frames < 1)
    {
        document.getElementById("clock").style.backgroundColor = 'red';
        leftBeep.play();

        if (secs % 2 == 0) {
            document.getElementById("box").style.left = 'calc(100vw - 5vmin)';
            leftBeep.play();
        }
        else {
            document.getElementById("box").style.left = '0vw';
            rightBeep.play();
        }
    }
    else
    {
        document.getElementById("clock").style.backgroundColor = 'blue';
    }

    /* Move box left and right*/
    //document.getElementById("box").style.left = 'calc(' + (1 / fps * (frames)) + ' * ( 100vw - 5vmin))'; 
    //document.getElementById("box").style.transform = 'translateX(calc(100vw / 25 * ' + frames + ' - 5vmin));
    //document.getElementById("box").style.transform = 'translateX(calc(100vw / 25 * ' + frames + ' - 0vmin))';

}

sync();