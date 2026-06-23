import { render, screen } from '@testing-library/react-native';
import { BalancePill } from '../BalancePill';

describe('BalancePill', () => {
  it('formats the balance as currency', () => {
    render(<BalancePill amountCents={4250} />);
    expect(screen.getByText('$42.50')).toBeTruthy();
  });
});
