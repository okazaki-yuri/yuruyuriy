// 構造化データ（JSON-LD）を <script type="application/ld+json"> として埋め込む。
// App Router 推奨方式：ページのサーバコンポーネント内に直接描画する。
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // 自前データのみを渡すが、将来 name/description 等に "<" が混入した場合でも
      // "</script>" でタグを閉じられないよう、"<" を Unicode エスケープ（<）しておく。
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
