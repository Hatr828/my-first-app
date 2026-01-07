import { render, screen } from '@testing-library/react';
import App from './App';

test('renders to-do list heading', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /to-do list/i });
  expect(heading).toBeInTheDocument();
});
