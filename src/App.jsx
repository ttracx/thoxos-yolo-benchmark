import { useEffect, useRef, useState, useCallback } from "react";
import { Chart, registerables } from "chart.js";
import StatusBar from "./components/StatusBar.jsx";
import InfoPanel from "./components/InfoPanel.jsx";

Chart.register(...registerables);

const BUILTIN_MODELS = [
  { value: "yolo12s", label: "yolo12s — 9.3M" },
  { value: "yolo12n", label: "yolo12n — 2.6M" },
  { value: "yolo11m", label: "yolo11m — 20.1M" },
  { value: "yolo11s", label: "yolo11s — 9.4M" },
  { value: "yolo11n", label: "yolo11n — 2.6M" },
  { value: "yolov10s", label: "yolov10s — 7.2M" },
  { value: "yolov10n", label: "yolov10n — 2.3M" },
  { value: "yolov8s", label: "yolov8s — 11.2M" },
  { value: "yolov8n", label: "yolov8n — 3.2M" },
];

function App() {
  const [benchmarkHistory, setBenchmarkHistory] = useState([]);
  const [currentBenchmark, setCurrentBenchmark] = useState({
    warmUpTime: "0.00",
    inferenceTime: "0.00",
    avgInferenceTime: "0.00",
    status: "Model Not Loaded",
  });
  const [isRunning, setIsRunning] = useState(false);
  const [selectedModels, setSelectedModels] = useState([]);
  const [customModels, setCustomModels] = useState([]);
  const [inferenceTimes, setInferenceTimes] = useState([]);
  const [showInfo, setShowInfo] = useState(false);
  const [backend, setBackend] = useState("wasm");
  const [selectedModel, setSelectedModel] = useState("yolo12s");
  const [inferenceCount, setInferenceCount] = useState(100);

  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const workerRef = useRef(null);

  // Initialize chart and worker
  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      chartInstanceRef.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: [],
          datasets: [
            {
              label: "Warm Up Time (ms)",
              data: [],
              backgroundColor: "rgba(245, 158, 11, 0.7)",
              borderColor: "rgb(245, 158, 11)",
              borderWidth: 1,
              borderRadius: 6,
            },
            {
              label: "Avg Inference Time (ms)",
              data: [],
              backgroundColor: "rgba(16, 185, 129, 0.7)",
              borderColor: "rgb(16, 185, 129)",
              borderWidth: 1,
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: { color: "#a1a1aa" },
              grid: { color: "rgba(255, 255, 255, 0.06)" },
            },
            x: {
              ticks: { color: "#a1a1aa" },
              grid: { color: "rgba(255, 255, 255, 0.06)" },
            },
          },
          plugins: {
            legend: {
              labels: { color: "#e4e4e7", font: { family: "Inter, sans-serif" } },
            },
          },
        },
      });
    }

    const worker = new Worker(
      new URL("./utils/inference_worker.js", import.meta.url),
      { type: "module" }
    );

    worker.onmessage = function (e) {
      const { type, warmUpTime, inferenceTime, status } = e.data;

      if (type === "status" || type === "warmup") {
        setCurrentBenchmark((prev) => ({
          ...prev,
          warmUpTime: warmUpTime.toFixed(2),
          status: status,
        }));
        if (type === "warmup") {
          setInferenceTimes([]);
        }
      } else if (type === "inference") {
        setInferenceTimes((prev) => {
          const newTimes = [...prev, inferenceTime];
          const avgTime =
            newTimes.reduce((a, b) => a + b, 0) / newTimes.length;

          setCurrentBenchmark((prevBenchmark) => ({
            ...prevBenchmark,
            warmUpTime: warmUpTime.toFixed(2),
            inferenceTime: inferenceTime.toFixed(2),
            avgInferenceTime: avgTime.toFixed(2),
            status: status,
          }));

          return newTimes;
        });
      } else if (type === "complete") {
        setIsRunning(false);
        setCurrentBenchmark((prev) => ({
          ...prev,
          status: status,
        }));
      } else if (type === "error") {
        setIsRunning(false);
        setCurrentBenchmark({
          warmUpTime: "0.00",
          inferenceTime: "0.00",
          avgInferenceTime: "0.00",
          status: status,
        });
      }
    };

    workerRef.current = worker;

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const handleStartBenchmark = useCallback(async () => {
    setIsRunning(true);
    setInferenceTimes([]);

    setCurrentBenchmark({
      warmUpTime: "0.00",
      inferenceTime: "0.00",
      avgInferenceTime: "0.00",
      status: "Starting Benchmark…",
    });

    const model_path = selectedModel.startsWith("blob:")
      ? selectedModel
      : `${window.location.origin}${window.location.pathname}models/${selectedModel}.onnx`;

    workerRef.current.postMessage({
      model_path: model_path,
      backend: backend,
      inferenceCount: parseInt(inferenceCount),
    });
  }, [selectedModel, backend, inferenceCount]);

  const handleUploadModel = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const fileName = file.name.replace(".onnx", "");
      const fileUrl = URL.createObjectURL(file);
      setCustomModels((prev) => [
        ...prev,
        { name: fileName, url: fileUrl },
      ]);
      setSelectedModel(fileUrl);
    }
  }, []);

  const handleAddPerformance = useCallback(() => {
    const modelLabel =
      [...customModels].find((m) => m.url === selectedModel)?.name ??
      BUILTIN_MODELS.find((m) => m.value === selectedModel)?.label ??
      selectedModel;

    const newEntry = {
      id: Date.now(),
      backend,
      model: modelLabel,
      warmUp: currentBenchmark.warmUpTime,
      avgInference: currentBenchmark.avgInferenceTime,
      inferenceCount: inferenceTimes.length,
      timestamp: new Date().toLocaleString(),
    };

    setBenchmarkHistory((prev) => [...prev, newEntry]);
    setSelectedModels((prev) => [...prev, newEntry]);

    if (chartInstanceRef.current) {
      chartInstanceRef.current.data.labels.push(`${modelLabel}\n(${backend})`);
      chartInstanceRef.current.data.datasets[0].data.push(
        parseFloat(currentBenchmark.warmUpTime)
      );
      chartInstanceRef.current.data.datasets[1].data.push(
        parseFloat(currentBenchmark.avgInferenceTime)
      );
      chartInstanceRef.current.update();
    }
  }, [currentBenchmark, inferenceTimes, backend, selectedModel, customModels]);

  const handleRemoveModel = useCallback((id) => {
    setSelectedModels((prev) => {
      const index = prev.findIndex((m) => m.id === id);
      if (index !== -1 && chartInstanceRef.current) {
        chartInstanceRef.current.data.labels.splice(index, 1);
        chartInstanceRef.current.data.datasets[0].data.splice(index, 1);
        chartInstanceRef.current.data.datasets[1].data.splice(index, 1);
        chartInstanceRef.current.update();
      }
      return prev.filter((m) => m.id !== id);
    });
  }, []);

  const handleExportHistory = useCallback(() => {
    if (benchmarkHistory.length === 0) return;
    const headers = "Timestamp,Model,Backend,Warm Up (ms),Avg Inference (ms),Runs\n";
    const rows = benchmarkHistory
      .map(
        (e) =>
          `"${e.timestamp}","${e.model}","${e.backend}","${e.warmUp}","${e.avgInference}","${e.inferenceCount}"`
      )
      .join("\n");
    const csv = headers + rows;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "thoxos-yolo-benchmark-history.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [benchmarkHistory]);

  return (
    <div className="flex h-dvh flex-col bg-gray-950 text-gray-100">
      <StatusBar
        isRunning={isRunning}
        backend={backend}
        onToggleInfo={() => setShowInfo(!showInfo)}
      />

      {showInfo ? (
        <InfoPanel onClose={() => setShowInfo(false)} />
      ) : (
        <div className="scrollbar-custom flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
            {/* Empty state / welcome */}
            {benchmarkHistory.length === 0 && !isRunning && (
              <div className="rounded-xl border border-dashed border-white/15 px-6 py-12 text-center">
                <h2 className="font-display text-base font-semibold text-gray-200">
                  ThoxOS YOLO Benchmark
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">
                  Benchmark YOLO ONNX models in-browser with WebGPU and WASM
                  backends. Select a model, choose a backend, and start
                  benchmarking.
                </p>
              </div>
            )}

            {/* Settings Panel */}
            <section className="thox-card rounded-xl border border-white/10 bg-gray-900/50 p-4">
              <h3 className="font-display text-sm font-semibold text-gray-200">
                Model Settings
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {/* Backend */}
                <label className="flex flex-col gap-1">
                  <span className="font-mono text-xxs text-gray-400">
                    Backend
                  </span>
                  <select
                    value={backend}
                    onChange={(e) => setBackend(e.target.value)}
                    disabled={isRunning}
                    className="rounded-lg border border-white/15 bg-black/30 px-3 py-1.5 font-mono text-xs text-gray-100 outline-hidden focus:border-emerald-500/60 disabled:opacity-50"
                  >
                    <option value="wasm">WASM (CPU)</option>
                    <option value="webgpu">WebGPU</option>
                  </select>
                </label>

                {/* Model */}
                <label className="flex flex-col gap-1">
                  <span className="font-mono text-xxs text-gray-400">
                    Model
                  </span>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    disabled={isRunning}
                    className="rounded-lg border border-white/15 bg-black/30 px-3 py-1.5 font-mono text-xs text-gray-100 outline-hidden focus:border-emerald-500/60 disabled:opacity-50"
                  >
                    {customModels.map((model, index) => (
                      <option key={index} value={model.url}>
                        {model.name} (custom)
                      </option>
                    ))}
                    {BUILTIN_MODELS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Inference count */}
                <label className="flex flex-col gap-1">
                  <span className="font-mono text-xxs text-gray-400">
                    Inference Count
                  </span>
                  <input
                    type="number"
                    value={inferenceCount}
                    onChange={(e) => setInferenceCount(e.target.value)}
                    min={1}
                    max={1000}
                    step={10}
                    disabled={isRunning}
                    className="rounded-lg border border-white/15 bg-black/30 px-3 py-1.5 font-mono text-xs text-gray-100 outline-hidden focus:border-emerald-500/60 disabled:opacity-50"
                  />
                </label>
              </div>
            </section>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleStartBenchmark}
                disabled={isRunning}
                className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-40"
              >
                {isRunning ? "Running…" : "Start Benchmark"}
              </button>
              <button
                type="button"
                onClick={handleAddPerformance}
                disabled={
                  isRunning ||
                  currentBenchmark.status === "Model Not Loaded"
                }
                className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-gray-300 hover:border-emerald-500/50 hover:text-emerald-300 disabled:opacity-40"
              >
                Add to Comparison
              </button>
              <button
                type="button"
                onClick={(e) => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = ".onnx";
                  input.onchange = handleUploadModel;
                  input.click();
                }}
                disabled={isRunning}
                className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-gray-300 hover:border-emerald-500/50 hover:text-emerald-300 disabled:opacity-40"
              >
                Upload Model
              </button>
              {benchmarkHistory.length > 0 && (
                <button
                  type="button"
                  onClick={handleExportHistory}
                  className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-gray-300 hover:border-emerald-500/50 hover:text-emerald-300"
                >
                  Export CSV
                </button>
              )}
            </div>

            {/* Current Performance — 3 metric cards */}
            <section className="thox-card rounded-xl border border-white/10 bg-gray-900/50 p-4">
              <h3 className="font-display text-sm font-semibold text-gray-200">
                Current Performance
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <MetricCard
                  label="Warm Up Time"
                  value={currentBenchmark.warmUpTime}
                  unit="ms"
                  color="text-amber-400"
                />
                <MetricCard
                  label="Current Inference"
                  value={currentBenchmark.inferenceTime}
                  unit="ms"
                  color="text-sky-400"
                />
                <MetricCard
                  label="Avg Inference"
                  value={currentBenchmark.avgInferenceTime}
                  unit="ms"
                  color="text-emerald-400"
                />
              </div>

              {/* Status bar */}
              <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-white/10 bg-black/30 px-3 py-2">
                <span
                  className={`size-1.5 rounded-full ${isRunning ? "bg-emerald-400 thox-spinner" : "bg-gray-600"}`}
                />
                <span
                  className={`font-mono text-xxs ${isRunning ? "text-emerald-300" : "text-gray-500"}`}
                >
                  {currentBenchmark.status}
                </span>
              </div>
            </section>

            {/* Chart */}
            <section className="thox-card rounded-xl border border-white/10 bg-gray-900/50 p-4">
              <h3 className="font-display text-sm font-semibold text-gray-200">
                Performance Comparison
              </h3>
              <div className="mt-3" style={{ height: "400px" }}>
                <canvas ref={chartRef}></canvas>
              </div>
            </section>

            {/* Comparison Table */}
            {selectedModels.length > 0 && (
              <section className="thox-card rounded-xl border border-white/10 bg-gray-900/50 p-4">
                <h3 className="font-display text-sm font-semibold text-gray-200">
                  Models in Comparison ({selectedModels.length})
                </h3>
                <div className="mt-3 overflow-x-auto scrollbar-custom">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-left text-xs text-gray-500">
                        <th className="py-2 pr-4 font-mono font-medium">Model</th>
                        <th className="py-2 pr-4 font-mono font-medium">Backend</th>
                        <th className="py-2 pr-4 font-mono font-medium">Warm Up</th>
                        <th className="py-2 pr-4 font-mono font-medium">Avg Inf</th>
                        <th className="py-2 pr-4 font-mono font-medium">Runs</th>
                        <th className="py-2 pr-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedModels.map((model) => (
                        <tr
                          key={model.id}
                          className="border-b border-white/5 hover:bg-white/[0.02]"
                        >
                          <td className="py-2 pr-4 text-gray-200">
                            {model.model}
                          </td>
                          <td className="py-2 pr-4">
                            <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-xxs text-emerald-300">
                              {model.backend}
                            </span>
                          </td>
                          <td className="py-2 pr-4 font-mono text-xs text-amber-400">
                            {model.warmUp} ms
                          </td>
                          <td className="py-2 pr-4 font-mono text-xs text-emerald-400">
                            {model.avgInference} ms
                          </td>
                          <td className="py-2 pr-4 font-mono text-xs text-sky-400">
                            {model.inferenceCount}
                          </td>
                          <td className="py-2 pr-4">
                            <button
                              type="button"
                              onClick={() => handleRemoveModel(model.id)}
                              className="rounded-md border border-white/10 px-2 py-0.5 text-xxs text-gray-400 hover:border-rose-500/40 hover:text-rose-300"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Benchmark History */}
            <section className="thox-card rounded-xl border border-white/10 bg-gray-900/50 p-4">
              <details>
                <summary>
                  <span className="font-display text-sm font-semibold text-gray-200">
                    Benchmark History ({benchmarkHistory.length})
                  </span>
                </summary>
                <div className="mt-3">
                  {benchmarkHistory.length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-500">
                      No benchmark history yet
                    </div>
                  ) : (
                    <div className="overflow-x-auto scrollbar-custom">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/10 text-left text-xs text-gray-500">
                            <th className="py-2 pr-4 font-mono font-medium">Timestamp</th>
                            <th className="py-2 pr-4 font-mono font-medium">Model</th>
                            <th className="py-2 pr-4 font-mono font-medium">Backend</th>
                            <th className="py-2 pr-4 font-mono font-medium">Warm Up</th>
                            <th className="py-2 pr-4 font-mono font-medium">Avg Inf</th>
                            <th className="py-2 pr-4 font-mono font-medium">Runs</th>
                          </tr>
                        </thead>
                        <tbody>
                          {benchmarkHistory.map((entry) => (
                            <tr
                              key={entry.id}
                              className="border-b border-white/5"
                            >
                              <td className="py-2 pr-4 font-mono text-xxs text-gray-500">
                                {entry.timestamp}
                              </td>
                              <td className="py-2 pr-4 text-gray-200">
                                {entry.model}
                              </td>
                              <td className="py-2 pr-4">
                                <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-xxs text-emerald-300">
                                  {entry.backend}
                                </span>
                              </td>
                              <td className="py-2 pr-4 font-mono text-xs text-amber-400">
                                {entry.warmUp}
                              </td>
                              <td className="py-2 pr-4 font-mono text-xs text-emerald-400">
                                {entry.avgInference}
                              </td>
                              <td className="py-2 pr-4 font-mono text-xs text-sky-400">
                                {entry.inferenceCount}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </details>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, unit, color }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/30 p-3 text-center">
      <div className="font-mono text-xxs text-gray-500">{label}</div>
      <div className={`mt-1 font-mono text-2xl font-bold ${color}`}>
        {value}
        <span className="ml-1 text-sm text-gray-600">{unit}</span>
      </div>
    </div>
  );
}

export default App;