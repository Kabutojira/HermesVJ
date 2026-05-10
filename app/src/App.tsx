import { useEffect, useMemo, useRef, useState } from 'react';
import { FullscreenPlayer } from './components/FullscreenPlayer';
import { Gallery } from './components/Gallery';
import { EngineBadge } from './components/EngineBadge';
import { DEFAULT_POLL_INTERVAL_MS, startPolling } from './lib/polling';
import { buildRuntimeDocument } from './lib/sketch';
import { fetchManifest, type ManifestSketch, type VisualManifest } from './lib/manifest';

type ViewMode = 'latest' | 'gallery';

function findCurrentSketch(manifest: VisualManifest | null, currentId: string | null): ManifestSketch | null {
  if (!manifest) {
    return null;
  }

  return manifest.sketches.find((sketch) => sketch.id === currentId) ?? null;
}

export default function App() {
  const fullscreenRef = useRef<HTMLDivElement | null>(null);
  const [manifest, setManifest] = useState<VisualManifest | null>(null);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('latest');
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pollingEnabled, setPollingEnabled] = useState(true);

  async function refreshManifest() {
    setIsRefreshing(true);

    try {
      const nextManifest = await fetchManifest();
      setManifest((previousManifest) => {
        const latestChanged = previousManifest?.latest !== nextManifest.latest;
        setCurrentId((previousId) => {
          if (viewMode === 'latest' || previousId === null || latestChanged) {
            return nextManifest.latest;
          }

          return nextManifest.sketches.some((sketch) => sketch.id === previousId)
            ? previousId
            : nextManifest.latest;
        });

        return nextManifest;
      });
      setError(null);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : 'Manifest refresh failed.';
      setError(`${message} Keeping the current visual running.`);
    } finally {
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    void refreshManifest();
  }, []);

  useEffect(() => {
    if (!pollingEnabled) {
      return undefined;
    }

    return startPolling(() => {
      void refreshManifest();
    }, DEFAULT_POLL_INTERVAL_MS);
  }, [pollingEnabled, viewMode]);

  const sketches = manifest?.sketches ?? [];
  const currentSketch = findCurrentSketch(manifest, currentId) ?? (manifest ? findCurrentSketch(manifest, manifest.latest) : null);
  const currentIndex = currentSketch ? sketches.findIndex((sketch) => sketch.id === currentSketch.id) : -1;
  const runtimeDocument = useMemo(
    () => (currentSketch ? buildRuntimeDocument(currentSketch) : null),
    [currentSketch],
  );

  function selectSketch(id: string) {
    setViewMode('gallery');
    setCurrentId(id);
    setError(null);
  }

  function showLatest() {
    if (!manifest) {
      return;
    }

    setViewMode('latest');
    setCurrentId(manifest.latest);
    setError(null);
  }

  function step(direction: -1 | 1) {
    if (currentIndex < 0 || sketches.length === 0) {
      return;
    }

    const nextIndex = (currentIndex + direction + sketches.length) % sketches.length;
    setViewMode('gallery');
    setCurrentId(sketches[nextIndex].id);
  }

  async function enterFullscreen() {
    if (!fullscreenRef.current) {
      return;
    }

    await fullscreenRef.current.requestFullscreen();
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">HermesVJ</p>
          <h1>Live visual display</h1>
          <p className="subtitle">Static GitHub Pages client for sandboxed p5 and Hydra visuals.</p>
        </div>
        <div className="topbar-status">
          <span>{isRefreshing ? 'Refreshing…' : 'Ready'}</span>
          <button className="secondary-button" onClick={() => void refreshManifest()} type="button">
            Refresh latest
          </button>
        </div>
      </header>

      <main className="layout">
        <Gallery currentId={currentSketch?.id ?? null} onSelect={selectSketch} sketches={sketches} />

        <section className="viewer-column">
          <div className="controls-card">
            <div className="controls-row">
              <button className={viewMode === 'latest' ? 'primary-button' : 'secondary-button'} onClick={showLatest} type="button">
                Latest mode
              </button>
              <button className="secondary-button" onClick={() => step(-1)} type="button">
                Previous
              </button>
              <button className="secondary-button" onClick={() => step(1)} type="button">
                Next
              </button>
              <button className="secondary-button" onClick={() => void enterFullscreen()} type="button">
                Fullscreen
              </button>
            </div>
            <div className="controls-row controls-row-wrap">
              <button
                className={pollingEnabled ? 'primary-button' : 'secondary-button'}
                onClick={() => setPollingEnabled((value) => !value)}
                type="button"
              >
                Polling: {pollingEnabled ? '30s' : 'off'}
              </button>
              {currentSketch ? (
                <>
                  <EngineBadge engine={currentSketch.engine} />
                  <span>{currentSketch.title}</span>
                  <span>#{currentIndex + 1}</span>
                </>
              ) : (
                <span>No manifest loaded yet.</span>
              )}
            </div>
            {currentSketch ? <p className="prompt-line">{currentSketch.prompt}</p> : null}
          </div>

          <div className="viewer-card" ref={fullscreenRef}>
            <FullscreenPlayer
              documentHtml={runtimeDocument}
              error={error}
              title={currentSketch?.title ?? 'HermesVJ visual player'}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
