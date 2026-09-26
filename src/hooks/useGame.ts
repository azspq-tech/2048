import { useState, useCallback, useEffect, useRef } from 'react';

export type Grid = number[][];
export type Direction = 'up' | 'down' | 'left' | 'right';
export type GameStatus = 'playing' | 'won' | 'lost' | 'paused';

export interface TileInfo {
  value: number;
  id: number;
  row: number;
  col: number;
  isNew?: boolean;
  isMerged?: boolean;
}

let tileIdCounter = 0;
const nextId = () => ++tileIdCounter;

function createEmptyGrid(size: number): Grid {
  return Array.from({ length: size }, () => Array(size).fill(0));
}

function getEmptyCells(grid: Grid): [number, number][] {
  const cells: [number, number][] = [];
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === 0) cells.push([r, c]);
    }
  }
  return cells;
}

function addRandomTile(grid: Grid): { grid: Grid; pos: [number, number] | null } {
  const newGrid = grid.map(row => [...row]);
  const empty = getEmptyCells(newGrid);
  if (empty.length === 0) return { grid: newGrid, pos: null };
  const pos = empty[Math.floor(Math.random() * empty.length)];
  newGrid[pos[0]][pos[1]] = Math.random() < 0.9 ? 2 : 4;
  return { grid: newGrid, pos };
}

function rotateGrid(grid: Grid): Grid {
  const size = grid.length;
  const rotated = createEmptyGrid(size);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      rotated[c][size - 1 - r] = grid[r][c];
    }
  }
  return rotated;
}

function slideLeft(grid: Grid): { grid: Grid; score: number; merged: boolean; mergedPositions: Set<string> } {
  const size = grid.length;
  let score = 0;
  let merged = false;
  const newGrid = createEmptyGrid(size);
  const mergedPositions = new Set<string>();

  for (let r = 0; r < size; r++) {
    const row = grid[r].filter(v => v !== 0);
    const newRow: number[] = [];
    let i = 0;
    while (i < row.length) {
      if (i + 1 < row.length && row[i] === row[i + 1]) {
        const val = row[i] * 2;
        newRow.push(val);
        score += val;
        merged = true;
        i += 2;
      } else {
        newRow.push(row[i]);
        i++;
      }
    }
    for (let c = 0; c < newRow.length; c++) {
      newGrid[r][c] = newRow[c];
    }
    // Track merged positions (approximate - mark cells that have doubled values)
    if (merged) {
      for (let c = 0; c < newRow.length; c++) {
        // Check if this position likely had a merge by checking if value doesn't match original
        if (newRow[c] > 0 && grid[r].includes(newRow[c] / 2)) {
          mergedPositions.add(`${r}-${c}`);
        }
      }
    }
  }

  return { grid: newGrid, score, merged, mergedPositions };
}

function move(grid: Grid, direction: Direction): { grid: Grid; score: number; moved: boolean; merged: boolean } {
  let rotated = grid;
  const rotations: Record<Direction, number> = { left: 0, up: 1, right: 2, down: 3 };
  const times = rotations[direction];

  for (let i = 0; i < times; i++) rotated = rotateGrid(rotated);

  const result = slideLeft(rotated);
  let finalGrid = result.grid;

  const reverseRotations = (4 - times) % 4;
  for (let i = 0; i < reverseRotations; i++) finalGrid = rotateGrid(finalGrid);

  const moved = JSON.stringify(finalGrid) !== JSON.stringify(grid);

  return { grid: finalGrid, score: result.score, moved, merged: result.merged };
}

function canMove(grid: Grid): boolean {
  const size = grid.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === 0) return true;
      if (c + 1 < size && grid[r][c] === grid[r][c + 1]) return true;
      if (r + 1 < size && grid[r][c] === grid[r + 1][c]) return true;
    }
  }
  return false;
}

function hasWon(grid: Grid, target: number): boolean {
  for (const row of grid) {
    for (const cell of row) {
      if (cell >= target) return true;
    }
  }
  return false;
}

