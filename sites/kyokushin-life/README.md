# 《極真人生》官網原始碼交接

本資料夾是既有介紹官網的完整靜態前端來源與素材，供 Claude 獨立審查。這次只交付既有檔案，沒有改網站內容、主遊戲或線上存取權限。

## 取得來源

- Repository：`a58045555/ikontaiwan`
- 分支：`collab/website-source`
- 官網目錄：`sites/kyokushin-life/`
- 獨立交接文件：repository 根目錄的 `docs/CLAUDE-WEBSITE-HANDOFF.md`

在已有 repository 的環境可執行：

```sh
git fetch origin collab/website-source
git switch --create claude/website-review origin/collab/website-source
cd sites/kyokushin-life
node check-site.cjs
node preview.cjs
```

若目前分支有未儲存工作，請使用獨立 checkout 或 worktree，避免覆蓋其他工作。`preview.cjs` 使用 `127.0.0.1:18771`；若埠已使用，可改用另一個靜態伺服器提供 `dist/`。不需 npm 安裝或 build。

## 已交付檔案

- `dist/index.html`、`dist/style.css`、`dist/app.js`：完整頁面、樣式與互動。
- `dist/assets/`：現有全部六張圖片／圖示。`sensei.webp` 是舊素材，現行頁面使用女生 `dojo-guide.webp`；保留檔案不表示要恢復舊圖或 sensei 文案。
- `check-site.cjs`：腳本語法、靜態連結與素材、ID／ARIA 等檢查。
- `preview.cjs`：本機靜態預覽。
- `guide-artwork.md`：既有女生導覽插圖製作說明。
- `.gitignore`：本機檔案排除設定。
- `SOURCE-MANIFEST.json`：交付來源檔案的長度、Git blob SHA 與 SHA-256，供確認程式與二進位素材一致。

沒有包含原 Sites checkout 的 `.git/`、`.openai/`、帳號設定或部署憑證。這些不是檢視與修改靜態官網所需的檔案；線上發佈由原 Sites 專案處理。

## 審查範圍

前面的主遊戲已另外交接。本輪只審查官網文案、視覺、手機排版、導覽、頁籤、可及性與遊戲入口連結；不修改主遊戲機制、反應組手邏輯或人物換畫風試作。

官網不要使用 sensei 稱呼，保留女生道場導覽圖。故事頁籤是固定的介紹示例，不是讀取玩家存檔的結語。請把官網現有宣傳內容與最新主遊戲核對，不要把網站上的舊版本標籤當成目前主遊戲版本。

官網線上網址可能回覆 403，因為它仍有帳號存取限制。**程式與圖片已在本分支，可直接從來源啟動預覽，不必等線上頁面開放或使用者上傳 zip。**

請回報重現步驟、問題位置、修改內容與驗證結果；無 Sites 部署工具時交回 commit／diff，不要宣稱已發佈。
