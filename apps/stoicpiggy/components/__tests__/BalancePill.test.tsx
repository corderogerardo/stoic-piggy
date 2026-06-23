import { render } from '@testing-library/react-native';
import { BalancePill } from '../BalancePill';

describe('BalancePill', () => {
  it('formats the balance as currency', () => {
    const { getByText } = render(<BalancePill amountCents={4250} />);
    expect(getByText('$42.50')).toBeTruthy();
  });
});
