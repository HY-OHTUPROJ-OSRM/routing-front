import { render, screen } from '@testing-library/react';
import App from './App';
jest.doMock('./components/my-map.jsx', () => {
  const MyMap = () => <div />;
  return MyMap;
});

test('renders Routing app', () => {
  render(<App />);
  const linkElement = screen.getByText(/Routing app/i);
  expect(linkElement).toBeInTheDocument();
});
