import { test, expect } from "@playwright/test";

test.describe("Teacher Dashboard", () => {
  test("should create a new session", async ({ page }) => {
    await page.goto("/teacher");

    // Check initial state
    await expect(page.getByText("Create Teaching Session")).toBeVisible();

    // Fill session title
    await page.getByLabel("Session Title").fill("Test Anatomy Session");

    // Start session
    await page.getByRole("button", { name: "Start Session" }).click();

    // Check session started
    await expect(page.getByText("Session: Test Anatomy Session")).toBeVisible();

    // Check session code is displayed
    const codeElement = page.getByText(/[A-Z0-9]{6}/);
    await expect(codeElement).toBeVisible();
  });

  test("should load Unity viewer", async ({ page }) => {
    await page.goto("/teacher");

    // Create session
    await page.getByLabel("Session Title").fill("Unity Test Session");
    await page.getByRole("button", { name: "Start Session" }).click();

    // Wait for Unity to load
    await expect(page.getByText("Loading Z-Anatomy Viewer")).toBeVisible();
    await expect(page.getByText("Loading Z-Anatomy Viewer")).toBeHidden({
      timeout: 30000,
    });

    // Check Unity canvas is visible
    await expect(page.locator("canvas")).toBeVisible();
  });

  test("should toggle controls panel", async ({ page }) => {
    await page.goto("/teacher");
    await page.getByLabel("Session Title").fill("Controls Test Session");
    await page.getByRole("button", { name: "Start Session" }).click();

    // Check controls visibility
    const controlsButton = page.getByRole("button", { name: /Controls/i });
    await controlsButton.click();

    // Check AI panel is visible
    await expect(page.getByText("AI Interactive")).toBeVisible();

    // Close controls
    await controlsButton.click();
    await expect(page.getByText("AI Interactive")).toBeHidden();
  });

  test("should handle fullscreen toggle", async ({ page }) => {
    await page.goto("/teacher");
    await page.getByLabel("Session Title").fill("Fullscreen Test Session");
    await page.getByRole("button", { name: "Start Session" }).click();

    // Toggle fullscreen
    const fullscreenButton = page.getByRole("button", { name: /Fullscreen/i });
    await fullscreenButton.click();

    // Check fullscreen state
    // Note: Can't fully test fullscreen API in headless mode
    await expect(fullscreenButton).toContainText("Exit Fullscreen");
  });

  test("should end session", async ({ page }) => {
    await page.goto("/teacher");
    await page.getByLabel("Session Title").fill("End Session Test");
    await page.getByRole("button", { name: "Start Session" }).click();

    // End session
    await page.getByRole("button", { name: "End Session" }).click();

    // Check redirected to home
    await expect(page).toHaveURL("/");
  });
});
