import { render, screen } from '@testing-library/react';
import CreatePolygons from './CreatePolygon';
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux';
import store from '../app/store';
import { CoordinatesProvider } from './CoordinatesContext';

beforeEach(()=>{
  IS_REACT_ACT_ENVIRONMENT = false
  render(
  <Provider store={store}>
    <CoordinatesProvider>
      <CreatePolygons />
    </CoordinatesProvider>
  </Provider>
  );
})

test('selecting type custom speed switches to custom speed', async () => {
  await userEvent.selectOptions(screen.getByLabelText(/Type:/i),'custom speed')
  expect(screen.getByLabelText(/speed effect:/i)).toBeInTheDocument()
});

test('selecting type Roadblock doesnt show speed effect', async () => {
  await userEvent.selectOptions(screen.getByLabelText(/Type:/i),'Roadblock')
  expect(screen.queryByLabelText(/speed effect:/i)).toBeNull()
});

test('submit cant be pressed on empty fields', async () => {
  expect(screen.getByText('Submit')).toBeDisabled()
});

test('submit cant be pressed on empty fields2', async () => {
  const user = userEvent.setup()
  await user.click(screen.getByText('Add Coordinate'))
  expect(screen.getByText('Submit')).toBeDisabled()
});

test('add coordinate adds extra fields', async() => {
  const user = userEvent.setup()
  await user.click(screen.getByText('Add Coordinate'))
  const listc = screen.getAllByRole("textbox")
  expect(listc.length == 5).toBeTruthy()
})

test('submit cant be pressed on invalid cords', async () => {
  const user = userEvent.setup()
  const listc = screen.getAllByRole('textbox')
  await user.clear(listc[0])
  await user.type(listc[0],'name')
  await user.type(listc[1],'222')
  await user.type(listc[2],'5')
  expect (screen.getByText('Submit')).toBeDisabled()
});

test('submit cant be pressed on invalid name', async () => {
  const user = userEvent.setup()
  const listc = screen.getAllByRole('textbox')
  await user.clear(listc[0])
  await user.type(listc[0],'99')
  await user.type(listc[1],'45')
  await user.type(listc[2],'55')
  expect(screen.getByText('Submit')).toBeDisabled()
});

test('submit can be pressed with valid values', async () => {
  const user = userEvent.setup()
  const listc = screen.getAllByRole('textbox')
  await user.clear(listc[0])
  await user.type(listc[0],'name')
  await user.type(listc[1],'45')
  await user.type(listc[2],'55')
  expect(screen.getByText('Submit')).not.toBeDisabled()
});

test('submit can be pressed with valid values2', async () => {
  const user = userEvent.setup()
  await user.click(screen.getByText('Add Coordinate'))
  const listc = screen.getAllByRole('textbox')
  await user.clear(listc[0])
  await user.type(listc[0],'name')
  await user.type(listc[1],'45')
  await user.type(listc[2],'55')
  await user.type(listc[3],'66')
  await user.type(listc[4],'77')
  expect(screen.getByText('Submit')).not.toBeDisabled()
});

test('valid submit adds to startpoint', async () => {
  const user = userEvent.setup()
  const listc = screen.getAllByRole('textbox')
  await user.clear(listc[0])
  await user.type(listc[0],'name')
  await user.type(listc[1],'45')
  await user.type(listc[2],'55')
  expect(screen.getByText('Submit')).not.toBeDisabled()
  await user.click(screen.getByText('Submit'))
  const listd = screen.getAllByRole('textbox')
  expect(listd.length == 3).toBeTruthy()
  expect(listd[1].value == '').toBeTruthy()
  expect(listd[2].value == '').toBeTruthy()
});

test('valid submit adds to startpoint2', async () => {
  const user = userEvent.setup()
  await user.click(screen.getByText('Add Coordinate'))
  const listc = screen.getAllByRole('textbox')
  await user.clear(listc[0])
  await user.type(listc[0],'name')
  await user.type(listc[1],'45')
  await user.type(listc[2],'55')
  await user.type(listc[3],'66')
  await user.type(listc[4],'89')
  expect(screen.getByText('Submit')).not.toBeDisabled()
  await user.click(screen.getByText('Submit'))
  const listd = screen.getAllByRole('textbox')
  expect(listd.length == 3).toBeTruthy()
  expect(listd[1].value == '').toBeTruthy()
  expect(listd[2].value == '').toBeTruthy()
});

test('invalid polygon name gets notified', async () => {
  const user = userEvent.setup()
  await user.clear(screen.getByLabelText(/Name:/i))
  await user.type(screen.getByLabelText(/Name:/i),'loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong')
  expect(screen.getByText('Name must be 3-30 characters long and contain only letters or numbers.')).toBeInTheDocument()
});

test('invalid polygon name correction removes notification', async () => {
  const user = userEvent.setup()
  await user.clear(screen.getByLabelText(/Name:/i))
  await user.type(screen.getByLabelText(/Name:/i),'mo')
  expect(screen.getByText('Name must be 3-30 characters long and contain only letters or numbers.')).toBeInTheDocument()
  await user.type(screen.getByLabelText(/Name:/i),'i')
  expect(screen.queryByText('Name must be 3-30 characters long and contain only letters or numbers.')).toBeNull()
});

test('invalid polygon coordinate gets notified', async () => {
  const user = userEvent.setup()
  const listc = screen.getAllByRole('textbox')
  await user.type(listc[2],'999')
  expect(screen.getByText('Coordinates must be a number between 0 and 90.')).toBeInTheDocument()
});

test('invalid polygon coordinate correction removes notification', async () => {
  const user = userEvent.setup()
  const listc = screen.getAllByRole('textbox')
  await user.type(listc[1],'0')
  expect(screen.getByText('Coordinates must be a number between 0 and 90.')).toBeInTheDocument()
  await user.type(listc[1],'1')
  expect(screen.queryByText('Coordinates must be a number between 0 and 90.')).toBeNull()
});

test('invalid extra polygon coordinate gets notified', async () => {
  const user = userEvent.setup()
  await user.click(screen.getByText('Add Coordinate'))
  const listc = screen.getAllByRole('textbox')
  await user.type(listc[3],'999')
  expect(screen.getByText('Coordinates must be a number between 0 and 90.')).toBeInTheDocument()
});

test('invalid extra polygon coordinate correction removes notification', async () => {
  const user = userEvent.setup()
  await user.click(screen.getByText('Add Coordinate'))
  const listc = screen.getAllByRole('textbox')
  await user.type(listc[4],'0')
  expect(screen.getByText('Coordinates must be a number between 0 and 90.')).toBeInTheDocument()
  await user.type(listc[4],'2')
  expect(screen.queryByText('Coordinates must be a number between 0 and 90.')).toBeNull()
});