function computeTiles(grid: Grid, prevGrid: Grid): TileInfo[] {
  const tiles: TileInfo[] = [];
  const size = grid.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] !== 0) {
        const wasEmpty = prevGrid[r][c] === 0;
        const valueChanged = prevGrid[r][c] !== 0 && prevGrid[r][c] !== grid[r][c];
        tiles.push({
          value: grid[r][c],
          id: nextId(),
          row: r,
          col: c,
          isNew: wasEmpty,
          isMerged: valueChanged,
        });
      }
    }
  }
  return tiles;
}

interface GameState {
  grid: Grid;
  score: number;
  highScore: number;
  status: GameStatus;
  gridSize: number;
  targetValue: number;
  combo: number;
  lastMoveDirection: Direction | null;
  tiles: TileInfo[];
}

export function useGame(initialSize = 4) {
  const gridRef = useRef<Grid>(createEmptyGrid(initialSize));
  
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem('2048_highscore');
    const highScore = saved ? parseInt(saved, 10) : 0;
    let grid = createEmptyGrid(initialSize);
    const r1 = addRandomTile(grid);
    grid = r1.grid;
    const r2 = addRandomTile(grid);
    grid = r2.grid;
    gridRef.current = grid;
    return {
      grid,
      score: 0,
      highScore,
      status: 'playing',
      gridSize: initialSize,
      targetValue: 2048,
      combo: 0,
      lastMoveDirection: null,
      tiles: computeTiles(grid, createEmptyGrid(initialSize)),
    };
  });

  const handleMove = useCallback((direction: Direction) => {
    setState(prev => {
      if (prev.status !== 'playing') return prev;

      const result = move(prev.grid, direction);
      if (!result.moved) return prev;

      const { grid: newGrid } = addRandomTile(result.grid);
      const newScore = prev.score + result.score;
      const newHighScore = Math.max(newScore, prev.highScore);

      if (newHighScore > prev.highScore) {
        localStorage.setItem('2048_highscore', String(newHighScore));
      }

      const won = hasWon(newGrid, prev.targetValue);
      const lost = !canMove(newGrid);

      const tiles = computeTiles(newGrid, prev.grid);
      gridRef.current = newGrid;

      return {
        ...prev,
        grid: newGrid,
        score: newScore,
        highScore: newHighScore,
        status: won ? 'won' : lost ? 'lost' : 'playing',
        combo: result.merged ? prev.combo + 1 : 0,
        lastMoveDirection: direction,
        tiles,
      };
    });
  }, []);

  const restart = useCallback((size?: number) => {
    tileIdCounter = 0;
    const gridSize = size || state.gridSize;
    let grid = createEmptyGrid(gridSize);
    const r1 = addRandomTile(grid);
    grid = r1.grid;
    const r2 = addRandomTile(grid);
    grid = r2.grid;
    gridRef.current = grid;
    setState(prev => ({
      ...prev,
      grid,
      score: 0,
      status: 'playing',
      gridSize,
      combo: 0,
      lastMoveDirection: null,
      tiles: computeTiles(grid, createEmptyGrid(gridSize)),
    }));
  }, [state.gridSize]);

  const togglePause = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: prev.status === 'paused' ? 'playing' : prev.status === 'playing' ? 'paused' : prev.status,
    }));
  }, []);

  const setGridSize = useCallback((size: number) => {
    restart(size);
  }, [restart]);

  const continueAfterWin = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: 'playing',
      targetValue: prev.targetValue * 2,
    }));
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyMap: Record<string, Direction> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right',
      };
      const direction = keyMap[e.key];
      if (direction) {
        e.preventDefault();
        handleMove(direction);
      }
      if (e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        togglePause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove, togglePause]);

  return {
    ...state,
    handleMove,
    restart,
    togglePause,
    setGridSize,
    continueAfterWin,
  };
}
