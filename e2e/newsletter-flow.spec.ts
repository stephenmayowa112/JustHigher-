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

    test('submitting spam email shows blocked error', async ({ page }) => {
        await page.goto('/');
        const emailInput = page.getByPlaceholder('Enter your email').first();
        await expect(emailInput).toBeVisible({ timeout: 10_000 });
        // Use a disposable email domain that passes HTML5 validation but fails Zod validation
        await emailInput.fill('user@10minutemail.com');

        const subscribeBtn = page.getByRole('button', { name: /subscribe/i }).first();
        await subscribeBtn.click();

        // Should show validation error from client-side Zod validation
        const errorMsg = page.getByText(/not allowed|disposable|error|failed/i).first();
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

    test('POST /api/newsletter with empty email returns error', async ({ request }) => {
        const response = await request.post('/api/newsletter', {
            data: { email: '', source: 'e2e-test' },
        });

        const body = await response.json();
        // Should fail with validation error or rate limit
        expect(body.success).toBe(false);
    });

    test('POST /api/newsletter with spam email returns blocked', async ({ request }) => {
        const response = await request.post('/api/newsletter', {
            data: { email: 'test@test.com', source: 'e2e-test' },
        });

        const body = await response.json();
        expect(body.success).toBe(false);
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
        // The component shows "Oops, something went wrong" for non-success status
        await expect(page.getByText(/oops|went wrong/i).first()).toBeVisible({ timeout: 10_000 });
    });

    test('back to blog link navigates home', async ({ page }) => {
        await page.goto('/unsubscribe?status=success');
        const backLink = page.getByRole('link', { name: /back to blog/i });
        await expect(backLink).toBeVisible();
        await backLink.click();
        await expect(page).toHaveURL('/');
    });
});
