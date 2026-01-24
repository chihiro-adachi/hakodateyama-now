import { chromium } from 'playwright-core';

const TARGET_URL = 'https://vacan.com/map/41.7606471,140.7089988,15?areaName=hakodate-city&isOpendata=false';
const VIEWPORT = { width: 1920, height: 1080 };

export interface Spot {
  name: string;
  status: string;
}

export interface SidebarData {
  timestamp: string;
  spots: Spot[];
}

export interface FetchOptions {
  url?: string;
  timeout?: number;
  onLog?: (message: string) => void;
  onWarn?: (message: string) => void;
}

export async function fetchStatus(options: FetchOptions = {}): Promise<SidebarData> {
  const {
    url = TARGET_URL,
    timeout = 10000,
    onLog = () => {},
    onWarn = () => {},
  } = options;

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  try {
    const context = await browser.newContext({
      viewport: VIEWPORT,
    });
    const page = await context.newPage();

    onLog(`Navigating to: ${url}`);
    await page.goto(url, { waitUntil: 'load' });

    onLog('Waiting for content...');
    await page.waitForSelector('article.card-view', { timeout });

    // サイドバーの施設リストを取得
    const { spots, warnings } = await page.evaluate(() => {
      const results: { name: string; status: string }[] = [];
      const warns: string[] = [];

      const spotCards = document.querySelectorAll('article.card-view');

      spotCards.forEach((card, index) => {
        const nameEl = card.querySelector('.place-name');
        const statusEl = card.querySelector('.vacancy-text');

        if (!nameEl) {
          warns.push(`Card ${index}: missing .place-name element`);
          return;
        }

        const name = nameEl.textContent?.trim() || '';
        if (!name) {
          warns.push(`Card ${index}: .place-name has no text`);
          return;
        }

        if (!statusEl) {
          warns.push(`"${name}": missing .vacancy-text element`);
        }

        const rawStatus = statusEl?.textContent?.trim();
        const status = rawStatus ? rawStatus.replace(/\s+/g, '') : '不明';

        results.push({ name, status });
      });

      return { spots: results, warnings: warns };
    });

    // 警告があれば出力
    for (const warn of warnings) {
      onWarn(warn);
    }

    if (spots.length === 0) {
      throw new Error('No spots found - page structure may have changed');
    }

    // JSTタイムスタンプを生成
    const now = new Date();
    const timestamp = now.toLocaleString('sv-SE', { timeZone: 'Asia/Tokyo' }).replace(' ', 'T') + '+09:00';

    return {
      timestamp,
      spots,
    };
  } finally {
    try {
      await browser.close();
    } catch (closeError) {
      onWarn(`Failed to close browser: ${closeError}`);
    }
  }
}
