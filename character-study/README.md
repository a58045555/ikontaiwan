# 人物試作 01

使用內建 image_gen 工具，兩張透明背景人物圖。現有遊戲素材只作畫風參考。

## 主角

Use case: stylized-concept. Asset type: transparent full-body 2D pixel-art character sprite for the Traditional Chinese karate life game 極真人生. Input image: style reference only, existing reaction kumite character. Primary request: create a polished new teenage male protagonist age 17 in the SAME chibi pixel JRPG art direction as reference: compact 3-head-tall proportions, large expressive dark eyes, tousled black hair with recognizable side fringe, youthful determined friendly face. Traditional off-white karate gi, WHITE belt tied correctly, bare hands and bare feet, no gloves, no shin guards, no branding or text. Orthodox karate ready stance, knees slightly bent, lead foot forward, relaxed bare fists in a torso-level guard, three-quarter facing viewer-right so he can face a rival. Entire head and feet visible, centered with 10% transparent margin. Clean dark pixel outlines, deliberate square pixels, restrained 16-bit game shading in cream, warm gray, dark indigo and skin tones. Readable at a small portrait thumbnail, detailed enough at 260px height. One character only, no extra poses, no motion trails, no ground shadow, no backdrop, no letters, no frame. Genuine transparent alpha background. Preserve reference's handmade pixel sprite feeling, not smooth anime painting, not 3D rendering.

## 對手

Use case: stylized-concept. Asset type: second transparent full-body 2D pixel-art karate character sprite for 極真人生. Input Image 1: newly made protagonist, STRICT art direction and proportion reference only; Input Image 2: original game rival, thematic reference only. Create ONE distinct teenage male rival age 18, slightly broader shoulders and stockier than protagonist but same 3-head-tall chibi proportions, pixel density, outline weight, face detail and off-white gi shading as Image 1. Short dark reddish-brown hair swept up with trimmed sides, strong thick eyebrows, sharp dark eyes, confident challenging half-smile, clearly a different face from protagonist. BLUE karate belt tied correctly, bare hands, bare feet, no gloves/protectors/branding. Three-quarter karate ready stance facing viewer-LEFT, to face protagonist across the screen; fists raised in a torso-level guard, knees relaxed and lead foot forward. Entire head and feet visible with 10% transparent margins. Clean deliberate square pixels, dark indigo pixel outlines, restrained JRPG 16-bit cream and warm-gray shading; match protagonist's rendering exactly. One figure only, no extra poses, no ground shadow, no backdrop, no text, no logo. Genuine transparent alpha background. No 3D, no smooth anime illustration, no photorealism.

## 範圍

獨立美術展示頁。兩位展示人物，男性 17 歲白帶主角、男性 18 歲藍帶對手。主角與對手命名及台詞屬試作資料，不加入正式劇情。角色卡、組手場景、對話共用同一張人物圖，頭像用 CSS 裁切。組手僅用位移示意，未製作招式逐格動畫，不計勝負、不讀寫存檔。未更動正式遊戲頁面、數值、人物設定或反應組手程式。

## 圖片檔案

assets/hero.webp、assets/rival.webp 為這次新圖，透明背景 WebP。原始 PNG 留在工作區 character-study/。原有素材比較取自主遊戲 HERO_PNG.white 與 PX.rival。對戰場景以 CSS 鏡像讓右側對手面向主角。

## 驗證

已在 390×844 及 320×760 檢查角色卡、新舊素材切換、對手選取、組手位移、防守回饋、劇情說話者切換及鍵盤分頁操作。未見橫向溢出，圖片載入成功，瀏覽器沒有警告或錯誤。主遊戲與反應組手檔案未改動。這是美術呈現試作，沒有聲稱完成招式逐格動畫或真人玩家測試。


## 對手第二版：拉開人物辨識度

使用內建 image_gen，原對手為修改目標，主角僅作同畫風及避免相同長相的參考。保留 18 歲、藍帶、白道服與像素風；改為短平頭、較方臉型、較小眼睛、較深膚色、寬肩厚前臂與低重心前手姿勢。主角圖片、展示數值與對話不變。

最新遊戲用圖：assets/rival-v2.webp（工作區 deploy-game/character-study/assets/rival-v2.webp）。原始 PNG：character-study/rival-v2-source.png。第一版圖片保留，沒有覆寫。

