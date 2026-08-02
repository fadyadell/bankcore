import { ApiClient, Auth } from './api';

console.log('Admin portal initialized');

document.addEventListener('DOMContentLoaded', async () => {
    if (!Auth.isAuthenticated()) {
        console.warn('User not authenticated, skipping API calls or redirecting...');
    }

    try {
        // Fetch System Audit Logs / Accounts (assuming we want to manage accounts from admin)
        const accountsResponse = await ApiClient.get('/accounts');
        console.log('Fetched Accounts for Admin:', accountsResponse);
        
        // In a real application, you'd iterate over accountsResponse.accounts and populate the DOM table here.
    } catch (err) {
        console.error('Failed to load admin data:', err);
    }
});
