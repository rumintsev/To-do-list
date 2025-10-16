const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const toDoList = document.getElementById('toDoList');
const doneList = document.getElementById('doneList');

window.addEventListener('DOMContentLoaded', loadTasks);

addBtn.addEventListener('click', addTask);
toDoList.addEventListener('click', handleTaskClick);

function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  const tasks = getTasks();
  const id = tasks.length == 0 ? 0 : tasks[tasks.length - 1].id + 1;
  const task = { id, text, done: false };
  tasks.push(task);
  localStorage.setItem('tasks', JSON.stringify(tasks));

  createTaskElement(task);
  taskInput.value = '';
}

function createTaskElement(task) {
  const li = document.createElement('li');
  const span = document.createElement('span');
  span.textContent = task.text;

  if (task.done) { li.classList.add('done'); }

  const doneBtn = document.createElement('button');
  doneBtn.textContent = '✓';
  doneBtn.classList.add('done');

  const removeBtn = document.createElement('button');
  removeBtn.textContent = '✕';
  removeBtn.classList.add('remove');

  li.id = task.id;
  li.appendChild(doneBtn);
  li.appendChild(span);
  li.appendChild(removeBtn);
  toDoList.appendChild(li);
}

function handleTaskClick(event) {
  const target = event.target;
  const li = target.closest('li');
  if (!li) return;

  if (target.classList.contains('done')) {
    li.classList.toggle('done');
    doneTask(li.id);
  }

  if (target.classList.contains('remove')) {
    removeTask(li.id);
    li.remove();
  }
}

// localStorage
function getTasks() {
  return JSON.parse(localStorage.getItem('tasks') || '[]');
}

function loadTasks() {
  const saved = localStorage.getItem('tasks');
  if (!saved) return;

  const tasks = JSON.parse(saved);
  tasks.forEach(createTaskElement);
}

function doneTask(id) {
  const tasks = getTasks();
  const taskIndex = tasks.findIndex(task => task.id == id);
  if (taskIndex !== -1) {
    tasks[taskIndex] = { ...tasks[taskIndex], done: !tasks[taskIndex].done };
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }
}

function removeTask(id) {
  const tasks = getTasks();
  const taskIndex = tasks.findIndex(task => task.id == id);

  if (taskIndex !== -1) {
    tasks.splice(taskIndex, 1);
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }
}