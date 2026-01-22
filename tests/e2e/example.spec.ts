import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load and display the homepage', async ({ page }) => {
    await page.goto('/');

    // Check for the main heading
    await expect(page.locator('h1')).toContainText('SplitSync');

    // Check for the main headline
    await expect(page.locator('h2')).toContainText('Expense Sharing');

    // Check for CTA buttons
    await expect(page.getByRole('link', { name: 'Get Started' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Learn More' })).toBeVisible();

    // Check for feature cards
    await expect(page.getByText('Group Management')).toBeVisible();
    await expect(page.getByText('Expense Tracking')).toBeVisible();
    await expect(page.getByText('Smart Settlements')).toBeVisible();
  });

  test('should navigate to signin page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Get Started' }).click();

    // Should navigate to signin page
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');

    // Check title
    await expect(page).toHaveTitle(/SplitSync/);

    // Check for meta description
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    expect(metaDescription).toBeDefined();
    expect(metaDescription).toContain('expense sharing');
  });
});
