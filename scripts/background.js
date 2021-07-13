let STATE, clock, MODE;
let audio = new Audio("/assets/alarm.mp3");

let chromeTabOptions = {
    active: true,
    currentWindow: true
}

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({'startTime':0, 'duration':defaultSettings().ft*60, 'blockedUrls':[], 'taskList':[], 'settings':defaultSettings(), 'cyclesLeft':defaultSettings().cycles});
    STATE = 0;
    MODE = 0;
});

chrome.runtime.onStartup.addListener(() => {
    MODE = 0;
    STATE = 0;
});

function updateState(value){
    STATE = value;
}

function getState(){
    return STATE;
}

function getMode(){
    return MODE;
}

function updateMode(value){
    //MODE 0 - focus timer
    //MODE 1 - break timer
    MODE = value;
}

//-----------------Timer--------------------//
function setAlarm(timeLeft){
    console.log("setAlarm", timeLeft, STATE);
    //Starts website blocking
    updateBlockListener();
    console.log("set alarm triggered", STATE, MODE);
    clock = setTimeout(()=>{
        let nID = (Date.now()/1000|0).toString();
        chrome.notifications.create(nID, { type: 'basic', title: 'Time is up!', message: '', priority: 2, iconUrl: "/assets/img1.jpg" }, function() { });
        audio.play();
        stopBlocking();

        processTimerState();               
    }, timeLeft);
    
}

function clearAlarm(){
    console.log("clearAlarm");
    stopBlocking();
    clearTimeout(clock);
}

function processTimerState(){
    let isOpen = (chrome.extension.getViews({ type: "popup" }).length > 0);
    if(!isOpen){
        chrome.storage.local.get({'settings':defaultSettings(), 'cyclesLeft':0}, (data)=>{        
            console.log("processTImerState triggered: cycles left", data.cyclesLeft, "isopen? ", isOpen);
            if(MODE == 0){
                if(data.cyclesLeft > 1){
                    STATE = 1;
                    MODE = 1;
                    data.cyclesLeft--;
                    chrome.storage.local.set({'startTime':Date.now(), 'duration':data.settings.sbt*60,'cyclesLeft':data.cyclesLeft}, ()=>{                        
                        setAlarm(data.settings.sbt*60*1000);
                    });
                } else{
                    STATE = 0;
                    MODE = 0;
                    chrome.storage.local.get({'settings':defaultSettings()}, (data)=>{
                        chrome.storage.local.set({'startTime':0, 'duration':data.settings.ft*60, 'cyclesLeft':data.settings.cycles});
                    });
                }            
            } else{
                if(data.cyclesLeft > 0){
                    STATE = 1;
                    MODE = 0;
                    chrome.storage.local.set({'startTime':Date.now(), 'duration':data.settings.ft*60}, ()=>{
                        //set alarm
                        setAlarm(data.settings.ft*60*1000);                        
                    });
                } else{
                    STATE = 0;
                    MODE = 0;
                    chrome.storage.local.get({'settings':defaultSettings()}, (data)=>{
                        chrome.storage.local.set({'startTime':0, 'duration':data.settings.ft*60, 'cyclesLeft':data.settings.cycles});
                    });
                }                
            }
        });
    }
}
//---------------Timer-Settings-------------//

function defaultSettings(){
    return {
        ft: 20,
        sbt: 5,
        cycles: 2,
    }
}

//----------------blocking------------------//

function add2BL(url, callback){                            //Adds url to blacklist
    chrome.storage.local.get({'blockedUrls':[]}, (data)=>{
        for(let i = 0; i < data.blockedUrls.length; i++){
            if(url == data.blockedUrls[i]) return;
        }
        data.blockedUrls.push(url);
        chrome.storage.local.set(data, callback);
    });
}

function rmBL(url, callback){
    chrome.storage.local.get({'blockedUrls':[]}, (data)=>{
        for(let i = 0; i < data.blockedUrls.length; i++){
            if(url == data.blockedUrls[i]){
                data.blockedUrls.splice(i, 1);
                break;
            }
        }
        console.log(data.blockedUrls);
        chrome.storage.local.set(data, callback);
    });
}

function blpFindHosts(callback){
    chrome.storage.local.get({'blockedUrls':[]}, (data)=>{
        callback(data.blockedUrls);
    });
}

const cancelFunc = () => ({cancel: true});

function stopBlocking(){
    console.log("removing block");
    chrome.webRequest.onBeforeRequest.removeListener(cancelFunc);
}

function startBlocking(){
    console.log("starting block");
    blpFindHosts(all => {
        let blocklist = [];
        for(let i = 0; i < all.length; i++){
            blocklist.push(url2rgx(all[i]));
        }

        if(blocklist.length){
            chrome.webRequest.onBeforeRequest.addListener(
                cancelFunc,
                {urls: blocklist},
                ['blocking']
            );
        }
    });
}

function updateBlockListener(){
    if(STATE == 1 && MODE == 0){
        stopBlocking();
        startBlocking(); 
    } else{
        stopBlocking();
    }
}

function url2rgx(url) {
    return `*://*.${url}/*`
}

//---------------To-Do-------------------------//

function addTask2Storage(item, callback){
    chrome.storage.local.get({'taskList':[]}, (data)=>{
        data.taskList.push(item);
        chrome.storage.local.set(data, callback);
    });
}

function fetchAllTasks(callback){
    chrome.storage.local.get({'taskList':[]}, (data) => {
        callback(data.taskList);
    });
}

function rmToDo(id, callback){
    chrome.storage.local.get({'taskList':[]}, (data)=>{
        for(let i = 0; i < data.taskList.length; i++){
            if(data.taskList[i].id == id){
                data.taskList.splice(i, 1);
                break;
            }
        }
        chrome.storage.local.set(data, callback);
    });
}

function toggleToDo(id, callback){
    chrome.storage.local.get({'taskList':[]}, (data)=>{
        for(let i = 0; i < data.taskList.length; i++){
            console.log(data.taskList[i].id, id);
            if(data.taskList[i].id == id){
                data.taskList[i].checked = !data.taskList[i].checked;
                break;
            }
        }
        chrome.storage.local.set(data, callback);
    });
}