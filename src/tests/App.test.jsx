import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
// Using a more explicit path to prevent resolution errors in CI
import App from '/src/App.jsx';

describe('App', () => {
  it('renders the login screen after initialization', async () => {
    render(<App />);
    
    // Wait for the "Initializing" message to DISAPPEAR.
    await waitFor(() => {
      expect(screen.queryByText(/initializing application/i)).toBeNull();
    }, { timeout: 15000 });

    // NOW that loading is complete, safely look for the login heading.
    const loginHeading = await screen.findByText(/client login/i);
    
    expect(loginHeading).toBeInTheDocument();
  });
});