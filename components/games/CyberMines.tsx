import React, { useState, useEffect, useCallback } from 'react';
import { Flag, Bomb, RefreshCw, Crosshair, Skull, HelpCircle, Terminal, ShieldAlert, MousePointer2 } from 'lucide-react';

const ROWS = 10;
const COLS = 10;
const MINES = 15;

interface Cell {
  r: number;
  c: number;
  isMine: boolean;
  isOpen: boolean;
  isFlagged: boolean;
  neighborCount: number;
}

export const CyberMines: React.FC = () => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [flagMode, setFlagMode] = useState(false); // For mobile users
  const [showRules, setShowRules] = useState(true);

  const initGame = useCallback(() => {
    // 1. Create empty grid
    let newGrid: Cell[][] = [];
    for (let r = 0; r < ROWS; r++) {
      let row: Cell[] = [];
      for (let c = 0; c < COLS; c++) {
        row.push({ r, c, isMine: false, isOpen: false, isFlagged: false, neighborCount: 0 });
      }
      newGrid.push(row);
    }

    // 2. Place Mines
    let minesPlaced = 0;
    while (minesPlaced < MINES) {
      const r = Math.floor(Math.random() * ROWS);
      const c = Math.floor(Math.random() * COLS);
      if (!newGrid[r][c].isMine) {
        newGrid[r][c].isMine = true;
        minesPlaced++;
      }
    }

    // 3. Calculate Neighbors
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!newGrid[r][c].isMine) {
          let count = 0;
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              const nr = r + i;
              const nc = c + j;
              if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && newGrid[nr][nc].isMine) {
                count++;
              }
            }
          }
          newGrid[r][c].neighborCount = count;
        }
      }
    }

    setGrid(newGrid);
    setGameOver(false);
    setWin(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const reveal = (r: number, c: number, currentGrid: Cell[][]) => {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS || currentGrid[r][c].isOpen || currentGrid[r][c].isFlagged) return;

    currentGrid[r][c].isOpen = true;

    if (currentGrid[r][c].neighborCount === 0) {
      // Flood fill
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
           reveal(r + i, c + j, currentGrid);
        }
      }
    }
  };

  const handleCellClick = (r: number, c: number) => {
    if (gameOver || win) return;

    const newGrid = [...grid.map(row => [...row.map(cell => ({ ...cell }))])]; // Deep copy
    const cell = newGrid[r][c];

    if (flagMode) {
      if (!cell.isOpen) {
        cell.isFlagged = !cell.isFlagged;
        setGrid(newGrid);
      }
      return;
    }

    if (cell.isFlagged) return;

    if (cell.isMine) {
      // Game Over
      cell.isOpen = true;
      setGameOver(true);
      // Reveal all mines
      newGrid.forEach(row => row.forEach(c => {
        if (c.isMine) c.isOpen = true;
      }));
    } else {
      reveal(r, c, newGrid);
      // Check win
      let closedNonMines = 0;
      newGrid.forEach(row => row.forEach(c => {
        if (!c.isMine && !c.isOpen) closedNonMines++;
      }));
      if (closedNonMines === 0) setWin(true);
    }
    
    setGrid(newGrid);
  };

  const getNumberColor = (num: number) => {
    const colors = ['text-gray-500', 'text-blue-400', 'text-green-400', 'text-red-400', 'text-purple-400', 'text-yellow-400', 'text-pink-400', 'text-white'];
    return colors[num] || 'text-white';
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto">
      {/* Header Controls */}
      <div className="flex justify-between items-center w-full mb-6 px-4">
        <div className="flex items-center gap-3">
             <button 
               onClick={() => setShowRules(true)}
               className="bg-green-900/30 p-2 rounded-lg text-green-400 border border-green-800 hover:bg-green-800 transition-colors"
             >
                <HelpCircle size={20} />
             </button>
             <h2 className="text-xl sm:text-2xl font-arcade text-green-500 tracking-wider">CYBER_MINES</h2>
        </div>
        
        <button 
          onClick={() => setFlagMode(!flagMode)}
          className={`
            px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition-all text-xs sm:text-sm
            ${flagMode ? 'bg-yellow-500 text-black shadow-[0_0_15px_#eab308]' : 'bg-gray-800 text-gray-400 border border-gray-700'}
          `}
        >
          <Flag size={16} /> {flagMode ? 'FLAG ON' : 'FLAG OFF'}
        </button>
      </div>

      <div className="relative bg-black p-4 rounded-xl border-2 border-green-900 shadow-2xl">
        
        {/* Rules Overlay (Mission Briefing) */}
        {showRules && (
          <div className="absolute inset-0 z-50 bg-black/95 flex flex-col p-6 font-mono text-green-500 rounded-xl border border-green-500/50 overflow-y-auto">
             <div className="flex items-center gap-2 mb-6 border-b border-green-800 pb-4">
               <Terminal size={24} />
               <h3 className="text-xl font-bold tracking-widest">MISSION BRIEFING</h3>
             </div>
             
             <div className="space-y-6 text-sm flex-1">
                <div className="flex gap-4">
                   <div className="mt-1"><Crosshair className="text-green-400" size={20}/></div>
                   <div>
                      <strong className="block text-green-300 mb-1">OBJECTIVE</strong>
                      <p className="opacity-80">Decrypt the entire grid by revealing all safe sectors. Do not trigger any security nodes.</p>
                   </div>
                </div>

                <div className="flex gap-4">
                   <div className="mt-1"><Bomb className="text-red-500" size={20}/></div>
                   <div>
                      <strong className="block text-red-400 mb-1">THREATS</strong>
                      <p className="opacity-80">Hidden mines will terminate the session immediately. Watch the numbers closely.</p>
                   </div>
                </div>

                <div className="flex gap-4">
                   <div className="mt-1"><ShieldAlert className="text-blue-400" size={20}/></div>
                   <div>
                      <strong className="block text-blue-300 mb-1">INTEL</strong>
                      <p className="opacity-80">Numbers indicate how many mines are touching that square (including diagonals).</p>
                   </div>
                </div>

                <div className="flex gap-4">
                   <div className="mt-1"><MousePointer2 className="text-yellow-400" size={20}/></div>
                   <div>
                      <strong className="block text-yellow-300 mb-1">CONTROLS</strong>
                      <p className="opacity-80">
                         • <span className="text-white">Tap</span> to Reveal.<br/>
                         • Toggle <span className="text-yellow-400 font-bold">FLAG MODE</span> to mark suspected mines safely.
                      </p>
                   </div>
                </div>
             </div>

             <button 
               onClick={() => setShowRules(false)}
               className="mt-6 w-full py-3 bg-green-700 hover:bg-green-600 text-black font-bold uppercase tracking-widest rounded transition-colors"
             >
               Initialize System
             </button>
          </div>
        )}

        <div className="grid grid-cols-10 gap-1 bg-green-900/20 p-2 border border-green-800">
          {grid.map((row, r) => (
             row.map((cell, c) => (
               <button
                 key={`${r}-${c}`}
                 onClick={() => handleCellClick(r, c)}
                 className={`
                   w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-mono font-bold text-sm sm:text-lg transition-all
                   ${cell.isOpen 
                      ? (cell.isMine ? 'bg-red-900/80 border border-red-800' : 'bg-black border border-green-900/30') 
                      : 'bg-green-900/40 hover:bg-green-800/60 border border-green-700/50 shadow-inner'
                    }
                 `}
               >
                 {cell.isOpen && !cell.isMine && cell.neighborCount > 0 && (
                   <span className={getNumberColor(cell.neighborCount)}>{cell.neighborCount}</span>
                 )}
                 {cell.isOpen && cell.isMine && <Bomb size={18} className="text-red-500 animate-pulse" />}
                 {!cell.isOpen && cell.isFlagged && <Flag size={16} className="text-yellow-500" />}
               </button>
             ))
          ))}
        </div>

        {/* Overlay */}
        {(gameOver || win) && !showRules && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-10 border border-green-500">
            <div className={`text-4xl font-arcade mb-4 ${win ? 'text-green-500' : 'text-red-500'}`}>
               {win ? 'SYSTEM HACKED' : 'ACCESS DENIED'}
            </div>
            {gameOver && <Skull size={48} className="text-red-500 mb-4" />}
            {win && <Crosshair size={48} className="text-green-500 mb-4 animate-spin-slow" />}
            
            <button 
              onClick={initGame}
              className="px-8 py-3 bg-green-600 hover:bg-green-500 text-black font-bold font-mono rounded-sm flex items-center gap-2"
            >
              <RefreshCw size={18} /> REBOOT SYSTEM
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 text-green-700/60 font-mono text-xs text-center">
        v.2.0.4_BETA // MINES: {MINES} // GRID: 10x10
      </div>
    </div>
  );
};