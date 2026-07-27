# Architecture

## Overview

ThoxOS YOLO Benchmark is a client-side React application that runs YOLO ONNX
model inference benchmarks entirely in the browser using ONNX Runtime Web.
The UI is styled with the ThoxOS design system, matching ThoxOS Web Edition
and ThoxOS Mini.

## Data Flow

```
User selects model + backend + count
         │
         ▼
App.jsx posts message to Web Worker
         │
         ▼
inference_worker.js
  ├── Loads ONNX model via InferenceSession.create()
  ├── Warm-up inference (1 run)
  ├── N inference cycles
  └── postMessage results back per cycle
         │
         ▼
App.jsx receives messages
  ├── Updates currentBenchmark state (warm-up, current, avg)
  ├── Appends to inferenceTimes array
  └── On "complete": re-enables UI
         │
         ▼
User clicks "Add to Comparison"
  ├── Adds to selectedModels + benchmarkHistory
  └── Pushes data to Chart.js bar chart
```

## Components

### App.jsx
Main application shell. Manages all benchmark state, worker lifecycle, and
chart updates. Renders StatusBar + content area (benchmark interface or
InfoPanel).

### StatusBar.jsx
ThoxOS status bar — 30px height, semi-transparent dark background, hairline
border. Shows deployment name, running status pill, and About button.
Matches `standalone/components/StatusBar.svelte` from thoxos-webby-edition.

### InfoPanel.jsx
About/settings panel — shows model list, backend descriptions, privacy info,
and license details. Styled like `standalone/components/Settings.svelte`.

### inference_worker.js
Web Worker that runs ONNX inference. Uses `onnxruntime-web/webgpu` for
WebGPU + WASM backend support. Creates dummy 1×3×640×640 float32 tensors
for inference. Communicates via postMessage with typed events:
- `status` — loading/warming up
- `warmup` — warm-up complete with time
- `inference` — per-cycle result
- `complete` — all runs done
- `error` — failure

## Design System

CSS tokens are defined in `src/index.css` using TailwindCSS v4 `@theme`:
- Neutrals: custom near-black scale (gray-50 through gray-950)
- Brand: emerald triad (#10b981, #34d399, #059669)
- Status: danger, warning, success, info, agentic
- Typography: Inter, JetBrains Mono, Chakra Petch
- Radius: lg (12px) for controls, xl (16px) for containers
- Motion: 150ms fast, 200ms base, 300ms sheet
- Focus: 1px solid rgba(16,185,129,0.55) with 2px offset

## Key Design Decisions

1. **React, not Svelte** — The original yolo-onnx-benchmark-web uses React.
   We keep React to preserve the working inference logic, but replace
   Bootstrap with TailwindCSS + ThoxOS tokens.

2. **Web Worker for inference** — ONNX inference is CPU/GPU intensive and
   would freeze the UI thread. The worker pattern is preserved from the
   original repo.

3. **No external references** — Following ThoxOS standalone principles,
   index.html has no external font CDN, analytics, or icon hosts. Fonts
   are system-installed when available, falling back cleanly.

4. **Relative base path** — `base: "./"` in vite.config.js allows the
   build to be served from any path, including local file:// for
   air-gapped use.

## Provenance

- Inference logic: adapted from [nomi30701/yolo-onnx-benchmark-web](https://github.com/nomi30701/yolo-onnx-benchmark-web)
- Design tokens: synced from [ttracx/thoxos-webby-edition](https://github.com/ttracx/thoxos-webby-edition) `design-tokens/dist/tokens.css`
- UI patterns: modeled after `standalone/components/` from thoxos-webby-edition
- ONNX models: bundled from the original yolo-onnx-benchmark-web repo