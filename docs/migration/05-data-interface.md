# 05. データ取得I/Fと第2段階への布石

第1段階の唯一かつ最重要の設計判断。ここを守るかどうかで、第2段階（API化 / プロジェクト移行）の
コストが「フロント無改修」か「全面書き直し」かに分かれる。

---

## 原則：データは「実体」ではなく「I/F」越しに読む

ページから静的JSONを直接 `import` すると、第2段階でAPI化するときに**全ページを書き換える**羽目になる。
そうならないよう、**取得I/F（リポジトリ）を1枚かませる**。

```
呼び出し側（ページ）
      │  getTools() を呼ぶだけ（実体を知らない）
      ▼
toolsRepository（I/F）
      │  第1段階：static JSON を返す
      │  第2段階：fetch('/api/...') に差し替え ← ここだけ変える
      ▼
data/tools.json  →（将来）API / DB
```

---

## 実装例

### 型定義

```ts
// packages/core/src/data/types.ts
export type Tool = {
  slug: string;
  name: string;
  description: string;
  href: string;
};

export interface ToolsRepository {
  getTools(): Promise<Tool[]>;
  getTool(slug: string): Promise<Tool | null>;
}
```

### 第1段階の実装（静的JSON）

```ts
// packages/core/src/data/toolsRepository.ts
import type { Tool, ToolsRepository } from './types';
import tools from '../../../../data/tools.json'; // ビルド時に取り込まれる

export const toolsRepository: ToolsRepository = {
  async getTools() {
    return tools as Tool[];
  },
  async getTool(slug) {
    return (tools as Tool[]).find((t) => t.slug === slug) ?? null;
  },
};
```

### データ本体

```json
// data/tools.json
[
  { "slug": "wordroulette-chan", "name": "ことばルーレットちゃん", "description": "...", "href": "/tools/wordroulette-chan/" },
  { "slug": "web-dice-chan",     "name": "Webサイコロちゃん",     "description": "...", "href": "/tools/web-dice-chan/" }
]
```

### ページ側の使い方（実体を知らない）

```tsx
// app/tools/page.tsx （Server Component）
import { toolsRepository } from '@yuruyuriy/core/data/toolsRepository';

export default async function ToolsPage() {
  const tools = await toolsRepository.getTools();
  return (
    <ul>
      {tools.map((t) => <li key={t.slug}><a href={t.href}>{t.name}</a></li>)}
    </ul>
  );
}
```

> `getTools()` を `async` にしておくのがコツ。第1段階では中身が同期でも、
> シグネチャを非同期にしておけば第2段階の `fetch` 化でページ側の変更が不要になる。

---

## 第2段階が来たときにやること（このI/Fを守った場合）

「参照データをもとにしたシステム」を作る段になったら、状況に応じて：

### ケースA：読み取り専用のまま（ランキング表示・データビューア等）

- 実は**第2段階すら不要**。`data/*.json` をビルドごとに生成/更新すればよい。
- データが増える場合は、外部ソース（スプレッドシート/CMS/生成スクリプト）から
  ビルド時に `data/*.json` を吐く仕組みにするだけ。フロントは静的なまま、SEOも維持。

### ケースB：書き込み・更新・認証が必要

1. API用サーバを用意（Xserver VPS / 外部ホスト / PHP+MySQL 等。言語は自由）
2. `toolsRepository` の実装を **`fetch('https://api.example.com/...')` に差し替え**
3. **ページ側は無改修**。CORS・認証・レート制限などのセキュリティ対策はこのAPI層に集約
4. スマホアプリは同じ `core` の I/F（同じ `getTools()`）を呼ぶ → **Web/スマホで挙動一致**

### 全面移行を選ぶ場合

- Static Export をやめて Node ホストへ移せば、同じNext.jsコードのまま
  SSR/ISR/Route Handler（APIルート）が使える。`core` と `data/` はそのまま流用可能。

---

## この章のチェックリスト

- [ ] ページから `data/*.json` を**直接importしていない**（必ずrepository経由）
- [ ] repositoryのメソッドが `Promise` を返す（非同期シグネチャ）
- [ ] データ型が `packages/core/src/data/types.ts` に定義され、Web/スマホで共有できる
- [ ] 「実体（JSON/API）」を差し替えても呼び出し側が変わらない構造になっている
