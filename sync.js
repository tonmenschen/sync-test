var fps;
var dotBuilder;
var dotBuilderIntervall;
var updateIntervall;
var leftBeep;
var rightBeep;
var timeOffset;

init();

function init() {
    //Start Sync from timeserver ... async
    leftBeep = document.getElementById("leftBeep");
    rightBeep = document.getElementById("rightBeep");

    //Set default FPS
    changeFps(25);
}

function reset() {
    //Stop TC Running
    clearInterval(updateIntervall);
    
    document.getElementById("timecode").innerText = "WA:IT:SY:NC";
    
    //Hide Dots
    dotBuilder = 0;
    var dot = document.getElementsByClassName("dot");
    for (var i = 0; i < dot.length; i++) {
        dot.item(i).style.visibility = 'hidden';
        dot.item(i).style.color = 'white';
    }

    //Build Clock
    clearInterval(dotBuilderIntervall);
    dotBuilderIntervall = setInterval(build, 1200 / fps);
}

function changeFps(newFps) {
    fps = newFps;
 
    //(re)sync Time
    sync();

    //(re)build Clock
    reset();

    //Highlight selected
    var buttons = document.getElementsByClassName("button");
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].className = buttons[i].className.replace("button active", "button");
    }
    document.getElementById('fps' + newFps).className += " active";
}

function build() {
    //Build Dots

    if (dotBuilder < fps) {
        document.getElementById((dotBuilder < 10 ? `0${dotBuilder}` : dotBuilder).toString()).style.visibility = 'visible';
        document.getElementById((dotBuilder < 10 ? `0${dotBuilder}` : dotBuilder).toString()).style.transform = 'rotate(' + (360 / fps * dotBuilder) + 'deg)';
        dotBuilder++;
    }
    else {
        clearInterval(dotBuilderIntervall);
        //Start TC Running
        updateIntervall = setInterval(update, 1000 / fps / 2);
    }
}


function update() {
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

    /* Flash current frame dot */
    var dot = document.getElementsByClassName("dot");
    for (var i = 0; i < dot.length; i++) {
        dot.item(i).style.color = 'white';
    }
    document.getElementById(frames).style.color = 'red';

    /* Flash every second */
    if (frames < 1) {
        document.getElementById("clock").style.borderColor = 'red';

        if (secs % 2 == 0) {
            document.getElementById("box").style.left = 'calc(100vw - 5vmin)';

            if (leftBeep.duration > 0 && leftBeep.paused) {
                // leftBeep.play();
                // console.log("Left Played @ " + secs);
            }
        }
        else {
            document.getElementById("box").style.left = '0vw';

            if (rightBeep.duration > 0 && rightBeep.paused) {
                // rightBeep.play();
                // console.log("Right Played @ " + secs);
            }
        }
    }
    else {
        document.getElementById("clock").style.borderColor = 'gray';
    }
}


function sync() {
    var request = new XMLHttpRequest();

    // Query Server before actual sync
    // request.open('GET', 'https://worldtimeapi.org/api/ip', true);
    // request.send();
    // if (request.readyState == XMLHttpRequest.DONE && request.status != 200) {
    //     console.log("Error " + request.status + " while polling for JSON source: " + request.responseText);
    //     return;
    // }
    // console.log("Blind poll finished");
    var timeRequest;
    var timeAnswer;
    var answer;
    var JSONObject;
    var timeJSON;
    var timeDelta;
    var serverTime;
    var clientTime;
    request.open('GET', 'https://worldtimeapi.org/api/ip', true);
    request.send();

    timeRequest = Date.now();
    request.onreadystatechange = function () {
        if (request.readyState == XMLHttpRequest.DONE) {
            if (request.status == 200) {
                timeAnswer = Date.now();
                timeDelta = (timeAnswer - timeRequest);
                answer = request.responseText;
                JSONObject = JSON.parse(answer);
                timeJSON = JSONObject.utc_datetime;
                serverTime = Date.parse(timeJSON);
                clientTime = (serverTime + timeDelta / 2);
                timeOffset = Date.now() - clientTime;
                // console.log("responseText: " + answer);
                // console.log("timeJSON: " + timeJSON);
                // console.log("timeRequest: " + timeRequest);
                // console.log("timeAnswer: " + timeAnswer);
                // console.log("timeDelta: " + timeDelta);
                // console.log("serverTime: " + serverTime);
                // console.log("timeOffset: " + timeOffset);
                // console.log("clientTime: " + clientTime);

                document.getElementById("serverTime").innerHTML = "serverTime: " + serverTime.toString();
                document.getElementById("clientTime").innerHTML = "clientTime: " + clientTime.toString();
                document.getElementById("deltaTime").innerHTML = "deltaTime: " + timeOffset.toString();
            }
            else {
                console.log("Error " + request.status + " while polling for JSON source: " + request.responseText);
            }
        }
    }
}