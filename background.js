let STATE, clock;
let audio = new Audio("alarm.mp3");

let chromeTabOptions = {
    active: true,
    currentWindow: true
}

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({'startTime':0, 'duration':0, 'blockedUrls':[], 'taskList':[], 'settings':defaultSettings()});
    STATE = 0;
});

function updateState(value){
    STATE = value;
}

function getState(){
    return STATE;
}

//-----------------Timer--------------------//
function setAlarm(timeLeft){
    console.log("setAlarm", timeLeft, STATE);
    //Starts website blocking
    updateBlockListener();
    clock = setTimeout(()=>{
        let nID = (Date.now()/1000|0).toString();
        chrome.notifications.create(nID, { type: 'basic', title: 'Time is up!', message: '', priority: 2, iconUrl: "img1.jpg" }, function() { });
        audio.play();

        STATE = 0;
        stopBlocking();
        chrome.storage.local.set({'duration':15}, ()=>{});
    }, timeLeft);
}

function clearAlarm(){
    console.log("clearAlarm");
    stopBlocking();
    clearTimeout(clock);
}
//---------------Timer-Settings-------------//

function defaultSettings(){
    return {
        ft: 20,
        sbt: 5,
        lbt: 20,
        lbf: 3,
        cycles: 1,
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
    if(STATE == 1){
        stopBlocking();
        startBlocking(); 
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