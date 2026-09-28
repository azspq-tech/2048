import { GameStatus } from '../hooks/useGame';

interface HeaderProps {
  score: number;
  highScore: number;
  gridSize: number;
  status: GameStatus;
  soundEnabled: boolean;
  combo: number;
  onSetGridSize: (size: number) => void;
  onRestart: () => void;
  onTogglePause: () => void;
  onToggleSound: () => void;
}

export function Header({
  score,
  highScore,
  gridSize,
  status,
  soundEnabled,
  combo,
  onSetGridSize,
  onRestart,
  onTogglePause,
  onToggleSound,
}: HeaderProps) {
  const comboActive = combo >= 2;

  return (
    <header className="w-full max-w-[450px] mx-auto space-y-3">
      {/* Title and Logo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-amber-400 flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-sm">2048</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            2048
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onToggleSound}
            className="w-9 h-9 rounded-lg bg-slate-700/80 backdrop-blur border border-slate-600/50 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-600/80 transition-all active:scale-95"
            title={soundEnabled ? 'Mute' : 'Unmute'}
          >
            {soundEnabled ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            )}
          </button>
          <button
            onClick={onTogglePause}
            className={`w-9 h-9 rounded-lg backdrop-blur border flex items-center justify-center transition-all active:scale-95 ${
              status === 'paused'
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                : 'bg-slate-700/80 border-slate-600/50 text-slate-300 hover:text-white hover:bg-slate-600/80'
            }`}
            title={status === 'paused' ? 'Resume' : 'Pause'}
          >
            {status === 'paused' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            )}
          </button>
          <button
            onClick={onRestart}
            className="w-9 h-9 rounded-lg bg-slate-700/80 backdrop-blur border border-slate-600/50 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-600/80 transition-all active:scale-95"
            title="Restart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
        </div>
      </div>

      {/* Score Row */}
      <div className="flex gap-2 items-stretch">
        <div className="flex-1 rounded-xl bg-slate-800/80 backdrop-blur border border-slate-700/50 px-3 py-2 text-center">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Score</div>
          <div className="text-xl font-black text-white tabular-nums">{score.toLocaleString()}</div>
        </div>
        <div className="flex-1 rounded-xl bg-slate-800/80 backdrop-blur border border-slate-700/50 px-3 py-2 text-center">
          <div className="text-[10px] uppercase tracking-wider text-amber-400/80 font-medium">Best</div>
          <div className="text-xl font-black text-amber-300 tabular-nums">{highScore.toLocaleString()}</div>
        </div>
      </div>

      {/* Grid Selector + Combo Badge Row */}
      <div className="flex items-center justify-between gap-2">
        {/* Left: Grid controls */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Grid:</span>
          <div className="flex gap-1">
            {[3, 4, 5].map(size => (
              <button
                key={size}
                onClick={() => onSetGridSize(size)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                  gridSize === size
                    ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
                    : 'bg-slate-700/80 text-slate-300 hover:bg-slate-600/80 border border-slate-600/50'
                }`}
              >
                {size}×{size}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Combo Badge - always rendered, opacity-only toggle for zero layout shift */}
        <div
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-full
            bg-slate-800/80 backdrop-blur-sm
            border border-amber-500/30
            transition-opacity duration-300 ease-out
            ${comboActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}
          aria-hidden={!comboActive}
        >
          <span className="text-sm leading-none">🔥</span>
          <span className="text-amber-300 font-bold text-xs tabular-nums whitespace-nowrap">
            {combo}× Combo!
          </span>
        </div>
      </div>
    </header>
  );
}
