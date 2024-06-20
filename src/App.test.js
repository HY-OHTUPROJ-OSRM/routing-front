import { render, screen } from '@testing-library/react';
import App from './App';
import { AppProviders } from './components/CoordinatesContext';
jest.mock("./components/TimedAlert")
jest.mock("./components/CopeSideBar")
jest.mock("./components/RouteField")
jest.mock("./components/SideBar")
jest.mock("./components/RouteInfo")
const mockDispatch = jest.fn();
const mockSelector = jest.fn();
jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: () => mockSelector
}));
// Mock the Map_Displayer component
jest.mock('./components/Map_Displayer.js', () => {
  return () => <div>Mocked MyMap</div>;
});

test('renders Routing app', () => {
  render(
    <AppProviders><App/></AppProviders>
  );
  const linkElement = screen.getByText(/Routing app/i);
  expect(linkElement).toBeInTheDocument();
});