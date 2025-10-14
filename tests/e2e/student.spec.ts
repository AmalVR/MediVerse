import { test, expect } from "@playwright/test";

test.describe("Student View", () => {
  test("should join existing session", async ({ page, browser }) => {
    // Create a teacher session first
    const teacherContext = await browser.newContext();
    const teacherPage = await teacherContext.newPage();
    await teacherPage.goto("/teacher");
    await teacherPage.getByLabel("Session Title").fill("Join Test Session");
    await teacherPage.getByRole("button", { name: "Start Session" }).click();

    // Get session code
    const codeText = await teacherPage.getByText(/[A-Z0-9]{6}/).textContent();
    const sessionCode = codeText?.match(/[A-Z0-9]{6}/)?.[0];
    await teacherContext.close();

    // Join as student
    await page.goto("/");
    await page.getByLabel("Session Code").fill(sessionCode!);
    await page.getByRole("button", { name: "Join Session" }).click();

    // Check joined successfully
    await expect(page.getByText("Session: Join Test Session")).toBeVisible();
  });

  test("should sync with teacher state", async ({ page, browser }) => {
    // Setup teacher session
    const teacherContext = await browser.newContext();
    const teacherPage = await teacherContext.newPage();
    await teacherPage.goto("/teacher");
    await teacherPage.getByLabel("Session Title").fill("Sync Test Session");
    await teacherPage.getByRole("button", { name: "Start Session" }).click();
    const sessionCode = await teacherPage
      .getByText(/[A-Z0-9]{6}/)
      .textContent();

    // Join as student
    await page.goto("/");
    await page.getByLabel("Session Code").fill(sessionCode!);
    await page.getByRole("button", { name: "Join Session" }).click();

    // Teacher changes state
    await teacherPage.getByRole("button", { name: /Controls/i }).click();
    await teacherPage.getByText("Show Skeletal System").click();

    // Check student view updates
    await expect(page.getByText("Skeletal System")).toBeVisible();

    await teacherContext.close();
  });

  test("should handle session end gracefully", async ({ page, browser }) => {
    // Setup teacher session
    const teacherContext = await browser.newContext();
    const teacherPage = await teacherContext.newPage();
    await teacherPage.goto("/teacher");
    await teacherPage.getByLabel("Session Title").fill("End Test Session");
    await teacherPage.getByRole("button", { name: "Start Session" }).click();
    const sessionCode = await teacherPage
      .getByText(/[A-Z0-9]{6}/)
      .textContent();

    // Join as student
    await page.goto("/");
    await page.getByLabel("Session Code").fill(sessionCode!);
    await page.getByRole("button", { name: "Join Session" }).click();

    // Teacher ends session
    await teacherPage.getByRole("button", { name: "End Session" }).click();
    await teacherContext.close();

    // Check student is redirected
    await expect(page).toHaveURL("/");
    await expect(page.getByText("Session ended by teacher")).toBeVisible();
  });
});
