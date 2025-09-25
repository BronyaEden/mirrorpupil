import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../store';
import { setTokens, logout } from '../store/authSlice';
import App from '../App';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Routes: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Route: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Navigate: () => <div data-testid="navigate">Navigate</div>,
}));

// Mock API calls
jest.mock('../utils/api/auth', () => ({
  __esModule: true,
  default: {
    getProfile: jest.fn().mockResolvedValue({
      data: {
        data: {
          user: {
            _id: '1',
            username: 'testuser',
            email: 'test@example.com',
            followers: [],
            following: [],
            followersCount: 0,
            followingCount: 0,
            isActive: true,
            isVerified: true,
            role: 'user',
            createdAt: new Date(),
            updatedAt: new Date(),
            preferences: {
              theme: 'dark',
              language: 'zh-CN',
              notifications: {
                email: true,
                push: true,
              },
            },
          },
        },
      },
    }),
  },
}));

describe('Auth State Persistence', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear Redux store
    store.dispatch(logout());
  });

  test('should restore user state after page refresh', async () => {
    // Set tokens in localStorage (simulating login)
    const accessToken = 'test-access-token';
    const refreshToken = 'test-refresh-token';
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    // Render the app
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    // Wait for the profile to be fetched
    await waitFor(() => {
      const state = store.getState();
      expect(state.auth.isAuthenticated).toBe(true);
      expect(state.auth.user).not.toBeNull();
      expect(state.auth.user?.username).toBe('testuser');
    });
  });

  test('should clear auth state when tokens are removed', async () => {
    // Set initial state
    const accessToken = 'test-access-token';
    const refreshToken = 'test-refresh-token';
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    // Render the app
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    // Wait for initial state to be set
    await waitFor(() => {
      const state = store.getState();
      expect(state.auth.isAuthenticated).toBe(true);
    });

    // Remove tokens from localStorage (simulating logout from another tab)
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // The state should be cleared
    const state = store.getState();
    expect(state.auth.isAuthenticated).toBe(false);
    expect(state.auth.user).toBeNull();
    expect(state.auth.accessToken).toBeNull();
    expect(state.auth.refreshToken).toBeNull();
  });
});