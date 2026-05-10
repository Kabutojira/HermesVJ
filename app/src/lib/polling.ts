export const DEFAULT_POLL_INTERVAL_MS = 30_000;

export function startPolling(callback: () => void, intervalMs: number): () => void {
  const timer = window.setInterval(callback, intervalMs);
  return () => window.clearInterval(timer);
}
