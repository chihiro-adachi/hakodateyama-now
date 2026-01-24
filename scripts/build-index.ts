import { readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

interface DateIndex {
  date: string;
  files: string[];
}

interface Index {
  generatedAt: string;
  dates: DateIndex[];
}

async function buildIndex(): Promise<void> {
  const dataDir = join(import.meta.dirname, "..", "data");
  const outputPath = join(dataDir, "index.json");

  const entries = await readdir(dataDir, { withFileTypes: true });

  const dates: DateIndex[] = [];

  for (const entry of entries) {
    if (entry.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(entry.name)) {
      const dateDir = join(dataDir, entry.name);
      const files = await readdir(dateDir);
      const jsonFiles = files
        .filter((f) => f.endsWith(".json"))
        .sort();

      if (jsonFiles.length > 0) {
        dates.push({
          date: entry.name,
          files: jsonFiles,
        });
      }
    }
  }

  // 日付の降順でソート（新しい日付が先）
  dates.sort((a, b) => b.date.localeCompare(a.date));

  const index: Index = {
    generatedAt: new Date().toISOString(),
    dates,
  };

  await writeFile(outputPath, JSON.stringify(index, null, 2) + "\n");
  console.log(`Generated ${outputPath}`);
  console.log(`  ${dates.length} dates indexed`);
}

buildIndex().catch((err) => {
  console.error(err);
  process.exit(1);
});
