import { test, expect } from '@playwright/test';

test.describe('Historical World Map', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		// Wait for map to load
		await page.waitForSelector('.maplibregl-canvas', { timeout: 15000 });
	});

	test('should display the page title', async ({ page }) => {
		await expect(page).toHaveTitle('Historical Interactive World Map');
	});

	test('should show the header', async ({ page }) => {
		const header = page.locator('header h1');
		await expect(header).toContainText('Historical Interactive World Map');
	});

	test('should have a time slider', async ({ page }) => {
		const slider = page.locator('#time-slider');
		await expect(slider).toBeVisible();
		await expect(slider).toHaveAttribute('type', 'range');
	});

	test('should display current period label', async ({ page }) => {
		const periodLabel = page.locator('.current-period');
		await expect(periodLabel).toBeVisible();
		await expect(periodLabel).toHaveText('123000 BC');
	});

	test('should update period when slider changes', async ({ page }) => {
		const slider = page.locator('#time-slider');
		await slider.fill('26'); // 1000 AD (index 26)
		const periodLabel = page.locator('.current-period');
		await expect(periodLabel).toHaveText('1000 AD');
	});

	test('should have accessible slider label', async ({ page }) => {
		const label = page.locator('label[for="time-slider"]');
		await expect(label).toHaveText('Historical time period');
	});

	test('should show footer with data source link', async ({ page }) => {
		const footer = page.locator('footer');
		// Footer is hidden on mobile, visible on desktop
		if (await footer.isVisible()) {
			const link = footer.locator('a');
			await expect(link).toHaveAttribute('href', 'https://github.com/aourednik/historical-basemaps');
			await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
		}
	});

	test('should render the map canvas', async ({ page }) => {
		const canvas = page.locator('.maplibregl-canvas');
		await expect(canvas).toBeVisible();
	});

	test('should have navigation controls', async ({ page }) => {
		const zoomIn = page.locator('.maplibregl-ctrl-zoom-in');
		const zoomOut = page.locator('.maplibregl-ctrl-zoom-out');
		await expect(zoomIn).toBeVisible();
		await expect(zoomOut).toBeVisible();
	});
});
