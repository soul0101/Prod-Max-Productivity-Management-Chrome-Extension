let ticker, display, startBtn, resetBtn, curTime, ft, sbt, lbt, lbf, cycles;
display = document.getElementById("timer");
startBtn = document.getElementById("start-btn");
resetBtn = document.getElementById("rst-btn");
ft = document.getElementById('focus-time');
sbt = document.getElementById('sho-break-time');
lbt =document.getElementById('lo-break-time');
lbf = document.getElementById('lo-break-frequency');
cycles = document.getElementById('cycles');


let bg = chrome.extension.getBackgroundPage();
function formatTime(s){
    let min = (s/60|0).toString().padStart(2,'0');
    let sec = (s%60).toString().padStart(2,'0');
    return min + ':' + sec;
}

function startPause(){
    $("#timer-settings").toggle();
    if(bg.getState() == 1){
        chrome.storage.local.get(['startTime', 'duration'], (data)=>{
            let newDuration = data.duration - ((Date.now() - data.startTime)/1000|0);
            chrome.storage.local.set({'startTime':0, 'duration':newDuration});
            // bg.STATE = 0;
            bg.updateState(0);
            startBtn.innerHTML = "Start";
            bg.clearAlarm(); //Clear alarm
            clearInterval(ticker);
            console.log("cleared..");
        });
    } else{
        chrome.storage.local.get(['duration'], (data)=>{
            curTime = Date.now();
            chrome.storage.local.set({'startTime':curTime, 'duration':data.duration});
            console.log("startTime: ", curTime);
            console.log("Duration: ", data.duration);
            // bg.STATE = 1;
            bg.updateState(1);
            startBtn.innerHTML = "Pause";
            bg.setAlarm(data.duration*1000); //set Alarm
            startTicker();
        });        
    }
}

function startTicker(){    
    chrome.storage.local.get(['startTime', 'duration'], (data)=>{
        let startT = data.startTime;
        let dur = data.duration;       
        curTime = Date.now();

        console.log(dur, startT, curTime)
        let secondsLeft = dur - ((curTime - startT)/1000|0); //remove redundant variables later
        display.innerHTML = formatTime(secondsLeft);

        ticker = setInterval(function(){
            secondsLeft--;
            if(secondsLeft < 1){
                clearTicker();
            }
            display.innerHTML = formatTime(secondsLeft);
        }, 1000);
    });   
}

function clearTicker(){
    // bg.STATE = 0;
    bg.updateState(0);
    clearInterval(ticker);
    $("#timer-settings").show();
    startBtn.innerHTML = "Start";    
    // display.innerHTML = formatTime(15);
    // chrome.storage.local.set({'startTime':0, 'duration':15});
    resetClockState();
}

function resetTicker(){
    // bg.STATE = 0;
    bg.updateState(0);
    bg.clearAlarm();
    clearInterval(ticker);
    startBtn.innerHTML = "Start";
    $("#timer-settings").show();
    // display.innerHTML = formatTime(15);
    // chrome.storage.local.set({'startTime':0, 'duration':15});
    resetClockState();
}

function resetClockState(){
    chrome.storage.local.get({'settings':bg.defaultSettings()}, (data)=>{
        chrome.storage.local.set({'startTime':0, 'duration':data.settings.ft*60});
        display.innerHTML = formatTime(data.settings.ft*60);
    });
}

function buildSettings(){
    return {
        ft: ft.value,
        sbt: sbt.value,
        lbt: lbt.value,
        lbf: lbf.value,
        cycles: cycles.value,
    }
}

document.addEventListener('DOMContentLoaded', ()=>{    
    startBtn.addEventListener('click', startPause);    
    resetBtn.addEventListener('click', resetTicker); 

    console.log("added listeners");
    // console.log(bg.STATE);
    if(bg.getState() == 1){
        //clock alr running
        console.log("starting ticker.............")
        $("#timer-settings").hide();
        startBtn.innerHTML = "Pause";
        startTicker();
    } else{
        //clock either paused or reset
        $("#timer-settings").show();
        startBtn.innerHTML = "Start";
        chrome.storage.local.get(['startTime', 'duration'], (data)=>{      
            display.innerHTML = formatTime(data.duration);
        }); 
    }

    let save = document.getElementById("save-timer-settings");
    save.addEventListener('click', ()=>{
        let ls = buildSettings();
        chrome.storage.local.set({'settings':ls}, ()=>{
            resetClockState()
            console.log("save-settings");
            $(".tabcontent").hide();
            $("#time-page").show();
        });
    });
});


//Recycle Bin

//startTicker()
// -------
// ticker = setInterval(function(){
//     curTime = Date.now();
//     console.log(dur, startT, curTime)
//     let secondsLeft = dur - ((curTime - startT)/1000|0);
//     console.log(secondsLeft);
//     if(secondsLeft < 1){
//         clearInterval(ticker);
//         //change start button;
//         startBtn.innerHTML = "Start";
//     }
//     display.innerHTML = formatTime(secondsLeft);
// }, 1000);