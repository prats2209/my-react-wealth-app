import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App', () => {
  it('renders the login screen by default', () => {
    // Render the App component
    render(<App />);
    
    // Check if the text "Client Login" is present on the screen
    // The `i` flag makes the search case-insensitive
    expect(screen.getByText(/client login/i)).toBeInTheDocument();
  });
});
