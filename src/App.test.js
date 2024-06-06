import { render, screen } from '@testing-library/react';
import App from './App';
import { Provider } from 'react-redux';
import store from './app/store';

// Mock the Map_Displayer component
jest.mock('./components/Map_Displayer.js', () => {
  return () => <div>Mocked MyMap</div>;
});

test('renders Routing app', () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  const linkElement = screen.getByText(/Routing app/i);
  expect(linkElement).toBeInTheDocument();
});