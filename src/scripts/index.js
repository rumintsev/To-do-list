// Creating a main input field

const header = document.createElement('header');
const main = document.createElement('main');
const footer = document.createElement('footer');

const h1 = document.createElement('h1');
h1.textContent = 'TO-DO LIST';
header.append(h1);

const h2 = document.createElement('h2');
h2.textContent = 'DESIGNED AND DEVELOPED BY NE_MIKEXD';
footer.append(h2);

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

const searchInput = document.createElement('input');
searchInput.type = 'text';
searchInput.classList.add('searchInput');
searchInput.placeholder = 'Поиск...';

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

const toDoList = document.createElement('ul');
toDoList.classList.add('toDoList');

const inputGroup = document.createElement('div');
inputGroup.classList.add('inputGroup');
inputGroup.append(taskInput, dateInputMain, addBtn);

const sortGroup = document.createElement('div');
sortGroup.classList.add('sortGroup');
sortGroup.append(sortDateBtn, sortDirectionSelect);

main.append(inputGroup, searchInput, filterSelect, sortGroup, toDoList);
document.body.append(header, main, footer);

// Rendering tasks from local storage

window.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  enableDragAndDrop();
});

addBtn.addEventListener('click', addTask);
toDoList.addEventListener('click', handleTaskClick);
sortDateBtn.addEventListener('click', sortByDate);
filterSelect.addEventListener('change', filterTasks);
searchInput.addEventListener('input', searchTasks);

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
  span.classList.add('text');
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

  if (task.done) { li.classList.add('doneTask'); }

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

  const dragHandle = document.createElement('div');
  dragHandle.classList.add('dragHandle');
  for (let i = 0; i < 6; i++) {
    const dot = document.createElement('span');
    dragHandle.appendChild(dot);
  }

  li.appendChild(dragHandle);
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
    li.classList.toggle('doneTask');
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

  while (toDoList.firstChild) {
    toDoList.removeChild(toDoList.firstChild);
  }

  tasks.sort((a, b) => {
    const diff = new Date(a.date) - new Date(b.date);
    return direction === 'asc' ? diff : -diff;
  });

  localStorage.setItem('tasks', JSON.stringify(tasks));

  tasks.forEach(createTaskElement);
}

function filterTasks() {
  const tasks = getTasks();
  const filterValue = filterSelect.value;

  while (toDoList.firstChild) {
    toDoList.removeChild(toDoList.firstChild);
  }

  const filtered = tasks.filter(task => {
    if (filterValue === 'all') return true;
    if (filterValue === 'done') return task.done;
    if (filterValue === 'undone') return !task.done;
  });

  filtered.forEach(createTaskElement);
}

function searchTasks() {
  const tasks = getTasks();
  const query = searchInput.value.trim().toLowerCase();

  while (toDoList.firstChild) {
    toDoList.removeChild(toDoList.firstChild);
  }

  const filtered = tasks.filter(task => task.text.toLowerCase().includes(query));

  filtered.forEach(createTaskElement);
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
  const listItems = document.querySelectorAll('.toDoList li');
  const tasks = getTasks();

  if (listItems.length != tasks.length) return

  const newTasks = [];

  listItems.forEach((li, i) => {
    const span = li.querySelector('.text');
    const dateInput = li.querySelector('input[type="date"]');
    const done = li.classList.contains('doneTask');
    newTasks.push({
      id: i,
      text: span.textContent,
      date: dateInput.value,
      done
    });

    li.id = i;
  });

  localStorage.setItem('tasks', JSON.stringify(newTasks));
}