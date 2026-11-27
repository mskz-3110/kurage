# Kurage

<p align="center"><img src="docs/readme/logo.png" alt="Kurage" width="160"></p>

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

### ブラウザで試す

[![GitHub Codespaces で開く](https://github.com/codespaces/badge.svg)](https://codespaces.new/mskz-3110/kurage?quickstart=1)

GitHub Codespaces を使えば、ローカル環境にインストールせずにブラウザから試せます。

セットアップスクリプトが環境の違いを吸収し、必要な開発環境を構築します。

(コンテナのビルド時間：約3分)

### pnpm でインストール

```bash
pnpm add kurage
```

### 単一バイナリで利用

GitHub Releases から単一バイナリをダウンロードして利用できます。

[GitHub Releases](https://github.com/mskz-3110/kurage/releases)

## クイックスタート

基本的なコマンドの使い方をデモで紹介します。

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

Markdown コメントで指定したファイルの内容を埋め込みます。

ファイルを指定するとファイルを更新し、標準入力を使う場合は変換結果を標準出力に出力します。

### JavaScript API

パッケージをインポートすると、コマンド実行、ファイル操作、ログ、時間計測などの API を利用できます。

`kurage` と `$` は、グローバル変数として利用できます。

`$out` は外部コマンドの標準出力を文字列で返します。

```js
import kurage from 'kurage';

const output = await kurage.$out(['node', '--version']);
kurage.logger.out(output);
```

## ライセンス

[Apache-2.0](LICENSE)
