import { test, expect } from "@playwright/test";

test.describe("メインページ", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("ページタイトルが表示される", async ({ page }) => {
    await expect(page).toHaveTitle("函館山混雑状況");
  });

  test("ヘッダーが表示される", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("函館山混雑状況");
  });

  test("外部リンクが存在する", async ({ page }) => {
    await expect(page.locator("a.vacan-link")).toBeVisible();
  });

  test("GitHubリンクが存在する", async ({ page }) => {
    await expect(page.locator('a[href*="github.com"]')).toBeVisible();
  });

  test("休日フィルターが存在する", async ({ page }) => {
    await expect(page.locator(".filter")).toBeVisible();
  });
});

test.describe("データ表示", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("日付セクションが表示される", async ({ page }) => {
    await expect(page.locator(".date-section").first()).toBeVisible();
  });

  test("日付セクションに日付ヘッダーが表示される", async ({ page }) => {
    await expect(
      page.locator(".date-section").first().locator("h2"),
    ).toBeVisible();
  });

  test("日付セクションにテーブルが表示される", async ({ page }) => {
    await expect(
      page.locator(".date-section").first().locator("table"),
    ).toBeVisible();
  });
});

test.describe("休日フィルター", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("フィルターをオンにすると平日データが非表示になる", async ({ page }) => {
    const weekdaySection = page.locator('.date-section[data-holiday="false"]');
    const holidaySection = page.locator('.date-section[data-holiday="true"]');
    const checkbox = page.locator('.filter input[type="checkbox"]');

    // フィルター前: 両方表示されている
    await expect(weekdaySection.first()).toBeVisible();
    await expect(holidaySection.first()).toBeVisible();

    // フィルターをオン
    await checkbox.check();

    // 平日は非表示、休日は表示
    await expect(weekdaySection.first()).toBeHidden();
    await expect(holidaySection.first()).toBeVisible();
  });

  test("フィルターをオフにすると平日データが再表示される", async ({ page }) => {
    const weekdaySection = page.locator('.date-section[data-holiday="false"]');
    const checkbox = page.locator('.filter input[type="checkbox"]');

    // フィルターをオン→オフ
    await checkbox.check();
    await checkbox.uncheck();

    // 平日データが再表示される
    await expect(weekdaySection.first()).toBeVisible();
  });
});
