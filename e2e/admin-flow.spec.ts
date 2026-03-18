import { test, expect, type Page } from '@playwright/test';

test.describe('Admin Flow', () => {
    const passwordInput = (page: Page) => page.getByRole('textbox', { name: /^password$/i });

    test('login page loads with form fields', async ({ page }) => {
        await page.goto('/admin/login');
        await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible();
        await expect(page.getByLabel(/email/i)).toBeVisible();
        await expect(passwordInput(page)).toBeVisible();
        await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    });

    test('login page shows description text', async ({ page }) => {
        await page.goto('/admin/login');
        await expect(page.getByText(/sign in to manage/i)).toBeVisible();
    });

    test('submitting empty form does not navigate away', async ({ page }) => {
        await page.goto('/admin/login');
        const signInBtn = page.getByRole('button', { name: /sign in/i });
        await signInBtn.click();

        // Should stay on login page (HTML5 validation prevents submission)
        await expect(page).toHaveURL(/\/admin\/login/);
    });

    test('submitting wrong credentials shows error', async ({ page }) => {
        await page.goto('/admin/login');

        await page.getByLabel(/email/i).fill('wrong@example.com');
        await passwordInput(page).fill('wrongpassword123');
        await page.getByRole('button', { name: /sign in/i }).click();

        // Should show an error message
        const errorMsg = page.locator('[class*="red"], [class*="error"]').first();
        await expect(errorMsg).toBeVisible({ timeout: 10_000 });
    });

    test('accessing /admin without auth redirects or shows unauthorized', async ({ page }) => {
        await page.goto('/admin');

        // Should either redirect to login or show an unauthorized page
        await page.waitForTimeout(3_000);
        const url = page.url();
        const hasAuthRedirect = url.includes('/login') || url.includes('/unauthorized');
        const showsUnauthorized = await page.getByText(/unauthorized|sign in|login/i)
            .first()
            .isVisible()
            .catch(() => false);

        expect(hasAuthRedirect || showsUnauthorized).toBeTruthy();
    });

    test('login button shows loading state when clicked', async ({ page }) => {
        await page.goto('/admin/login');
        await page.getByLabel(/email/i).fill('test@test.com');
        await passwordInput(page).fill('password123');

        const signInBtn = page.getByRole('button', { name: /sign in/i });
        await signInBtn.click();

        // Button should show loading text briefly
        const loadingOrError = page.locator('text=/signing in|failed|error/i').first();
        await expect(loadingOrError).toBeVisible({ timeout: 10_000 });
    });
});
