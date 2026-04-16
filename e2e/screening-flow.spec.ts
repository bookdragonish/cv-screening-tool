import { test, expect } from '@playwright/test';

test('tests screening flow', async ({ page }) => {
    
    test.setTimeout(300000);
    // Navigate to the website
    await page.goto('http://localhost:5173/login');

    await page.getByRole('button', { name: 'Logg inn' }).click();

    // Check if we successfully navigated to the home page. Expects to see the text "Velkommen tilbake".
    await expect(page.getByRole('heading', { name: 'Velkommen tilbake!' })).toBeVisible();

    // Navigates to the page for creating of a new screening
    await page.getByRole('link', { name: 'Ny skanning' }).click();

    // Uploads a job advertisment in .pdf format
    await page.setInputFiles('input[type="file"]', 'e2e/test-data/job-description.pdf');
    await expect(page.getByRole('button', { name: 'Neste' })).toBeEnabled();

    // Starts scanning
    await page.getByRole('button', { name: 'Neste' }).click();
    const seResultater = page.getByRole('link', { name: 'Se resultater' });
    await expect(seResultater).toBeVisible({ timeout: 180000 });
    
    // Navigates to result page
    await seResultater.click();
    

    // Checks if we end up on the correct page (result page). Expects to see for example the text "Kvalifiserte kandidater" and "Ikke kvalifiserte kandidater".
    await expect(page.getByRole('heading', { name: 'Kvalifiserte kandidater', exact: true, level: 2 })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('heading', { name: 'Ikke kvalifiserte kandidater', exact: true, level: 2 })).toBeVisible({ timeout: 15000 });


});