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

```sql
CREATE TABLE status_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,  -- "2025-01-28T10:00:00+09:00"
  spots TEXT NOT NULL       -- JSON: [{"name":"...", "status":"..."}]
);

CREATE INDEX idx_snapshots_timestamp ON status_snapshots(timestamp);
```
