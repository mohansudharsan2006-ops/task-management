const authForm = document.getElementById('loginForm') || document.getElementById('registerForm');
const loginMessage = document.getElementById('loginMessage');
const registerMessage = document.getElementById('registerMessage');

const apiBase = '/api';

if (authForm) {
    authForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const url = window.location.pathname.endsWith('login.html')
            ? `${apiBase}/auth/login`
            : `${apiBase}/auth/register`;

        const formData = new FormData(authForm);
        const payload = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Unable to submit form');
            }

            localStorage.setItem('taskAuthToken', data.token);
            localStorage.setItem('taskUserName', data.user.name || data.user.email);
            window.location.href = 'dashboard.html';
        } catch (error) {
            const target = document.getElementById('loginMessage') || document.getElementById('registerMessage');
            if (target) target.textContent = error.message;
        }
    });
}

if (window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('register.html')) {
    const token = localStorage.getItem('taskAuthToken');
    if (token) {
        window.location.href = 'dashboard.html';
    }
}
