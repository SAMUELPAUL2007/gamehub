import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, User, X, Circle, Bot, Swords, Brain, Trophy, ShieldAlert, Zap, ArrowLeft } from 'lucide-react';

type Player = 'X' | 'O';
type GameMode = 'PVP' | 'CPU';
type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
type GameState = 'SETUP' | 'PLAYING' | 'GAME_OVER';

interface TicTacToeProps {
  variant?: 'classic' | 'neon';
}

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export const TicTacToe: React.FC<TicTacToeProps> = ({ variant = 'classic' }) => {
  const [board, setBoard] = useState<(Player | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true); // X is always the starting player
  const [gameState, setGameState] = useState<GameState>('SETUP');
  const [gameMode, setGameMode] = useState<GameMode>('PVP');
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [winner, setWinner] = useState<Player | 'Draw' | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);

  const isNeon = variant === 'neon';
  const themeColor = isNeon ? 'text-arcade-neon' : 'text-arcade-primary';
  const glowClass = isNeon ? 'shadow-[0_0_15px_rgba(0,243,255,0.3)]' : 'shadow-none';

  // --- Game Logic Helpers ---

  const checkWinner = useCallback((squares: (Player | null)[]) => {
    for (let i = 0; i < WINNING_LINES.length; i++) {
      const [a, b, c] = WINNING_LINES[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: WINNING_LINES[i] };
      }
    }
    if (!squares.includes(null)) {
      return { winner: 'Draw' as const, line: null };
    }
    return null;
  }, []);

  // --- AI Engines ---

  const getBestMove = (squares: (Player | null)[], diff: Difficulty): number => {
    // 1. Easy: Random move
    if (diff === 'EASY') {
      const available = squares.map((v, i) => v === null ? i : null).filter(v => v !== null) as number[];
      return available[Math.floor(Math.random() * available.length)];
    }

    // 2. Medium: 40% chance of error, otherwise best move (or block immediate threats)
    if (diff === 'MEDIUM') {
      const chance = Math.random();
      if (chance > 0.6) {
        // Make a "mistake" (random move)
        const available = squares.map((v, i) => v === null ? i : null).filter(v => v !== null) as number[];
        return available[Math.floor(Math.random() * available.length)];
      }
      // Otherwise fall through to hard logic (Minimax)
    }

    // 3. Hard: Minimax (Unbeatable)
    let bestScore = -Infinity;
    let move = -1;
    
    squares.forEach((square, index) => {
      if (square === null) {
        squares[index] = 'O'; // CPU is O
        const score = minimax(squares, 0, false);
        squares[index] = null; // Undo
        if (score > bestScore) {
          bestScore = score;
          move = index;
        }
      }
    });
    return move;
  };

  const minimax = (squares: (Player | null)[], depth: number, isMaximizing: boolean): number => {
    const result = checkWinner(squares);
    if (result?.winner === 'O') return 10 - depth;
    if (result?.winner === 'X') return depth - 10;
    if (result?.winner === 'Draw') return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      squares.forEach((square, index) => {
        if (square === null) {
          squares[index] = 'O';
          const score = minimax(squares, depth + 1, false);
          squares[index] = null;
          bestScore = Math.max(score, bestScore);
        }
      });
      return bestScore;
    } else {
      let bestScore = Infinity;
      squares.forEach((square, index) => {
        if (square === null) {
          squares[index] = 'X';
          const score = minimax(squares, depth + 1, true);
          squares[index] = null;
          bestScore = Math.min(score, bestScore);
        }
      });
      return bestScore;
    }
  };

  // --- Game Loop ---

  const handleCellClick = (index: number) => {
    if (board[index] || winner || (gameMode === 'CPU' && !isXNext)) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result.winner);
      setWinningLine(result.line);
      setGameState('GAME_OVER');
    } else {
      setIsXNext(!isXNext);
    }
  };

  // CPU Turn Effect
  useEffect(() => {
    if (gameMode === 'CPU' && !isXNext && !winner && gameState === 'PLAYING') {
      const timer = setTimeout(() => {
        const moveIndex = getBestMove(board, difficulty);
        if (moveIndex !== -1) {
          const newBoard = [...board];
          newBoard[moveIndex] = 'O';
          setBoard(newBoard);
          
          const result = checkWinner(newBoard);
          if (result) {
            setWinner(result.winner);
            setWinningLine(result.line);
            setGameState('GAME_OVER');
          } else {
            setIsXNext(true); // Back to player
          }
        }
      }, 600); // Thinking delay
      return () => clearTimeout(timer);
    }
  }, [isXNext, gameMode, winner, gameState, board, difficulty, checkWinner]);

  // --- Controls ---

  const startGame = (mode: GameMode, level: Difficulty = 'MEDIUM') => {
    setGameMode(mode);
    setDifficulty(level);
    setGameState('PLAYING');
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine(null);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine(null);
    setGameState('PLAYING');
  };

  const backToMenu = () => {
    setGameState('SETUP');
    setWinner(null);
    setWinningLine(null);
  };

  // --- Renders ---

  if (gameState === 'SETUP') {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto space-y-8 animate-fadeIn">
        <div className="text-center space-y-2">
          <h2 className={`text-4xl font-arcade ${themeColor} mb-2`}>
            {isNeon ? 'NEON TTT' : 'TIC TAC TOE'}
          </h2>
          <p className="text-gray-400">Select Game Mode</p>
        </div>

        <div className="grid grid-cols-1 w-full gap-4">
          <button 
            onClick={() => startGame('PVP')}
            className="group relative p-6 bg-arcade-card hover:bg-gray-800 border border-gray-700 rounded-xl transition-all hover:scale-105 hover:border-arcade-primary flex items-center gap-4"
          >
            <div className="p-3 bg-indigo-500/20 rounded-full text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
              <Swords size={32} />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-white">Versus Friend</h3>
              <p className="text-sm text-gray-500">Local multiplayer on one device</p>
            </div>
          </button>

          <div className="space-y-3">
            <div className="text-sm text-gray-500 uppercase tracking-wider font-bold ml-1">Versus Computer</div>
            <div className="grid grid-cols-3 gap-3">
               <button 
                onClick={() => startGame('CPU', 'EASY')}
                className="flex flex-col items-center justify-center p-4 bg-gray-800 hover:bg-green-900/30 border border-gray-700 hover:border-green-500 rounded-xl transition-all hover:-translate-y-1"
              >
                <Zap className="mb-2 text-green-400" />
                <span className="font-bold text-sm">EASY</span>
              </button>
               <button 
                onClick={() => startGame('CPU', 'MEDIUM')}
                className="flex flex-col items-center justify-center p-4 bg-gray-800 hover:bg-yellow-900/30 border border-gray-700 hover:border-yellow-500 rounded-xl transition-all hover:-translate-y-1"
              >
                <ShieldAlert className="mb-2 text-yellow-400" />
                <span className="font-bold text-sm">MEDIUM</span>
              </button>
               <button 
                onClick={() => startGame('CPU', 'HARD')}
                className="flex flex-col items-center justify-center p-4 bg-gray-800 hover:bg-red-900/30 border border-gray-700 hover:border-red-500 rounded-xl transition-all hover:-translate-y-1"
              >
                <Brain className="mb-2 text-red-500" />
                <span className="font-bold text-sm">IMPOSSIBLE</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PLAYING or GAME_OVER
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto h-full">
      {/* HUD */}
      <div className="flex justify-between items-center w-full mb-8 px-4">
        <button onClick={backToMenu} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition">
           <ArrowLeft size={24} />
        </button>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-4 text-xl font-bold font-arcade tracking-tight">
             <span className={`${isXNext ? 'text-arcade-primary scale-110' : 'text-gray-600'} transition-all flex items-center gap-2`}>
               <User size={20} /> You
             </span>
             <span className="text-gray-700">VS</span>
             <span className={`${!isXNext ? 'text-arcade-success scale-110' : 'text-gray-600'} transition-all flex items-center gap-2`}>
               {gameMode === 'CPU' ? <Bot size={20} /> : <User size={20} />} 
               {gameMode === 'CPU' ? 'CPU' : 'P2'}
             </span>
          </div>
          {gameMode === 'CPU' && (
             <div className="text-xs font-mono text-gray-500 mt-1 uppercase tracking-widest">{difficulty} MODE</div>
          )}
        </div>
        <div className="w-10"></div> {/* Spacer for alignment */}
      </div>

      {/* Board */}
      <div className={`relative grid grid-cols-3 gap-3 p-4 rounded-2xl bg-gray-800/50 border border-gray-700 ${glowClass}`}>
        {/* Victory Line Drawing */}
        {winningLine && (
          <div className="absolute inset-0 z-20 pointer-events-none">
            {/* We could use SVG to draw the line dynamically, but simplified css classes for cells handle the highlighting mostly. 
                This empty div is a placeholder for potential advanced canvas drawing. 
            */}
          </div>
        )}

        {board.map((square, i) => {
          const isWinningSquare = winningLine?.includes(i);
          return (
            <button
              key={i}
              onClick={() => handleCellClick(i)}
              className={`
                relative w-20 h-20 sm:w-28 sm:h-28 rounded-xl flex items-center justify-center text-5xl sm:text-6xl transition-all duration-300
                ${!square && !winner ? 'hover:bg-gray-700 cursor-pointer' : 'cursor-default'}
                ${isWinningSquare ? (square === 'X' ? 'bg-indigo-900/80 shadow-[inset_0_0_20px_rgba(99,102,241,0.5)]' : 'bg-green-900/80 shadow-[inset_0_0_20px_rgba(34,197,94,0.5)]') : 'bg-gray-800'}
              `}
              disabled={!!square || !!winner || (gameMode === 'CPU' && !isXNext)}
            >
              <div className={`transform transition-all duration-300 ${square ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                {square === 'X' && <X size={64} strokeWidth={isNeon ? 3 : 2.5} className="text-arcade-primary drop-shadow-lg" />}
                {square === 'O' && <Circle size={56} strokeWidth={isNeon ? 3 : 2.5} className="text-arcade-success drop-shadow-lg" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Game Over Overlay / Footer */}
      <div className={`mt-8 transition-all duration-500 ${winner ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className="flex flex-col items-center">
          <h3 className="text-3xl font-arcade text-white mb-6 flex items-center gap-3">
             {winner === 'Draw' ? 'DRAW GAME' : (
               <>
                 <Trophy className="text-yellow-400" size={32} />
                 <span className={winner === 'X' ? 'text-arcade-primary' : 'text-arcade-success'}>
                   {winner === 'X' ? 'YOU WON!' : (gameMode === 'CPU' ? 'CPU WINS!' : 'PLAYER O WINS!')}
                 </span>
               </>
             )}
          </h3>
          <div className="flex gap-4">
             <button
              onClick={backToMenu}
              className="px-6 py-3 rounded-full font-bold bg-gray-700 hover:bg-gray-600 transition-colors text-gray-200"
            >
              Menu
            </button>
            <button
              onClick={resetGame}
              className={`px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-lg ${isNeon ? 'bg-arcade-neon text-black hover:bg-cyan-300' : 'bg-arcade-primary text-white hover:bg-indigo-500'}`}
            >
              <RefreshCw size={20} />
              Play Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};