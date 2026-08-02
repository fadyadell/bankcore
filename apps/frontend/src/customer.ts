import { ApiClient, Auth } from './api';

console.log('Customer portal initialized');

document.addEventListener('DOMContentLoaded', async () => {
    if (!Auth.isAuthenticated()) {
        console.warn('User not authenticated, skipping API calls or redirecting...');
        // In real flow: Auth.login();
        // Mock token for testing if none exists: Auth.setToken('mock_jwt_token_for_testing');
    }

    try {
        // Fetch User Accounts
        const accountsResponse = await ApiClient.get('/accounts');
        console.log('Fetched Accounts:', accountsResponse);
        
        // Fetch Recent Transactions for the first account (if any)
        if (accountsResponse.accounts && accountsResponse.accounts.length > 0) {
             const firstAccountId = accountsResponse.accounts[0].id;
             const balance = await ApiClient.get(`/accounts/${firstAccountId}/balance`);
             console.log('Balance:', balance);
             
             const transactions = await ApiClient.get(`/transactions?accountId=${firstAccountId}`);
             console.log('Transactions:', transactions);
        }
    } catch (err) {
        console.error('Failed to load customer data:', err);
    }
});
