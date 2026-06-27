import type { ChildWins, SavingsGoal } from '@stoicpiggy/shared';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

// Mutable state the mocked API hooks read/write. Names are `mock*` so Jest's
// hoisted factory may reference them; the hooks read them lazily at render time.
let mockGoalsData: SavingsGoal[] = [];
let mockWinsData: ChildWins | undefined;
const mockCreate = jest.fn();
const mockDelete = jest.fn();
const mockContribute = jest.fn();

const goal = (over: Partial<SavingsGoal> = {}): SavingsGoal => ({
  id: 'g1',
  childId: 'c1',
  title: 'Bici',
  targetCents: 15000,
  savedCents: 0,
  term: 'medium',
  category: 'thing',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...over,
});

jest.mock('@stoicpiggy/api', () => ({
  useChildHome: () => ({ data: { child: { id: 'c1', age: 9 } } }),
  useSavingsGoals: () => ({ data: mockGoalsData, isPending: false }),
  useMyWins: () => ({ data: mockWinsData }),
  useCreateGoal: () => ({ mutateAsync: mockCreate, isPending: false }),
  useDeleteGoal: () => ({ mutateAsync: mockDelete, isPending: false }),
  useContributeGoal: () => ({ mutateAsync: mockContribute, isPending: false }),
  useTRPC: () => ({
    goals: { listByChild: { queryKey: () => ['goals'] } },
    me: { home: { queryKey: () => ['home'] } },
  }),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: jest.fn().mockResolvedValue(undefined) }),
}));

import { Goals } from '../screens/Goals';

describe('Goals screen', () => {
  beforeEach(() => {
    mockGoalsData = [];
    mockWinsData = undefined;
    mockCreate.mockReset();
    mockDelete.mockReset();
    mockContribute.mockReset();
    // Default: creating a goal appends it to the list the screen reads back.
    mockCreate.mockImplementation(async (input) => {
      const created = goal({ id: `g${mockGoalsData.length + 1}`, savedCents: 0, ...input });
      mockGoalsData = [...mockGoalsData, created];
      return created;
    });
  });

  // ---- Logros (achievements) view ----
  it('renders the Logros section with earned/locked badges from wins', () => {
    mockWinsData = {
      level: 5,
      xp: 4200,
      balanceCents: 6000,
      resistedCount: 1,
      resistedCents: 0,
      tasksApproved: 5,
    };
    const { getByText, getAllByText } = render(<Goals />);

    expect(getByText('LOGROS')).toBeTruthy();
    expect(getByText('Primera tarea')).toBeTruthy(); // earned: tasksApproved >= 1
    expect(getByText('Maestro estoico')).toBeTruthy(); // locked: resisted < 5
    expect(getAllByText('OBTENIDO').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('BLOQUEADO').length).toBeGreaterThanOrEqual(1);
  });

  it('shows an empty state and a new-goal button when there are no goals', () => {
    const { getByText } = render(<Goals />);
    expect(getByText('Aún no tienes metas. ¡Crea tu primera!')).toBeTruthy();
    expect(getByText('Nueva meta')).toBeTruthy();
  });

  // ---- Zod validation + React Hook Form ----
  it('blocks submit and shows Zod errors when the custom form is empty', async () => {
    const { getByText } = render(<Goals />);
    fireEvent.press(getByText('Nueva meta'));
    fireEvent.press(getByText('Personalizada'));
    fireEvent.press(getByText('Crear meta'));

    await waitFor(() => expect(getByText('Give your goal a name')).toBeTruthy());
    expect(getByText('Set a target above $0')).toBeTruthy();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  // ---- Goal creation: custom form (RHF state + coercion + backend payload) ----
  it('creates a custom goal with the typed values, coercing dollars to cents', async () => {
    const { getByText, getByPlaceholderText } = render(<Goals />);
    fireEvent.press(getByText('Nueva meta'));
    fireEvent.press(getByText('Personalizada'));

    fireEvent.changeText(getByPlaceholderText('Ej. Bicicleta nueva'), 'PS5 nueva');
    fireEvent.changeText(getByPlaceholderText('60'), '150');
    fireEvent.press(getByText('Largo plazo')); // term -> long
    fireEvent.press(getByText('Invertir y crecer')); // category -> invest
    fireEvent.press(getByText('Crear meta'));

    await waitFor(() =>
      expect(mockCreate).toHaveBeenCalledWith({
        title: 'PS5 nueva',
        targetCents: 15000,
        term: 'long',
        category: 'invest',
      }),
    );
    // The created goal is read back and rendered in the list.
    await waitFor(() => expect(getByText('PS5 nueva')).toBeTruthy());
  });

  // ---- Goal creation: preloaded suggestion ----
  it('creates a goal from a preloaded suggestion', async () => {
    const { getByText } = render(<Goals />);
    fireEvent.press(getByText('Nueva meta')); // opens on the "Suggested" tab
    fireEvent.press(getByText('Una bicicleta'));

    await waitFor(() =>
      expect(mockCreate).toHaveBeenCalledWith({
        title: 'Una bicicleta',
        targetCents: 15000,
        term: 'medium',
        category: 'thing',
      }),
    );
  });

  // ---- Backend integration: the contribute tracker ----
  it('contributes a quick-add amount to an existing goal', async () => {
    mockGoalsData = [goal({ id: 'g1', title: 'Bici', targetCents: 15000, savedCents: 0 })];
    mockContribute.mockResolvedValue(goal({ savedCents: 500 }));
    const { getByText } = render(<Goals />);

    fireEvent.press(getByText('+$5'));
    await waitFor(() =>
      expect(mockContribute).toHaveBeenCalledWith({ goalId: 'g1', amountCents: 500 }),
    );
  });
});
