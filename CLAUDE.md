# 開發守則（給接手的人與 AI）

先讀 `PROJECT.md`（網址、資料夾、規則版本、待辦）。

## 修改遊戲
- 只改 `preview-v2/index.html`。`index.html` 由 `validation/production-transform.cjs` 轉出，兩邊必須一致。
- 部分檔案的行尾是 CRLF：用工具改檔時保留原本的換行（Python 用 `open(..., newline='')`）。
- 每次改完都要更新 `validation/verify-release.cjs` 裡兩個 blob 雜湊（`git hash-object index.html preview-v2/index.html`）。

## 存檔與規則版本（最重要）
- 人生用 seed＋選擇紀錄重播，任何會改變結果的修改（亂數次數、選項順序、數值、提示畫面的增減）都會讓舊存檔壞掉。
- 這類修改一律開新規則：`GAME_VERSION`＋1，新增 `xxxRules(){return !!S&&Number(S.setup.v)>=N;}`，把新邏輯包在判斷裡；`validateSave` 的允許名單加上 N。
- 改之前先記下前一個規則四種入門的人生雜湊（seed 246810），在 `validation/verify-review.cjs` 加雜湊鎖測試，再加新規則本身的測試。
- 同步更新 `verify-dramatic`、`verify-growth`、`verify-mentors`、`verify-release` 裡的版本號，以及 README 的存檔段落。
- 只改顯示（CSS、文字、版面、不影響選項的提示）不用開新規則。

## 驗證
- `node validation/run-preview-checks.cjs`、`node validation/verify-release.cjs`，或逐一跑 `validation/verify-*.cjs`。
- `verify-preview-mechanics.cjs` 目前缺 `optimized/v2-test-results.json`，可以略過。
- 介面修改用 Playwright 在 390×664（手機）截圖確認；預覽版測試連結 `preview-v2/?demo=twj|tw|jp`。

## 上線
- PR 合併到 `main` 後 Vercel 自動部署（專案 `ikontaiwan`）。
- 新頁面要在 `<head>` 最前面加 `<script src="../migrate.js"></script>`（依層級調整路徑），舊網址才會轉過來。

## 其他
- 不捏造分數或比賽結果；平衡數字用模擬實際算出來。
- 美術是像素風，不要寫實。
