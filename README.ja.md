<p align="center"><img src="docs/readme/logo.png" alt="Kurage" width="160"></p>

<p align="center"><a href="https://www.npmjs.com/package/kurage"><img src="https://img.shields.io/npm/v/kurage" alt="npm version"></a> <a href="https://www.npmjs.com/package/kurage"><img src="https://img.shields.io/npm/dw/kurage" alt="npm downloads"></a> <a href="LICENSE"><img src="https://img.shields.io/github/license/mskz-3110/kurage" alt="License"></a></p>

[![Kurage の概要図](docs/readme/overview.png)](docs/readme/overview.png)

## 概要

Kurage は、Node.js と Bun で動作する JavaScript ランタイムツールです。

JavaScript の実行、外部コマンドの実行、JSON 形式での実行結果の取得など、開発やスクリプト作成に役立つ機能を提供します。

## 特徴

- **複数のランタイムに対応** — Node.js と Bun で動作
- **JavaScript をすぐに実行** — コードの評価やファイルの実行に対応
- **外部コマンドを実行** — コマンドの実行結果を JSON 形式で取得可能
- **対話的に利用** — REPL で JavaScript を実行
- **開発支援 API** — ファイル操作、テキスト処理、ログ、時間計測などの機能を提供

## インストール

| 方法 | 手順 |
| --- | --- |
| ブラウザで試す | [![GitHub Codespaces で開く](https://github.com/codespaces/badge.svg)](https://codespaces.new/mskz-3110/kurage?quickstart=1)<br>ローカルにインストールせずに試せます（コンテナのビルド時間：約3分）。 |
| pnpm | `pnpm add kurage` |
| npx | `npx kurage` |
| 単一バイナリ | [GitHub Releases](https://github.com/mskz-3110/kurage/releases) から OS・アーキテクチャに合ったアーカイブを選び、展開します。 |

### 配布アーカイブ

| OS・アーキテクチャ | アーカイブ |
| --- | --- |
| Linux x64 | `kurage-linux-x64.tar.gz` |
| Linux arm64 | `kurage-linux-arm64.tar.gz` |
| Windows x64 | `kurage-windows-x64.zip` |
| macOS arm64 | `kurage-darwin-arm64.tar.gz` |

Linux x64 での展開・実行例:

```bash
tar -xzf kurage-linux-x64.tar.gz
./kurage --version
```

### 必要なバージョン

| ツール | 必要なバージョン |
| --- | --- |
| Node.js | 22.23.4 以上 |
| Bun | 1.4.5 以上 |
| pnpm | 12.23.0 以上 |

## クイックスタート

基本的なコマンドの使い方をデモで紹介します。

| 機能 | コマンド | 説明 |
| --- | --- | --- |
| REPL | `kurage [repl]` | 対話的に JavaScript を実行 |
| コード評価 | `kurage eval <code>` | JavaScript コードを実行 |
| 外部コマンド | `kurage exec <command> [args...]` | 外部コマンドを実行 |
| JSON 出力 | `kurage exec-json <command> [args...]` | 外部コマンドの実行結果を JSON で出力 |
| run | `kurage [run] <file> [args...]` | JavaScript ファイルを実行 |
| 環境情報 | `kurage info-json` | Kurage とプロセスの情報を JSON で出力 |
| ファイル内容を埋め込む | `kurage txcl <files...>` | マーカー範囲にファイル内容を埋め込む |

### 対話的に実行する

![REPL](docs/readme/repl.gif)

```bash
kurage repl
```

REPL で `kurage.logger.out('REPL');` を実行します。

### JavaScript を直接実行する

![eval](docs/readme/eval.gif)

```bash
kurage eval "kurage.logger.out('EVAL');"
```

### 外部コマンドを実行する

![exec](docs/readme/exec.gif)

```bash
kurage exec node -v
```

### JavaScript ファイルを実行する

![run](docs/readme/run.gif)

```bash
kurage run examples/log.js
```

## 便利な機能

### コマンド実行結果を JSON で取得する

![exec-json](docs/readme/exec-json.gif)

```bash
kurage exec-json node --version
```

### 実行環境の情報を取得する

![info-json](docs/readme/info-json.gif)

```bash
kurage info-json
```

### ファイルの内容を処理する

![txcl](docs/readme/txcl.gif)

```bash
kurage txcl README.md
```

`<!-- :< ファイルパス { -->` と `<!-- :} -->` で囲んだ範囲に、指定したファイルの内容を埋め込みます。

````markdown
<!-- :< examples/txcl/engines.json {```json -->
<!-- :}``` -->
````

ファイルを指定すると、そのファイルを更新します。

標準入力を使う場合は、変換結果を標準出力に出力します。

### JavaScript API

パッケージを使う場合は `kurage` をインポートします。

コマンド実行、ファイル操作、ログ、時間計測などの API を利用できます。

`eval`、`run`、REPL では `kurage` と `$` がグローバル変数として利用できます。

`$` はファイル操作などを提供する API です。

たとえば、`eval` や REPL でファイルを読み取って表示できます。

```js
kurage.logger.out($.read('README.md'));
```

インポートした `kurage` の `$out` メソッドは、外部コマンドの標準出力を文字列として返します。

```js
import kurage from 'kurage';

const output = await kurage.$out(['node', '--version']);
kurage.logger.out(output);
```

## ライセンス

[Apache-2.0](LICENSE)
