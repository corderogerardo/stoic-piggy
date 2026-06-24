import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mutateAsync = vi.fn().mockResolvedValue({ id: 'c9', displayName: 'Nina' });
const invalidateQueries = vi.fn().mockResolvedValue(undefined);

vi.mock('@stoicpiggy/api', () => ({
  useCreateChild: () => ({ mutateAsync, isPending: false }),
  useTRPC: () => ({
    children: {
      dashboard: { queryKey: () => ['children', 'dashboard'] },
      list: { queryKey: () => ['children', 'list'] },
    },
  }),
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries }),
}));

import { CreateKidForm } from './CreateKidForm';

describe('CreateKidForm', () => {
  beforeEach(() => {
    mutateAsync.mockClear();
    invalidateQueries.mockClear();
  });

  it('blocks a too-short password without calling the API', async () => {
    const user = userEvent.setup();
    render(<CreateKidForm lang="en" />);

    await user.type(screen.getByPlaceholderText(/kid's name/i), 'Nina');
    await user.type(screen.getByPlaceholderText(/e\.g\. marco/i), 'nina');
    await user.type(screen.getByPlaceholderText(/at least 8/i), 'short');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(mutateAsync).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('creates a kid account on valid input and refreshes the dashboard', async () => {
    const user = userEvent.setup();
    const onCreated = vi.fn();
    render(<CreateKidForm lang="en" onCreated={onCreated} />);

    await user.type(screen.getByPlaceholderText(/kid's name/i), 'Nina');
    await user.type(screen.getByPlaceholderText(/e\.g\. marco/i), 'nina');
    await user.type(screen.getByPlaceholderText(/at least 8/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(mutateAsync).toHaveBeenCalledWith({
      displayName: 'Nina',
      username: 'nina',
      password: 'password123',
      age: undefined,
    });
    expect(onCreated).toHaveBeenCalledWith('Nina');
    expect(invalidateQueries).toHaveBeenCalled();
  });
});
