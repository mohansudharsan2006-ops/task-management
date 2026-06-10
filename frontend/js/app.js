document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;
    const token = localStorage.getItem('taskAuthToken');

    if (currentPath.endsWith('dashboard.html')) {
        if (!token) {
            window.location.href = 'login.html';
            return;
        }
        fetchTasks();
    }
});
