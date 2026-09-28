import type { GameStatus } from '../hooks/useGame';

interface StatusBannerProps {
  status: GameStatus;
  combo: number;
  targetValue: number;
  onContinue: () => void;
  onRestart: () => void;
}

export function StatusBanner({ status, targetValue, onContinue, onRestart }: StatusBannerProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-20 rounded-xl md:rounded-2xl overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm animate-fade-in" />

      {/* Content */}
      <div className="relative animate-fade-in">
        {/* Paused */}
        {status === 'paused' && (
          <div className="text-center px-8 py-6">
            <div className="text-5xl mb-3">⏸️</div>
            <h2 className="text-2xl font-black text-white mb-1">Paused</h2>
            <p className="text-slate-400 text-sm mb-4">Press Space or tap Resume</p>
            <button
              onClick={onRestart}
              className="px-5 py-2 rounded-xl bg-slate-700/80 text-slate-200 text-sm font-medium hover:bg-slate-600/80 transition-all active:scale-95 border border-slate-600/50"
            >
              Restart Game
            </button>
          </div>
        )}

        {/* Win */}
        {status === 'won' && (
          <div className="text-center px-8 py-6">
            <div className="text-5xl mb-3 animate-bounce">🏆</div>
            <h2 className="text-2xl font-black text-white mb-1">You Win!</h2>
            <p className="text-violet-200 text-sm mb-4">
              You reached <span className="font-bold text-violet-300">{targetValue}</span>!
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={onContinue}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all active:scale-95"
              >
                Keep Going →
              </button>
              <button
                onClick={onRestart}
                className="px-5 py-2.5 rounded-xl bg-slate-700/80 text-slate-200 font-medium text-sm hover:bg-slate-600/80 transition-all active:scale-95 border border-slate-600/50"
              >
                New Game
              </button>
            </div>
          </div>
        )}

        {/* Lose */}
        {status === 'lost' && (
          <div className="text-center px-8 py-6">
            <div className="text-5xl mb-3">💀</div>
            <h2 className="text-2xl font-black text-white mb-1">Game Over</h2>
            <p className="text-red-200/80 text-sm mb-4">No more moves available</p>
            <button
              onClick={onRestart}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-sm shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all active:scale-95"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
