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
│  GitHub Pages (自動デプロイ)                                 │
│  https://chihiro-adachi.github.io/hakodateyama-now/         │
│                                                             │
│  index.html が data/index.json を読み込み                    │
│  → 各日付の JSON を fetch して表形式で表示                    │
└─────────────────────────────────────────────────────────────┘
```

## ディレクトリ構成

```
├── src/
│   ├── fetch-status.ts      # コア関数・型定義
│   ├── cli.ts               # CLIエントリポイント
│   └── fetch-status.test.ts
├── scripts/
│   ├── build-index.ts       # data/index.json 生成
│   └── capture-screenshot.ts
├── data/
│   ├── index.json           # 日付・ファイル一覧（自動生成）
│   └── YYYY-MM-DD/
│       └── HH-00.json       # 混雑状況データ
├── index.html               # GitHub Pages 可視化ページ
└── .github/workflows/
    ├── fetch-status.yml     # 毎時データ収集
    └── ci.yml               # テスト・型チェック
```

## コマンド

```bash
# 混雑状況取得（結果はstdout、ログはstderr）
pnpm run fetch-status
pnpm run --silent fetch-status  # JSONのみ（stderrにログ出力）

# インデックス生成（GitHub Pages用）
pnpm run build-index

# 型チェック
pnpm typecheck

# テスト
pnpm test              # 単発実行（E2Eテスト、実際にvacan.comにアクセス）
pnpm test:watch        # ウォッチモード
```

## 主要ファイル

- `src/fetch-status.ts`: スクレイピングのコア関数。ライブラリとしても使用可能
- `src/cli.ts`: CLI。stdout にJSON、stderr にログを出力
- `scripts/build-index.ts`: data/配下をスキャンしてindex.jsonを生成
- `index.html`: GitHub Pages用。JSでJSONを読み込み表形式で表示

## 技術スタック

- Node.js 24 + pnpm 10（mise管理）
- TypeScript（Node.jsで直接実行、ビルド不要）
- playwright-core（`channel: 'chrome'`でシステムのChromeを使用）
- vitest（テスト）

## スクレイピング対象

- URL: `https://vacan.com/map/41.7606471,140.7089988,15?areaName=hakodate-city&isOpendata=false`
- セレクタ: `article.card-view` → `.place-name`, `.vacancy-text`
