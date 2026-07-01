import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LandingPage } from './LandingPage';

const SIGNUP_URL = 'https://stoic-piggy-parents.noofficelocation.com/?signup=1';

describe('LandingPage', () => {
  it('shows the five kid-app screenshots', () => {
    render(<LandingPage />);
    const shots = screen
      .getAllByRole('img')
      .filter((img) => img.getAttribute('src')?.startsWith('/screens/'));
    expect(shots.map((img) => img.getAttribute('src'))).toEqual([
      '/screens/home.png',
      '/screens/tareas.png',
      '/screens/metas.png',
      '/screens/mentor.png',
      '/screens/misiones.png',
    ]);
  });

  it('points every "Empezar gratis" CTA at the parents dashboard sign-up', () => {
    render(<LandingPage />);
    // nav + hero + footer all share the "Empezar gratis" label.
    const ctas = screen.getAllByRole('link', { name: /empezar gratis/i });
    expect(ctas.length).toBeGreaterThanOrEqual(3);
    for (const cta of ctas) {
      expect(cta).toHaveAttribute('href', SIGNUP_URL);
    }
  });
});
