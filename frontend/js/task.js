const taskList = document.getElementById('taskList');
const taskForm = document.getElementById('taskForm');
const taskStatus = document.getElementById('taskStatus');
const logoutButton = document.getElementById('logoutButton');
const welcomeText = document.getElementById('welcomeText');

const apiBase = '/api';
const token = localStorage.getItem('taskAuthToken');
const userName = localStorage.getItem('taskUserName');

const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
});

function getSelectedStatus() {
    const allFilters = Array.from(document.querySelectorAll('.filter'));
    const btns = allFilters.filter(el => el.tagName === 'BUTTON');
    const active = btns.find(b => b.classList.contains('active'));
    return active ? active.textContent.trim().toLowerCase() : 'all';
}

async function fetchTasks() {
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const statusText = getSelectedStatus();
        let statusParam;
        if (statusText === 'all') statusParam = undefined;
        else if (statusText === 'to do') statusParam = 'todo';
        else if (statusText.includes('in progress')) statusParam = 'open';
        else if (statusText === 'completed') statusParam = 'completed';

        const categoryFilterEl = document.getElementById('categoryFilter');
        const category = categoryFilterEl ? categoryFilterEl.value : undefined;

        const params = new URLSearchParams();
        if (statusParam) params.set('status', statusParam);
        if (category && category !== 'All') params.set('category', category);

        const url = `${apiBase}/tasks${params.toString() ? `?${params.toString()}` : ''}`;

        const response = await fetch(url, {
            headers: authHeaders(),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to load tasks');

        taskList.innerHTML = data.tasks.length
            ? data.tasks.map(renderTaskCard).join('')
            : '<p>No tasks yet. Add one above.</p>';
    } catch (error) {
        taskStatus.textContent = error.message;
    }
}

function renderTaskCard(task) {
    return `
        <article class="task-card ${task.completed ? 'completed' : ''}">
            <header>
                <div>
                    <h3>${escapeHtml(task.title)}</h3>
                    <p>${task.dueDate ? `Due ${new Date(task.dueDate).toLocaleDateString()}` : 'No due date'} &middot; <small>${escapeHtml(task.category || 'General')}</small></p>
                </div>
                <div class="task-actions">
                    <button onclick="toggleCompletion('${task._id}', ${task.completed})">
                        ${task.completed ? 'Mark Open' : 'Mark Done'}
                    </button>
                    <button onclick="deleteTask('${task._id}')" class="secondary">Delete</button>
                </div>
            </header>
            <p>${escapeHtml(task.description || '')}</p>
        </article>
    `;
}

function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
}

async function toggleCompletion(id, completed) {
    try {
        const response = await fetch(`${apiBase}/tasks/${id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ completed: !completed }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Unable to update task');
        await fetchTasks();
    } catch (error) {
        taskStatus.textContent = error.message;
    }
}

async function deleteTask(id) {
    try {
        const response = await fetch(`${apiBase}/tasks/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Unable to delete task');
        await fetchTasks();
    } catch (error) {
        taskStatus.textContent = error.message;
    }
}

if (taskForm) {
    taskForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(taskForm);
        const taskPayload = {
            title: formData.get('title'),
            category: formData.get('category') || 'General',
            description: formData.get('description'),
            dueDate: formData.get('dueDate') || undefined,
        };

        try {
            const response = await fetch(`${apiBase}/tasks`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(taskPayload),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Unable to create task');
            taskForm.reset();
            await fetchTasks();
        } catch (error) {
            taskStatus.textContent = error.message;
        }
    });
}

if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('taskAuthToken');
        localStorage.removeItem('taskUserName');
        window.location.href = 'login.html';
    });
}

if (welcomeText) {
    welcomeText.textContent = `Welcome, ${userName || 'user'}.`;
}

window.fetchTasks = fetchTasks;
window.toggleCompletion = toggleCompletion;
window.deleteTask = deleteTask;

// Wire up filter buttons and category selector
document.addEventListener('DOMContentLoaded', () => {
    const allFilters = Array.from(document.querySelectorAll('.filter'));
    const statusButtons = allFilters.filter(el => el.tagName === 'BUTTON');
    statusButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            statusButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            fetchTasks();
        });
    });

    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) categoryFilter.addEventListener('change', () => fetchTasks());
});
