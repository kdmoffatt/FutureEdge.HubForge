import { expect, test } from '@playwright/test';

test('public UI and portal boot', async ({ page, request }) => {
  const health = await request.get('http://127.0.0.1:4000/health');
  expect(health.ok()).toBeTruthy();

  await page.goto('/');
  await expect(page.locator('text=HubForge')).toBeVisible();

  await page.goto('http://127.0.0.1:3001');
  await expect(page.locator('text=HubForge Portal')).toBeVisible();
});
