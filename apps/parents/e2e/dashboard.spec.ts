import { expect, test } from '@playwright/test';

// Unauthenticated, the dashboard renders the parent login gate (no backend needed).
test('shows the parent login gate when signed out', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Stoic Piggy' })).toBeVisible();
  await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /crear cuenta/i })).toBeVisible();
  await expect(page.getByPlaceholder(/tucorreo/i)).toBeVisible();
});

test('can switch to the create-account tab', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: /crear cuenta/i }).click();
  await expect(page.getByPlaceholder(/tu nombre/i)).toBeVisible();
});
