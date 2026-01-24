# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

vacan.com から函館エリアの混雑状況をスクレイピングして取得するツール。Playwrightでブラウザを操作し、施設名と混雑状況テキストをJSON形式で出力する。

## コマンド

```bash
# 混雑状況取得（結果はstdout、ログはstderr）
pnpm run fetch-status
pnpm run --silent fetch-status 2>/dev/null  # JSONのみ

# 型チェック
pnpm typecheck

# テスト
pnpm test              # 単発実行（E2Eテスト、実際にvacan.comにアクセス）
pnpm test:watch        # ウォッチモード
```

## アーキテクチャ

```
src/
├── fetch-status.ts    # コア関数・型定義（fetchStatus, Spot, SidebarData）
├── cli.ts             # CLIエントリポイント
└── fetch-status.test.ts
```

- `fetch-status.ts`: ライブラリとして使用可能。`FetchOptions`でログ/警告コールバック、URL、タイムアウトをカスタマイズ可能
- `cli.ts`: stdout にJSON結果、stderr にログを出力

## 技術スタック

- Node.js 24 + pnpm 10（mise管理）
- TypeScript（Node.jsで直接実行、ビルド不要）
- playwright-core（`channel: 'chrome'`でシステムのChromeを使用）
- vitest（テスト）

## スクレイピング対象

- URL: `https://vacan.com/map/...?areaName=hakodate-city`
- セレクタ: `article.card-view` → `.place-name`, `.vacancy-text`
