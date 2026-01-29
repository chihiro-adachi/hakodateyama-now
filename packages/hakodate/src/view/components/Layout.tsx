import type { Child } from 'hono/jsx';
import { styles } from '../styles';

interface LayoutProps {
  children: Child;
}

export function Layout({ children }: LayoutProps) {
  return (
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>函館山混雑状況</title>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
