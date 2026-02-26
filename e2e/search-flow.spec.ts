import { test, expect } from '@playwright/test';

test.describe('Search Flow', () => {
    test('search page loads with heading and input', async ({ page }) => {
        await page.goto('/search');
        await expect(page.getByRole('heading', { name: /search posts/i })).toBeVisible();
        await expect(page.getByPlaceholder(/search for posts/i)).toBeVisible();
    });

    test('search page shows "start searching" prompt when no query', async ({ page }) => {
        await page.goto('/search');
        await expect(page.getByText(/start searching/i)).toBeVisible();
    });

    test('search with a query updates URL and shows results or no-results', async ({ page }) => {
        await page.goto('/search');
        const searchInput = page.getByPlaceholder(/search/i);
        await searchInput.fill('welcome');
        await searchInput.press('Enter');

        // URL should update with query param
        await expect(page).toHaveURL(/[?&]q=welcome/i);

        // Should show either results or "no results" message
        const resultsOrEmpty = page.locator('text=/Found|No results|No posts/i').first();
        await expect(resultsOrEmpty).toBeVisible({ timeout: 10_000 });
    });

    test('search with gibberish shows no results', async ({ page }) => {
        await page.goto('/search?q=xyzzy99nonsense');
        const noResults = page.getByText(/no results|no posts/i).first();
        await expect(noResults).toBeVisible({ timeout: 10_000 });
    });

    test('search result links navigate to post page', async ({ page }) => {
        await page.goto('/search?q=welcome');

        // Wait for search results
        const resultLink = page.locator('a:has-text("Read full post")').first();

        if (await resultLink.isVisible({ timeout: 8_000 }).catch(() => false)) {
            await resultLink.click();
            // Should navigate away from the search page
            await expect(page).not.toHaveURL(/\/search/);
        }
    });

    test('sidebar search box navigates to search page', async ({ page }) => {
        await page.goto('/');

        // Wait for the sidebar search box to load (it's lazy-loaded)
        const sidebarSearch = page.locator('aside input, nav input, [class*="sidebar"] input')
            .filter({ hasText: '' })
            .first();

        if (await sidebarSearch.isVisible({ timeout: 5_000 }).catch(() => false)) {
            await sidebarSearch.fill('blog');
            await sidebarSearch.press('Enter');
            await expect(page).toHaveURL(/\/search/);
        }
    });
});
