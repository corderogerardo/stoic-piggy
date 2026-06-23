import { expect, test } from '@playwright/test';

test('dashboard renders the family heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /family dashboard/i })).toBeVisible();
});
