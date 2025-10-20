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

const searchInput = document.createElement('input');
searchInput.type = 'text';
searchInput.classList.add('searchInput');
searchInput.placeholder = 'Название...';

const filterSelect = document.createElement('select');
filterSelect.classList.add('filterSelect');

const optionAll = document.createElement('option');
optionAll.value = 'all';
optionAll.textContent = 'Все';

const optionDone = document.createElement('option');
optionDone.value = 'done';
optionDone.textContent = 'Выполненные';

const optionUndone = document.createElement('option');
optionUndone.value = 'undone';
optionUndone.textContent = 'Невыполненные';

filterSelect.append(optionAll, optionDone, optionUndone);

const sortDateBtn = document.createElement('button');
sortDateBtn.classList.add('sortDateBtn');
sortDateBtn.textContent = 'Сортировать по дате';

const sortDirectionSelect = document.createElement('select');
sortDirectionSelect.classList.add('sortDirectionSelect');

const optionDesc = document.createElement('option');
optionDesc.value = 'desc';
optionDesc.textContent = '↑';

const optionAsc = document.createElement('option');
optionAsc.value = 'asc';
optionAsc.textContent = '↓';

sortDirectionSelect.append(optionDesc, optionAsc);

main.append(taskInput, dateInputMain, addBtn, toDoList, searchInput, filterSelect, sortDateBtn, sortDirectionSelect);
document.body.appendChild(main);

// Rendering tasks from local storage

window.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  enableDragAndDrop();
});

addBtn.addEventListener('click', addTask);
toDoList.addEventListener('click', handleTaskClick);
sortDateBtn.addEventListener('click', sortByDate);

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

function sortByDate() {
  const tasks = getTasks();
  const direction = sortDirectionSelect.value;

  tasks.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    const diff = new Date(a.date) - new Date(b.date);
    return direction === 'asc' ? diff : -diff;
  });

  localStorage.setItem('tasks', JSON.stringify(tasks));
  while (toDoList.firstChild) {
    toDoList.removeChild(toDoList.firstChild);
  }
  loadTasks();
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
  const listItems = document.querySelectorAll('.toDoList li');
  const newTasks = [];

  listItems.forEach((li, i) => {
    const span = li.querySelector('span');
    const dateInput = li.querySelector('input[type="date"]');
    const done = li.classList.contains('done');

    newTasks.push({
      id: i,
      text: span ? span.textContent : '',
      date: dateInput ? dateInput.value : '',
      done
    });

    li.id = i;
  });

  localStorage.setItem('tasks', JSON.stringify(newTasks));
}