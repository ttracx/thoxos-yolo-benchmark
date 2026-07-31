# ThoxOS Web — YOLO ONNX Benchmark

<!-- THOX-BADGES:START -->
[![Repository](https://img.shields.io/badge/repository-ttracx/thoxos--yolo--benchmark-0B1220)](https://github.com/ttracx/thoxos-yolo-benchmark)
![THOX.ai LLC](https://img.shields.io/badge/owner-THOX.ai%20LLC-00A676)
![Visibility](https://img.shields.io/badge/visibility-public-0B1220)
![License](https://img.shields.io/badge/license-MIT-22c55e)
![Leadership](https://img.shields.io/badge/CTO-Tommy%20Xaypanya-1F6FEB)
![Leadership](https://img.shields.io/badge/CEO-Craig%20Ross-6F42C1)
<!-- THOX-BADGES:END -->

In-browser YOLO ONNX model benchmarking powered by ONNX Runtime Web with WebGPU and WASM backends, styled with the ThoxOS design system.

Built by leveraging [nomi30701/yolo-onnx-benchmark-web](https://github.com/nomi30701/yolo-onnx-benchmark-web) and matching the UI/interface of [ThoxOS Web Edition](https://github.com/ttracx/thoxos-webby-edition) and [ThoxOS Mini](https://github.com/ttracx/thoxos-mini).

## Ecosystem role and canonical status

**Canonical for:** in-browser YOLO/ONNX benchmarking. It is a **benchmarking and
demo tool**, not device software and not part of any shipping ThoxOS surface.

**This is the only PUBLIC repository in the ThoxOS family** — every sibling below
is private. Treat anything added here as published.

| Repo | Relationship |
|---|---|
| [`thoxos-web-edition`](https://github.com/ttracx/thoxos-web-edition) | Browser-native **WebGPU LLM** inference (Transformers.js). The closest technical sibling — same in-browser-inference idea, different runtime and models. |
| [`thoxos-webby-edition`](https://github.com/ttracx/thoxos-webby-edition) | Server-backed chat UI; the design-token source this repo's styling matches. |
| [`thoxos-mini`](https://github.com/ttracx/thoxos-mini) | ThoxOS Mini documentation stub. |
| [`thoxos-emulator`](https://github.com/ttracx/thoxos-emulator) | Desktop device simulator. |

**Not a MeshStack repo.** No Supabase, no cloud account, no device registry, no
backend. Everything runs in the browser.

### ⚠️ Licence composition — read before adding models or reusing code

- **This repository's code is MIT.**
- **The bundled YOLO weights in `public/models/` are AGPL-3.0 (Ultralytics)** —
  nine `.onnx` files, committed and served. See `public/models/LICENSE.txt`.
- The two are different licences travelling in one public repository. THOX
  elsewhere treats AGPL-3.0 as disqualifying for products it needs to keep
  private or commercial, so **do not lift this bundling pattern into a product
  repo**, and do not add further AGPL artifacts here without a deliberate
  decision.

See [`AGENTS.md`](AGENTS.md) for the coding-agent handoff.

## Features

- **WebGPU + WASM backends** — benchmark on GPU or CPU, entirely in-browser
- **Real-time metrics** — warm-up time, current inference, rolling average
- **Interactive comparison chart** — compare models side-by-side
- **Custom model upload** — drag in any .onnx YOLO model
- **Exportable results** — download benchmark history as CSV
- **ThoxOS design system** — dark-first, emerald accent, Chakra Petch display font

## Available Models

| Model | Input Size | Params | mAP₅₀₋₉₅ |
|-------|-----------|--------|----------|
| YOLO12-S | 640 | 9.3M | 48.0 |
| YOLO12-N | 640 | 2.6M | 40.6 |
| YOLO11-M | 640 | 20.1M | 51.5 |
| YOLO11-S | 640 | 9.4M | 47.0 |
| YOLO11-N | 640 | 2.6M | 39.5 |
| YOLOv10-S | 640 | 7.2M | 46.3 |
| YOLOv10-N | 640 | 2.3M | 38.5 |
| YOLOv8-S | 640 | 11.2M | 44.9 |
| YOLOv8-N | 640 | 3.2M | 37.3 |

All models are licensed under AGPL-3.0 (Ultralytics). See `public/models/LICENSE.txt`.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

## Using Custom YOLO Models

1. Export your YOLO model to ONNX format with `opset=12` for WebGPU compatibility:

```python
from ultralytics import YOLO
model = YOLO("path/to/your/model.pt")
model.export(format="onnx", opset=12, dynamic=True)
```

2. Click "Upload Model" in the app and select your .onnx file.

3. Select your model from the dropdown and start benchmarking.

## Tech Stack

- **React 19** + **Vite 6** — UI framework and build tool
- **TailwindCSS 4** — styling with ThoxOS design tokens
- **ONNX Runtime Web** — in-browser inference with WebGPU/WASM
- **Chart.js** — performance comparison charts

## Design System

This app uses the ThoxOS design system tokens from [thoxos-webby-edition](https://github.com/ttracx/thoxos-webby-edition):

- Dark-first identity (true black #000000 root)
- Emerald accent (#10b981) for focus, selection, active states
- Chakra Petch display font, Inter body, JetBrains Mono code
- Controls use radius-lg (12px), containers use radius-xl (16px)
- 30px status bar with semi-transparent dark background
- Hairline borders (rgba(255,255,255,0.08))

## Architecture

```
thoxos-yolo-benchmark/
├── index.html               Entry point, no external references
├── src/
│   ├── main.jsx             React mount
│   ├── index.css            ThoxOS design tokens + TailwindCSS
│   ├── App.jsx              Main benchmark interface
│   ├── components/
│   │   ├── StatusBar.jsx    ThoxOS status bar (matches Web Edition)
│   │   └── InfoPanel.jsx    About/models/backends panel
│   └── utils/
│       └── inference_worker.js  ONNX inference web worker
├── public/
│   ├── models/              Pre-built ONNX models
│   ├── favicon.svg          ThoxOS icon
│   └── manifest.json        PWA manifest
└── docs/
    └── architecture.md      Architecture documentation
```

## Documentation

- [Architecture](docs/architecture.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Security Policy](SECURITY.md)

## THOX.ai LLC

This repository is maintained by THOX.ai LLC.

- Tommy Xaypanya is CTO.
- Craig Ross is CEO.

## Copyright and Legal

Copyright (c) 2024-2026 THOX.ai LLC. All rights reserved.

THOX-specific documentation, configuration, branding, product definitions, and integration work are owned by THOX.ai LLC unless explicitly noted. Third-party dependencies, forks, vendored components, and upstream source materials remain governed by their original licenses and notices.

YOLO models are licensed under AGPL-3.0 by Ultralytics. See `public/models/LICENSE.txt` for details.

This project's MIT license covers the application code only; the bundled ONNX models retain their original AGPL-3.0 license.