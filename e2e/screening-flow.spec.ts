import { test, expect } from '@playwright/test';
//test.setTimeout(120000); // 2 minutter
test('test', async ({ page }) => {
    
    test.setTimeout(300000);
    // Gå til nettsiden/hovedsiden på nettsiden
    await page.goto('http://localhost:5173/');

    // Skjekker om vi faktisk kom til hovedsiden. Forventer å se teksten "Velkommen tilbake".
    await expect(page.getByRole('heading', { name: 'Velkommen tilbake!' })).toBeVisible();

    // Navigerer til opprettelse av ny screening siden
    await page.getByRole('link', { name: 'Ny skanning' }).click();

    // Last opp stillingsannonse i pdf format
    await page.setInputFiles('input[type="file"]', 'e2e/test-data/job-description.pdf');
    await expect(page.getByRole('button', { name: 'Neste' })).toBeEnabled();

    // Starter skanningen
    await page.getByRole('button', { name: 'Neste' }).click();
    const seResultater = page.getByRole('link', { name: 'Se resultater' });
    await expect(seResultater).toBeVisible({ timeout: 180000 });
    
    // Navigerer til resultatsiden
    await seResultater.click();
    

    // Skjekker at vi ender på rikitg side (resultatsiden). Forventer å se f.eks teksten "Kvalifiserte kandidater".
    await expect(page.getByRole('heading', { name: 'Kvalifiserte kandidater', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ikke kvalifiserte kandidater', exact: true })).toBeVisible();


});