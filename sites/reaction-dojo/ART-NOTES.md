# 反應組手 美術素材說明（2026-10-22）

## 目前狀態

`dist/assets/` 的兩張圖集是**正式畫質**的像素風版本，人物照使用者提供的凱師範照片（IMG_0437）重畫，
動作依 `POSE-SPEC.md`，提示詞在 `PROMPTS.md`，圖由使用者在 Gemini 產生。

- `art-src/kai-px/`：凱師範 7 張去背 PNG（guard、high/mid/low 的 windup 與 contact）。
- `art-src/fp-px/`：第一人稱 4 張去背 PNG（guard、punch、block、kick）。
- `art-src/gemini/`：Gemini 原始輸出（下段出招單圖、兩張合成圖）。
- `candidates/*-pixel-original.png`：改版前的舊圖集備份。
- `art-src/kai/`、`art-src/first-person/`：先前 Canva 版（已不用，留作紀錄）。

## 重建

```
python3 tools/build-kai-atlas.py art-src/kai-px dist/assets/kai-reference-actions-v8.png
python3 tools/build-fp-atlas.py art-src/fp-px dist/assets/first-person-atlas.png
node verify-training.mjs
```

圖集格子不變（凱師範 3×3，列 0/417/847；第一人稱 2×2），程式碼不用改。
白底原圖去背：從邊緣泛洪去掉純白（min channel ≥ 250），另外去掉面積 ≥ 3000px 的封閉純白區（例如交叉手臂之間的空隙）。
