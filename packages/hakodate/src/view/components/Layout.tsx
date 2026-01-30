import type { Child } from "hono/jsx";

interface LayoutProps {
  children: Child;
}

export function Layout({ children }: LayoutProps) {
  return (
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="stylesheet" href="/styles.css" />
        <title>函館山混雑状況</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
