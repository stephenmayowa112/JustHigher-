import { test, expect } from '@playwright/test';

test.describe('Reading Flow', () => {
    test('homepage loads with correct title', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/JustHigher/i);
    });

    test('sidebar is visible on desktop', async ({ page }) => {
        await page.goto('/');
        // The sidebar brand heading contains "JustHigher"
        const sidebarBrand = page.getByRole('heading', { name: /justhigher/i }).first();
        await expect(sidebarBrand).toBeVisible({ timeout: 15_000 });
    });

    test('sidebar sections are present', async ({ page }) => {
        await page.goto('/');
        // Wait for lazy-loaded sidebar sections
        await expect(page.getByText('About', { exact: false }).first()).toBeVisible();
        await expect(page.getByText('Search', { exact: false }).first()).toBeVisible();
        await expect(page.getByText('Newsletter', { exact: false }).first()).toBeVisible();
    });

    test('blog posts render on homepage', async ({ page }) => {
        await page.goto('/');
        // Wait for content to load — either real posts or the fallback welcome post
        const postOrWelcome = page.locator('article, [class*="text-center"]').first();
        await expect(postOrWelcome).toBeVisible({ timeout: 10_000 });
    });

    test('clicking a post navigates to the post page', async ({ page }) => {
        await page.goto('/');

        // Find the first post link (either in an article or in the Top Posts sidebar)
        const postLink = page.locator('article a, a[href^="/"]').filter({ hasText: /.{3,}/ }).first();

        // If a post link exists, click it and verify navigation
        if (await postLink.isVisible({ timeout: 5_000 }).catch(() => false)) {
            const href = await postLink.getAttribute('href');
            await postLink.click();
            await page.waitForURL(`**${href}`);
            // The page should have loaded content
            await expect(page.locator('main, article, [class*="prose"]').first()).toBeVisible();
        }
    });

    test('404 page shows for nonexistent post', async ({ page }) => {
        const response = await page.goto('/this-post-definitely-does-not-exist-12345');
        // Should return a 404 status
        expect(response?.status()).toBe(404);
    });

    test('footer copyright is visible', async ({ page }) => {
        await page.goto('/');
        const copyright = page.getByText('©', { exact: false });
        await expect(copyright.first()).toBeVisible();
    });
});
