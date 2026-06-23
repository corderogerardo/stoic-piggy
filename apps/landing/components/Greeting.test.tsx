import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Greeting } from './Greeting';

describe('Greeting', () => {
  it('renders the app name and the provided name', () => {
    render(<Greeting name="Ada" />);
    expect(screen.getByText(/Stoic Piggy/)).toBeInTheDocument();
    expect(screen.getByText(/Ada/)).toBeInTheDocument();
  });
});
