import axios from 'axios';

// Create a generic API client pointing to the API Gateway (port 3000)
// For testing purposes, we assume the API Gateway routes to the correct microservice.
export const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api/v1', // Gateway URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optionally add an interceptor for the JWT token later
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
