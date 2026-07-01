# MD Editor へようこそ

**Typora** 風のインラインプレビューエディタです。行をクリックすると生のMarkdownが表示されます。

## 機能

- GFM（GitHub Flavored Markdown）準拠
- 外部ライブラリ **不使用**
- 編集行のみ生テキスト表示

## インライン記法

**太字** · *斜体* · ~~打消し~~ · \`code\` · [リンク](https://example.com)

## 画像

通常の画像:

![サンプル画像](https://picsum.photos/seed/mdtype/600/300)

サイズ指定（ \`=幅x高さ\` 形式）:

![サイズ指定画像](https://picsum.photos/seed/small/400/400 =200x200)

サイズ指定（ \`{width=... height=...}\` 形式、%指定も可）:

![サイズ指定画像2](https://picsum.photos/seed/wide/800/300){width=80%}

## タスクリスト

- [x] パーサー実装
- [x] Typora風インライン編集
- [ ] 残りの機能

## コードブロック

\`\`\`js
const greet = name => \`Hello, \${name}!\`;
console.log(greet('world'));
\`\`\`

## テーブル

| 言語 | 速度 | 用途 |
|------|------|------|
| Go   | ⚡ 速い | サーバー |
| Rust | ⚡ 速い | システム |
| JS   | 普通 | ブラウザ |

---

> 引用文は \`>\` で書きます。

## 数式（MathJax）

インライン数式: エネルギーは $E = mc^2$ で表されます。

ブロック数式:

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

## 図表（Mermaid）

\`\`\`mermaid
graph TD
  A[開始] --> B{条件分岐}
  B -->|Yes| C[処理A]
  B -->|No| D[処理B]
  C --> E[終了]
  D --> E[終了]
\`\`\`

## 数式テキスト

水平線の下に何でも書けます。`