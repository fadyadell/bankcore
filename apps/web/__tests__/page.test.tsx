import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

// Mock the auth context
jest.mock('@/lib/auth', () => ({
  useAuth: jest.fn().mockReturnValue({
    user: null,
    loading: true,
  }),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({
    replace: jest.fn(),
  }),
}));

describe('Home Page', () => {
  it('renders loading state', () => {
    render(<Home />);
    expect(screen.getByText('Loading BankCore...')).toBeInTheDocument();
  });
});
