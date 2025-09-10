import { test, expect } from "@playwright/test";

test("Devis → WO → Conso → PO → Clôture", async ({ page }) => {
  // (si auth activée, créer un bypass local pour le test ou mocker cookies)
  await page.goto("/quotes");
  // Accepter le premier devis
  const firstAccept = page.locator("text=Accepter").first();
  await firstAccept.click();

  // On est redirigé vers la page WO
  await expect(page).toHaveURL(/\/workorders\/WO-/);

  // Cocher une tâche (consommation)
  const firstCheckbox = page.locator('tbody input[type="checkbox"]').first();
  await firstCheckbox.check();

  // S'il manque des pièces, un lien "Commander" apparaît (facultatif)
  const cmdLink = page.locator("text=Commander").first();
  // await expect(cmdLink).toBeVisible();

  // Retour liste WO
  await page.goto("/workorders");
  await expect(page.locator("h1")).toHaveText(/Réparations en cours/);

  // Aller PO et créer un PO rapide
  await page.goto("/purchase-orders/new");
  await page.click("text=Créer");
  await expect(page).toHaveURL(/\/purchase-orders\/PO-/);

  // Réceptionner une ligne
  await page.fill('input[name="q"]', "1");
  await page.click("text=Recevoir");

  // Clore le WO (cocher toutes les tâches si besoin)
  await page.goto("/workorders");
  const woLink = page.locator('a[href^="/workorders/"]').first();
  const href = await woLink.getAttribute("href");
  await page.goto(href!);
  const checkboxes = page.locator('tbody input[type="checkbox"]');
  const count = await checkboxes.count();
  for (let i = 0; i < count; i++) {
    const cb = checkboxes.nth(i);
    const checked = await cb.isChecked();
    if (!checked) await cb.check();
  }
  const closeBtn = page.locator("text=Clore").first();
  await closeBtn.click();
});

