import { chromium } from "playwright-core";
import { join } from "node:path";

export interface CaptureScreenshotOptions {
  url?: string;
  outputPath?: string;
  onLog?: (message: string) => void;
}

export interface CaptureScreenshotResult {
  outputPath: string;
}

export async function captureScreenshot(
  options?: CaptureScreenshotOptions
): Promise<CaptureScreenshotResult> {
  const url =
    options?.url ?? "https://chihiro-adachi.github.io/hakodateyama-now/";
  const outputPath =
    options?.outputPath ?? join(import.meta.dirname, "..", "screenshot.png");
  const log = options?.onLog ?? (() => {});

  const browser = await chromium.launch({ channel: "chrome" });
  try {
    const page = await browser.newPage({
      viewport: { width: 1200, height: 800 },
    });

    await page.goto(url);
    await page.waitForSelector(".date-section", { timeout: 10000 });

    await page.screenshot({ path: outputPath, fullPage: true });
    log(`Screenshot saved: ${outputPath}`);
  } finally {
    await browser.close();
  }

  return { outputPath };
}
