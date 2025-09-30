(() => {
  const form = document.getElementById('task-form');
  const input = document.getElementById('task-input');
  const list = document.getElementById('task-list');
  const emptyState = document.getElementById('empty-state');
  const pendingCount = document.getElementById('pending-count');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const storageKey = 'todoTasks';

  let tasks = [];
  let currentFilter = 'all';

  const emptyMessages = {
    all: 'No hay tareas todavia.',
    pending: 'No hay tareas pendientes.',
    completed: 'No hay tareas completadas.'
  };

  const saveTasks = () => {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
  };

  const updatePendingCount = () => {
    const count = tasks.filter(task => !task.completed).length;
    const label = count === 1 ? '1 tarea pendiente' : `${count} tareas pendientes`;
    pendingCount.textContent = label;
  };

  const getFilteredTasks = () => {
    if (currentFilter === 'pending') {
      return tasks.filter(task => !task.completed);
    }
    if (currentFilter === 'completed') {
      return tasks.filter(task => task.completed);
    }
    return tasks;
  };

  const updateEmptyState = (filteredTasks) => {
    emptyState.textContent = emptyMessages[currentFilter];
    emptyState.style.display = filteredTasks.length === 0 ? 'block' : 'none';
  };

  const createIcon = (classes) => {
    const icon = document.createElement('i');
    icon.className = classes;
    icon.setAttribute('aria-hidden', 'true');
    return icon;
  };

  const renderTasks = () => {
    list.innerHTML = '';
    const filteredTasks = getFilteredTasks();

    filteredTasks.forEach(task => {
      const item = document.createElement('li');
      item.dataset.id = task.id;

      const text = document.createElement('span');
      text.className = 'task-text' + (task.completed ? ' completed' : '');
      text.textContent = task.text;

      const actions = document.createElement('div');
      actions.className = 'task-actions';

      const completeButton = document.createElement('button');
      completeButton.type = 'button';
      completeButton.className = 'icon-btn complete';
      completeButton.title = task.completed ? 'Desmarcar tarea' : 'Completar tarea';
      completeButton.setAttribute('aria-label', completeButton.title);
      completeButton.appendChild(createIcon(task.completed ? 'fa-solid fa-rotate-left' : 'fa-solid fa-check'));
      completeButton.addEventListener('click', () => toggleTask(task.id));

      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'icon-btn delete';
      deleteButton.title = 'Eliminar tarea';
      deleteButton.setAttribute('aria-label', deleteButton.title);
      deleteButton.appendChild(createIcon('fa-solid fa-trash'));
      deleteButton.addEventListener('click', () => deleteTask(task.id));

      actions.append(completeButton, deleteButton);
      item.append(text, actions);
      list.appendChild(item);
    });

    updateEmptyState(filteredTasks);
    updatePendingCount();
  };

  const addTask = (text) => {
    const trimmed = text.trim();
    if (!trimmed) {
      input.focus();
      return;
    }

    const newTask = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      text: trimmed,
      completed: false
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();
  };

  const toggleTask = (id) => {
    tasks = tasks.map(task => {
      if (task.id !== id) {
        return task;
      }
      return { ...task, completed: !task.completed };
    });
    saveTasks();
    renderTasks();
  };

  const deleteTask = (id) => {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    addTask(input.value);
    form.reset();
    input.focus();
  });

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      currentFilter = button.dataset.filter;
      filterButtons.forEach(btn => btn.classList.toggle('active', btn === button));
      renderTasks();
    });
  });

  const storedTasks = localStorage.getItem(storageKey);
  if (storedTasks) {
    try {
      const parsed = JSON.parse(storedTasks);
      if (Array.isArray(parsed)) {
        tasks = parsed
          .filter(task => task && typeof task.text === 'string')
          .map(task => ({
            id: task.id || Date.now().toString(),
            text: task.text,
            completed: Boolean(task.completed)
          }));
      }
    } catch (error) {
      console.error('No se pudieron cargar las tareas guardadas:', error);
    }
  }

  renderTasks();
})();
