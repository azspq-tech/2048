import { Tile } from './Tile';
import type { Grid, TileInfo } from '../hooks/useGame';

interface BoardProps {
  grid: Grid;
  tiles: TileInfo[];
  gridSize: number;
}

export function Board({ tiles, gridSize }: BoardProps) {
  const gap = gridSize === 3 ? 'gap-2.5 md:gap-3' : gridSize === 5 ? 'gap-1 md:gap-1.5' : 'gap-1.5 md:gap-2';

  return (
    <div className="relative w-full aspect-square max-w-[450px] mx-auto">
      {/* Background grid cells */}
      <div
        className={`absolute inset-0 grid ${gap} rounded-xl md:rounded-2xl bg-slate-800/90 backdrop-blur-sm p-2 md:p-2.5 border border-slate-700/50 shadow-2xl shadow-black/40`}
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        }}
      >
        {Array.from({ length: gridSize * gridSize }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg md:rounded-xl bg-slate-700/40"
          />
        ))}
      </div>

      {/* Tiles layer */}
      <div className="absolute inset-0 p-2 md:p-2.5">
        {tiles.map(tile => (
          <Tile key={tile.id} tile={tile} gridSize={gridSize} />
        ))}
      </div>
    </div>
  );
}
