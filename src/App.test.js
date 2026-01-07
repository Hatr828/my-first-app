import { render, screen } from '@testing-library/react';
import App from './App';

test('renders feedback form', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /feedback form/i });
  expect(heading).toBeInTheDocument();
});
