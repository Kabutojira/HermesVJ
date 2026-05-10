import type { ManifestSketch } from '../lib/manifest';
import { EngineBadge } from './EngineBadge';

interface GalleryProps {
  currentId: string | null;
  onSelect: (id: string) => void;
  sketches: ManifestSketch[];
}

export function Gallery({ currentId, onSelect, sketches }: GalleryProps) {
  return (
    <aside className="gallery-panel" aria-label="Sketch gallery">
      <div className="gallery-header">
        <h2>Gallery</h2>
        <span>{sketches.length} visual{sketches.length === 1 ? '' : 's'}</span>
      </div>
      <div className="gallery-list">
        {sketches.map((sketch) => (
          <button
            key={sketch.id}
            className={`gallery-card${currentId === sketch.id ? ' active' : ''}`}
            onClick={() => onSelect(sketch.id)}
            type="button"
          >
            <div className="gallery-card-top">
              <strong>{sketch.title}</strong>
              <EngineBadge engine={sketch.engine} />
            </div>
            <div className="gallery-card-meta">{new Date(sketch.created_at).toLocaleString()}</div>
            <div className="gallery-card-prompt">{sketch.prompt}</div>
          </button>
        ))}
      </div>
    </aside>
  );
}
