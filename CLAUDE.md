# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

函館山の混雑状況を自動収集・可視化するツール。vacan.comからスクレイピングしたデータをGitHub Pagesで公開。

## 全体フロー

```
┌─────────────────────────────────────────────────────────────┐
│  GitHub Actions (毎時 JST 10:00-22:00)                       │
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
├── src/                        # CLIツール
│   ├── fetch-status.ts         # コア関数・型定義
│   ├── build-index.ts          # data/index.json 生成
│   ├── capture-screenshot.ts   # スクリーンショット取得
│   ├── cli.ts                  # 統合CLIエントリポイント
│   └── fetch-status.test.ts
├── web/                        # React SPA (Vite)
│   ├── src/
│   │   ├── main.tsx            # エントリポイント
│   │   ├── App.tsx             # ルートコンポーネント
│   │   ├── App.css             # スタイル
│   │   ├── components/         # UIコンポーネント
│   │   ├── hooks/              # カスタムフック
│   │   ├── utils/              # ユーティリティ
│   │   ├── constants/          # 定数
│   │   └── types/              # 型定義
│   ├── index.html              # Viteテンプレート
│   ├── vite.config.ts
│   └── tsconfig.json
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
node src/cli.ts --help

# 混雑状況取得（結果はstdout、ログはstderr）
pnpm run fetch-status
pnpm run --silent fetch-status  # JSONのみ（stderrにログ出力）

# インデックス生成（GitHub Pages用）
pnpm run build-index

# スクリーンショット取得（README用）
pnpm run screenshot

# 型チェック
pnpm typecheck          # CLIツール
pnpm typecheck:web      # React SPA

# テスト
pnpm test              # 単発実行（E2Eテスト、実際にvacan.comにアクセス）
pnpm test:watch        # ウォッチモード

# Web開発
pnpm dev               # 開発サーバー起動
pnpm build             # 本番ビルド → dist/
pnpm preview           # ビルド結果プレビュー
```

## 主要ファイル

### CLIツール (src/)
- `src/fetch-status.ts`: スクレイピングのコア関数。ライブラリとしても使用可能
- `src/build-index.ts`: data/配下をスキャンしてindex.jsonを生成
- `src/capture-screenshot.ts`: GitHub Pagesのスクリーンショットを取得
- `src/cli.ts`: 統合CLI（サブコマンド: fetch-status, build-index, capture-screenshot）

### React SPA (web/)
- `web/src/App.tsx`: ルートコンポーネント、状態管理
- `web/src/hooks/useStatusData.ts`: データ取得・キャッシュ
- `web/src/components/`: Header, HolidayFilter, DateSection, StatusTable, StatusCell
- `web/vite.config.ts`: Vite設定（開発サーバーでdata/を提供するミドルウェア含む）

## 技術スタック

### CLIツール
- Node.js 24 + pnpm 10（mise管理）
- TypeScript（Node.jsで直接実行、ビルド不要）
- playwright-core（`channel: 'chrome'`でシステムのChromeを使用）
- vitest（テスト）

### React SPA
- React 19 + TypeScript
- Vite（ビルド・開発サーバー）
- GitHub Pages（ホスティング）

## スクレイピング対象

- URL: `https://vacan.com/map/41.7606471,140.7089988,15?areaName=hakodate-city&isOpendata=false`
- セレクタ: `article.card-view` → `.place-name`, `.vacancy-text`
