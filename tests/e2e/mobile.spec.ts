import { test, expect } from "@playwright/test";

test.describe("Mobile Experience", () => {
  test("should show mobile-optimized controls", async ({ page }) => {
    await page.goto("/teacher");
    await page.getByLabel("Session Title").fill("Mobile Test Session");
    await page.getByRole("button", { name: "Start Session" }).click();

    // Check mobile controls
    const controlsButton = page.getByRole("button", { name: /Controls/i });
    await controlsButton.click();

    // Check bottom sheet appears
    await expect(page.getByText("Controls & Chat")).toBeVisible();

    // Check can close sheet
    await page.getByRole("button", { name: "Close panel" }).click();
    await expect(page.getByText("Controls & Chat")).toBeHidden();
  });

  test("should load mobile Unity build", async ({ page }) => {
    await page.goto("/teacher");
    await page.getByLabel("Session Title").fill("Mobile Unity Test");
    await page.getByRole("button", { name: "Start Session" }).click();

    // Check mobile build message
    await expect(page.getByText("Using Mobile Build")).toBeVisible();
    await expect(page.getByText("Optimized for mobile devices")).toBeVisible();

    // Wait for Unity to load
    await expect(page.getByText("Loading Z-Anatomy Viewer")).toBeHidden({
      timeout: 30000,
    });
    await expect(page.locator("canvas")).toBeVisible();
  });

  test("should handle touch interactions", async ({ page }) => {
    await page.goto("/teacher");
    await page.getByLabel("Session Title").fill("Touch Test Session");
    await page.getByRole("button", { name: "Start Session" }).click();

    // Wait for Unity
    await expect(page.getByText("Loading Z-Anatomy Viewer")).toBeHidden({
      timeout: 30000,
    });

    // Simulate touch interactions
    const canvas = page.locator("canvas");
    await canvas.tap();

    // Open controls with touch
    await page.getByRole("button", { name: /Controls/i }).tap();
    await expect(page.getByText("Controls & Chat")).toBeVisible();
  });

  test("should be responsive across screen sizes", async ({ page }) => {
    // Test different viewport sizes
    for (const size of [
      { width: 375, height: 667 }, // iPhone SE
      { width: 390, height: 844 }, // iPhone 12
      { width: 768, height: 1024 }, // iPad
    ]) {
      await page.setViewportSize(size);
      await page.goto("/teacher");

      // Check layout adjusts
      if (size.width < 768) {
        await expect(
          page.getByRole("button", { name: /Controls/i })
        ).toBeVisible();
        await expect(page.getByText("Controls")).toBeHidden();
      } else {
        await expect(page.getByText("Controls")).toBeVisible();
      }
    }
  });
});
