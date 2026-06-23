import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatCard } from './StatCard';

describe('StatCard', () => {
  it('formats the amount as currency', () => {
    render(<StatCard label="Total saved" amountCents={4250} />);
    expect(screen.getByText('Total saved')).toBeInTheDocument();
    expect(screen.getByText('$42.50')).toBeInTheDocument();
  });
});
