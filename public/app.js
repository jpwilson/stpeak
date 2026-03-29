const API_BASE = '/api';

// Load tasks on page load
document.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  loadStats();
});

// Form submission
document.getElementById('task-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const task = {
    title: document.getElementById('title').value,
    description: document.getElementById('description').value,
    assignee: document.getElementById('assignee').value,
    priority: document.getElementById('priority').value
  };

  try {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });

    const data = await res.json();
    if (data.success) {
      document.getElementById('task-form').reset();
      loadTasks();
      loadStats();
    } else {
      showError(data.errors ? data.errors.join(', ') : data.error);
    }
  } catch (err) {
    showError('Failed to create task');
  }
});

async function loadTasks() {
  try {
    const res = await fetch(`${API_BASE}/tasks`);
    const data = await res.json();

    if (data.success) {
      renderTasks(data.data);
    }
  } catch (err) {
    showError('Failed to load tasks');
  }
}

async function loadStats() {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    const data = await res.json();

    if (data.success) {
      document.getElementById('stat-total').textContent = data.data.total;
      document.getElementById('stat-pending').textContent = data.data.pending;
      document.getElementById('stat-progress').textContent = data.data.inProgress;
      document.getElementById('stat-completed').textContent = data.data.completed;
    }
  } catch (err) {
    showError('Failed to load stats');
  }
}

function renderTasks(tasks) {
  const list = document.getElementById('task-list');
  list.innerHTML = '';

  if (tasks.length === 0) {
    list.innerHTML = '<li class="task-item">No tasks yet. Add one above!</li>';
    return;
  }

  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item priority-${task.priority}`;
    li.innerHTML = `
      <div>
        <strong>${task.title}</strong>
        <span class="status-badge status-${task.status}">${task.status}</span>
        ${task.assignee ? `<small> - ${task.assignee}</small>` : ''}
      </div>
      <div>
        <button onclick="completeTask('${task.id}')">Complete</button>
        <button onclick="deleteTask('${task.id}')" style="background:#e74c3c">Delete</button>
      </div>
    `;
    list.appendChild(li);
  });
}

async function completeTask(id) {
  try {
    const res = await fetch(`${API_BASE}/tasks/${id}/complete`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      loadTasks();
      loadStats();
    }
  } catch (err) {
    showError('Failed to complete task');
  }
}

async function deleteTask(id) {
  try {
    const res = await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      loadTasks();
      loadStats();
    }
  } catch (err) {
    showError('Failed to delete task');
  }
}

function showError(message) {
  const banner = document.getElementById('error-banner');
  banner.textContent = message;
  banner.style.display = 'block';
  setTimeout(() => { banner.style.display = 'none'; }, 5000);
}
