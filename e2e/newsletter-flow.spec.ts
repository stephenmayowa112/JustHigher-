import { test, expect } from '@playwright/test';

test.describe('Newsletter Flow — UI', () => {
    test('newsletter form is visible in the sidebar', async ({ page }) => {
        await page.goto('/');
        // Wait for the lazy-loaded newsletter form
        const emailInput = page.getByPlaceholder('Enter your email').first();
        await expect(emailInput).toBeVisible({ timeout: 10_000 });
        const subscribeBtn = page.getByRole('button', { name: /subscribe/i }).first();
        await expect(subscribeBtn).toBeVisible();
    });

    test('submitting empty email shows validation error', async ({ page }) => {
        await page.goto('/');
        const subscribeBtn = page.getByRole('button', { name: /subscribe/i }).first();
        await expect(subscribeBtn).toBeVisible({ timeout: 10_000 });
        await subscribeBtn.click();

        // Should show an error message
        const errorMsg = page.getByText(/please enter/i).first();
        await expect(errorMsg).toBeVisible({ timeout: 5_000 });
    });

    test('submitting invalid email shows validation error', async ({ page }) => {
        await page.goto('/');
        const emailInput = page.getByPlaceholder('Enter your email').first();
        await expect(emailInput).toBeVisible({ timeout: 10_000 });
        await emailInput.fill('not-an-email');

        const subscribeBtn = page.getByRole('button', { name: /subscribe/i }).first();
        await subscribeBtn.click();

        // Should show validation error
        const errorMsg = page.getByText(/valid email|invalid/i).first();
        await expect(errorMsg).toBeVisible({ timeout: 5_000 });
    });
});

test.describe('Newsletter Flow — API', () => {
    test('POST /api/newsletter with valid email returns success or already-subscribed', async ({ request }) => {
        const response = await request.post('/api/newsletter', {
            data: {
                email: `playwright-test-${Date.now()}@gmail.com`,
                source: 'e2e-test',
            },
        });

        const body = await response.json();

        // Should be 200 (success) or 409 (already subscribed) or 429 (rate limited)
        expect([200, 409, 429]).toContain(response.status());
        expect(body).toHaveProperty('success');
    });

    test('POST /api/newsletter with invalid JSON returns 400', async ({ request }) => {
        const response = await request.post('/api/newsletter', {
            headers: { 'Content-Type': 'application/json' },
            data: 'this is not json',
        });

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.success).toBe(false);
    });

    test('POST /api/newsletter with missing email returns validation error', async ({ request }) => {
        const response = await request.post('/api/newsletter', {
            data: { source: 'e2e-test' },
        });

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.success).toBe(false);
        expect(body.code).toBe('VALIDATION_ERROR');
    });

    test('GET /api/newsletter returns 405 method not allowed', async ({ request }) => {
        const response = await request.get('/api/newsletter');
        expect(response.status()).toBe(405);
        const body = await response.json();
        expect(body.code).toBe('METHOD_NOT_ALLOWED');
    });
});

test.describe('Unsubscribe Page', () => {
    test('success state shows confirmation message', async ({ page }) => {
        await page.goto('/unsubscribe?status=success&email=test@example.com');
        await expect(page.getByText(/unsubscribed/i)).toBeVisible();
        await expect(page.getByText('test@example.com')).toBeVisible();
    });

    test('error state shows error message', async ({ page }) => {
        await page.goto('/unsubscribe?status=error');
        await expect(page.getByText(/something went wrong|couldn't process/i)).toBeVisible();
    });

    test('back to blog link navigates home', async ({ page }) => {
        await page.goto('/unsubscribe?status=success');
        const backLink = page.getByRole('link', { name: /back to blog/i });
        await expect(backLink).toBeVisible();
        await backLink.click();
        await expect(page).toHaveURL('/');
    });
});
