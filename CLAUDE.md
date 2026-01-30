# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

函館山の混雑状況を自動収集・可視化するツール。Cloudflare Workers上で動作し、vacan.comからスクレイピングしたデータをD1データベースに保存、SSRでWebページを提供。

## 全体フロー

```
┌─────────────────────────────────────────────────────────────┐
│  Cloudflare Workers                                         │
│  packages/hakodate/                                         │
│                                                             │
│  Cron Triggers: 毎時 JST 10:00-22:00 (UTC 1:00-13:00)       │
│  → Browser Rendering で vacan.com をスクレイピング           │
│  → D1 データベースに保存                                     │
│                                                             │
│  HTTP Request: GET /                                        │
│  → D1 からデータ取得                                         │
│  → Hono + hono/jsx で SSR                                   │
│  → HTML レスポンス                                           │
└─────────────────────────────────────────────────────────────┘
```

## コマンド

```bash
# 開発サーバー起動
pnpm dev

# Cloudflareにデプロイ
pnpm run deploy

# 型チェック
pnpm typecheck

# Lint
pnpm lint
pnpm lint:fix

# Format
pnpm format
pnpm format:check

# テスト
pnpm test

# D1操作（ローカル）
wrangler d1 execute hakodate --local --command "SELECT * FROM status_snapshots"

# D1操作（リモート）
wrangler d1 execute hakodate --remote --command "SELECT * FROM status_snapshots"
```

## 主要ファイル

### エントリポイント
- `src/index.ts`: Honoアプリ、fetchハンドラ（SSR）、scheduledハンドラ（Cron）

### スクレイピング
- `src/scraper/index.ts`: Browser Renderingでvacan.comをスクレイピング

### データベース
- `src/db/index.ts`: D1操作（保存・取得）
- `schema.sql`: テーブル定義

## 技術スタック

- **Cloudflare Workers**: エッジコンピューティング
- **Cloudflare D1**: SQLiteベースのデータベース
- **Cloudflare Browser Rendering**: ヘッドレスブラウザ
- **Hono**: 軽量Webフレームワーク
- **hono/jsx**: JSXベースのSSR
- **TypeScript**: 型安全
- **pnpm**: パッケージマネージャ
- **mise**: ツールバージョン管理

## スクレイピング対象

- URL: `https://vacan.com/map/41.7606471,140.7089988,15?areaName=hakodate-city&isOpendata=false`
- セレクタ: `article.card-view` → `.place-name`, `.vacancy-text`

## D1スキーマ

@packages/hakodate/schema.sql を参照

## テスト方針

### 概要

- **フレームワーク**: vitest v4
- **配置**: コロケーション方式（テスト対象と同じディレクトリに `.test.ts`）
- **実行**: `pnpm test` / `pnpm test:watch`

### テスト対象の優先度

| 優先度 | 対象 | 方針 |
|--------|------|------|
| 高 | 純粋関数（transform, utils） | 必ずテストを書く |
| 中 | DB操作（db/index.ts） | D1をモックしてテスト |
| 低 | エントリポイント（index.ts） | 統合テストでカバー |
| 対象外 | スクレイパー（scraper/） | E2Eでカバー |

### D1モックパターン

```typescript
const mockDb = {
  prepare: vi.fn().mockReturnValue({
    bind: vi.fn().mockReturnValue({
      run: vi.fn().mockResolvedValue({ success: true }),
      all: vi.fn().mockResolvedValue({ results: [] }),
    }),
  }),
} as unknown as D1Database;
```

### ファイル構成

```
src/
├── transform/
│   ├── index.ts
│   └── index.test.ts
├── view/utils/
│   ├── dateUtils.ts
│   ├── dateUtils.test.ts
│   ├── statusUtils.ts
│   └── statusUtils.test.ts
└── db/
    ├── index.ts
    └── index.test.ts
```
