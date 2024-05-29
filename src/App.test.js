import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the Map_Displayer component
jest.mock('./components/Map_Displayer.js', () => {
  return () => <div>Mocked MyMap</div>;
});

test('renders Routing app', () => {
  render(<App />);
  const linkElement = screen.getByText(/Routing app/i);
  expect(linkElement).toBeInTheDocument();
});