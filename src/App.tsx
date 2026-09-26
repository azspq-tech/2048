import { useState, useCallback, useRef, useEffect } from 'react';
import { useGame } from './hooks/useGame';
import { useAudio } from './hooks/useAudio';
import { useSwipe } from './hooks/useSwipe';
import { Board } from './components/Board';
import { Header } from './components/Header';
import { StatusBanner } from './components/StatusBanner';

export default function App() {
  const game = useGame(4);
  const audio = useAudio();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const prevScoreRef = useRef(game.score);
  const prevStatusRef = useRef(game.status);

  // Sound effects based on game events
  useEffect(() => {
    if (!soundEnabled) {
      prevScoreRef.current = game.score;
      prevStatusRef.current = game.status;
      return;
    }

    if (game.status === 'won' && prevStatusRef.current !== 'won') {
      audio.playWin();
    } else if (game.status === 'lost' && prevStatusRef.current !== 'lost') {
      audio.playLose();
    } else if (game.score > prevScoreRef.current && game.status === 'playing') {
      audio.playMerge(game.score - prevScoreRef.current);
    } else if (game.lastMoveDirection && game.score === prevScoreRef.current && game.status === 'playing') {
      audio.playMove();
    }

    prevScoreRef.current = game.score;
    prevStatusRef.current = game.status;
  }, [game.score, game.status, game.lastMoveDirection, soundEnabled, audio]);

  const handleMove = useCallback((dir: 'up' | 'down' | 'left' | 'right') => {
    if (game.status !== 'playing') return;
    game.handleMove(dir);
  }, [game.status, game.handleMove]);

  const { onTouchStart, onTouchEnd } = useSwipe(handleMove);

  const handleRestart = useCallback(() => {
    game.restart();
  }, [game.restart]);

  const handleToggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  const isOverlay = game.status === 'paused' || game.status === 'won' || game.status === 'lost';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-3 md:p-4 selection:bg-violet-500/30">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-[500px] flex flex-col items-center gap-3 md:gap-4">
        <Header
          score={game.score}
          highScore={game.highScore}
          gridSize={game.gridSize}
          status={game.status}
          soundEnabled={soundEnabled}
          combo={game.combo}
          onSetGridSize={game.setGridSize}
          onRestart={handleRestart}
          onTogglePause={game.togglePause}
          onToggleSound={handleToggleSound}
        />

        {/* Game area with overlay */}
        <div className="relative w-full">
          <div
            className="w-full select-none"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <Board
              grid={game.grid}
              tiles={game.tiles}
              gridSize={game.gridSize}
            />
          </div>

          {/* Overlay for game states */}
          {isOverlay && (
            <StatusBanner
              status={game.status}
              combo={game.combo}
              targetValue={game.targetValue}
              onContinue={game.continueAfterWin}
              onRestart={handleRestart}
            />
          )}
        </div>

        {/* Instructions */}
        <div className="text-center space-y-1 mt-1">
          <p className="text-slate-500 text-xs">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono">↑↓←→</kbd>
            {' '}or{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono">WASD</kbd>
            {' '}to move • Swipe on mobile
          </p>
          <p className="text-slate-600 text-[10px]">
            Merge tiles to reach 2048!
          </p>
        </div>
      </div>
    </div>
  );
}
