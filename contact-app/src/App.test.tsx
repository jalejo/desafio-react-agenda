import { render, screen } from '@testing-library/react';
import App from './App';

test('renders main action button', () => {
  render(<App />);
  const buttonElement = screen.getByRole("button", { name: /agregar contacto/i })
  expect(buttonElement).toBeInTheDocument();
});
