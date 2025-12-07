import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, User, Bot, RefreshCw, Trophy, ChevronDown, HelpCircle, MoveDown, Minimize2 } from 'lucide-react';

const ROWS = 6;
const COLS = 7;
type Player = 1 | 2; // 1 = Red/Human, 2 = Yellow/CPU

interface GravityConnectProps {
  onBack?: () => void;
}

export const GravityConnect: React.FC<GravityConnectProps> = ({ onBack }) => {
  const [grid, setGrid] = useState<number[][]>(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
  const [currentPlayer, setCurrentPlayer] = useState<Player>(1);
  const [winner, setWinner] = useState<Player | 'Draw' | null>(null);
  const [mode, setMode] = useState<'PVP' | 'CPU' | null>(null);
  const [winningCells, setWinningCells] = useState<{r: number, c: number}[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // --- Game Logic ---

  const checkWin = useCallback((board: number[][], player: number) => {
    // Check Horizontal
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        if (board[r][c] === player && board[r][c+1] === player && board[r][c+2] === player && board[r][c+3] === player) {
          return [{r, c}, {r, c: c+1}, {r, c: c+2}, {r, c: c+3}];
        }
      }
    }
    // Check Vertical
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 0; c < COLS; c++) {
        if (board[r][c] === player && board[r+1][c] === player && board[r+2][c] === player && board[r+3][c] === player) {
          return [{r, c}, {r: r+1, c}, {r: r+2, c}, {r: r+3, c}];
        }
      }
    }
    // Check Diagonal /
    for (let r = 3; r < ROWS; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        if (board[r][c] === player && board[r-1][c+1] === player && board[r-2][c+2] === player && board[r-3][c+3] === player) {
          return [{r, c}, {r: r-1, c: c+1}, {r: r-2, c: c+2}, {r: r-3, c: c+3}];
        }
      }
    }
    // Check Diagonal \
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        if (board[r][c] === player && board[r+1][c+1] === player && board[r+2][c+2] === player && board[r+3][c+3] === player) {
          return [{r, c}, {r: r+1, c: c+1}, {r: r+2, c: c+2}, {r: r+3, c: c+3}];
        }
      }
    }
    return null;
  }, []);

  const getLowestEmptyRow = (board: number[][], col: number) => {
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r][col] === 0) return r;
    }
    return -1;
  };

  const dropDisc = (col: number) => {
    if (winner || isAiThinking) return;

    const row = getLowestEmptyRow(grid, col);
    if (row === -1) return; // Column full

    const newGrid = grid.map(row => [...row]);
    newGrid[row][col] = currentPlayer;
    setGrid(newGrid);

    const winLine = checkWin(newGrid, currentPlayer);
    if (winLine) {
      setWinner(currentPlayer);
      setWinningCells(winLine);
    } else if (newGrid.every(row => row.every(cell => cell !== 0))) {
      setWinner('Draw');
    } else {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    }
  };

  // --- AI Logic (Simple Heuristic) ---
  useEffect(() => {
    if (mode === 'CPU' && currentPlayer === 2 && !winner) {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        makeAiMove();
        setIsAiThinking(false);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, mode, winner]);

  const makeAiMove = () => {
    // 1. Check if AI can win immediately
    for (let c = 0; c < COLS; c++) {
      const r = getLowestEmptyRow(grid, c);
      if (r !== -1) {
        const tempGrid = grid.map(row => [...row]);
        tempGrid[r][c] = 2;
        if (checkWin(tempGrid, 2)) {
          dropDisc(c);
          return;
        }
      }
    }

    // 2. Check if Human needs to be blocked
    for (let c = 0; c < COLS; c++) {
      const r = getLowestEmptyRow(grid, c);
      if (r !== -1) {
        const tempGrid = grid.map(row => [...row]);
        tempGrid[r][c] = 1;
        if (checkWin(tempGrid, 1)) {
          dropDisc(c); // Block
          return;
        }
      }
    }

    // 3. Prefer center column
    const centerCol = 3;
    if (getLowestEmptyRow(grid, centerCol) !== -1 && Math.random() > 0.3) {
      dropDisc(centerCol);
      return;
    }

    // 4. Random valid move
    const validCols = [];
    for (let c = 0; c < COLS; c++) {
      if (getLowestEmptyRow(grid, c) !== -1) validCols.push(c);
    }
    const randomCol = validCols[Math.floor(Math.random() * validCols.length)];
    dropDisc(randomCol);
  };

  const resetGame = () => {
    setGrid(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
    setWinner(null);
    setWinningCells([]);
    setCurrentPlayer(1);
  };

  if (!mode) {
    return (
      <div className="flex flex-col items-center justify-center space-y-8 animate-fadeIn w-full max-w-md mx-auto">
        <h2 className="text-4xl font-arcade text-arcade-neon text-center leading-tight drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">
          GRAVITY<br />CONNECT
        </h2>
        
        {/* Game Mode Selection */}
        <div className="grid gap-4 w-full">
          <button 
            onClick={() => setMode('PVP')}
            className="p-5 bg-arcade-card hover:bg-gray-800 border border-gray-700 hover:border-arcade-primary rounded-xl transition-all hover:scale-105 flex items-center justify-between group shadow-lg"
          >
            <div className="flex flex-col items-start">
              <span className="text-xl font-bold text-white group-hover:text-arcade-primary transition-colors">VS Friend</span>
              <span className="text-xs text-gray-500">Local Multiplayer</span>
            </div>
            <div className="bg-indigo-500/10 p-2 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
               <User className="text-arcade-primary" size={28} />
            </div>
          </button>
          
          <button 
            onClick={() => setMode('CPU')}
            className="p-5 bg-arcade-card hover:bg-gray-800 border border-gray-700 hover:border-arcade-neon rounded-xl transition-all hover:scale-105 flex items-center justify-between group shadow-lg"
          >
            <div className="flex flex-col items-start">
              <span className="text-xl font-bold text-white group-hover:text-arcade-neon transition-colors">VS Computer</span>
              <span className="text-xs text-gray-500">Challenge the AI</span>
            </div>
             <div className="bg-cyan-500/10 p-2 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
               <Bot className="text-arcade-neon" size={28} />
             </div>
          </button>
        </div>

        {/* Professional How To Play Card */}
        <div className="w-full bg-gray-900/60 rounded-xl p-5 border border-gray-700/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 font-bold text-white mb-4 border-b border-gray-700/50 pb-2">
                <HelpCircle size={18} className="text-arcade-primary"/> 
                <span className="tracking-wide">HOW TO PLAY</span>
            </div>
            
            <div className="space-y-4">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20 mt-1">
                       <MoveDown size={20} />
                    </div>
                    <div>
                        <span className="text-gray-200 font-bold block mb-1">Gravity Drop</span>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          Tap any column to drop your disc. It will fall to the 
                          <span className="text-blue-300"> lowest available slot</span>, simulating gravity.
                        </p>
                    </div>
                </div>
                
                 <div className="flex items-start gap-4">
                    <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400 border border-pink-500/20 mt-1">
                       <Minimize2 size={20} className="rotate-45" />
                    </div>
                    <div>
                        <span className="text-gray-200 font-bold block mb-1">Connect Four</span>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          Be the first to connect <span className="text-pink-300">4 discs</span> of your color horizontally, vertically, or diagonally.
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-6 px-4">
        <button onClick={() => setMode(null)} className="text-gray-400 hover:text-white transition bg-gray-800/50 p-2 rounded-full hover:bg-gray-700">
           <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-6 text-lg font-bold font-arcade bg-gray-900/50 px-6 py-2 rounded-full border border-gray-700">
           <div className={`flex items-center gap-2 ${currentPlayer === 1 ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'text-gray-600 opacity-50'} transition-all`}>
             <User size={18} /> P1
           </div>
           <span className="text-gray-700 text-xs">VS</span>
           <div className={`flex items-center gap-2 ${currentPlayer === 2 ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]' : 'text-gray-600 opacity-50'} transition-all`}>
             {mode === 'CPU' ? <Bot size={18} /> : <User size={18} />} {mode === 'CPU' ? 'CPU' : 'P2'}
           </div>
        </div>
        <div className="w-9"></div> {/* Spacer */}
      </div>

      {/* Board */}
      <div className="p-4 bg-blue-800 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] border-4 border-blue-900 relative">
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {Array.from({ length: COLS }).map((_, colIndex) => (
            <div 
              key={colIndex} 
              className="flex flex-col gap-2 sm:gap-3 cursor-pointer group"
              onClick={() => dropDisc(colIndex)}
            >
              {/* Drop Indicator */}
              <div className="h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white mb-1">
                {!winner && !isAiThinking && <ChevronDown className="animate-bounce text-yellow-300" />}
              </div>

              {/* Cells */}
              {Array.from({ length: ROWS }).map((_, rowIndex) => {
                const cellValue = grid[rowIndex][colIndex];
                const isWinning = winningCells.some(cell => cell.r === rowIndex && cell.c === colIndex);
                
                return (
                  <div 
                    key={rowIndex}
                    className={`
                      w-8 h-8 sm:w-12 sm:h-12 rounded-full border-4 shadow-inner transition-all duration-500 ease-bounce
                      ${cellValue === 0 ? 'bg-blue-900 border-blue-900/50' : ''}
                      ${cellValue === 1 ? 'bg-red-500 border-red-700 shadow-[inset_0_2px_5px_rgba(0,0,0,0.3)]' : ''}
                      ${cellValue === 2 ? 'bg-yellow-400 border-yellow-600 shadow-[inset_0_2px_5px_rgba(0,0,0,0.3)]' : ''}
                      ${isWinning ? 'ring-4 ring-white animate-pulse shadow-[0_0_30px_rgba(255,255,255,0.8)] z-10 scale-105' : ''}
                    `}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Status */}
      <div className="mt-8 h-16 flex items-center justify-center w-full">
        {winner ? (
           <div className="flex flex-col items-center animate-fadeInUp">
             <div className="text-2xl font-arcade text-white flex items-center gap-3 mb-4">
               <Trophy className="text-yellow-400" size={32} />
               <span className="drop-shadow-md">
                 {winner === 'Draw' ? 'DRAW GAME!' : `${winner === 1 ? 'PLAYER 1' : (mode === 'CPU' ? 'CPU' : 'PLAYER 2')} WINS!`}
               </span>
             </div>
             <button 
               onClick={resetGame}
               className="px-8 py-3 bg-arcade-primary hover:bg-indigo-500 text-white rounded-full font-bold flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
             >
               <RefreshCw size={18} /> Play Again
             </button>
           </div>
        ) : (
          <div className="text-gray-400 text-sm font-mono tracking-wider animate-pulse bg-gray-900/50 px-4 py-2 rounded-lg border border-gray-800">
            {isAiThinking ? 'CPU IS THINKING...' : `WAITING FOR ${currentPlayer === 1 ? 'PLAYER 1' : 'PLAYER 2'}...`}
          </div>
        )}
      </div>
    </div>
  );
};