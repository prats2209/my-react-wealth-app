import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App', () => {
  it('renders the login screen after initialization', async () => {
    render(<App />);
    
    // First, wait for the "Initializing" message to DISAPPEAR.
    await waitFor(() => {
      expect(screen.queryByText(/initializing application/i)).toBeNull();
    }, { timeout: 15000 }); // Wait up to 15 seconds

    // NOW that loading is complete, we can safely look for the login heading.
    const loginHeading = await screen.findByText(/client login/i);
    
    expect(loginHeading).toBeInTheDocument();
  });
});