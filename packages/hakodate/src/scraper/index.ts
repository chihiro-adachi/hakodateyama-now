import puppeteer, { type BrowserWorker } from '@cloudflare/puppeteer';
import type { SidebarData } from '../types';

const TARGET_URL =
  'https://vacan.com/map/41.7606471,140.7089988,15?areaName=hakodate-city&isOpendata=false';
const VIEWPORT = { width: 1920, height: 1080 };

export async function fetchStatus(browserBinding: BrowserWorker): Promise<SidebarData> {
  const browser = await puppeteer.launch(browserBinding);

  try {
    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);

    console.log(`Navigating to: ${TARGET_URL}`);
    await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });

    console.log('Waiting for content...');
    await page.waitForSelector('article.card-view', { timeout: 10000 });

    try {
      await page.waitForFunction(
        () => {
          const cards = document.querySelectorAll('article.card-view');
          if (cards.length === 0) return false;
          const readyCount = Array.from(cards).filter((card) =>
            card.querySelector('.vacancy-text')
          ).length;
          return readyCount === cards.length;
        },
        { timeout: 8000 }
      );
    } catch {
      console.warn('Timed out waiting for .vacancy-text elements');
    }

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
          const snippet = card.textContent?.trim().replace(/\s+/g, ' ').slice(0, 80);
          warns.push(`"${name}": missing .vacancy-text element${snippet ? ` (text: ${snippet}...)` : ''}`);
        }

        const rawStatus = statusEl?.textContent?.trim();
        const status = rawStatus ? rawStatus.replace(/\s+/g, '') : '不明';

        results.push({ name, status });
      });

      return { spots: results, warnings: warns };
    });

    for (const warn of warnings) {
      console.warn(warn);
    }

    if (spots.length === 0) {
      throw new Error('No spots found - page structure may have changed');
    }

    const now = new Date();
    const timestamp =
      now.toLocaleString('sv-SE', { timeZone: 'Asia/Tokyo' }).replace(' ', 'T') +
      '+09:00';

    return {
      timestamp,
      spots,
    };
  } finally {
    try {
      await browser.close();
    } catch (closeError) {
      console.warn('Failed to close browser:', closeError);
    }
  }
}
