// 日付を含むテストデータを「当日(日本時間)」で作り直します。
//
//   node tools/generate.mjs
//
// 作られるファイル
//   api/tasks.json         タスクサイト形式（Response.Data 配列）
//   api/custom-tasks.json  独自形式（result.list 配列）
//
// GitHub Actions（.github/workflows/pages.yml）から毎日実行しているため、
// 公開中のサイトでは CompletionTime / due_date が常にその日の日付になります。
// HTMLのページは時刻しか持たない（日付はアプリ側が {Today} で補う）ので、作り直しは不要です。

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// 実行環境のタイムゾーンに関係なく日本時間の当日を使う
const jst = new Date(Date.now() + 9 * 60 * 60 * 1000);
const y = jst.getUTCFullYear();
const m = jst.getUTCMonth();
const d = jst.getUTCDate();

const pad = (n) => String(n).padStart(2, "0");
const today = `${y}-${pad(m + 1)}-${pad(d)}`;

/** 当日の指定時刻。翌日以降は addDays で指定します（月末の繰り上がりは Date に任せます） */
const at = (hour, minute = 0, addDays = 0) => {
  const t = new Date(Date.UTC(y, m, d + addDays, hour, minute, 0));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}T${pad(t.getUTCHours())}:${pad(t.getUTCMinutes())}:00`;
};

// ---------------------------------------------------------------
// タスクサイト形式 /api/items/{id}/get の応答
//   ArrayPath : Response.Data
//   IssueId / Title / CompletionTime
// ---------------------------------------------------------------
const rows = [
  { IssueId: 3001, Title: "見積書の作成", CompletionTime: at(9, 0) },
  { IssueId: 3002, Title: "月次レポート提出", CompletionTime: at(13, 0) },
  { IssueId: 3003, Title: '問い合わせ対応 "至急"', CompletionTime: at(17, 0) },
  { IssueId: 3004, Title: "棚卸しの準備", CompletionTime: at(10, 30, 1) },
];

const tasks = {
  Id: 0,
  StatusCode: 200,
  Response: {
    Offset: 0,
    PageSize: 200,
    TotalCount: rows.length,
    Data: rows.map((r) => ({
      IssueId: r.IssueId,
      SiteId: 2,
      Title: r.Title,
      Status: 200,
      CompletionTime: r.CompletionTime,
    })),
  },
};

// ---------------------------------------------------------------
// 独自形式（項目名も配列の位置も既定と違うAPI）
//   ArrayPath : result.list
//   id / subject / due_date
// ---------------------------------------------------------------
const custom = {
  status: "ok",
  generated: today,
  result: {
    list: [
      { id: 7001, subject: "月次締め", due_date: `${today} 15:30:00` },
      { id: 7002, subject: "棚卸し", due_date: `${today} 18:00:00` },
      { id: 7003, subject: "備品の発注", due_date: `${today} 20:00:00` },
    ],
  },
};

await mkdir(join(root, "api"), { recursive: true });
await writeFile(join(root, "api", "tasks.json"), JSON.stringify(tasks, null, 2) + "\n", "utf8");
await writeFile(join(root, "api", "custom-tasks.json"), JSON.stringify(custom, null, 2) + "\n", "utf8");

// ---------------------------------------------------------------
// リスト形式のページだけは時刻を日付ごと持っているので、日付を差し替える
//   <span class="when">yyyy/MM/dd HH:mm</span>
// ---------------------------------------------------------------
const customHtmlPath = join(root, "schedule", "custom.html");
const customHtml = await readFile(customHtmlPath, "utf8");
await writeFile(
  customHtmlPath,
  customHtml.replace(
    /(<span class="when">)\d{4}\/\d{2}\/\d{2}( \d{2}:\d{2}<\/span>)/g,
    `$1${y}/${pad(m + 1)}/${pad(d)}$2`
  ),
  "utf8"
);

console.log(`generated for ${today}`);
