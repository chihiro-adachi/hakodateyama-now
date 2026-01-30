import { render } from 'hono/jsx/dom';
import { jsx } from 'hono/jsx';
import type { FC } from 'hono/jsx';
import { Counter } from './Counter';

// Islandコンポーネントの登録
const islands: Record<string, FC> = {
  Counter: Counter,
};

// data-island属性を持つ要素を自動でマウント(Islandコンポーネントで指定)
document.querySelectorAll<HTMLElement>('[data-island]').forEach((el) => {
  const name = el.dataset.island;
  if (name && name in islands) {
    const Component = islands[name];
    render(jsx(Component, {}), el);
  }
});
