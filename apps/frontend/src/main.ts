import { Auth } from './api';

console.log('Main landing page initialized');

document.addEventListener('DOMContentLoaded', () => {
    // Check if we just redirected back from a mock login with a token hash
    if (window.location.hash.includes('token=')) {
        const token = window.location.hash.split('token=')[1];
        Auth.setToken(token);
        window.location.hash = ''; // clear hash
        console.log('Successfully logged in.');
    }

    // Bind login buttons
    const loginButtons = document.querySelectorAll('button');
    loginButtons.forEach(btn => {
        if (btn.textContent?.includes('Open Account') || btn.textContent?.includes('Login')) {
            btn.addEventListener('click', () => {
                // Mock redirect loop for demo
                window.location.href = '#token=mock_jwt_token_for_testing';
                window.location.reload();
            });
        }
    });
});
