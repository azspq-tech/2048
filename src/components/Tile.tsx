import { memo } from 'react';
import type { TileInfo } from '../hooks/useGame';

const TILE_COLORS: Record<number, { bg: string; text: string; glow?: string }> = {
  2: { bg: 'bg-slate-200', text: 'text-slate-800' },
  4: { bg: 'bg-amber-100', text: 'text-slate-800' },
  8: { bg: 'bg-orange-300', text: 'text-white' },
  16: { bg: 'bg-orange-400', text: 'text-white' },
  32: { bg: 'bg-orange-500', text: 'text-white' },
  64: { bg: 'bg-red-500', text: 'text-white' },
  128: { bg: 'bg-yellow-400', text: 'text-white', glow: 'shadow-yellow-400/30' },
  256: { bg: 'bg-yellow-500', text: 'text-white', glow: 'shadow-yellow-500/30' },
  512: { bg: 'bg-emerald-400', text: 'text-white', glow: 'shadow-emerald-400/30' },
  1024: { bg: 'bg-emerald-500', text: 'text-white', glow: 'shadow-emerald-500/40' },
  2048: { bg: 'bg-violet-500', text: 'text-white', glow: 'shadow-violet-500/50' },
  4096: { bg: 'bg-purple-600', text: 'text-white', glow: 'shadow-purple-500/50' },
  8192: { bg: 'bg-pink-500', text: 'text-white', glow: 'shadow-pink-500/50' },
};

function getTileStyle(value: number) {
  return TILE_COLORS[value] || { bg: 'bg-gradient-to-br from-fuchsia-500 to-cyan-400', text: 'text-white', glow: 'shadow-fuchsia-500/50' };
}

function getFontSize(value: number, gridSize: number): string {
  if (gridSize === 3) {
    if (value < 100) return 'text-3xl md:text-4xl';
    if (value < 1000) return 'text-2xl md:text-3xl';
    return 'text-xl md:text-2xl';
  }
  if (gridSize === 5) {
    if (value < 100) return 'text-base md:text-lg';
    if (value < 1000) return 'text-sm md:text-base';
    return 'text-xs md:text-sm';
  }
  // Default 4x4
  if (value < 100) return 'text-2xl md:text-3xl';
  if (value < 1000) return 'text-xl md:text-2xl';
  if (value < 10000) return 'text-base md:text-lg';
  return 'text-sm md:text-base';
}

interface TileProps {
  tile: TileInfo;
  gridSize: number;
}

export const Tile = memo(function Tile({ tile, gridSize }: TileProps) {
  const style = getTileStyle(tile.value);
  const fontSize = getFontSize(tile.value, gridSize);

  const animationClass = tile.isNew
    ? 'animate-pop-in'
    : tile.isMerged
    ? 'animate-merge'
    : '';

  const glowClass = style.glow ? `shadow-lg ${style.glow}` : 'shadow-md';

  // Calculate position based on grid size
  // Padding is 8px (p-2), gap varies by size
  const cellPercent = 100 / gridSize;

  return (
    <div
      className={`
        absolute flex items-center justify-center
        rounded-lg md:rounded-xl font-extrabold
        transition-all duration-100 ease-in-out
        ${style.bg} ${style.text} ${fontSize}
        ${animationClass}
        ${glowClass}
      `}
      style={{
        width: `calc(${cellPercent}% - 6px)`,
        height: `calc(${cellPercent}% - 6px)`,
        top: `calc(${tile.row * cellPercent}% + 3px)`,
        left: `calc(${tile.col * cellPercent}% + 3px)`,
      }}
    >
      {tile.value}
    </div>
  );
});
