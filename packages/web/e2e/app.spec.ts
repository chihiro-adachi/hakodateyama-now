import { test, expect } from '@playwright/test';

const SITE_URL = 'https://chihiro-adachi.github.io/hakodateyama-now/';

test.describe('函館山混雑状況', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(SITE_URL);
  });

  test('ページが正常に表示される', async ({ page }) => {
    // タイトルが表示される
    await expect(page.locator('h1')).toHaveText('函館山混雑状況');

    // ヘッダーリンクが存在する
    await expect(page.locator('a.vacan-link')).toBeVisible();
    await expect(page.locator('a[title="GitHub"]')).toBeVisible();
  });

  test('日付セクションとステータステーブルが表示される', async ({ page }) => {
    // 日付セクションが少なくとも1つ表示される
    const dateSections = page.locator('.date-section');
    await expect(dateSections.first()).toBeVisible();

    // 日付見出し（h2）が表示される
    const dateHeading = dateSections.first().locator('h2');
    await expect(dateHeading).toBeVisible();

    // テーブルが表示される
    const table = dateSections.first().locator('table');
    await expect(table).toBeVisible();

    // テーブルヘッダーに「時間」列がある
    await expect(table.locator('th.time-col')).toHaveText('時間');

    // テーブルに行がある（時間帯のデータ）
    const rows = table.locator('tbody tr');
    await expect(rows.first()).toBeVisible();
  });

  test('スポット名がテーブルヘッダーに表示される', async ({ page }) => {
    // テーブルが表示されるまで待つ
    const table = page.locator('.date-section').first().locator('table');
    await expect(table).toBeVisible();

    // ヘッダーが2つ以上ある（時間列 + スポット列）
    const headers = table.locator('thead th');
    await expect(headers).not.toHaveCount(0);
    const count = await headers.count();
    expect(count).toBeGreaterThan(1);
  });

  test('祝日フィルターが動作する', async ({ page }) => {
    // データのロードを待つ
    await expect(page.locator('.date-section').first()).toBeVisible();

    const checkbox = page.locator('input[type="checkbox"]');
    const initialCount = await page.locator('.date-section').count();

    // チェックボックスをクリック
    await checkbox.check();
    await expect(checkbox).toBeChecked();

    // フィルター後の日付数は元と同じか少ない
    const filteredCount = await page.locator('.date-section').count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);

    // チェックを外すと元に戻る
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
    await expect(page.locator('.date-section')).toHaveCount(initialCount);
  });

  test('混雑状況のセルにステータスが表示される', async ({ page }) => {
    const table = page.locator('.date-section').first().locator('table');
    const cells = table.locator('tbody td');

    // セルが存在する
    await expect(cells.first()).toBeVisible();

    // 少なくとも一部のセルにテキストがある（- または混雑状況）
    const firstRowCells = table.locator('tbody tr').first().locator('td');
    await expect(firstRowCells.first()).toBeVisible();
  });
});

test.describe('モバイル表示', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('モバイルでもテーブルが表示される', async ({ page }) => {
    await page.goto(SITE_URL);

    await expect(page.locator('h1')).toHaveText('函館山混雑状況');
    await expect(page.locator('.date-section').first().locator('table')).toBeVisible();
  });
});
