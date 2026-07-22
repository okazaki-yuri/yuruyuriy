import { Fragment } from 'react';

/**
 * 辞書の string[]（行の配列）を <br /> 区切りで描画する。
 * 「文中の改行位置」はロケールごとに異なるため、辞書側で行単位に持たせている。
 */
export default function MultilineText({ lines }: { lines: string[] }) {
  return lines.map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {line}
    </Fragment>
  ));
}
