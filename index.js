document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const todoForm = document.getElementById('todo-form');
  const todoInput = document.getElementById('todo-input');
  const todoList = document.getElementById('todo-list');
  const itemsCount = document.getElementById('items-count');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const clearCompletedBtn = document.getElementById('clear-completed-btn');

  // App State
  let todos = JSON.parse(localStorage.getItem('taskflow_todos')) || [
    { id: 1, text: 'Welcome to Taskflow! 👋', completed: false },
    { id: 2, text: 'Click the checkbox to complete a task', completed: true },
    { id: 3, text: 'Filter or clear tasks using the menu', completed: false }
  ];
  let currentFilter = 'all';

  // Save to LocalStorage
  const saveTodos = () => {
    localStorage.setItem('taskflow_todos', JSON.stringify(todos));
  };

  // Render Todos
  const renderTodos = () => {
    todoList.innerHTML = '';

    const filteredTodos = todos.filter(todo => {
      if (currentFilter === 'active') return !todo.completed;
      if (currentFilter === 'completed') return todo.completed;
      return true;
    });

    if (filteredTodos.length === 0) {
      todoList.innerHTML = `
        <div class="empty-state">
          No ${currentFilter !== 'all' ? currentFilter : ''} tasks found.
        </div>
      `;
    } else {
      filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.setAttribute('data-id', todo.id);

        li.innerHTML = `
          <div class="todo-left">
            <input 
              type="checkbox" 
              class="checkbox-custom" 
              ${todo.completed ? 'checked' : ''} 
              aria-label="Mark task as completed"
            >
            <span class="todo-text">${escapeHtml(todo.text)}</span>
          </div>
          <button class="btn-delete" aria-label="Delete task">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        `;

        // Checkbox Event
        const checkbox = li.querySelector('.checkbox-custom');
        checkbox.addEventListener('change', () => toggleTodo(todo.id));

        // Delete Event
        const deleteBtn = li.querySelector('.btn-delete');
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

        todoList.appendChild(li);
      });
    }

    updateCounter();
  };

  // Helper to escape HTML characters
  const escapeHtml = (str) => {
    return str.replace(/[&<>"']/g, (match) => {
      const escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      };
      return escapeMap[match];
    });
  };

  // Update Task Counter
  const updateCounter = () => {
    const activeCount = todos.filter(t => !t.completed).length;
    itemsCount.textContent = `${activeCount} ${activeCount === 1 ? 'task' : 'tasks'} left`;
  };

  // Add Todo
  const addTodo = (text) => {
    const newTodo = {
      id: Date.now(),
      text: text.trim(),
      completed: false
    };
    todos.push(newTodo);
    saveTodos();
    renderTodos();
  };

  // Toggle Todo Status
  const toggleTodo = (id) => {
    todos = todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos();
    renderTodos();
  };

  // Delete Todo
  const deleteTodo = (id) => {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
  };

  // Clear Completed Todos
  clearCompletedBtn.addEventListener('click', () => {
    todos = todos.filter(todo => !todo.completed);
    saveTodos();
    renderTodos();
  });

  // Filter Selection
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentFilter = e.target.getAttribute('data-filter');
      renderTodos();
    });
  });

  // Form Submit
  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (text) {
      addTodo(text);
      todoInput.value = '';
    }
  });

  // Initial Render
  renderTodos();
});
