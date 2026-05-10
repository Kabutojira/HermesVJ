import type { SketchEngine } from '../lib/manifest';

interface EngineBadgeProps {
  engine: SketchEngine;
}

export function EngineBadge({ engine }: EngineBadgeProps) {
  return <span className={`engine-badge engine-${engine}`}>{engine}</span>;
}
