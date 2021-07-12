let ticker, display, startBtn, resetBtn, curTime, ft, sbt, cycles, save, settingsBtn, fcyclesLeft;
display = document.getElementById("timer");
startBtn = document.getElementById("start-btn");
resetBtn = document.getElementById("rst-btn");
ft = document.getElementById('focus-time');
sbt = document.getElementById('sho-break-time');
cycles = document.getElementById('cycles');
save = document.getElementById("save-timer-settings");
settingsBtn = document.getElementById("timer-settings");
fcyclesLeft = document.getElementById("focus-cycles-left");

let bg = chrome.extension.getBackgroundPage();


//----------------------TIMER MODULE BEGIN---------------------------------//

function formatTime(s){
    let min = (s/60|0).toString().padStart(2,'0');
    let sec = (s%60).toString().padStart(2,'0');
    return min + ':' + sec;
}

function startPause(){
    console.log("StartPause() triggered");
    $("#timer-settings").toggle();
    if(bg.getState() == 1){
        chrome.storage.local.get(['startTime', 'duration'], (data)=>{
            let newDuration = data.duration - ((Date.now() - data.startTime)/1000|0);
            chrome.storage.local.set({'startTime':0, 'duration':newDuration});
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
            // console.log("startTime: ", curTime);
            // console.log("Duration: ", data.duration);
            bg.updateState(1);
            startBtn.innerHTML = "Pause";
            bg.setAlarm(data.duration*1000); //set Alarm
            startTicker();
        });        
    }
}

function startTicker(){    
    chrome.storage.local.get(['startTime', 'duration', 'cyclesLeft'], (data)=>{
        let startT = data.startTime;
        let dur = data.duration;       
        curTime = Date.now();

        // console.log(dur, startT, curTime)
        let secondsLeft = dur - ((curTime - startT)/1000|0); //remove redundant variables later
        display.innerHTML = formatTime(secondsLeft);
        fcyclesLeft.innerHTML = data.cyclesLeft;

        ticker = setInterval(function(){
            secondsLeft--;
            if(secondsLeft < 1){
                processCycle();
                // clearInterval(ticker);
            }
            display.innerHTML = formatTime(secondsLeft);
            fcyclesLeft.innerHTML = data.cyclesLeft;
        }, 1000);
    });   
}
//-------------------------------------------------------------------------//


//----------------------NEXT STATE HANDLERS---------------------------------//
function processCycle(){
    clearInterval(ticker);
    chrome.storage.local.get({'cyclesLeft':0}, (data)=>{
        if(bg.getMode() == 0){
            if(data.cyclesLeft > 1){
                data.cyclesLeft--;
                chrome.storage.local.set(data, ()=>{
                    //start break timer
                    startBreakTimer();
                });
            } else{
                //no cycles left so end process
                clearTicker();
            }
        } else{
            if(data.cyclesLeft > 0){
                startFocusTimer();
            } else{
                clearTicker();
            }
        }
    });
}

function startBreakTimer(){
    bg.updateState(0);
    bg.updateMode(1);
    updateUI();

    chrome.storage.local.get({'settings':bg.defaultSettings()}, (data)=>{
        chrome.storage.local.set({'startTime':0, 'duration':data.settings.sbt*60});
        display.innerHTML = formatTime(data.settings.sbt*60);
        startPause();
    });
}

function startFocusTimer(){
    bg.updateState(0);
    bg.updateMode(0);
    updateUI();

    chrome.storage.local.get({'settings':bg.defaultSettings()}, (data)=>{
        chrome.storage.local.set({'startTime':0, 'duration':data.settings.ft*60});
        display.innerHTML = formatTime(data.settings.ft*60);
        startPause();
    });
}

function clearTicker(){
    bg.updateState(0);
    bg.updateMode(0);
    // clearInterval(ticker);
    $("#timer-settings").show();
    startBtn.innerHTML = "Start";    
    resetClockState();
}

function resetTicker(){
    // bg.STATE = 0;
    bg.updateState(0);
    bg.updateMode(0);
    bg.clearAlarm();
    clearInterval(ticker);
    startBtn.innerHTML = "Start";
    $("#timer-settings").show();
    resetClockState();
}

function resetClockState(){
    chrome.storage.local.get({'settings':bg.defaultSettings()}, (data)=>{
        chrome.storage.local.set({'startTime':0, 'duration':data.settings.ft*60, 'cyclesLeft':data.settings.cycles});
        display.innerHTML = formatTime(data.settings.ft*60);
        fcyclesLeft.innerHTML = data.settings.cycles;
        updateUI();
    });
}
//-------------------------------------------------------------------------//

//----------------------------GENERAL--------------------------------------//

function buildSettings(){
    return {
        ft: ft.value,
        sbt: sbt.value,
        cycles: cycles.value,
    }
}

function loadSettings(){
    console.log("settings being loaded...");
    chrome.storage.local.get({'settings':bg.defaultSettings()}, (data)=>{
        // $("#focus-time").val(data.settings.ft);
        // $("#sho-break-time").val(data.settings.sbt);
        // $("#cycles").val(data.settings.cycles);
        document.getElementById('focus-time').value = data.settings.ft;
        document.getElementById('sho-break-time').value = data.settings.sbt;
        document.getElementById('cycles').value = data.settings.cycles;
        
        $(".tabcontent").hide();
        $("#timer-settings-page").show();
    });
}

function updateSettings(){
    let ls = buildSettings();
    chrome.storage.local.set({'settings':ls}, ()=>{
        resetClockState()
        console.log("save-settings");
        $(".tabcontent").hide();
        $("#time-page").show();
    });
}

function updateUI(){
    if(bg.getMode() == 0){
        $("#focus-now").show();
        $("#break-now").hide();
    } else{
        $("#focus-now").hide();
        $("#break-now").show();
    }
}

//-------------------------------------------------------------------------//

document.addEventListener('DOMContentLoaded', ()=>{    
    startBtn.addEventListener('click', startPause);    
    resetBtn.addEventListener('click', resetTicker); 
    save.addEventListener('click', updateSettings);
    settingsBtn.addEventListener('click', loadSettings);
    console.log(bg.getState());
    updateUI();
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
        chrome.storage.local.get(['duration','cyclesLeft'], (data)=>{      
            display.innerHTML = formatTime(data.duration);
            console.log(data.cyclesLeft);
            fcyclesLeft.innerHTML = data.cyclesLeft;
        }); 
    }
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