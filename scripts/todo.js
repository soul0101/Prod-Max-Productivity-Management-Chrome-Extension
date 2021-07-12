//variables for my shopping list 
let input = document.getElementById("task-input");
let button = document.getElementById("taskAddBtn");
let list = document.querySelector('#todo-items');

// toggle between classlist
function strikeout() {
  this.classList.toggle("done");
}

//check the length of the string entered
function inputlength() {
  return input.value.trim().length;
}

function renderList(item){
  const isChecked = item.checked ? '' : 'done';

  return `
  <li class="todo-item" data-key = ${item.id}>
    <span class="js-tick ${isChecked}">${item.text}</span>
    <span data-url="${item}"  class="delete-todo js-delete-todo material-icons-outlined">delete</span>
  </li>
`

{/* <input id="${item.id}" type="checkbox" class="tick js-tick"/>
<label for="${item.id}"></label> */}
}

function updateList(){
  bg.fetchAllTasks((all) => {
    let items = [];
    for(let i = 0; i < all.length; i++){
      items.push(renderList(all[i]));
    }
    document.querySelector('#todo-items').innerHTML = items.join('');
  });
}

function addTask(){
  let text = input.value.trim();
  const item = {
    text,
    checked: true,
    id: Date.now(),
  }
  bg.addTask2Storage(item, ()=>{
    console.log("Item added", item);
    input.value = '';
    updateList();
  });
}

//this will add a new list item after click 
function addListAfterClick() {
  if (inputlength() > 0) {
    addTask();
  }
}

//this will add a new list item with keypress
function addListKeyPress(event) {
  if (inputlength() > 0 && event.which === 13) {
    addTask();
  }
}

function toggleToDo(key){
  console.log("toggling todo id:", key);
  bg.toggleToDo(key, ()=>{
    updateList();
  });
}

function rmToDo(id){
  console.log("removing todo id: ", id);
  bg.rmToDo(id, ()=>{
    updateList();
  });
}

function addListeners(){
  //this will check for the event/keypress and create new list item
  input.addEventListener("keypress", addListKeyPress);

  //this will check for a click event and create new list item
  button.addEventListener("click", addListAfterClick);

  //list listener 
  list.addEventListener("click", function(e) {
    console.log(e.target, e.target.parentElement);
    let target = e.target;
    if (target.classList.contains("delete-todo")) {
      let id = target.parentElement.getAttribute('data-key');
      rmToDo(id);
    }
    else if(target.classList.contains('js-tick')){
      let id = target.parentElement.getAttribute('data-key');
      toggleToDo(id);
    }
  });
}

document.addEventListener('DOMContentLoaded', ()=>{ 
  addListeners();
  updateList();
});