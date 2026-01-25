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

export interface BuildIndexOptions {
  dataDir?: string;
  onLog?: (message: string) => void;
}

export interface BuildIndexResult {
  outputPath: string;
  datesCount: number;
}

export async function buildIndex(
  options?: BuildIndexOptions
): Promise<BuildIndexResult> {
  const dataDir = options?.dataDir ?? join(import.meta.dirname, "..", "data");
  const outputPath = join(dataDir, "index.json");
  const log = options?.onLog ?? (() => {});

  const entries = await readdir(dataDir, { withFileTypes: true });

  const dates: DateIndex[] = [];

  for (const entry of entries) {
    if (entry.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(entry.name)) {
      const dateDir = join(dataDir, entry.name);
      const files = await readdir(dateDir);
      const jsonFiles = files.filter((f) => f.endsWith(".json")).sort();

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
  log(`Generated ${outputPath}`);
  log(`  ${dates.length} dates indexed`);

  return {
    outputPath,
    datesCount: dates.length,
  };
}
