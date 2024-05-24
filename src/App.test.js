import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the MyMap component
jest.mock('./components/my-map.jsx', () => {
  return () => <div>Mocked MyMap</div>;
});

test('renders Routing app', () => {
  render(<App />);
  const linkElement = screen.getByText(/Routing app/i);
  expect(linkElement).toBeInTheDocument();
});