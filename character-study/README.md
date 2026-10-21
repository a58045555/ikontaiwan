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
