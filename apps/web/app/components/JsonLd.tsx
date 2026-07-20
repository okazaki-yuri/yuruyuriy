// 構造化データ（JSON-LD）を <script type="application/ld+json"> として埋め込む。
// App Router 推奨方式：ページのサーバコンポーネント内に直接描画する。
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify 済みの信頼できる自前データのみを渡す
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
