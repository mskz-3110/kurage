# テストガイド

## 構成

- テストは`tests/`に置き、ファイル名は`<module>.test.js`にする。
- `vitest.config.ts`で`tests/**/*.test.js`を対象にしている。
- テスト対象は通常`dist/`からimportする。ソースの変更を検証するときは、先に`pnpm run build:src`を実行して`dist/`を更新する。
- テスト名は英語で、動作を具体的に表す。関連するテストは`describe`でまとめ、既存テストに合わせて複数の動作は`&`でつなぐ。

## テストの書き方

- 公開されている動作を検証し、実装の内部構造に依存しすぎない。
- 各テストは必要な入力と期待結果が分かるように書く。複数のケースで同じ動作を検証するときは、既存テストに合わせて`forEach`でまとめてもよい。
- Vitestのglobalsが有効なので、`describe`、`it`、`expect`、`vi`は通常importせずに使う。既存のファイルの流儀に合わせる。
- matcherは検証内容を直接表現するものを選ぶ。例: `toBeDefined()`、`toBeInstanceOf(Type)`。
- 実時間への依存や不必要な待機を避ける。時刻を検証する場合は、可能な限り固定値で制御する。

## モックと後片付け

- `vi.spyOn`などのモックは、テストファイルの`afterEach`で`vi.restoreAllMocks()`を呼び、テスト間に影響を残さない。
- `process.argv`、`process.exitCode`、環境変数、cwd、プロパティ記述子などを直接変更した場合は、変更前の値を保存し、`try/finally`などで必ず復元する。
- 登録したLogger handlerやstreamなど、spyの復元だけでは戻らない状態・リソースも明示的に解除する。
- `tests/helpers.js`には複数ファイルで使う`mockProcessExit`と`mockLoggerWrite`がある。共通化でテスト固有の挙動が隠れないよう、重複があり利用意図も共通する場合に限ってヘルパーを追加する。

## ファイルシステムとcwd

- 一時ファイルやディレクトリは、既存テストに合わせてSpellbookのAPIを優先して使う。
- cwdを変更する処理は逐次実行し、テスト終了時に元へ戻す。失敗時にも戻るよう`try/finally`を使う。
- 一時ファイル・ディレクトリはUUIDなどで一意にし、テスト後に削除する。

## 実行

```sh
pnpm run test
```

このコマンドはテスト実行と同時にカバレッジを測定する。測定にはV8 providerを使い、`dist/**/*.js`を対象にして`dist/cli/**`を除外する。結果はターミナルとHTMLレポートに出力され、HTMLレポートは`coverage/index.html`で確認できる。

- Statements、Branches、Functions、Linesの各指標を確認する。
- 未カバー箇所があればHTMLレポートで該当コードと分岐を確認し、意味のある動作を検証するテストを追加する。HTML上の行数・行番号をソースの行数・行番号と混同しない。
- 数値を上げることだけを目的に、実装詳細に依存するテストや意味の薄いテストを追加しない。
- CLIは現在のcoverage対象外。CLIを変更した場合は、カバレッジに含まれていなくても必要な動作確認を行う。

ソース変更後のビルドとテストをまとめて確認する場合:

```sh
pnpm run build:src
pnpm run test
```
