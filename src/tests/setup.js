import { vi } from 'vitest';

// Create a mock Firebase object on the global window
global.window.firebase = {
  initializeApp: vi.fn(() => ({
    auth: vi.fn(() => ({
      onAuthStateChanged: vi.fn(callback => {
        // Immediately call the callback with a "logged out" user (null)
        callback(null);
        // Return an empty unsubscribe function
        return () => {};
      }),
    })),
    firestore: vi.fn(() => ({
      // Mock firestore methods if needed in other tests
    })),
  })),
  auth: () => ({}),
  firestore: () => ({}),
};