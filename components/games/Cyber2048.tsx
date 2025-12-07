import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

export const Cyber2048: React.FC = () => {
  const [grid, setGrid] = useState<number[][]>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  // --- Game Logic ---

  const initGame = useCallback(() => {
    const newGrid = Array(4).fill(0).map(() => Array(4).fill(0));
    addNumber(newGrid);
    addNumber(newGrid);
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
    setWon(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const addNumber = (currentGrid: number[][]) => {
    const available = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (currentGrid[i][j] === 0) available.push({ r: i, c: j });
      }
    }
    if (available.length > 0) {
      const spot = available[Math.floor(Math.random() * available.length)];
      currentGrid[spot.r][spot.c] = Math.random() > 0.9 ? 4 : 2;
    }
  };

  const getColor = (value: number) => {
    switch (value) {
      case 2: return 'bg-gray-700 text-white border-gray-600';
      case 4: return 'bg-gray-600 text-white border-gray-500';
      case 8: return 'bg-arcade-primary text-white border-indigo-400 shadow-[0_0_10px_#6366f1]';
      case 16: return 'bg-blue-600 text-white border-blue-400 shadow-[0_0_15px_#2563eb]';
      case 32: return 'bg-cyan-600 text-white border-cyan-400 shadow-[0_0_15px_#0891b2]';
      case 64: return 'bg-teal-600 text-white border-teal-400 shadow-[0_0_20px_#0d9488]';
      case 128: return 'bg-green-600 text-white border-green-400 shadow-[0_0_25px_#16a34a]';
      case 256: return 'bg-yellow-600 text-white border-yellow-400 shadow-[0_0_25px_#ca8a04]';
      case 512: return 'bg-orange-600 text-white border-orange-400 shadow-[0_0_30px_#ea580c]';
      case 1024: return 'bg-red-600 text-white border-red-400 shadow-[0_0_35px_#dc2626]';
      case 2048: return 'bg-arcade-neon text-black border-white shadow-[0_0_50px_#00f3ff] animate-pulse';
      default: return 'bg-black text-gray-500';
    }
  };

  // Move Logic
  const slide = (row: number[]) => {
    const arr = row.filter(val => val);
    const missing = 4 - arr.length;
    const zeros = Array(missing).fill(0);
    return arr.concat(zeros);
  };

  const combine = (row: number[], currentScore: number) => {
    let newScore = currentScore;
    for (let i = 0; i < 3; i++) {
      if (row[i] !== 0 && row[i] === row[i + 1]) {
        row[i] = row[i] * 2;
        row[i + 1] = 0;
        newScore += row[i];
        if (row[i] === 2048 && !won) setWon(true);
      }
    }
    return { newRow: row, scoreAdded: newScore - currentScore };
  };

  const operate = (direction: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN') => {
    if (gameOver) return;
    
    let oldGrid = JSON.stringify(grid);
    let newGrid = grid.map(row => [...row]);
    let totalScoreAdded = 0;

    if (direction === 'LEFT' || direction === 'RIGHT') {
      for (let i = 0; i < 4; i++) {
        let row = newGrid[i];
        if (direction === 'RIGHT') row.reverse();
        
        row = slide(row);
        const { newRow, scoreAdded } = combine(row, 0);
        row = slide(newRow); // Slide again after combine
        
        if (direction === 'RIGHT') row.reverse();
        newGrid[i] = row;
        totalScoreAdded += scoreAdded;
      }
    } else {
      // Transpose for Up/Down
      for (let i = 0; i < 4; i++) {
        let col = [newGrid[0][i], newGrid[1][i], newGrid[2][i], newGrid[3][i]];
        if (direction === 'DOWN') col.reverse();

        col = slide(col);
        const { newRow, scoreAdded } = combine(col, 0);
        col = slide(newRow);

        if (direction === 'DOWN') col.reverse();
        
        // Transpose back
        for (let r = 0; r < 4; r++) newGrid[r][i] = col[r];
        totalScoreAdded += scoreAdded;
      }
    }

    if (JSON.stringify(newGrid) !== oldGrid) {
      addNumber(newGrid);
      setGrid(newGrid);
      const newTotal = score + totalScoreAdded;
      setScore(newTotal);
      if (newTotal > bestScore) setBestScore(newTotal);
      
      // Check Game Over
      if (!canMove(newGrid)) {
        setGameOver(true);
      }
    }
  };

  const canMove = (checkGrid: number[][]) => {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (checkGrid[i][j] === 0) return true;
        if (i !== 3 && checkGrid[i][j] === checkGrid[i + 1][j]) return true;
        if (j !== 3 && checkGrid[i][j] === checkGrid[i][j + 1]) return true;
      }
    }
    return false;
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      switch(e.key) {
        case 'ArrowLeft': operate('LEFT'); break;
        case 'ArrowRight': operate('RIGHT'); break;
        case 'ArrowUp': operate('UP'); break;
        case 'ArrowDown': operate('DOWN'); break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [grid, score, gameOver]); // Dependencies important for closure state

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto">
      <div className="flex justify-between items-center w-full mb-6 px-2">
        <div>
          <h2 className="text-4xl font-arcade text-arcade-neon drop-shadow-lg">2048</h2>
          <span className="text-xs text-arcade-primary uppercase tracking-widest">Cyber Edition</span>
        </div>
        <div className="flex gap-4 text-right">
           <div className="bg-gray-800 p-2 rounded border border-gray-700">
             <div className="text-xs text-gray-500 font-bold">SCORE</div>
             <div className="text-xl font-bold text-white">{score}</div>
           </div>
           <div className="bg-gray-800 p-2 rounded border border-gray-700">
             <div className="text-xs text-gray-500 font-bold">BEST</div>
             <div className="text-xl font-bold text-yellow-400">{bestScore}</div>
           </div>
        </div>
      </div>

      <div className="relative bg-gray-900 p-4 rounded-xl border-4 border-gray-700 shadow-2xl">
        <div className="grid grid-cols-4 gap-3 bg-gray-800/50 p-2 rounded-lg">
          {grid.map((row, r) => (
            row.map((val, c) => (
              <div 
                key={`${r}-${c}`} 
                className={`
                  w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center rounded-lg text-2xl sm:text-3xl font-bold transition-all duration-200 border-2
                  ${getColor(val)}
                  ${val > 0 ? 'scale-100 opacity-100' : 'scale-95 opacity-50 bg-gray-800 border-gray-800'}
                `}
              >
                {val > 0 ? val : ''}
              </div>
            ))
          ))}
        </div>

        {/* Overlays */}
        {(gameOver || won) && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg backdrop-blur-sm z-10">
             <h3 className={`text-4xl font-arcade mb-4 ${won ? 'text-arcade-neon' : 'text-red-500'}`}>
               {won ? 'YOU WON!' : 'GAME OVER'}
             </h3>
             <button 
               onClick={initGame}
               className="px-8 py-3 bg-arcade-primary hover:bg-white hover:text-black rounded-full font-bold flex items-center gap-2 transition-all"
             >
               <RefreshCw size={20} /> Try Again
             </button>
          </div>
        )}
      </div>

      {/* Controls for Mobile */}
      <div className="mt-8 grid grid-cols-3 gap-4 sm:hidden">
        <div></div>
        <button onClick={() => operate('UP')} className="p-4 bg-gray-800 rounded-lg active:bg-arcade-primary"><ArrowUp/></button>
        <div></div>
        <button onClick={() => operate('LEFT')} className="p-4 bg-gray-800 rounded-lg active:bg-arcade-primary"><ArrowLeft/></button>
        <button onClick={() => operate('DOWN')} className="p-4 bg-gray-800 rounded-lg active:bg-arcade-primary"><ArrowDown/></button>
        <button onClick={() => operate('RIGHT')} className="p-4 bg-gray-800 rounded-lg active:bg-arcade-primary"><ArrowRight/></button>
      </div>

      <div className="mt-6 text-gray-500 text-sm hidden sm:block">
        Use Arrow Keys to merge tiles. Reach 2048 to win.
      </div>
    </div>
  );
};