import { forwardRef } from 'react';

interface FullscreenPlayerProps {
  documentHtml: string | null;
  error: string | null;
  isFullscreen: boolean;
  onExitFullscreen: () => void;
  title: string;
}

export const FullscreenPlayer = forwardRef<HTMLDivElement, FullscreenPlayerProps>(function FullscreenPlayer(
  { documentHtml, error, isFullscreen, onExitFullscreen, title },
  ref,
) {
  return (
    <div className={isFullscreen ? 'player-shell is-fullscreen' : 'player-shell'} ref={ref}>
      {documentHtml ? (
        <iframe
          allow="fullscreen"
          allowFullScreen
          className="player-frame"
          sandbox="allow-scripts"
          srcDoc={documentHtml}
          title={title}
        />
      ) : (
        <div className="player-empty">No sketch selected.</div>
      )}
      {isFullscreen ? (
        <button className="fullscreen-exit-button" onClick={onExitFullscreen} type="button">
          Exit fullscreen
        </button>
      ) : null}
      {error ? <div className="player-error">{error}</div> : null}
    </div>
  );
});
