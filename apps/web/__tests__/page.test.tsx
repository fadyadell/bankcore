import { render, screen, waitFor } from '@testing-library/react';
import Home from '@/app/page';

// Mock the apiClient module
jest.mock('@/lib/apiClient', () => ({
  fetchApi: jest.fn().mockResolvedValue({
    data: {
      status: 'ok',
      uptime: 100,
      timestamp: '2026-09-30T10:00:00.000Z'
    },
    error: null
  })
}));

describe('Home Page', () => {
  it('renders the API Health Status title', async () => {
    const resolvedHome = await Home();
    render(resolvedHome);
    expect(screen.getByText('API Health Status')).toBeInTheDocument();
    
    // Wait for the mock to resolve and state to update
    await waitFor(() => {
      expect(screen.getByText('Healthy')).toBeInTheDocument();
    });
  });
});
