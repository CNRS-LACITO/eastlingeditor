import { render, screen } from '@testing-library/react';
import App from './App';

test("Renders Task Label", () => {
  render(<App />);
  const linkElement = screen.getByText("Sign in");
  expect(linkElement).toBeInTheDocument();
});
