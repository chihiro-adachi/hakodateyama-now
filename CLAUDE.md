# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

函館山の混雑状況を自動収集・可視化するツール。vacan.comからスクレイピングしたデータをGitHub Pagesで公開。

## 全体フロー

```
┌─────────────────────────────────────────────────────────────┐
│  Cloudflare Workers (Cron Triggers)                         │
│  packages/cron/                                             │
│                                                             │
│  毎時 JST 10:00-22:00 (UTC 1:00-13:00)                       │
│  → GitHub API で workflow_dispatch を発火                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  GitHub Actions (workflow_dispatch)                          │
│  .github/workflows/fetch-status.yml                         │
│                                                             │
│  1. pnpm run fetch-status → data/YYYY-MM-DD/HH-00.json     │
│  2. pnpm run build-index  → data/index.json                │
│  3. git commit & push                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  GitHub Actions (mainブランチ push時)                        │
│  .github/workflows/deploy.yml                               │
│                                                             │
│  1. pnpm build → dist/ (React SPA)                         │
│  2. data/, favicon.ico を dist/ にコピー                    │
│  3. GitHub Pages にデプロイ                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  GitHub Pages                                               │
│  https://chihiro-adachi.github.io/hakodateyama-now/         │
│                                                             │
│  React SPA が data/index.json を読み込み                     │
│  → 各日付の JSON を fetch して表形式で表示                    │
└─────────────────────────────────────────────────────────────┘
```

## ディレクトリ構成

```
├── pnpm-workspace.yaml         # pnpm workspace設定
├── package.json                # ルート（共通スクリプト）
├── tsconfig.base.json          # TypeScript共通設定
├── packages/
│   ├── cli/                    # CLIツール (@hakodate/cli)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── fetch-status.ts         # コア関数・型定義
│   │   │   ├── build-index.ts          # data/index.json 生成
│   │   │   ├── capture-screenshot.ts   # スクリーンショット取得
│   │   │   └── cli.ts                  # 統合CLIエントリポイント
│   │   └── e2e/
│   │       └── fetch-status.test.ts    # E2Eテスト（vacan.comにアクセス）
│   ├── cron/                   # Cloudflare Workers (@hakodate/cron)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── wrangler.toml       # Cron Triggers 設定
│   │   └── src/
│   │       ├── index.ts        # scheduled ハンドラ
│   │       └── index.test.ts   # ユニットテスト
│   └── web/                    # React SPA (@hakodate/web)
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── index.html
│       ├── src/
│       │   ├── main.tsx            # エントリポイント
│       │   ├── App.tsx             # ルートコンポーネント
│       │   ├── App.css             # スタイル
│       │   ├── components/         # UIコンポーネント
│       │   ├── hooks/              # カスタムフック
│       │   ├── utils/              # ユーティリティ
│       │   ├── constants/          # 定数
│       │   └── types/              # 型定義
│       └── e2e/
│           └── app.spec.ts         # E2Eテスト（Playwright）
├── data/
│   ├── index.json              # 日付・ファイル一覧（自動生成）
│   └── YYYY-MM-DD/
│       └── HH-00.json          # 混雑状況データ
├── dist/                       # ビルド出力（.gitignore）
└── .github/workflows/
    ├── fetch-status.yml        # 毎時データ収集
    ├── deploy.yml              # GitHub Pagesデプロイ
    └── ci.yml                  # テスト・型チェック
```

## コマンド

```bash
# CLIヘルプ表示
node packages/cli/src/cli.ts --help

# 混雑状況取得（結果はstdout、ログはstderr）
pnpm run fetch-status
pnpm run --silent fetch-status  # JSONのみ（stderrにログ出力）

# インデックス生成（GitHub Pages用）
pnpm run build-index

# スクリーンショット取得（README用）
pnpm run screenshot

# 型チェック
pnpm typecheck          # 全パッケージ（cli + web）

# E2Eテスト
pnpm e2e               # 全パッケージ（cli + web）のE2Eテスト実行
pnpm --filter @hakodate/cli e2e:watch   # CLIテストのウォッチモード
pnpm --filter @hakodate/web e2e:ui      # Web E2EテストのUIモード

# Web開発
pnpm dev               # 開発サーバー起動
pnpm build             # 本番ビルド → dist/
pnpm preview           # ビルド結果プレビュー

# Cloudflare Workers (Cron)
pnpm cron:dev          # ローカル開発サーバー
pnpm cron:deploy       # Cloudflare にデプロイ
pnpm --filter @hakodate/cron test  # ユニットテスト
```

## 主要ファイル

### CLIツール (packages/cli/)
- `packages/cli/src/fetch-status.ts`: スクレイピングのコア関数。ライブラリとしても使用可能
- `packages/cli/src/build-index.ts`: data/配下をスキャンしてindex.jsonを生成
- `packages/cli/src/capture-screenshot.ts`: GitHub Pagesのスクリーンショットを取得
- `packages/cli/src/cli.ts`: 統合CLI（サブコマンド: fetch-status, build-index, capture-screenshot）

### React SPA (packages/web/)
- `packages/web/src/App.tsx`: ルートコンポーネント、状態管理
- `packages/web/src/hooks/useStatusData.ts`: データ取得・キャッシュ
- `packages/web/src/components/`: Header, HolidayFilter, DateSection, StatusTable, StatusCell
- `packages/web/vite.config.ts`: Vite設定（開発サーバーでdata/を提供するミドルウェア含む）

### Cloudflare Workers (packages/cron/)
- `packages/cron/src/index.ts`: scheduled イベントハンドラ、指数バックオフ付きリトライ
- `packages/cron/wrangler.toml`: Cron Triggers 設定（UTC 1:00-13:00 = JST 10:00-22:00）

## 技術スタック

### モノレポ構成
- pnpm workspace（3パッケージ: @hakodate/cli, @hakodate/web, @hakodate/cron）
- 共有コードなし（JSONデータ経由で連携）

### CLIツール
- Node.js 24 + pnpm 10（mise管理）
- TypeScript（Node.jsで直接実行、ビルド不要）
- playwright-core（`channel: 'chrome'`でシステムのChromeを使用）
- vitest（テスト）

### React SPA
- React 19 + TypeScript
- Vite（ビルド・開発サーバー）
- GitHub Pages（ホスティング）

### Cloudflare Workers
- Cron Triggers（スケジュール実行）
- wrangler（デプロイ・ローカル開発）

## スクレイピング対象

- URL: `https://vacan.com/map/41.7606471,140.7089988,15?areaName=hakodate-city&isOpendata=false`
- セレクタ: `article.card-view` → `.place-name`, `.vacancy-text`
