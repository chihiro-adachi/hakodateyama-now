import { chromium } from "playwright-core";
import { join } from "node:path";

async function capture(): Promise<void> {
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });

  await page.goto("https://chihiro-adachi.github.io/hakodate-vacan/");
  await page.waitForSelector(".date-section", { timeout: 10000 });

  const outputPath = join(import.meta.dirname, "..", "screenshot.png");
  await page.screenshot({ path: outputPath, fullPage: true });

  console.log(`Screenshot saved: ${outputPath}`);
  await browser.close();
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
