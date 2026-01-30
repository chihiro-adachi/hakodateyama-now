import type { FC } from 'hono/jsx';

type Props = {
  component: FC;
};

/**
 * Islandコンポーネントのマウントポイントを生成する
 *
 * サーバー側で空の<div data-island="...">を出力し、
 * クライアント側のclient.tsxがこの要素を検出してハイドレーションする
 *
 * @example
 * // サーバー側
 * <Island component={Counter} />
 * // → <div data-island="Counter"></div>
 *
 * // client.tsxで同名のキーで登録が必要
 * const islands = { Counter: Counter };
 */
export function Island({ component }: Props) {
  return <div data-island={component.name}></div>;
}
