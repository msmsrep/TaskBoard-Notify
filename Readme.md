# TaskReminder テストサイト

Windows 用の予定・タスク通知アプリ **TaskReminder** を、接続先が無い場所でも試せるようにするための
ダミーデータを GitHub Pages で配信しています。

**公開先** https://msmsrep.github.io/TaskBoard-Notify-/

アプリ側は接続先も解析方法もコードに書かれておらず、定義ファイル `sources.json` の内容どおりに動きます。
そのため、**定義ファイルを差し替えるだけ**でここのデータを読ませられます。

## 使い方

1. アプリの「設定」→「定義ファイルを開く」で `sources.json` を開く
   （`%LOCALAPPDATA%\TaskReminder\sources.json`、MSIX版は LocalState）
2. 元の内容を控えてから、[sources/sources.pages.json](sources/sources.pages.json) の内容で置き換えて保存
3. 設定画面の「再読み込み」を押す（アプリの再起動は不要）
4. 戻すときは控えた内容に書き戻す。またはファイルを削除して再起動すると App.config から作り直されます

## 配信しているもの

| URL | 形式 | 内容 |
| --- | --- | --- |
| `schedule/day.html` | HTML | 日別予定。`.aligned.inCompany` の行が12件、朝から深夜まで（拾われてはいけない行も1件） |
| `schedule/empty.html` | HTML | 0件のページ |
| `schedule/custom.html` | HTML | 表ではなくリスト構造（行内セレクタ用） |
| `api/tasks.json` | JSON | プリザンター形式（`Response.Data`）。日付は毎日その日に更新 |
| `api/tasks-empty.json` | JSON | 0件の応答 |
| `api/tasks-missing-field.json` | JSON | `CompletionTime` が欠けた応答 |
| `api/broken.json` | - | JSONとして壊れた応答 |
| `api/custom-tasks.json` | JSON | 項目名も配列の位置も違う独自形式（`result.list`） |
| `items/detail.html` | HTML | トーストの「ページを開く」の遷移先 |

存在しないURLは 404 を返すので、そのまま「取得失敗」の確認に使えます。

定義ファイルは2種類置いています。

| ファイル | 内容 |
| --- | --- |
| [sources/sources.pages.json](sources/sources.pages.json) | 既定（業務デザイナー / プリザンター）と同じ解析方法のまま、取得先だけをこのサイトへ向けたもの |
| [sources/sources.custom.json](sources/sources.custom.json) | 項目名も構造も違う相手を、コードを変えずに扱えることの確認用 |

## 確認できること / できないこと

確認できること

- HTMLの解析（行のCSSセレクタ・列位置・属性・行内セレクタ）
- JSONの解析（配列までのパス・項目までのパス・日時の書式指定）
- 置き換え文字（`{Base}` `{Today}` `{Today:yyyy-MM-dd}`）
- 差分の取り方（`ReplaceAll` / `OnlyFuture`）とトースト通知、通知からのページ表示
- 異常系（404での取得失敗、壊れた応答・項目欠損での解析失敗、0件、資格情報の未登録）

できないこと（GitHub Pages は静的配信のため）

- **POST**（`"Method": "POST"` は失敗します）、**ログイン**（`"Login"` は書かない）、**Cookieの引き継ぎ**
- プリザンターの絞り込み条件（`View`）のような**リクエスト本文**の中身の確認
- `Authorization` ヘッダーなど**認証の検証**（送っても素通りします）

ログイン・POST・Cookie・APIキーの中身まで確認したい場合は、本体リポジトリの擬似サーバーを使ってください。

```bash
dotnet run --project Tests/TaskReminder.TestConsole -- server
```

## データを変えたい

- HTMLのページは時刻しか持ちません（日付はアプリ側が `{Today}` で補います）。直接編集してください
- 日付を含むJSONは `tools/generate.mjs` が作ります

```bash
node tools/generate.mjs
```

`main` へ push すると GitHub Actions が生成しなおして公開します。毎日 05:00（JST）にも実行され、
`api/*.json` の日付はその日のものに保たれます。

## 公開の設定

リポジトリの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** にしてください
（`.github/workflows/pages.yml` が公開します）。

「Deploy from a branch」を選ぶ場合は `main` / `(root)` を指定します。この場合もリポジトリ内の
ファイルがそのまま配信されますが、JSONの日付は最後に生成した日のままになります。

---

ここにあるのは動作確認用の作り話のデータです。実在の予定・タスク・接続先は含みません。
