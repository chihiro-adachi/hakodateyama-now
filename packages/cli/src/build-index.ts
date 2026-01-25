import { readdir, writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";

interface DateIndex {
  date: string;
}

interface Index {
  generatedAt: string;
  dates: DateIndex[];
}

interface DailyData {
  date: string;
  generatedAt: string;
  hours: {
    [hour: number]: {
      [spotName: string]: string;
    };
  };
}

interface SpotData {
  fetchedAt: string;
  spots: { name: string; status: string }[];
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
  const dataDir = options?.dataDir ?? join(import.meta.dirname, "..", "..", "..", "data");
  const outputPath = join(dataDir, "index.json");
  const log = options?.onLog ?? (() => {});

  const entries = await readdir(dataDir, { withFileTypes: true });

  const dates: DateIndex[] = [];

  for (const entry of entries) {
    if (entry.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(entry.name)) {
      const dateDir = join(dataDir, entry.name);
      const files = await readdir(dateDir);
      const jsonFiles = files
        .filter((f) => f.endsWith(".json") && f !== "daily.json")
        .sort();

      if (jsonFiles.length > 0) {
        // daily.jsonを生成
        const dailyData: DailyData = {
          date: entry.name,
          generatedAt: new Date().toISOString(),
          hours: {},
        };

        for (const file of jsonFiles) {
          const content = await readFile(join(dateDir, file), "utf-8");
          const data: SpotData = JSON.parse(content);
          const hour = parseInt(file.split("-")[0], 10);
          dailyData.hours[hour] = {};
          for (const spot of data.spots) {
            dailyData.hours[hour][spot.name] = spot.status;
          }
        }

        await writeFile(
          join(dateDir, "daily.json"),
          JSON.stringify(dailyData, null, 2) + "\n"
        );

        dates.push({
          date: entry.name,
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
