import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../store';
import { fetchConversations, fetchMessages } from '../store/chatSlice';
import { setTokens } from '../store/authSlice';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Routes: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Route: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Navigate: () => <div data-testid="navigate">Navigate</div>,
}));

// Mock API calls
jest.mock('../utils/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn((url) => {
      if (url === '/chat/conversations') {
        return Promise.resolve({
          data: {
            data: {
              conversations: [
                {
                  _id: '1',
                  participants: [
                    {
                      _id: 'user1',
                      username: 'User1',
                    },
                    {
                      _id: 'user2',
                      username: 'User2',
                    }
                  ],
                  lastMessageTime: new Date(),
                  lastMessage: {
                    content: 'Hello'
                  }
                }
              ]
            }
          }
        });
      }
      
      if (url.includes('/messages')) {
        return Promise.resolve({
          data: {
            data: {
              messages: [
                {
                  _id: 'msg1',
                  conversationId: '1',
                  senderId: 'user1',
                  content: 'Hello',
                  createdAt: new Date(),
                }
              ]
            }
          }
        });
      }
      
      return Promise.reject(new Error('Not found'));
    }),
    post: jest.fn(() => Promise.resolve({ data: { data: {} } })),
  },
}));

describe('Chat State Persistence', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset store
    store.dispatch({ type: 'RESET_STORE' });
  });

  test('should restore chat state after page refresh', async () => {
    // Set tokens in localStorage (simulating login)
    const accessToken = 'test-access-token';
    const refreshToken = 'test-refresh-token';
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    // Set auth state
    store.dispatch(setTokens({ accessToken, refreshToken }));
    
    // Fetch conversations
    await store.dispatch(fetchConversations() as any);
    
    // Wait for the conversations to be loaded
    await waitFor(() => {
      const state = store.getState();
      expect(state.chat.conversations.length).toBeGreaterThan(0);
      expect(state.chat.conversations[0]._id).toBe('1');
    });
  });

  test('should correctly identify message ownership', async () => {
    // Set tokens in localStorage (simulating login)
    const accessToken = 'test-access-token';
    const refreshToken = 'test-refresh-token';
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    // Set auth state with user ID matching senderId
    store.dispatch(setTokens({ accessToken, refreshToken }));
    
    // Fetch messages
    await store.dispatch(fetchMessages('1') as any);
    
    // Wait for messages to be loaded
    await waitFor(() => {
      const state = store.getState();
      expect(state.chat.messages.length).toBeGreaterThan(0);
      expect(state.chat.messages[0].senderId).toBe('user1');
    });
  });
});