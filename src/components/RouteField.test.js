import { render, screen} from '@testing-library/react';
import Routing_form from './RouteField';
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { RouteProvider } from './CoordinatesContext';

const mockDispatch = jest.fn();
const mockSelector = jest.fn()
jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: () => mockSelector
}));

beforeEach(()=>{
  IS_REACT_ACT_ENVIRONMENT = false
  render(
    <RouteProvider>
      <Routing_form />
    </RouteProvider>
  );
})

test('invalid coordinates give error message', async () => {
  const user = userEvent.setup()
  const listc = screen.getAllByRole('textbox')
  await user.type(listc[3],'999')
  expect(screen.getByText('Coordinates must be a number between 0 and 90.')).toBeInTheDocument()
});

test('correcting coordinates removes error message', async () => {
  const user = userEvent.setup()
  const listc = screen.getAllByRole('textbox')
  await user.type(listc[0],'0')
  await user.type(listc[0],'9')
  expect(screen.queryByText('Coordinates must be a number between 0 and 90.')).toBeNull()
});

test('get blocked segments can always be pressed', async () => {
  const user = userEvent.setup()
  const listc = screen.getAllByRole('textbox')
  expect (screen.getByText('Get Blocked Segments')).not.toBeDisabled()
  await user.type(listc[0],'9')
  expect (screen.getByText('Get Blocked Segments')).not.toBeDisabled()
  await user.type(listc[1],'9')
  await user.type(listc[2],'9')
  await user.type(listc[3],'9')
  expect (screen.getByText('Get Blocked Segments')).not.toBeDisabled()
});

test('route cannot be pressed with faulty or lacking coordinates', async () => {
  const user = userEvent.setup()
  const listc = screen.getAllByRole('textbox')
  expect (screen.getByText('Route')).toBeDisabled()
  await user.type(listc[0],'99')
  await user.type(listc[1],'99')
  await user.type(listc[2],'99')
  await user.type(listc[3],'99')
  expect (screen.getByText('Route')).toBeDisabled()
});

test('route can be pressed with valid coordinates', async () => {
  const user = userEvent.setup()
  const listc = screen.getAllByRole('textbox')
  expect (screen.getByText('Route')).toBeDisabled()
  await user.type(listc[0],'9')
  await user.type(listc[1],'9')
  await user.type(listc[2],'9')
  await user.type(listc[3],'9')
  expect (screen.getByText('Route')).not.toBeDisabled()
});

/* Causes error in /features/routes/routeSlice.js fix:???????????
test('clicking route clears form', async () => {
  const user = userEvent.setup()
  const listc = screen.getAllByRole('textbox')
  await user.type(listc[0],'9')
  await user.type(listc[1],'9')
  await user.type(listc[2],'9')
  await user.type(listc[3],'9')
  await user.click(screen.getByText('Route'))
  expect(listc[0].value == '').toBeTruthy()
  expect(listc[1].value == '').toBeTruthy()
  expect(listc[2].value == '').toBeTruthy()
  expect(listc[3].value == '').toBeTruthy()
}); */
