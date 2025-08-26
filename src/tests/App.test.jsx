import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App', () => {
  // Make the test function async
  it('renders the login screen after initialization', async () => {
    // Render the App component
    render(<App />);
    
    // Use `findByText` which automatically waits for the element to appear.
    // We've also increased the default timeout to 10 seconds just in case.
    const loginHeading = await screen.findByText(/client login/i, {}, { timeout: 10000 });
    
    // Assert that the element is now in the document
    expect(loginHeading).toBeInTheDocument();
  });
});