### 第二版完整提示詞

Use case: precise-object-edit. Asset type: replacement full-body transparent pixel-art rival sprite for the game 極真人生. Image 1 is the EDIT TARGET: redesign this rival's identity and stance. Image 2 is the protagonist and is a NEGATIVE IDENTITY REFERENCE: keep the pixel art universe, but make the rival clearly unrelated and instantly distinguishable even at thumbnail size. Primary request: retain an 18-year-old male karate student, off-white karate gi, correctly tied BLUE belt, bare hands, bare feet, true transparent alpha, clean chunky pixel outlines, restrained cream/warm-gray/indigo JRPG shading, full head and feet with similar 10% margins. Replace the current spiky-haired pretty-boy look completely. New rival has very short close-cropped dark hair / flat crew cut, absolutely no long bangs or spikes; warm medium-brown tan skin; a broad SQUARE face and jaw, thick short straight eyebrows, small narrow dark eyes, visibly smaller eyes than protagonist, broad nose, serious closed mouth, no smile. Stocky athletic build, distinctly wider shoulders, thick forearms and neck, power-oriented low stable karate stance. Both knees flexed, torso more side-on, rear fist at lower ribs, front fist extended forward at chest level, a clearly different silhouette from the protagonist's symmetric high guard. Face and whole body three-quarter facing viewer-RIGHT; the game renderer will mirror for opponent placement. Still youthful 18, no beard, no scars, no villain symbolism, no oversized muscles, no accessories, no gloves, no text or logos. Maintain the same quality of intentional square pixels as the input, no smooth anime or 3D. One figure only, no additional poses, no floor or shadow, no backdrop. It must look like a different person, NOT the hero with a different hair or belt color.


## 對手第三版：保留紅棕髮少年感，加強特徵

依使用者回饋，以第一版紅棕髮對手為修改基礎，保留原身形、道服與藍帶。新版增加不對稱上揚髮束及銅紅高光、露額輪廓、較細長的眉眼、偏長的臉型與單邊上揚笑容。角色卡提供「第一版／特徵加強」切換，切換後組手與劇情使用相同版本。主角、展示數值與台詞不變。

目前預設遊戲用圖：assets/rival-v3.webp（工作區 deploy-game/character-study/assets/rival-v3.webp）。原始 PNG：character-study/rival-v3-source.png。第一、二版保留。

本圖使用內建 image_gen 製作。提示詞是生成規格，實際結果以圖片為準。

### 第三版完整提示詞

Use case: precise-object-edit. Asset type: third revision of a transparent full-body pixel-art teenage karate rival for 極真人生. Input image is the EDIT TARGET, the user's preferred FIRST version. Preserve this boy's attractive youthful chibi JRPG feeling, red-brown spiky hair color, slim athletic teenage build, three-head-tall proportions, off-white gi, BLUE belt, bare hands and feet, pose and overall silhouette, pixel density, outline thickness, lighting and cream/indigo shading. The user likes THIS version, so refine his identity rather than replacing him with a stocky adult, buzzcut or square-jawed bruiser. Change ONLY head, facial identity, hair silhouette and subtle expression: a distinctive asymmetric red-brown upswept quiff with one tall copper-highlighted crest and clearly shorter hair at the visible temple, forehead mostly exposed, NO soft shaggy fringe covering forehead. Face slightly longer and leaner with a defined cheek angle and tapered chin, not the protagonist's round big-eyed face. Make eyes clearly narrower almond-shaped (roughly 25 percent less tall), amber-brown irises, confident sharp gaze. Strong sharply angled eyebrows with a small natural gap in the visible eyebrow as a recognizable identity feature, not an injury or scar. Give a mischievous confident one-sided smile, one mouth corner lifted, no beard or adult aging. Keep him appealing, spirited, cocky and youthful. Full body three-quarter facing viewer-RIGHT, as in the original, entirely visible with transparent margin including fingers and toes. Pixel art with intentional square pixels; genuine transparent alpha background. One character only, no background, no extra poses, no text, logos, props, gloves or accessories. Preserve original body and uniform, do not simply recolor the protagonist, do not reproduce his large round eyes or tousled black-hair silhouette.
