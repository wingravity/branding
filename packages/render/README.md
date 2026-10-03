# render

Internal. Turns an HTML page into a PNG through the Chrome already on
the machine, so the repo has no npm dependencies.

| Export | Does |
| :--- | :--- |
| `screenshot({ html, width, height, outPath, scale })` | PNG. `scale` is the device scale factor, so 2 renders at 2x without touching CSS. |
| `findChrome()` | Chrome, Chromium, Edge or Brave in the usual macOS and Linux places, or `CHROME_PATH`. |
| `ROOT` | The repo root. Scratch pages go to `.tmp/` under it. |
| `tokens`, `wordmark`, `symbol`, `appIcon`, `fontFaces`, `logoPath` | Re-exported from `@wingravity/brand`, so a generator needs one import. |
