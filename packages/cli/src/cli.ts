import { fetchStatus } from "./fetch-status.ts";
import { buildIndex } from "./build-index.ts";
import { captureScreenshot } from "./capture-screenshot.ts";

const HELP = `Usage: node src/cli.ts <command>

Commands:
  fetch-status       混雑状況を取得してJSONを出力
  build-index        data/index.jsonを生成
  capture-screenshot スクリーンショットを取得

Options:
  -h, --help         このヘルプを表示
`;

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "-h" || command === "--help") {
    console.log(HELP);
    process.exit(0);
  }

  switch (command) {
    case "fetch-status":
      await runFetchStatus();
      break;
    case "build-index":
      await runBuildIndex();
      break;
    case "capture-screenshot":
      await runCaptureScreenshot();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      console.error(HELP);
      process.exit(1);
  }
}

async function runFetchStatus(): Promise<void> {
  const data = await fetchStatus({
    onLog: (msg) => console.error(msg),
    onWarn: (msg) => console.error(`Warning: ${msg}`),
  });
  process.stdout.write(JSON.stringify(data, null, 2) + "\n");
  console.error("Done!");
}

async function runBuildIndex(): Promise<void> {
  await buildIndex({
    onLog: (msg) => console.log(msg),
  });
}

async function runCaptureScreenshot(): Promise<void> {
  await captureScreenshot({
    onLog: (msg) => console.log(msg),
  });
}

main().catch((error: unknown) => {
  if (error instanceof Error) {
    console.error("Error:", error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  } else {
    console.error("Error:", error);
  }
  process.exit(1);
});
