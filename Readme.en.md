# TaskBoard-Notify Test Site

[日本語](Readme.md) | English

This repository serves dummy data on GitHub Pages so that **TaskBoard-Notify**, a schedule and task notification app for Windows,
can be tried even without a real server.

**Published at**
- Home page: https://msmsrep.github.io/TaskBoard-Notify/index.en.html (`index.en.html`; Japanese: `index.html`. Screenshots are in `assets/img/`)
- Test site guide: https://msmsrep.github.io/TaskBoard-Notify/test.en.html (`test.en.html`; Japanese: `test.html`)
- Microsoft Store: https://apps.microsoft.com/detail/9n2f619n6d0x?hl=en-US&gl=US

The app has no sources or parsing rules written in its code; it works exactly as the definition file `sources.json` says.
Sources are simply listed one by one under `Sources`, with no distinction between schedules and tasks.
So you can make the app read the data here **just by swapping the definition file**.

## How to use

The easiest way is Settings → "**Add test sources**" in the app.
Two sources that read this site's data are added right away (no download, no authentication).
Your current sources are kept, so remove the test ones with each source's "Delete" when you are done.

> For now, the sources added by "Add test sources" read the Japanese data (`schedule/day.html`, `api/tasks.json`),
> even when the app is shown in English. To read the English data, import
> [sources/sources.pages.en.json](sources/sources.pages.en.json) as described below.

To import a file:

1. In the app, open Settings → "Open definition file" to open `sources.json`
   (`%LOCALAPPDATA%\TaskBoard-Notify\sources.json`; LocalState for the MSIX version)
2. Keep a copy of the original contents, then replace them with the contents of [sources/sources.pages.en.json](sources/sources.pages.en.json) and save
3. Click "Reload" in Settings (no need to restart the app)
4. To go back, restore the copy you kept. Or delete the file and restart; the app starts from a template with 0 sources

Dragging and dropping the file onto the Settings window does the same.
A file that contains **only one source**, like [sources/sources.one.json](sources/sources.one.json),
does not replace your current settings; just that one source is added (replacing one with the same name, if any).

## What is served

English data uses the `.en` file names. Files without an English version are shared with the Japanese data (their titles are in Japanese).

| URL | Format | Contents |
| --- | --- | --- |
| `schedule/day.en.html` | HTML | Daily schedule (English). 12 `.aligned.inCompany` rows from early morning to late night (plus one row that must not be picked up). Same structure as `schedule/day.html` |
| `schedule/day.html` | HTML | Daily schedule (Japanese) |
| `schedule/empty.html` | HTML | A page with 0 items |
| `schedule/custom.html` | HTML | A list structure instead of a table (for in-row selectors) |
| `api/tasks.en.json` | JSON | Task site format (`Response.Data`), English. Same shape and times as `api/tasks.json`. Dates are updated to the current day every day |
| `api/tasks.json` | JSON | Task site format (`Response.Data`), Japanese. Dates are updated to the current day every day |
| `api/tasks-empty.json` | JSON | A response with 0 items |
| `api/tasks-missing-field.json` | JSON | A response missing `CompletionTime` |
| `api/broken.json` | - | A response that is broken as JSON |
| `api/custom-tasks.json` | JSON | A custom format with different field names and array location (`result.list`) |
| `items/detail.en.html` | HTML | The page opened by "Open page" on a toast, for the English data |
| `items/detail.html` | HTML | The page opened by "Open page" on a toast, for the Japanese data |

A URL that does not exist returns 404, so you can use it as is to check "fetch failed".

Definition files:

| File | Contents |
| --- | --- |
| [sources/sources.pages.en.json](sources/sources.pages.en.json) | English version of `sources.pages.json`. Same parsing; names are `Test schedule (GitHub Pages)` / `Test tasks (GitHub Pages)`; it reads the English data and opens `items/detail.en.html` |
| [sources/sources.pages.json](sources/sources.pages.json) | The schedule site / task site parsing rules as they are, with only the URLs pointed at this site (same as the app's "Add test sources"; Japanese data) |
| [sources/sources.custom.json](sources/sources.custom.json) | Checks that a source with different field names and structure can be handled without changing code |
| [sources/sources.one.json](sources/sources.one.json) | Only one source. Checks the behavior of **adding** to the current settings |
| [sources/sources.pleasanter.json](sources/sources.pleasanter.json) | Usage example (Pleasanter API), shown in "Example" on the home page. Edit the URL and site ID before use |

Comments in the definition files other than `sources.pages.en.json` are in Japanese.

## What you can and cannot check

What you can check

- HTML parsing (row CSS selector, column positions, attributes, in-row selectors)
- JSON parsing (path to the array, path to fields, date-time format)
- Placeholders (`{Base}` `{Today}` `{Today:yyyy-MM-dd}`)
- Adding and listing sources one by one (any number under `Sources`)
- How differences are taken (`ReplaceAll` / `OnlyFuture`), toast notifications, and opening pages from notifications
- Error cases (fetch failure on 404, parse failure on broken responses or missing fields, 0 items, unregistered credentials)

What you cannot check (because GitHub Pages serves static files)

- **POST** (`"Method": "POST"` fails), **login** (don't write `"Login"`), **carrying over cookies**
- The contents of a **request body**, such as the task site's filter conditions (`View`)
- **Authentication checks** such as the `Authorization` header (it passes through unchecked)

To check login, POST, cookies or API key contents, use the mock server in the main repository.

```bash
dotnet run --project Tests/TaskBoardNotify.TestConsole -- server
```

## Changing the data

- The HTML pages hold only times (the app fills in the date with `{Today}`). Edit them directly
- JSON containing dates is generated by `tools/generate.mjs` (`api/tasks.json`, `api/tasks.en.json`, `api/custom-tasks.json`)

```bash
node tools/generate.mjs
```

Pushing to `main` makes GitHub Actions regenerate and publish the data. It also runs every day at 05:00 (JST),
keeping the dates in `api/*.json` set to the current day.

## Publishing settings

Set the repository's **Settings → Pages → Build and deployment → Source** to **GitHub Actions**
(`.github/workflows/pages.yml` publishes the site).

If you choose "Deploy from a branch", specify `main` / `(root)`. The files in the repository are served as they are in this case too,
but the dates in the JSON stay at the day they were last generated.

---

All data here is made-up data for testing. It contains no real schedules, tasks or servers.

## Privacy Policy

The App's privacy policy is at [privacy.en.html](privacy.en.html) (Japanese: [privacy.html](privacy.html)).
Published URL: <https://msmsrep.github.io/TaskBoard-Notify/privacy.en.html>

## Support development

The App (TaskBoard-Notify) is developed and operated by an individual. Optional support is welcome to help with ongoing updates and improvements.  
If you would like to help, support through the links below would be a great encouragement.  
(This support is an optional donation with nothing in return; no rewards are offered.)  

- GitHub Sponsors: <https://github.com/sponsors/msmsrep>  
- Ko-fi: <https://ko-fi.com/msmsrep>
