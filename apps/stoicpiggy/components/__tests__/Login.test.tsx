import { fireEvent, render, waitFor } from '@testing-library/react-native';

const mockLogin = jest.fn();

jest.mock('@/lib/auth', () => ({
  useAuth: () => ({ status: 'anonymous', child: null, login: mockLogin, logout: jest.fn() }),
}));

import { Login } from '../screens/Login';

describe('Login (kid sign-in)', () => {
  beforeEach(() => {
    mockLogin.mockReset();
  });

  it('signs in with the entered username and password', async () => {
    mockLogin.mockResolvedValue(undefined);
    const { getByText, getByPlaceholderText } = render(<Login />);

    fireEvent.changeText(getByPlaceholderText('tu usuario'), 'marco');
    fireEvent.changeText(getByPlaceholderText('tu contraseña'), 'piggy1234');
    fireEvent.press(getByText('Entrar'));

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('marco', 'piggy1234'));
  });

  it('shows an error when sign-in fails', async () => {
    mockLogin.mockRejectedValue(new Error('bad creds'));
    const { getByText, getByPlaceholderText } = render(<Login />);

    fireEvent.changeText(getByPlaceholderText('tu usuario'), 'marco');
    fireEvent.changeText(getByPlaceholderText('tu contraseña'), 'wrong');
    fireEvent.press(getByText('Entrar'));

    await waitFor(() => expect(getByText('Usuario o contraseña incorrectos.')).toBeTruthy());
  });

  it('does not call login with an empty form', () => {
    const { getByText } = render(<Login />);
    fireEvent.press(getByText('Entrar'));
    expect(mockLogin).not.toHaveBeenCalled();
  });
});
