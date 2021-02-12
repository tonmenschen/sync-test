var settingFps;
var settingSound;
var dotBuilder;
var dotBuilderIntervall;
var updateIntervall;
var soundPing; //left sound
var soundPong; //right sound
var soundBeep;
var syncOffset; //Positive Offset --> Systemuhr geht nach
var pulse;
var timecode;
var dots;
var box;
var clock;
var buttonsFps;
var buttonsSound;
var readyForNextFrame;
var previousFrame;
var statusHTML;
var offsetHTML;

init();

function init() {
    //Initiate HTML Elements
    soundPing = document.getElementById("soundPing");
    soundPong = document.getElementById("soundPong");
    soundBeep = document.getElementById("soundBeep");
    pulse = document.getElementById("pulse");
    timecode = document.getElementById("timecode");
    dots = document.getElementsByClassName("dot");
    box = document.getElementById("box");
    clock = document.getElementById("clock");
    buttonsFps = document.getElementsByClassName("button fps");
    buttonsSound = document.getElementsByClassName("button sound");
    statusHTML = document.getElementById("status");
    offsetHTML = document.getElementById("offset");

    //Re-trigger flags
    previousFrame = 99;
    readyForNextFrame = true;

    //Set default FPS: 25
    changeFps(25);

    //Set delauft Sound: off
    changeSound("off");

    //Auto Re-Sync every minute
    setInterval(sync, 60000);
}

function reset() {
    //Stop TC Running
    clearInterval(updateIntervall);

    timecode.innerText = "WA:IT:SY:NC";

    //Hide Dots
    dotBuilder = 0;

    for (var i = 0; i < dots.length; i++) {
        dots.item(i).style.visibility = 'hidden';
        dots.item(i).style.color = 'white';
    }

    //Build Clock
    clearInterval(dotBuilderIntervall);
    dotBuilderIntervall = setInterval(build, 1200 / settingFps);
}

function changeFps(newFps) {
    settingFps = newFps;

    //(re)sync Time
    sync();

    //(re)build Clock
    reset();

    //Highlight selected Fps
    for (var i = 0; i < buttonsFps.length; i++) {
        buttonsFps[i].className = buttonsFps[i].className.replace(" active", "");
    }
    document.getElementById('fps' + newFps).className += " active";
}

function changeSound(newSound) {
    settingSound = newSound;

    //Highlight selected Sound
    for (var i = 0; i < buttonsSound.length; i++) {
        buttonsSound[i].className = buttonsSound[i].className.replace(" active", "");
    }
    document.getElementById(newSound).className += " active";
}

function build() {
    //Build Dots
    if (dotBuilder < settingFps) {
        document.getElementById((dotBuilder < 10 ? `0${dotBuilder}` : dotBuilder).toString()).style.visibility = 'visible';
        document.getElementById((dotBuilder < 10 ? `0${dotBuilder}` : dotBuilder).toString()).style.transform = 'rotate(' + (360 / settingFps * dotBuilder) + 'deg)';
        dotBuilder++;
    }
    else {
        clearInterval(dotBuilderIntervall);
        //Start TC Running
        updateIntervall = setInterval(update, 1000 / settingFps / 3);
    }
}


