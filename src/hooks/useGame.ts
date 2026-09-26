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

// ============================================================================
// CORE 1D ROW ALGORITHM
// ============================================================================

/**
 * Pure function: Slide and merge a single row to the left.
 * 
 * Step A (Filter/Compress): Remove all zeros, shifting numbers toward index 0.
 * Step B (Sequential Pairwise Merge): 
 *   - Iterate left to right: if adjacent tiles match, combine them (arr[i] * 2)
 *   - Add merged value to score
 *   - Skip next index (non-greedy: merged tile cannot merge again)
 *   - Example: [2, 2, 2, 2] -> [4, 4, 0, 0]
 * Step C (Pad): Re-compress and append zeros until array length is 4.
 * 
 * @param row - Array of numbers (length 4)
 * @returns Object with newRow, score gained, and whether any merge occurred
 */
function slideRow(row: number[]): { newRow: number[]; score: number; merged: boolean } {
  const size = row.length;
  
  // Step A: Filter/Compress - remove all zeros
  const filtered = row.filter(val => val !== 0);
  
  // Step B: Sequential Pairwise Merge
  const merged: number[] = [];
  let score = 0;
  let anyMerged = false;
  let i = 0;
  
  while (i < filtered.length) {
    // Check if current and next tile match
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      // Merge: combine into single tile
      const mergedValue = filtered[i] * 2;
      merged.push(mergedValue);
      score += mergedValue;
      anyMerged = true;
      // Skip next index (non-greedy rule)
      i += 2;
    } else {
      // No merge: keep current tile
      merged.push(filtered[i]);
      i++;
    }
  }
  
  // Step C: Pad - append zeros until length is 4
  const newRow = [...merged];
  while (newRow.length < size) {
    newRow.push(0);
  }
  
  return { newRow, score, merged: anyMerged };
}

// ============================================================================
// GRID TRANSFORMATION HELPERS
// ============================================================================

/**
 * Transpose the grid (swap rows and columns)
 * Used for UP/DOWN movements
 */
function transpose(grid: Grid): Grid {
  const size = grid.length;
  const transposed = createEmptyGrid(size);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      transposed[c][r] = grid[r][c];
    }
  }
  return transposed;
}

/**
 * Reverse each row in the grid
 * Used for RIGHT/DOWN movements
 */
function reverseRows(grid: Grid): Grid {
  return grid.map(row => [...row].reverse());
}

// ============================================================================
// 4-DIRECTION MOVEMENT
// ============================================================================

/**
 * Move the entire board in the specified direction.
 * 
 * Strategy: Normalize all directions to "slide left" using transformations:
 * - LEFT: Apply slideRow directly to every row
 * - RIGHT: Reverse each row → slide left → reverse back
 * - UP: Transpose → slide left → transpose back
 * - DOWN: Transpose → reverse rows → slide left → reverse back → transpose back
 * 
 * @param grid - Current game board
 * @param direction - Direction to move (up/down/left/right)
 * @returns Object with new grid, score gained, whether board changed, and if any merge occurred
 */
