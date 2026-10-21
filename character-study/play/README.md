# 人物遊玩測試（2026-10-21）

目前為 collab/character-art-pilot 審查分支，尚未合併上線。合併後預定試玩網址：https://a58045555.github.io/ikontaiwan/character-study/play/?scene=card

Claude 協作交接：[COLLABORATION.md](COLLABORATION.md)

## 這輪完成什麼

把獨立人物展示接入真正的 v2.7 遊戲流程。新版外觀先套用 15–21 歲男性主角與男性宿敵。兩位角色各有白、橙、藍、黃、綠、茶、黑七種腰帶，黑帶各段共用黑帶圖。頭像維持原有單張角色識別，組手腰帶依實際段位選圖。女性、22 歲後、其他 NPC 與尚未載入的素材沿用原有圖片。

上方可選「主角修行」「宿敵對話」「宿敵對戰」，也能在同一個遊戲狀態切換新版／原有人物。片段均透過原遊戲 startGame 與選擇紀錄重播，沒有硬改能力、對手、勝負或羈絆。共同 seed 為 130650，宿敵均為王承恩；對話與對戰是相同起點的不同選擇分支，不是同一條依序發生的年表。

出招目前使用同一人物預備姿勢搭配原有位移與特效。完整拳踢逐格動作與多表情尚未製作，不把本輪描述成全角色完成。

## 進度如何保護

所有存檔、成就與偏好都在 kyokushin-character-play-v1: 範圍。示範片段另加 demo:；按「我的測試人生」可回到自己的測試人生或開新人生。切換片段不取代自己的測試存檔。正式遊戲、舊 preview 與原有人物展示頁的存檔均不讀寫。試玩頁停用原有流量統計，且不提供獨立 PWA 安裝。

正式 index.html、preview-v2/index.html 和 hanno/index.html 沒有修改。人物外觀、載入、縮圖與位移由 pilot-runtime.js 接入，不改原遊戲核心。build.cjs 可由正式版重建此頁，驗證會檢查移除人物與存檔包裝後的遊戲核心與正式版逐位元一致。

## 驗證

執行 node validation/verify-character-play.cjs。包含共同起點片段的真實重播、男女與四種入門路線狀態一致、19／20／21 舊規則、獨立存檔、七色腰帶格位、女性與成年素材回退、缺圖回退、人物切換不消耗遊戲亂數，以及新舊出招人物一致。

另執行既有 verify-release.cjs 的 17 項相容檢查。已在 390×844 和 320×760 瀏覽器檢查頭像、宿敵對話、手動出招、交給本能、片段切換與原有素材切換，未見橫向超出或瀏覽器錯誤。這些驗證不代表已完成真人喜好或辨識度測試。

## 來源與檔案

使用內建 image_gen 製作兩張 4×2 透明背景圖集，前七格依腰帶順序使用，第八格空白。遊戲用 WebP 各為 768×576，七種腰帶共用一張圖集；兩張合計 296164 bytes。原始 PNG 留在工作區 character-play-work/hero-belts-source.png 與 character-play-work/rival-belts-source.png。

遊戲用圖：../assets/hero-belts-v1.webp、../assets/rival-belts-v1.webp。頭像沿用 ../assets/hero.webp 與 ../assets/rival-v3.webp。以下是完整生成提示詞，實際結果以圖集為準。

### 主角圖集

Use case: precise-object-edit. Asset type: ONE production sprite atlas for a 2D pixel-art karate game. Reference is the locked protagonist identity. Make a precise regular 4-COLUMN by 2-ROW grid (8 equal portrait-oriented cells) on a transparent canvas, ideally 1536x1152 pixels, each cell 384x576. COPY the SAME full-body protagonist into the first SEVEN cells, identical black hair, face, white gi, bare hands, feet, stance, pixel shading, size and placement. Change ONLY the karate belt color per cell. Reading order: top row WHITE, ORANGE, BLUE, YELLOW belts; bottom row GREEN, BROWN, BLACK belts, last bottom-right cell completely empty and transparent. Each full figure must fit inside its OWN equal cell with 8 percent clear margin; no clipping or crossing cell boundaries; all characters exactly same height and foot baseline. Keep original youthful three-head chibi pixel-art look, no redesign. Maintain clear shadows on the colored belt and two hanging belt ends. Absolutely no labels, lettering, numbers, grid lines, background, floor, shadow outside figures, logos, extra poses or extra characters. Genuine transparent alpha across whole background. Strict uniform grid and seven different belt colors are critical for code to select the correct belt.

### 宿敵圖集

Use case: precise-object-edit. Asset type: ONE production sprite atlas for a 2D pixel-art karate game. Reference is the locked RED-HAIRED teenage rival identity, keep him exactly like this preferred version: asymmetric copper-red spiky quiff, exposed forehead, narrow eyes, cocky one-sided smile, slim athletic build. Make a strict regular 4-COLUMN by 2-ROW grid (8 equal portrait-oriented cells) on a transparent canvas, ideally 1536x1152 pixels, each cell 384x576. COPY the SAME full-body rival into the first SEVEN cells, identical face, red hair, white gi, bare hands, feet, stance, pixel shading, size and placement. Change ONLY the karate belt color per cell. Reading order: top row WHITE, ORANGE, BLUE, YELLOW belts; bottom row GREEN, BROWN, BLACK belts, last bottom-right cell completely empty and transparent. Every figure three-quarter facing viewer-RIGHT, same as the reference; game code mirrors the opponent. Each full figure must fit inside its OWN equal cell with 8 percent clear margin, no clipping, no crossing boundaries, identical height and foot baseline. Keep the original youthful 3-head chibi pixel style, not square-jawed, not buzzcut, no redesign. Belt color and two hanging ends clear. No labels, letters, numbers, grid lines, background, floor, ground shadow, logos, extra poses or additional characters. Genuine transparent alpha background. Strict grid and seven belt colors are critical for game code.

## 重建

在 repository 根目錄執行 node character-study/play/build.cjs，接著執行 node validation/verify-character-play.cjs。需要更新正式遊戲版本時，先核對新核心、更新基準雜湊、重建並重新執行相容檢查；不可手動分叉遊戲規則。
