// Creating a main input field

const main = document.createElement('main');

const taskInput = document.createElement('input');
taskInput.type = 'text';
taskInput.classList.add('taskInput');
taskInput.placeholder = 'Задача...';

const dateInputMain = document.createElement('input');
dateInputMain.type = 'date';
dateInputMain.value = new Date().toISOString().split('T')[0];

const addBtn = document.createElement('button');
addBtn.classList.add('addBtn');
addBtn.textContent = 'Добавить';

const toDoList = document.createElement('ul');
toDoList.classList.add('toDoList');

main.append(taskInput, dateInputMain, addBtn, toDoList);
document.body.appendChild(main);

// Rendering tasks from local storage

window.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  enableDragAndDrop();
});

addBtn.addEventListener('click', addTask);
toDoList.addEventListener('click', handleTaskClick);

// Functions

function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  const date = dateInputMain.value;

  const tasks = getTasks();
  const task = { id: tasks.length, text: text, done: false, date: date };
  tasks.push(task);
  localStorage.setItem('tasks', JSON.stringify(tasks));

  createTaskElement(task);
  taskInput.value = '';
}

function createTaskElement(task) {
  const li = document.createElement('li');
  li.id = task.id;
  li.draggable = true;

  const span = document.createElement('span');
  span.textContent = task.text;
  span.contentEditable = true;

  span.addEventListener('input', function () {
    updateTaskText(li.id, span.textContent);
  });

  span.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      span.blur();
    }
  });

  if (task.done) { li.classList.add('done'); }

  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.value = task.date;
  dateInput.classList.add('task-date');
  dateInput.addEventListener('change', () => {
    updateTaskDate(li.id, dateInput.value);
  });

  const doneBtn = document.createElement('button');
  doneBtn.textContent = '✓';
  doneBtn.classList.add('done');

  const removeBtn = document.createElement('button');
  removeBtn.textContent = '✕';
  removeBtn.classList.add('remove');

  li.id = task.id;
  li.appendChild(doneBtn);
  li.appendChild(span);
  li.appendChild(dateInput);
  li.appendChild(removeBtn);
  toDoList.appendChild(li);
}

function updateTaskText(id, newText) {
  const tasks = getTasks();
  const taskIndex = tasks.findIndex(task => task.id == id);
  if (taskIndex !== -1) {
    tasks[taskIndex] = { ...tasks[taskIndex], text: newText };
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }
}

function updateTaskDate(id, newDate) {
  const tasks = getTasks();
  const taskIndex = tasks.findIndex(task => task.id == id);
  if (taskIndex !== -1) {
    tasks[taskIndex].date = newDate;
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }
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
    reindexTasks();
  }
}

function enableDragAndDrop() {
  toDoList.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'LI') e.target.classList.add('dragging');
  });

  toDoList.addEventListener('dragend', (e) => {
    if (e.target.tagName === 'LI') {
      e.target.classList.remove('dragging');
      reindexTasks();
    }
  });

  toDoList.addEventListener('dragover', (e) => {
    e.preventDefault();
    const dragging = toDoList.querySelector('.dragging');
    if (!dragging) return;

    let after = null;
    for (const li of toDoList.querySelectorAll('li:not(.dragging)')) {
      const rect = li.getBoundingClientRect();
      if (e.clientY < rect.top + rect.height / 2) {
        after = li;
        break;
      }
    }

    if (after) toDoList.insertBefore(dragging, after);
    else toDoList.appendChild(dragging);
  });
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

function reindexTasks() {
  const tasks = getTasks();

  tasks.forEach((task, i) => task.id = i);
  localStorage.setItem('tasks', JSON.stringify(tasks));

  const lis = document.querySelectorAll('.toDoList li');
  lis.forEach((li, i) => li.id = i);
}
function reindexTasks() {
  const listItems = document.querySelectorAll('.toDoList li'); // оставшиеся li
  const tasks = getTasks();
  const newTasks = [];

  listItems.forEach((li, i) => {
    const task = tasks.find(t => t.id == li.id);
    if (task) {
      task.id = i;
      li.id = i;
      newTasks.push(task);
    }
  });

  localStorage.setItem('tasks', JSON.stringify(newTasks));
}
