# 極真人生・專案說明

以極真空手道中村道場台灣支部為藍本的非官方空手道人生模擬遊戲。全部是靜態網頁（HTML／CSS／JS），手機、電腦瀏覽器都能玩，進度存在玩家自己的瀏覽器。

最後整理：2026-10-26

---

## 1. 網址

| 用途 | 網址 |
|---|---|
| 官網 | https://ikontaiwan.vercel.app/site/ |
| 正式遊戲 | https://ikontaiwan.vercel.app/ |
| 反應組手（15 秒小遊戲） | https://ikontaiwan.vercel.app/hanno/ |
| 反應組手・弟子道場 | https://ikontaiwan.vercel.app/reaction-dojo/ |
| 預覽版（存檔與正式版分開） | https://ikontaiwan.vercel.app/preview-v2/ |
| 比賽測試連結（預覽版） | `preview-v2/?demo=twj`（少年組）、`?demo=tw`（全台）、`?demo=jp`（日本巡迴） |
| 舊網址（會自動轉到新網址） | https://a58045555.github.io/ikontaiwan/ |

- 主機：**Vercel**，專案 `ikontaiwan`，連到 GitHub `a58045555/ikontaiwan` 的 `main`。合併到 `main` 後會自動部署，大約 1 分鐘。
- 舊網址（GitHub Pages）在部分 Wi-Fi 會被擋。每一頁開頭都載入 `migrate.js`：在舊網址打開時，會帶著存檔轉到新網址的同一頁；新網址只補上還沒有的資料，不會覆蓋。舊網址加 `?stay=1` 可以不轉。

---

## 2. 資料夾

| 路徑 | 內容 |
|---|---|
| `index.html` | **正式版遊戲**。由 `preview-v2/index.html` 經 `validation/production-transform.cjs` 轉出，不要直接手改。 |
| `preview-v2/` | **預覽版遊戲**（實際開發的地方）＋示範頁（成年入門、師徒、結語）。 |
| `site/` | 官網（`index.html`、`style.css`、`app.js`、素材）。 |
| `hanno/` | 反應組手（15 秒挑戰、10 位 sensei）。 |
| `reaction-dojo/` | 反應組手・弟子道場（第一人稱、凱師範像素動作、打擊特效可開關）。官網「反應組手」區與頁尾有入口。`practice.html` 與 `index.html` 內容相同。 |
| `reaction-dojo-test/`、`sites/reaction-dojo/` | 弟子道場的測試版（新功能先放這裡試）與原始素材、切圖工具、提示詞。 |
| `free-kumite/`、`free-kumite-combo/` | 自由組手小遊戲與連段測試版（含 three.js 場景）。 |
| `feedback/`、`api/feedback.js` | 試玩回饋表單與 Vercel 函式（存到 Vercel Blob）。 |
| `a/` | 遊戲用的像素圖（主角、對手、場景）。 |
| `beta/`、`character-study/` | 早期搶先試玩與人物美術試作。 |
| `validation/` | 自動驗證腳本、正式版轉換、審查紀錄。 |
| `migrate.js` | 舊網址 → 新網址轉址＋存檔搬家。 |

---

## 3. 遊戲內容（新人生＝規則 33）

**入門時刻**：15 歲青春競技、15 歲終身修行、30 歲成年入門、45 歲第一次入門。

**一年的流程**
- 每半年選一次稽古（抽牌，同一張練越多次越熟練）。
- 隨機事件（🎲 標籤）、升帶審查、道場與弟子。
- **年初排比賽計畫**：第 1 步選比賽，第 2 步選項目（組手／型／兩項）。比賽季到了先出現「🏆 比賽日」頁，按「押忍，上場！」才開打。
  - 全台少年組：15～17 歲、不限帶別，一年 1 個大會。
  - 全台選手權：黃帶、16 歲以上，一年 1 個大會；前兩名取得明年全日本資格。
  - 日本巡迴：取得資格後，一年 4 個大會（國際大會 → 全日本體重別或型 → 全台 → 全日本或世界大賽）。

