import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, RotateCcw, Trophy, Zap } from 'lucide-react';
import { Point } from '../../types';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };

interface SnakeProps {
  initialSpeed?: number;
  modeName?: string;
}

export const Snake: React.FC<SnakeProps> = ({ initialSpeed = 150, modeName = "CLASSIC" }) => {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  
  // Use ref to track direction to prevent rapid double-key presses causing suicide
  const directionRef = useRef<Point>(INITIAL_DIRECTION);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // Check if food spawned on snake
      // eslint-disable-next-line no-loop-func
      const isOnSnake = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!isOnSnake) break;
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setFood(generateFood(INITIAL_SNAKE));
    setGameOver(false);
    setScore(0);
    setIsPlaying(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || gameOver) return;

      const currentDir = directionRef.current;
      
      switch (e.key) {
        case 'ArrowUp':
          if (currentDir.y !== 1) directionRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
          if (currentDir.y !== -1) directionRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
          if (currentDir.x !== 1) directionRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
          if (currentDir.x !== -1) directionRef.current = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, gameOver]);

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const moveSnake = setInterval(() => {
      setSnake((prevSnake) => {
        const nextDir = directionRef.current;
        setDirection(nextDir); // Sync state for render if needed

        const newHead = {
          x: prevSnake[0].x + nextDir.x,
          y: prevSnake[0].y + nextDir.y,
        };

        // Check Wall Collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setGameOver(true);
          return prevSnake;
        }

        // Check Self Collision
        if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check Food
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 10);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop(); // Remove tail
        }

        return newSnake;
      });
    }, initialSpeed);

    return () => clearInterval(moveSnake);
  }, [isPlaying, gameOver, food, generateFood, initialSpeed]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="flex justify-between items-center w-full max-w-md mb-4 px-4">
        <h2 className="text-2xl font-arcade text-arcade-success flex items-center gap-2">
          SNAKE <span className="text-xs bg-gray-800 text-white px-2 py-1 rounded font-sans">{modeName}</span>
        </h2>
        <div className="flex items-center gap-2 text-yellow-400 font-bold font-arcade">
          <Trophy size={20} />
          {score}
        </div>
      </div>

      <div 
        className="relative bg-gray-900 border-4 border-gray-700 rounded-lg shadow-2xl"
        style={{
          width: 'min(90vw, 400px)',
          height: 'min(90vw, 400px)',
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
        }}
      >
        {/* Game Overlay */}
        {(!isPlaying || gameOver) && (
          <div className="absolute inset-0 bg-black/80 z-10 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm">
            {gameOver && <div className="text-red-500 font-arcade text-3xl mb-4 animate-bounce">GAME OVER</div>}
            <button
              onClick={resetGame}
              className="px-8 py-4 bg-arcade-success hover:bg-green-600 text-black font-arcade font-bold rounded shadow-lg transform transition hover:scale-105 flex items-center gap-3"
            >
              {gameOver ? <RotateCcw /> : <Play />}
              {gameOver ? 'RETRY' : 'START'}
            </button>
            {initialSpeed < 100 && <div className="mt-4 flex items-center gap-1 text-yellow-400 text-xs font-mono"><Zap size={12}/> HIGH SPEED MODE ACTIVE</div>}
          </div>
        )}

        {/* Snake & Food Render */}
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const x = i % GRID_SIZE;
          const y = Math.floor(i / GRID_SIZE);
          const isSnakeHead = snake[0].x === x && snake[0].y === y;
          const isSnakeBody = snake.some((s, idx) => idx !== 0 && s.x === x && s.y === y);
          const isFood = food.x === x && food.y === y;

          let cellClass = 'w-full h-full';
          if (isSnakeHead) cellClass += ' bg-arcade-success rounded-sm z-2';
          else if (isSnakeBody) cellClass += ' bg-green-800 rounded-sm opacity-80';
          else if (isFood) cellClass += ' bg-red-500 rounded-full animate-pulse-fast';
          
          return <div key={i} className={cellClass}></div>;
        })}
      </div>
      
      <div className="mt-6 text-gray-500 text-sm hidden sm:block">
        Use Arrow Keys to move
      </div>
       <div className="mt-6 sm:hidden flex gap-4">
          <p className="text-xs text-gray-500">Tap specific areas or use a keyboard</p>
      </div>
    </div>
  );
};