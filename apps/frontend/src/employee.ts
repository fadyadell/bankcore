import { ApiClient, Auth } from './api';

console.log('Employee portal initialized');

document.addEventListener('DOMContentLoaded', async () => {
    if (!Auth.isAuthenticated()) {
        console.warn('User not authenticated, skipping API calls or redirecting...');
    }

    try {
        // Fetch Users / Customers
        const usersResponse = await ApiClient.get('/users');
        console.log('Fetched Users:', usersResponse);
        
        // In a real application, you'd iterate over usersResponse.users and populate the DOM table here.
    } catch (err) {
        console.error('Failed to load employee data:', err);
    }
});