function moveBoard(grid: Grid, direction: Direction): { 
  grid: Grid; 
  score: number; 
  moved: boolean; 
  merged: boolean 
} {
  let workingGrid = grid;
  let totalScore = 0;
  let anyMerged = false;
  
  // Transform based on direction
  switch (direction) {
    case 'left':
      // Direct: apply slideRow to each row
      workingGrid = grid.map(row => {
        const result = slideRow(row);
        totalScore += result.score;
        if (result.merged) anyMerged = true;
        return result.newRow;
      });
      break;
      
    case 'right':
      // Reverse → slide left → reverse back
      workingGrid = reverseRows(grid);
      workingGrid = workingGrid.map(row => {
        const result = slideRow(row);
        totalScore += result.score;
        if (result.merged) anyMerged = true;
        return result.newRow;
      });
      workingGrid = reverseRows(workingGrid);
      break;
      
    case 'up':
      // Transpose → slide left → transpose back
      workingGrid = transpose(grid);
      workingGrid = workingGrid.map(row => {
        const result = slideRow(row);
        totalScore += result.score;
        if (result.merged) anyMerged = true;
        return result.newRow;
      });
      workingGrid = transpose(workingGrid);
      break;
      
    case 'down':
      // Transpose → reverse → slide left → reverse back → transpose back
      workingGrid = transpose(grid);
      workingGrid = reverseRows(workingGrid);
      workingGrid = workingGrid.map(row => {
        const result = slideRow(row);
        totalScore += result.score;
        if (result.merged) anyMerged = true;
        return result.newRow;
      });
      workingGrid = reverseRows(workingGrid);
      workingGrid = transpose(workingGrid);
      break;
  }
  
  // Check if board actually changed
  const moved = JSON.stringify(workingGrid) !== JSON.stringify(grid);
  
  return { grid: workingGrid, score: totalScore, moved, merged: anyMerged };
}

// ============================================================================
// TILE SPAWNING
// ============================================================================

/**
 * Spawn a new tile on the board.
 * 90% chance of 2, 10% chance of 4.
 * 
 * @param grid - Current game board
 * @returns Object with new grid and position where tile was spawned (or null if no empty cells)
 */
function spawnTile(grid: Grid): { grid: Grid; pos: [number, number] | null } {
  const newGrid = grid.map(row => [...row]);
  const emptyCells = getEmptyCells(newGrid);
  
  if (emptyCells.length === 0) {
    return { grid: newGrid, pos: null };
  }
  
  // Pick random empty cell
  const pos = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  
  // 90% chance of 2, 10% chance of 4
  const value = Math.random() < 0.9 ? 2 : 4;
  newGrid[pos[0]][pos[1]] = value;
  
  return { grid: newGrid, pos };
}

// ============================================================================
// GAME STATE HELPERS
// ============================================================================

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

/**
 * Check if the player has won (reached target value).
 * 
 * @param grid - Current game board
 * @param target - Target value to win (default 2048)
 * @returns true if any tile >= target
 */
function hasWon(grid: Grid, target: number): boolean {
  for (const row of grid) {
    for (const cell of row) {
      if (cell >= target) return true;
    }
  }
  return false;
}

/**
 * Check if the game is over.
 * Game over if: zero empty cells AND no adjacent matching tiles.
 * 
 * @param grid - Current game board
 * @returns true if no valid moves remain
 */
function isGameOver(grid: Grid): boolean {
  const size = grid.length;
  
  // Check for empty cells
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === 0) return false; // Empty cell exists, game not over
    }
  }
  
  // Check for possible merges (horizontal and vertical)
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const val = grid[r][c];
      // Check right neighbor
      if (c + 1 < size && grid[r][c + 1] === val) return false;
      // Check bottom neighbor
      if (r + 1 < size && grid[r + 1][c] === val) return false;
    }
  }
  
  // No empty cells and no possible merges
  return true;
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

// ============================================================================
// GAME STATE HOOK
// ============================================================================

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
    
    // Initialize with 2 random tiles
    let grid = createEmptyGrid(initialSize);
    grid = spawnTile(grid).grid;
    grid = spawnTile(grid).grid;
    
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

      // Execute move
      const result = moveBoard(prev.grid, direction);
      
      // Move validation: if board didn't change, move is invalid
      if (!result.moved) return prev;

      // Valid move: spawn new tile
      const { grid: newGrid } = spawnTile(result.grid);
      const newScore = prev.score + result.score;
      const newHighScore = Math.max(newScore, prev.highScore);

      // Update high score in localStorage
      if (newHighScore > prev.highScore) {
        localStorage.setItem('2048_highscore', String(newHighScore));
      }

      // Check win/lose conditions
      const won = hasWon(newGrid, prev.targetValue);
      const lost = isGameOver(newGrid);

      // Compute tile info for rendering
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
    grid = spawnTile(grid).grid;
    grid = spawnTile(grid).grid;
    
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
