// let bg = chrome.extensions.getBackgroundPage();

function addHost2BL(){
    let url = document.getElementById('blpHostInput');
    let urlNoSpace = url.value.replace(/ /g, "");
    if(urlNoSpace.length){
      bg.add2BL(urlNoSpace, ()=>{
        bg.updateBlockListener();
        blpUpdateList();
      });
    }
    url.value = '';
}

function rmHostBL(url){
  console.log("processing removal");
    bg.rmBL(url, ()=>{
      console.log("removed, updating blocking protocol");
      bg.updateBlockListener();
      console.log("protocol updated");
      blpUpdateList();
    });
}
function blpUpdateList() {
    bg.blpFindHosts(all => {
      let items = [];

      for (let i = 0; i < all.length; i++) {
        items.push(blpItemHTML(all[i]));
      }  
      document.querySelector('#blpTable tbody').innerHTML = items.join('');
      console.log("updated list");
    })
}

function blpItemHTML(item) {
    return `
            <tr title="${item}">
              <td title="${item}" class="url">${item}</td>
              <td>
                <span data-url="${item}"  class="blpRmHost material-icons-outlined">delete</span>
              </td>
            </tr>
        `
}

function tableListener(){
    document.getElementById("blpTable").addEventListener('click', (e)=>{
      let target = e.target;
      if(target.classList.contains("blpRmHost")){
        let url = target.getAttribute('data-url');
        
        rmHostBL(url); //Remove from list and update table
      }
    });
}

function addListener(){
  let blockBtn = document.getElementById('blpHostAddBtn');

  blockBtn.addEventListener('click', addHost2BL);
  document.getElementById('blpHostInput').onkeyup = function(e) {
    if (e.keyCode == 13) {
      addHost2BL();
    }
  }
}
document.addEventListener('DOMContentLoaded', ()=>{ 
    blpUpdateList(); //Updates blocked sites table       
    addListener(); //Listens for user clicking Block button or Enter key
    tableListener(); //Listens for deleting blocked webpage
});
