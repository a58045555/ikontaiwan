# 反應組手 美術素材說明（2026-10-22）

## 目前狀態

`dist/assets/` 裡的兩張圖集是**預覽畫質**：由 Canva 產生的 200px 縮圖放大而成，
人物與第一人稱手腳的風格已統一（依使用者提供的凱師範照片 IMG_0437 重畫），
但解析度不足，正式版要用 Canva 裡的原圖重建。

舊的像素風圖集備份在 `candidates/*-pixel-original.png`。

## 重建正式畫質

1. 從下面的 Canva 連結下載去背後的 PNG（原尺寸約 1000px 以上）。
2. 依檔名放到 `art-src/kai/` 與 `art-src/first-person/`（覆蓋 200px 版本）。
3. 執行：

```
python3 tools/build-kai-atlas.py art-src/kai dist/assets/kai-reference-actions-v8.png
python3 tools/build-fp-atlas.py art-src/first-person dist/assets/first-person-atlas.png
node verify-training.mjs
```

圖集格子不變（凱師範 3×3，列 0/417/847；第一人稱 2×2），程式碼不用改。

## Canva 連結（去背版）

| 檔名 | 內容 | Canva |
| --- | --- | --- |
| kai/guard.png | 架勢（三欄共用） | https://www.canva.com/M/MAHYtY06zfc |
| kai/high-windup.png | 上段蓄勢 | https://www.canva.com/M/MAHYtbK8aj4 |
| kai/high-contact.png | 上段出招 | https://www.canva.com/M/MAHYtSS51jg |
| kai/mid-windup.png | 中段蓄勢 | https://www.canva.com/M/MAHYtVXOAj0 |
| kai/mid-contact.png | 中段出招 | https://www.canva.com/M/MAHYtXQMMb4 |
| kai/low-windup.png | 下段蓄勢 | https://www.canva.com/M/MAHYtbXvgC4 |
| kai/low-contact.png | 下段出招 | https://www.canva.com/M/MAHYtWoAXF4 |
| first-person/guard.png | 自己的架勢 | https://www.canva.com/M/MAHYtdv-KZ8 |
| first-person/punch.png | 自己的正拳 | https://www.canva.com/M/MAHYtTOYj4g |
| first-person/block.png | 自己的格擋 | https://www.canva.com/M/MAHYtSUnAjk |
| first-person/kick.png | 自己的踢擊 | https://www.canva.com/M/MAHYtbQvmPk |

未去背原圖：MAHYtXa1nAw、MAHYtZmTgPY、MAHYtQ0F-6I、MAHYtWmkFMs、MAHYte9tiKQ、
MAHYtXzGCts、MAHYtZUMdWA、MAHYtVDOvzs、MAHYtbkCi9g、MAHYtcFNJ10、MAHYtUciBG8。
