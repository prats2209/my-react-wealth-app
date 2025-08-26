import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App', () => {
  // Make the test function async
  it('renders the login screen after initialization', async () => {
    // Render the App component
    render(<App />);
    
    // First, wait for the "Initializing" message to DISAPPEAR.
    // This is a robust way to ensure the app has finished its async setup.
    await waitFor(() => {
      expect(screen.queryByText(/initializing application/i)).toBeNull();
    }, { timeout: 15000 }); // Wait up to 15 seconds for initialization

    // NOW that loading is complete, we can safely look for the login heading.
    // We use findByText which also waits, as a final safety measure.
    const loginHeading = await screen.findByText(/client login/i);
    
    // Assert that the element is now in the document
    expect(loginHeading).toBeInTheDocument();
  });
});