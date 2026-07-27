// ThoxOS Info panel — styled like standalone/components/Settings.svelte
// Shows app info, model list, and license details.

const MODELS = [
  { id: "yolo12s", name: "YOLO12-S", params: "9.3M", map: "48.0" },
  { id: "yolo12n", name: "YOLO12-N", params: "2.6M", map: "40.6" },
  { id: "yolo11m", name: "YOLO11-M", params: "20.1M", map: "51.5" },
  { id: "yolo11s", name: "YOLO11-S", params: "9.4M", map: "47.0" },
  { id: "yolo11n", name: "YOLO11-N", params: "2.6M", map: "39.5" },
  { id: "yolov10s", name: "YOLOv10-S", params: "7.2M", map: "46.3" },
  { id: "yolov10n", name: "YOLOv10-N", params: "2.3M", map: "38.5" },
  { id: "yolov8s", name: "YOLOv8-S", params: "11.2M", map: "44.9" },
  { id: "yolov8n", name: "YOLOv8-N", params: "3.2M", map: "37.3" },
];

export default function InfoPanel({ onClose }) {
  return (
    <div className="scrollbar-custom flex-1 overflow-y-auto px-4 py-5">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-gray-100">
              About
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              In-browser YOLO ONNX model benchmarking with WebGPU and WASM
              backends. Runs entirely in your browser — no server needed.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/15 px-2.5 py-1 text-xs text-gray-300 hover:border-emerald-500/50"
          >
            Done
          </button>
        </div>

        {/* Models section */}
        <section className="rounded-xl border border-white/10 p-4">
          <h3 className="font-display text-sm font-semibold text-gray-200">
            Available Models
          </h3>
          <p className="mt-1 text-xs text-gray-400">
            All models use 640×640 input and opset 12 for WebGPU compatibility.
            Upload custom .onnx files to benchmark your own models.
          </p>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10 text-left text-gray-500">
                  <th className="py-2 pr-4 font-mono font-medium">Model</th>
                  <th className="py-2 pr-4 font-mono font-medium">Params</th>
                  <th className="py-2 pr-4 font-mono font-medium">mAP₅₀₋₉₅</th>
                </tr>
              </thead>
              <tbody>
                {MODELS.map((m) => (
                  <tr key={m.id} className="border-b border-white/5">
                    <td className="py-2 pr-4 text-gray-200">{m.name}</td>
                    <td className="py-2 pr-4 font-mono text-gray-400">
                      {m.params}
                    </td>
                    <td className="py-2 pr-4 font-mono text-emerald-400">
                      {m.map}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Backends */}
        <section className="rounded-xl border border-white/10 p-4">
          <h3 className="font-display text-sm font-semibold text-gray-200">
            Backends
          </h3>
          <ul className="mt-3 flex flex-col gap-2">
            <li className="rounded-lg border border-white/10 p-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-gray-200">WebGPU</span>
                <span className="font-mono text-xxs text-emerald-400">
                  GPU acceleration
                </span>
              </div>
              <p className="mt-1 font-mono text-xxs text-gray-500">
                Uses your device's GPU via WebGPU API. Requires a
                WebGPU-compatible browser.
              </p>
            </li>
            <li className="rounded-lg border border-white/10 p-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-gray-200">WASM (CPU)</span>
                <span className="font-mono text-xxs text-sky-400">
                  CPU fallback
                </span>
              </div>
              <p className="mt-1 font-mono text-xxs text-gray-500">
                WebAssembly backend — works everywhere, but slower than WebGPU.
              </p>
            </li>
          </ul>
        </section>

        {/* Privacy */}
        <section className="rounded-xl border border-white/10 p-4">
          <h3 className="font-display text-sm font-semibold text-gray-200">
            Privacy
          </h3>
          <p className="mt-2 text-xs text-gray-300">
            This app runs entirely in your browser. No model data, inference
            results, or benchmark data is sent to any server. All ONNX models
            are loaded locally and executed via ONNX Runtime Web.
          </p>
        </section>

        {/* License */}
        <section className="rounded-xl border border-white/10 p-4">
          <h3 className="font-display text-sm font-semibold text-gray-200">
            License
          </h3>
          <p className="mt-2 text-xs text-gray-400">
            YOLO models are licensed under AGPL-3.0 (Ultralytics). See
            <code className="ml-1 font-mono text-emerald-400">
              /models/LICENSE.txt
            </code>
            for details.
          </p>
          <p className="mt-3 font-mono text-xxs text-gray-500">
            Copyright (c) 2024-2026 THOX.ai LLC. All rights reserved.
          </p>
        </section>
      </div>
    </div>
  );
}