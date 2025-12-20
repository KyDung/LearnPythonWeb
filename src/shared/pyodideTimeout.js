const DEFAULT_TIMEOUT_MS = 5000;

const toSeconds = (timeoutMs) => Math.max(timeoutMs, 250) / 1000;

const buildTraceScript = (timeoutMs) => `
import sys, time
__codex_start = time.perf_counter()
__codex_limit = ${toSeconds(timeoutMs)}
def __codex_trace(frame, event, arg):
    if time.perf_counter() - __codex_start > __codex_limit:
        raise TimeoutError("Time limit exceeded")
    return __codex_trace
sys.settrace(__codex_trace)
`;

const clearTraceScript = `
import sys
sys.settrace(None)
for _name in ("__codex_start", "__codex_limit", "__codex_trace"):
    if _name in globals():
        del globals()[_name]
`;

export const withPyodideTimeout = (
  pyodide,
  run,
  timeoutMs = DEFAULT_TIMEOUT_MS
) => {
  if (!pyodide) {
    return run();
  }
  pyodide.runPython(buildTraceScript(timeoutMs));
  try {
    return run();
  } finally {
    pyodide.runPython(clearTraceScript);
  }
};

export const isPyodideTimeout = (error) => {
  const message = String(error);
  return (
    message.includes("TimeoutError") || message.includes("Time limit exceeded")
  );
};

export const PYODIDE_TIMEOUT_MS = DEFAULT_TIMEOUT_MS;
