# Contributing to ThoxOS YOLO Benchmark

Thank you for your interest in contributing to THOX.ai LLC projects.

## Development Setup

```bash
git clone https://github.com/ttracx/thoxos-yolo-benchmark.git
cd thoxos-yolo-benchmark
npm install
npm run dev
```

## Code Style

- Follow the existing ThoxOS design system tokens defined in `src/index.css`
- Use TailwindCSS v4 classes for styling — do not introduce Bootstrap or other CSS frameworks
- Maintain the dark-first, emerald-accent visual identity
- Use Chakra Petch for display headings, Inter for body, JetBrains Mono for code/metrics
- Controls use `rounded-lg` (12px), containers use `rounded-xl` (16px)
- Hairline borders: `border-white/10` or `border-white/15`
- Focus treatment: `focus:border-emerald-500/60` on inputs

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes, keeping commits focused
3. Ensure `npm run build` succeeds
4. Write clear commit messages
5. Open a PR with a description of what changed and why

## Commit Message Convention

- Use imperative mood: "Add WebGPU backend selector" not "Added"
- Keep the subject line under 72 characters
- Reference issues when applicable: "Fix model loading race (#123)"

## Design System Compliance

All UI changes must conform to the ThoxOS design token system:

- Color: dark-first, true black (#000) root, gray-900 (#0b0b0c) surfaces
- Accent: emerald (#10b981) for all affirmative actions and focus states
- Status: amber for warm-up, sky for current, emerald for average
- Typography: Chakra Petch display, Inter body, JetBrains Mono metrics
- Motion: 150ms fast, 200ms base, 300ms sheet

## THOX.ai LLC

- CTO: Tommy Xaypanya
- CEO: Craig Ross

Copyright (c) 2024-2026 THOX.ai LLC. All rights reserved.