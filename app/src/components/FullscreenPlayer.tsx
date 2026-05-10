interface FullscreenPlayerProps {
  documentHtml: string | null;
  error: string | null;
  title: string;
}

export function FullscreenPlayer({ documentHtml, error, title }: FullscreenPlayerProps) {
  return (
    <div className="player-shell">
      {documentHtml ? (
        <iframe
          allow="fullscreen"
          className="player-frame"
          sandbox="allow-scripts"
          srcDoc={documentHtml}
          title={title}
        />
      ) : (
        <div className="player-empty">No sketch selected.</div>
      )}
      {error ? <div className="player-error">{error}</div> : null}
    </div>
  );
}
