import { Hono } from "hono";
import type { BrowserWorker } from "@cloudflare/puppeteer";
import { fetchStatus } from "./scraper";
import { getStatusData, saveStatusSnapshot } from "./db";
import { renderApp, renderError } from "./view";

type Bindings = {
  BROWSER: BrowserWorker;
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", async (c) => {
  try {
    const data = await getStatusData(c.env.DB);
    return c.html(renderApp(data));
  } catch (error) {
    console.error("Failed to load status data:", error);
    return c.html(renderError(), 500);
  }
});

export default {
  fetch: app.fetch,
  async scheduled(
    event: ScheduledEvent,
    env: Bindings,
    _ctx: ExecutionContext,
  ) {
    console.log(
      "Cron triggered at:",
      new Date(event.scheduledTime).toISOString(),
    );

    try {
      const data = await fetchStatus(env.BROWSER);
      console.log(`Fetched: ${data.spots.length} spots at ${data.timestamp}`);

      await saveStatusSnapshot(env.DB, data);
      console.log("Saved to D1");
    } catch (error) {
      console.error("Scheduled fetch failed:", error);
      throw error;
    }
  },
};