function update() {
    let date = new Date(Date.now() + Math.round(syncOffset));
    let hrs = date.getHours();
    let mins = date.getMinutes();
    let secs = date.getSeconds();
    let msec = date.getMilliseconds();
    let frames = Math.floor(msec / 1000 * settingFps);

    if (frames != previousFrame) {
        hrs = hrs < 10 ? `0${hrs}` : hrs;
        mins = mins < 10 ? `0${mins}` : mins;
        secs = secs < 10 ? `0${secs}` : secs;
        frames = frames < 10 ? `0${frames}` : frames;

        /* Update TC text */
        let time = `${hrs}:${mins}:${secs}:${frames}`;
        timecode.innerText = time;

        /* Flash current frame dot */
        for (var i = 0; i < dots.length; i++) {
            dots.item(i).style.color = 'white';
        }
        document.getElementById(frames).style.color = 'red';

        /* Trigger every Second */
        if (frames < 1 && readyForNextFrame) {

            //Flash Border
            clock.style.borderColor = 'red';
            //Flash Pulse
            pulse.classList.remove('notransition');
            pulse.style.opacity = 0;
            pulse.style.borderWidth = '6vmin';

            //Prevent multiple 00 Frame trigers
            readyForNextFrame = false;

            /* Move Ping-ping box */
            if (secs % 2 == 0) {
                box.style.left = 'calc(100vw - 5vmin)';

                // Play left sound
                switch (settingSound) {
                    case "off":
                        break;
                    case "ping-pong":
                        if (soundPing.duration > 0 && soundPing.paused) {
                            soundPing.play();
                        }
                        break;
                    case "beep":
                        if (soundBeep.duration > 0 && soundBeep.paused) {
                            soundBeep.play();
                        }
                        break;
                    default:
                        break;
                }
            }
            else {
                box.style.left = '0vw';

                // Play right sound
                switch (settingSound) {
                    case "off":
                        break;
                    case "ping-pong":
                        if (soundPong.duration > 0 && soundPong.paused) {
                            soundPong.play();
                        }
                        break;
                    case "beep":
                        if (soundBeep.duration > 0 && soundBeep.paused) {
                            soundBeep.play();
                        }
                        break;
                    default:
                        break;
                }
            }
        }
        else {
            clock.style.borderColor = 'gray';
        }
        previousFrame = frames;
    }

    //Reset Pulse -> readyForNextFrame;
    if (frames == 23) {
        pulse.classList.add('notransition');
        pulse.style.opacity = 1;
        pulse.style.borderWidth = '3vmin';

        readyForNextFrame = true;
    }
}


function sync() {
    let debugString = "";
    let request = new XMLHttpRequest();
    let timeRequest; //Time @ Status 2: HEADERS_RECEIVED -> server starts response
    let timeAnswer;  //Time @ Status 4: DONE -> JSON time liegt vor
    let JSONObject;  //Parsed responseText as JSON string
    let timeJSON;    //Extract UTC-time
    let timeDelta;   //Time between request and answer
    let serverTime;  //Parse to UNIX-Time
    let clientTime;

    //Show (re)sync Status
    statusHTML.innerHTML = "&#11044; Syncing";
    document.getElementById("status").style.color = 'orange';

    //Query Time-Server 
    request.open('GET', 'https://worldtimeapi.org/api/ip', true);
    debugString += request.readyState + ":" + Date.now() + ",";
    request.send();

    request.onreadystatechange = function () {
        debugString += request.readyState + ":" + Date.now() + ",";

        //Store timeRequest when XMLHttpRequest.HEADERS_RECEIVED (request received)
        if (request.readyState == 2) {
            timeRequest = Date.now();
        }

        //Store timeAnswer when XMLHttpRequest.DONE (request finished and response is ready)
        if (request.readyState == XMLHttpRequest.DONE) {
            if (request.status == 200) {
                timeAnswer = Date.now();
                timeDelta = (timeAnswer - timeRequest);
                JSONObject = JSON.parse(request.responseText);
                timeJSON = JSONObject.utc_datetime;
                serverTime = Date.parse(timeJSON);
                clientTime = serverTime + timeDelta * 2; //timeDelta passed since server pulled timestamp, x 2 to compensate for roundtrip
                syncOffset = clientTime - Date.now();
                debugString += "JSON :" + serverTime + ",Offset: " + syncOffset;
                console.log(debugString);

                statusHTML.innerHTML = "&#11044; Sync Ok!";
                statusHTML.style.color = 'green';
                offsetHTML.innerHTML = "Offset is " + Math.round(syncOffset) + " ms";
            }
            else {
                console.log("Error " + request.status + " while polling for JSON source: " + request.responseText);
                statusHTML.innerHTML = "&#11044; No Sync!";
                statusHTML.style.color = 'red';
                offsetHTML.innerHTML = "(using client clock)";
            }
        }
    }
}