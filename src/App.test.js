import { render, screen } from '@testing-library/react';
import App from './App';

test('renders add task form', () => {
  render(<App />);
  const button = screen.getByRole('button', { name: /add task/i });
  expect(button).toBeInTheDocument();
});