**組手系統**
- 行動條決定出手順序；時機條在黃色區按下＝時機完美（威力 +12%）。
- 部位克制：力量型怕下段、技術型怕突、速度型怕中段（×1.5／×0.7）。
- **看破**：對手出招時有機會看破，可選擋下（一定成功，傷害剩 30%，並反擊）或迴避（看速度差，成功時不受傷）。
- **招式熟練 Lv**：用 8 次升 Lv2、用 25 次升 Lv3。
- **後天被動技能**（7 個）：銅牆鐵壁、疾風步、鐵拳、看破之眼、不動心、型之心、呼吸法。靠稽古次數、看破、逆轉勝，或隨機事件「老前輩的指點」取得。
- 得意技、黑帶後的必殺技、三冠王、完全製霸。

**介面重點**：新手教學（選好道場後，第一次來會彈窗詢問）、「🎯 你選了…」結果框、角色卡可收合、手機上一個畫面放得下整個對戰。

---

## 4. 規則版本（存檔相容）

每次改變遊戲結果的修改都會開新規則號。**舊人生永遠照它開始時的規則重播**，新規則只用在新開的人生。驗證腳本用雜湊鎖住每個舊規則的人生，確保一個字都不變。

| 規則 | 內容 |
|---|---|
| 19～21 | v2.7 以前的正式版規則 |
| 22 | 成長調整（v2.7 正式版） |
| 23 | 老化、道場主傷勢痊癒 |
| 24 | 每年只選一個比賽目標（日本巡迴算一個） |
| 25 | 日本巡迴含全台；全台前二可接著打同年全日本 |
| 26 | 台灣只保留全台選手權（取消支部交流賽） |
| 27 | 看破 |
| 28 | 招式熟練 Lv |
| 29 | 後天被動技能 |
| 30 | 全台少年組 |
| 31 | 一年只打一個大會（已停用，只保留給當時開始的人生） |
| 32 | 年初比賽計畫，比賽季自動報名 |
| **33** | 全台選手權計畫只打全台；前二取得明年全日本（**目前新人生**） |

---

## 5. 怎麼修改、驗證、上線

1. 改 `preview-v2/index.html`（遊戲邏輯與介面都在這裡）。
2. 轉出正式版：`node -e "const {transformProduction}=require('./validation/production-transform.cjs');const fs=require('fs');fs.writeFileSync('index.html',transformProduction(fs.readFileSync('preview-v2/index.html','utf8')))"`
3. 更新 `validation/verify-release.cjs` 裡兩個檔案的 blob 雜湊（`git hash-object index.html preview-v2/index.html`）。
4. 跑驗證：`node validation/run-preview-checks.cjs` 與 `node validation/verify-release.cjs`（或逐一執行 `validation/verify-*.cjs`）。
5. 開 PR 合併到 `main`，Vercel 自動部署。

要改變遊戲結果時：開新規則號（`GAME_VERSION`＋1、加 `xxxRules()` 判斷、存檔驗證名單加上新號），並在 `verify-review.cjs` 加上前一個規則的雜湊鎖。詳細步驟見 `CLAUDE.md`。

---

## 6. 待辦與已知事項

- [x] **弟子道場**上架：測試版打擊特效併入正式版、修掉頁尾亂碼與缺圖、官網加入口。之後可考慮加段位關卡。
- [ ] 遊戲畫面版本標示仍是 v2.7（官網頁尾已是 LIFE v2.8 / KUMITE v2.2），要不要統一。
- [ ] `validation/verify-preview-mechanics.cjs` 需要 `optimized/v2-test-results.json`，目前缺檔，無法執行（其他驗證都正常）。
- [ ] 部分 Wi-Fi 會擋舊網址 github.io：被擋的網路連轉址都做不到，請大家改用 vercel.app。
- 3D 道場（Three.js）試作過，已作罷並移除，程式留在版本紀錄。
