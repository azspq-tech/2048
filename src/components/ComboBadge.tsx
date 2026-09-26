interface ComboBadgeProps {
  combo: number;
}

export function ComboBadge({ combo }: ComboBadgeProps) {
  const active = combo >= 2;

  return (
    <div
      className={`
        flex flex-col items-center justify-center
        w-full h-full min-h-[400px]
        rounded-2xl
        bg-gradient-to-b from-amber-500/10 via-orange-500/10 to-red-500/10
        border border-amber-500/30
        backdrop-blur-sm
        transition-all duration-300 ease-out
        ${active ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
      `}
      aria-hidden={!active}
    >
      <div className="text-4xl mb-2">🔥</div>
      <div className="text-3xl font-black text-amber-300 tabular-nums">{combo}×</div>
      <div className="text-xs font-bold uppercase tracking-wider text-amber-400/80 mt-1">Combo</div>
    </div>
  );
}
