interface ComboBadgeProps {
  combo: number;
}

export function ComboBadge({ combo }: ComboBadgeProps) {
  const active = combo >= 2;

  return (
    <div
      className={`
        relative flex flex-col items-center justify-center
        w-full h-full
        rounded-2xl
        bg-gradient-to-b from-amber-500/10 via-orange-500/10 to-red-500/10
        border border-amber-500/25
        backdrop-blur-sm
        transition-all duration-300 ease-out
        ${active
          ? 'opacity-100 scale-100'
          : 'opacity-0 scale-95 pointer-events-none'
        }
      `}
      aria-hidden={!active}
    >
      {/* Fire icon */}
      <div className="text-3xl md:text-4xl mb-2 animate-pulse">
        🔥
      </div>

      {/* Combo count */}
      <div className="text-3xl md:text-4xl font-black text-amber-300 tabular-nums leading-none">
        {combo}×
      </div>

      {/* Label */}
      <div className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-amber-400/80 mt-2">
        Combo
      </div>

      {/* Glow effect when active */}
      {active && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-amber-500/5 to-transparent pointer-events-none" />
      )}
    </div>
  );
}
