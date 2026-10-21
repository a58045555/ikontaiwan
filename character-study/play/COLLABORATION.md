# Codex × Claude 協作交接：極真人生人物遊玩測試

日期：2026-10-21（台灣）
專案：https://github.com/a58045555/ikontaiwan
審查分支：collab/character-art-pilot
主分支基準：6d4330777f71b280d7be00204918e740a9a4b289
人物試玩實作提交：97d6ab4e426d7de75fd17de7f4bf0ffa274dc68e

## 使用者目前要什麼

使用者希望 Codex 與 Claude 協作。這輪目標是讓已試作的人物進入真正遊戲流程，先做可審查、可操作的小範圍試裝。優先保留使用者喜歡的第一版少年感，再增加人物辨識度。新對手方向是紅棕刺髮、露額、不對稱髮束、較細長眉眼與有挑釁感的笑容；不採用短平頭、方臉、壯碩版本。

使用者已授權例行程式修改與測試自主執行，但希望收到遊戲內容、數值、故事與介面改動報告。開場、成年開場留到最後。不要把 85 或 95 分當作已驗證的完成度；目前沒有真人喜好測試數據。

## 目前狀態

- main 仍在 6d4330777f71b280d7be00204918e740a9a4b289；這輪人物遊玩改動尚未合併或發布到正式 Pages。
- 已公開的人物比較頁：https://a58045555.github.io/ikontaiwan/character-study/?v=3
- 主遊戲：https://a58045555.github.io/ikontaiwan/?v=27-pace
- 分支內的新試玩頁路徑：character-study/play/index.html。README 所列試玩公開網址是合併後的預定網址；目前請由分支啟動本機伺服器。
- 原本人物比對頁已增加「進遊戲試玩」連結，同樣要隨這輪一起合併才會公開。
- 正式 index.html、preview-v2/index.html、hanno/index.html 沒有修改。

## 本輪實作

1. 原遊戲完整複製為獨立人物試玩頁；人物接入層在 pilot-runtime.js，建置來源另有 pilot.css、pilot-header.html、storage-prefix.js、fixtures.json 與 build.cjs。
2. 先套用 15–21 歲男性主角及男性宿敵。女性、22 歲後、其他角色與缺圖情形回退原有素材。
3. 主角與宿敵各有一張 4×2 透明圖集，前七格為白／橙／藍／黃／綠／茶／黑帶，第八格空白。黑帶各段共用黑帶圖，不假裝完成段位條紋。
4. 同一人物出招繼續使用新人物的預備姿勢，配合原有位移與特效；完整拳踢逐格動畫及多表情尚未製作。
5. 提供主角修行、宿敵訊息與宿敵對戰三個真正可重播的 checkpoint。共同 seed=130650、宿敵=王承恩；對話與對戰來自同起點的不同選擇分支，不是連續時間線。
6. 新版／原有人物切換只改呈現，不改能力、戰鬥規則或選擇紀錄。
7. 存檔等資料限定 kyokushin-character-play-v1:；示範另加 demo:。自己的試玩存檔與示範分開，正式版、preview 的存檔不讀寫。
8. 試玩頁停用原有流量統計、移除 PWA manifest；導覽提供跳至片段與返回選單。
9. 切換片段清理巡禮及戰鬥暫態；示範省略首次戰鬥遮罩，原有「怎麼打」說明保留，自己的試玩人生仍有原教學。

## 請 Claude 優先讀的檔案

- character-study/play/pilot-runtime.js：圖集、頭像、出招、載入、進度切換的接入層。
- character-study/play/storage-prefix.js：正常與 demo 的儲存隔離。
- character-study/play/build.cjs：由正式版重建試玩頁。
- character-study/play/fixtures.json：真實選擇紀錄；不可偷偷提升能力或任意替換對手。
- validation/verify-character-play.cjs：43 項人物試玩專用檢查。
- character-study/play/README.md：範圍、限制、資產路徑與內建 image_gen 的完整提示詞。
- .github/workflows/preview-checks.yml：接入原有回歸檢查的設定。

產出的 index.html 約 1.58 MB，適合核對生成結果，不建議直接手改。先修改來源檔案，再重建。

## 可以重現的檢查

在 repository 根目錄，使用 Node 24：

    node character-study/play/build.cjs
    node validation/verify-character-play.cjs
    node validation/verify-release.cjs

本機已通過 43 項人物試玩專用檢查與 17 項正式版相容檢查。前者驗證移除呈現及儲存包裝後的遊戲核心與正式版逐位元一致、性別及四條入門路線的選擇／狀態一致、舊規則 19–21、正常／demo／正式資料隔離、出招鍵與素材回退，以及人物呈現不消耗遊戲亂數。

完整既有回歸由草稿 PR 的 GitHub Actions 執行，請以該 PR 的實際結果為準，不能把尚未執行的 CI 說成通過。

本機可用任何靜態伺服器將 repository 根目錄當成網站根目錄；例如已有 Python 時執行：

    python -m http.server 18767 --bind 127.0.0.1

接著開：

    http://127.0.0.1:18767/character-study/play/?scene=card

原工作區已有 hanno-qa/server.cjs，會將 deploy-game 當根目錄。外部 Claude 無法透過自己的 localhost 連到使用者這台電腦，因此請在自己的 checkout 啟動伺服器。

## 已做的瀏覽器檢查與還沒證明的事

已在 390×844、320×760 檢查人物頭像、宿敵對話、素材切換、真實手動出招、交給本能、勝利後繼續、片段切換與回到自己試玩人生；未看到橫向溢出或瀏覽器錯誤。

尚未完成：真人辨識度／喜好測試、女性及其他年齡新圖、完整出招逐格動畫、師兄弟與 sensei 新圖、多表情。自動檢查不能證明玩家覺得好玩。

## 希望 Claude 怎麼審查

請作為獨立審查者，先找具體問題，不需要沿用 Codex 的結論。

優先檢查：
- 不同腰帶的格位、左右朝向、裁切及小頭像可讀性。
- 出招、升帶、年齡或性別切換時是否變回錯誤角色。
- 圖片延遲／失敗、快速切換片段、教學及巡禮殘留狀態。
- demo、自己試玩、正式版、preview 的儲存隔離。
- 同一套選擇是否保持相同能力、事件、勝負與亂數。
- 建置來源是否足夠維護，測試是否真的涵蓋風險。
- 偏好的少年感是否保留，主角與宿敵是否仍過於相似；請區分觀察與個人喜好。

每個問題請附：嚴重度、檔案與行號、可重現步驟、實際／預期結果、修正建議及應補的檢查。沒有重現或足夠證據的疑慮請標示為待確認。

## 協作規則

- 先審查這個分支與 main 的差異；不要同時直接修改 main。
- 若要修程式，從 collab/character-art-pilot 建立 Claude 自己的修正分支並提出 PR，或提供可套用的 diff 與測試結果。不要強制推送別人的分支。
- 不改既有 seed、選擇紀錄格式、規則版本或正式存檔 key；若認為必須改，先提出原因、遷移方式與驗證。
- 遊戲數值、故事、角色設定或介面行為的提案要清楚列出，方便回報使用者。
- 審查結果由使用者貼回 Codex，或留在這個草稿 PR，才會進入下一輪整合。此文件沒有聲稱已經自動連線或傳訊給 Claude。
