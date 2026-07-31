# AGENTS.md — coding-agent handoff for `thoxos-yolo-benchmark`

Assumes no prior THOX context. Small repo — 30 tracked files, nine of which are
model weights.

---

## 0. Two things that make this repo unusual

1. **It is PUBLIC.** Every other ThoxOS-family repository is private. Anything
   you add here is published — no internal notes, no unreleased product detail,
   no keys, no customer names.
2. **It mixes licences.** The code is **MIT**; the nine bundled YOLO `.onnx`
   weights in `public/models/` are **AGPL-3.0 (Ultralytics)**. Both are
   committed and served from this public repo. Do not copy this bundling pattern
   into a product repository — THOX treats AGPL-3.0 as disqualifying where a
   product must stay private or commercial.

---

## 1. Purpose and ecosystem frame

In-browser **YOLO ONNX model benchmarking** on **ONNX Runtime Web**, with WebGPU
and WASM backends, styled with the ThoxOS design system.

It measures warm-up time, current inference time, and a rolling average; charts
models side by side; accepts a drag-and-dropped custom `.onnx` model; and exports
benchmark history as CSV.

Built on [`nomi30701/yolo-onnx-benchmark-web`](https://github.com/nomi30701/yolo-onnx-benchmark-web),
with the UI matched to ThoxOS Web Edition and ThoxOS Mini.

**This is a benchmarking/demo tool.** It is not device software and ships in no
ThoxOS product.

### Upstream / downstream / data boundaries

- **Upstream:** ONNX Runtime Web; Ultralytics YOLO weights (AGPL-3.0); the
  `nomi30701` benchmark app it derives from; the ThoxOS design tokens
  (originating in `thoxos-webby-edition`).
- **Downstream:** none. A leaf tool.
- **Data boundaries:** everything runs in the browser. **No backend, no
  telemetry, no Supabase, no account.** Uploaded models never leave the page —
  preserve that; it is the reason users will drag proprietary weights in.

### Bundled models

| Model | Input | Params | mAP₅₀₋₉₅ |
|---|---|---|---|
| YOLO12-S / YOLO12-N | 640 | 9.3M / 2.6M | 48.0 / 40.6 |
| YOLO11-M / S / N | 640 | 20.1M / 9.4M / 2.6M | 51.5 / 47.0 / 39.5 |
| YOLOv10-S / N | 640 | 7.2M / 2.3M | 46.3 / 38.5 |
| YOLOv8-S / N | 640 | 11.2M / 3.2M | 44.9 / 37.3 |

---

## 2. Architecture

```
src/
  main.jsx                    React entry
  App.jsx                     the benchmark app
  index.css                   ThoxOS design system — dark-first, emerald accent,
                              Chakra Petch display font
  components/StatusBar.jsx    backend / device status
  components/InfoPanel.jsx    model + metric detail
  utils/inference_worker.js   ONNX Runtime Web worker — the measurement path
public/
  models/*.onnx (9)           AGPL-3.0 Ultralytics weights
  models/LICENSE.txt          their licence
  manifest.json, icon.svg, favicon.svg, thox-wordmark-white.png
docs/
vite.config.js
```

**`src/utils/inference_worker.js` is the only file where measurement correctness
lives.** Everything else is presentation. Benchmark numbers are the product here,
so changes to that file need more care than their size suggests.

---

## 3. Build, test, run — exactly

```bash
npm install
npm run dev       # vite
npm run build     # vite build
npm run preview
npm run lint      # eslint .
```

WebGPU needs Chrome/Edge 113+; the WASM backend works more widely and is the
comparison baseline.

**There is no test suite and no CI workflow.** `npm run lint` is the only
automated check. Any claim that a change is correct rests on running it in a
browser — do that, and say which backend and browser you used.

---

## 4. Current state

**Works:** WebGPU and WASM benchmarking, warm-up/current/rolling-average metrics,
the comparison chart, custom `.onnx` upload, CSV export, and the ThoxOS styling.

**Gaps:**
- No tests, no CI.
- Nine ONNX files are committed to git — the repository is heavy to clone and the
  weights are versioned as blobs rather than fetched.
- Benchmark methodology is not documented: iteration counts, warm-up policy,
  and whether timing excludes pre/post-processing all matter for comparability
  and are only discoverable by reading the worker.
- No pinned ONNX Runtime Web version is called out in the docs; runtime version
  materially changes results.

---

## 5. Prioritized next tasks

1. **Document the benchmark methodology** — warm-up count, measured iterations,
   what the timer includes, and the ONNX Runtime Web version. Without this the
   published numbers are not reproducible or comparable, which is the whole point
   of a benchmark.
2. **Record the runtime version alongside every result** (and in the CSV export),
   so historical results stay meaningful across upgrades.
3. **Add CI** running `npm run lint` and `npm run build`.
4. **Consider fetching weights instead of committing them** — it shrinks the repo
   and makes the AGPL boundary cleaner.
5. **Verify WebGPU numerical output**, not just timing. A sibling THOX WebGPU
   surface shipped silently-wrong results on a quantised model; a benchmark that
   times an incorrect computation is worse than no benchmark. Compare WebGPU and
   WASM detections on a fixed image and assert they agree.
6. Re-audit the public/private boundary before each push (§0).

---

## 6. Gotchas

- **Public repository.** See §0.
- **AGPL-3.0 weights in an MIT repo.** See §0. Do not propagate the pattern.
- **WebGPU results are not comparable across runtime versions or GPUs.** Always
  report both.
- **Timing is the deliverable.** Changes to `inference_worker.js` invalidate
  previously published numbers — say so when you make one.
- **Uploaded models must never leave the browser.** No upload endpoint, ever.
- Repos on this machine live under `V:`, not `C:\Users\tommy\dev`.

---

## 7. Conventions

**THOX defaults (fleet-wide):** Rust for systems, SwiftUI iOS 17+/macOS 14+ for
Apple, **TypeScript + Next.js 14 App Router** for web, Supabase over Firebase
where a backend is needed, **secrets in environment variables only** and never
committed.

**This repo deviates:** it is **JavaScript + React + Vite**, inherited from the
upstream benchmark app. Match the existing style rather than migrating — the
value is in the measurement path, not the framework.

Other local conventions:
- ThoxOS design system: dark-first, emerald accent, Chakra Petch display font.
  Style via `src/index.css`, not ad-hoc colours.
- Licence MIT for code; keep `public/models/LICENSE.txt` accurate for weights.
- Attribute the upstream project (`nomi30701/yolo-onnx-benchmark-web`) in any
  substantial rework.

---

## 8. Supabase contract — not applicable

For orientation: the unified THOX Supabase project is `rtaktyshnzbjktdyeemg`,
magic-link auth, Apple redirect `ai.thox.meshstack://auth-callback`, MeshStack
devices under RLS.

**This tool has no backend and no account by design** — and it is public, so it
should never hold a project ref or key of any kind. Route MeshStack work to
`THOX_MeshStack` or `meshstack-backend`.
