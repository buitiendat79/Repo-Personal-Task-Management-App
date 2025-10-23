import { test, expect } from "@playwright/test";

test.describe("Task Management Flow", () => {
  // Tạo task, cập nhật, xóa task
  test("should create, update, and delete a task successfully", async ({
    page,
  }) => {
    // Tạo task
    await page.goto("/tasks/create");

    await page.fill('input[name="title"]', "E2E Task Example");
    await page.fill(
      'textarea[name="description"]',
      "Task created by Playwright"
    );
    await page.click('input[name="deadline"]');
    await page.keyboard.press("Enter");
    await page.selectOption('select[name="priority"]', "High");

    await page.click('button[type="submit"]');

    // về danh sách
    await expect(page).toHaveURL(/.*\/tasks/);
    await expect(page.getByText("E2E Task Example")).toBeVisible();

    // Cập nhật
    await page.getByRole("button", { name: /sửa/i }).click();

    await page.fill('input[name="title"]', "E2E Task Updated");
    await page.click('button[type="submit"]');
    await expect(page.getByText("E2E Task Updated")).toBeVisible();

    // Xóa task
    await page.getByRole("button", { name: /xoá task/i }).click();
    await page.getByRole("button", { name: /đồng ý/i }).click();

    await expect(page.getByText("E2E Task Updated")).toHaveCount(0);
  });
});
