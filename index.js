document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const todoForm = document.getElementById('todo-form');
  const todoInput = document.getElementById('todo-input');
  const todoPriority = document.getElementById('todo-priority');
  const todoCategory = document.getElementById('todo-category');
  const todoDueDate = document.getElementById('todo-duedate');
  const todoList = document.getElementById('todo-list');
  const itemsCount = document.getElementById('items-count');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const clearCompletedBtn = document.getElementById('clear-completed-btn');
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  const backendStatus = document.getElementById('backend-status');
  const exportBtn = document.getElementById('export-btn');
  const toastContainer = document.getElementById('toast-container');

  // Application State
  let todos = [];
  let currentFilter = 'all';
  let searchQuery = '';
  let selectedCategory = 'all';
  let isApiOnline = false;

  const API_ENDPOINT = '/api/todos';

  // Toast Notification System
  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  // Helper to escape HTML characters (XSS Prevention)
  const escapeHtml = (str) => {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, (match) => {
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

  // Synchronize Local Storage Backup
  const saveToLocalStorage = () => {
    localStorage.setItem('taskflow_todos', JSON.stringify(todos));
  };

  const loadFromLocalStorage = () => {
    return JSON.parse(localStorage.getItem('taskflow_todos')) || [
      { id: '1', text: 'Welcome to Taskflow! 👋', completed: false, priority: 'medium', category: 'General', dueDate: '' },
      { id: '2', text: 'Explore priority levels & category tags', completed: true, priority: 'high', category: 'Work', dueDate: '' },
      { id: '3', text: 'Full-stack Netlify Functions integration ⚡', completed: false, priority: 'high', category: 'Dev', dueDate: '' }
    ];
  };

  // API Integration: Fetch All Todos
  const fetchTodos = async () => {
    try {
      const res = await fetch(API_ENDPOINT);
      if (res.ok) {
        const json = await res.json();
        todos = json.data;
        isApiOnline = true;
        backendStatus.textContent = 'API Connected ⚡';
        backendStatus.style.borderColor = 'rgba(16, 185, 129, 0.3)';
      } else {
        throw new Error('API server returned error');
      }
    } catch (err) {
      console.warn('Backend API unavailable. Falling back to local storage adapter:', err.message);
      todos = loadFromLocalStorage();
      isApiOnline = false;
      backendStatus.textContent = 'Local Offline Mode';
      backendStatus.style.color = '#fbbf24';
      backendStatus.style.borderColor = 'rgba(251, 191, 36, 0.3)';
    }
    renderTodos();
  };

  // API Integration: Create Todo
  const addTodo = async (todoData) => {
    if (isApiOnline) {
      try {
        const res = await fetch(API_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(todoData)
        });
        const json = await res.json();
        if (json.success) {
          todos.unshift(json.data);
          showToast('Task created successfully! 🚀', 'success');
        } else {
          showToast(json.error || 'Failed to create task.', 'danger');
        }
      } catch (err) {
        showToast('Network error while adding task.', 'danger');
      }
    } else {
      // Local fallback
      const newTodo = { ...todoData, id: String(Date.now()), createdAt: new Date().toISOString() };
      todos.unshift(newTodo);
      saveToLocalStorage();
      showToast('Task added locally.', 'info');
    }
    renderTodos();
  };

  // API Integration: Toggle / Update Todo
  const updateTodo = async (id, updates) => {
    if (isApiOnline) {
      try {
        const res = await fetch(API_ENDPOINT, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...updates })
        });
        const json = await res.json();
        if (json.success) {
          todos = todos.map(t => t.id === String(id) ? json.data : t);
        }
      } catch (err) {
        showToast('Failed to update task on backend.', 'danger');
      }
    } else {
      todos = todos.map(t => t.id === String(id) ? { ...t, ...updates } : t);
      saveToLocalStorage();
    }
    renderTodos();
  };

  // API Integration: Delete Todo
  const deleteTodo = async (id) => {
    if (isApiOnline) {
      try {
        const res = await fetch(`${API_ENDPOINT}?id=${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
          todos = todos.filter(t => t.id !== String(id));
          showToast('Task deleted.', 'info');
        }
      } catch (err) {
        showToast('Failed to delete task.', 'danger');
      }
    } else {
      todos = todos.filter(t => t.id !== String(id));
      saveToLocalStorage();
      showToast('Task deleted locally.', 'info');
    }
    renderTodos();
  };

  // API Integration: Clear Completed
  const clearCompleted = async () => {
    if (isApiOnline) {
      try {
        const res = await fetch(`${API_ENDPOINT}?clearCompleted=true`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
          todos = todos.filter(t => !t.completed);
          showToast('Cleared completed tasks.', 'info');
        }
      } catch (err) {
        showToast('Failed to clear completed tasks.', 'danger');
      }
    } else {
      todos = todos.filter(t => !t.completed);
      saveToLocalStorage();
      showToast('Cleared completed tasks locally.', 'info');
    }
    renderTodos();
  };

  // Render Function
  const renderTodos = () => {
    todoList.innerHTML = '';

    const filtered = todos.filter(todo => {
      // Filter by state
      if (currentFilter === 'active' && todo.completed) return false;
      if (currentFilter === 'completed' && !todo.completed) return false;

      // Filter by category
      if (selectedCategory !== 'all' && todo.category !== selectedCategory) return false;

      // Filter by search query
      if (searchQuery && !todo.text.toLowerCase().includes(searchQuery.toLowerCase())) return false;

      return true;
    });

    if (filtered.length === 0) {
      todoList.innerHTML = `
        <div class="empty-state">
          No tasks match your current view.
        </div>
      `;
    } else {
      filtered.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.setAttribute('data-id', todo.id);

        const priorityLabel = todo.priority ? todo.priority.toUpperCase() : 'MEDIUM';

        li.innerHTML = `
          <div class="todo-left">
            <input 
              type="checkbox" 
              class="checkbox-custom" 
              ${todo.completed ? 'checked' : ''} 
              aria-label="Mark task as completed"
            >
            <div class="todo-details">
              <span class="todo-text">${escapeHtml(todo.text)}</span>
              <div class="todo-tags">
                <span class="badge-priority ${todo.priority || 'medium'}">${priorityLabel}</span>
                <span class="badge-tag">${escapeHtml(todo.category || 'General')}</span>
                ${todo.dueDate ? `<span class="badge-duedate">📅 ${escapeHtml(todo.dueDate)}</span>` : ''}
              </div>
            </div>
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
        checkbox.addEventListener('change', (e) => {
          updateTodo(todo.id, { completed: e.target.checked });
        });

        // Delete Event
        const deleteBtn = li.querySelector('.btn-delete');
        deleteBtn.addEventListener('click', () => {
          deleteTodo(todo.id);
        });

        todoList.appendChild(li);
      });
    }

    updateCounter();
  };

  // Update Task Counter
  const updateCounter = () => {
    const activeCount = todos.filter(t => !t.completed).length;
    itemsCount.textContent = `${activeCount} ${activeCount === 1 ? 'task' : 'tasks'} left`;
  };

  // Export JSON
  exportBtn.addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(todos, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `taskflow_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported tasks to JSON file 📁', 'info');
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

  // Category Filter
  categoryFilter.addEventListener('change', (e) => {
    selectedCategory = e.target.value;
    renderTodos();
  });

  // Search Filter
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    renderTodos();
  });

  // Clear Completed
  clearCompletedBtn.addEventListener('click', clearCompleted);

  // Form Submit
  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (text) {
      addTodo({
        text,
        priority: todoPriority.value,
        category: todoCategory.value,
        dueDate: todoDueDate.value,
        completed: false
      });
      todoInput.value = '';
      todoDueDate.value = '';
    }
  });

  // Initialize App
  fetchTodos();
});
