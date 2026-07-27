// ThoxOS StatusBar — matches standalone/components/StatusBar.svelte
// Shows deployment name, backend status, and settings toggle.

export default function StatusBar({ isRunning, backend, onToggleInfo }) {
  const mode = isRunning
    ? { label: "Benchmarking…", tone: "ok" }
    : { label: "Ready", tone: "ok" };

  const toneClass = {
    ok: "border-emerald-500/50 text-emerald-300",
    bad: "border-rose-500/50 text-rose-300",
  }[mode.tone];

  return (
    <header className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-2.5">
      <div className="flex items-baseline gap-2">
        <span className="font-display text-sm font-semibold text-gray-100">
          ThoxOS Web
        </span>
        <span className="font-mono text-xxs text-gray-500">YOLO Benchmark</span>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-xxs ${toneClass}`}
        >
          <span
            className={`size-1.5 rounded-full bg-current ${isRunning ? "thox-spinner" : ""}`}
            aria-hidden="true"
          />
          {mode.label}
        </span>

        <button
          type="button"
          onClick={onToggleInfo}
          className="rounded-lg border border-white/15 px-2.5 py-1 text-xs text-gray-300 transition-colors hover:border-emerald-500/50 hover:text-emerald-300"
        >
          About
        </button>
      </div>
    </header>
  );
}