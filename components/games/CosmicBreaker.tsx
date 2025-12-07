import React, { useRef, useEffect, useState } from 'react';
import { Play, RotateCcw, Trophy, Info, MoveHorizontal, Shield, Target } from 'lucide-react';

export const CosmicBreaker: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showRules, setShowRules] = useState(true);

  // Game Constants
  const BALL_RADIUS = 6;
  const PADDLE_HEIGHT = 12;
  const PADDLE_WIDTH = 80;
  const BRICK_ROW_COUNT = 5;
  const BRICK_COLUMN_COUNT = 7;
  const BRICK_PADDING = 10;
  const BRICK_OFFSET_TOP = 40;
  const BRICK_OFFSET_LEFT = 35;

  // Refs for game state (to avoid re-renders in game loop)
  const gameState = useRef({
    x: 0,
    y: 0,
    dx: 4,
    dy: -4,
    paddleX: 0,
    bricks: [] as { x: number; y: number; status: number }[],
    score: 0,
    animationId: 0
  });

  const initGame = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    // Reset State
    gameState.current.x = canvas.width / 2;
    gameState.current.y = canvas.height - 30;
    gameState.current.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
    gameState.current.dy = -4;
    gameState.current.paddleX = (canvas.width - PADDLE_WIDTH) / 2;
    gameState.current.score = 0;
    
    // Build Bricks
    const newBricks = [];
    const brickWidth = (canvas.width - (BRICK_OFFSET_LEFT * 2) - (BRICK_PADDING * (BRICK_COLUMN_COUNT - 1))) / BRICK_COLUMN_COUNT;
    
    for(let c=0; c<BRICK_COLUMN_COUNT; c++) {
        for(let r=0; r<BRICK_ROW_COUNT; r++) {
            const brickX = (c*(brickWidth+BRICK_PADDING)) + BRICK_OFFSET_LEFT;
            const brickY = (r*(20+BRICK_PADDING)) + BRICK_OFFSET_TOP;
            newBricks.push({ x: brickX, y: brickY, status: 1 });
        }
    }
    gameState.current.bricks = newBricks;

    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    setShowRules(false);
    draw();
  };

  const draw = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Bricks
    gameState.current.bricks.forEach(b => {
      if (b.status === 1) {
        ctx.beginPath();
        ctx.rect(b.x, b.y, 45, 20); // approximated width
        ctx.fillStyle = '#6366f1'; // Arcade Primary
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#6366f1';
        ctx.fill();
        ctx.closePath();
      }
    });

    // Draw Ball
    ctx.beginPath();
    ctx.arc(gameState.current.x, gameState.current.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#00f3ff'; // Neon
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00f3ff';
    ctx.fill();
    ctx.closePath();

    // Draw Paddle
    ctx.beginPath();
    ctx.rect(gameState.current.paddleX, canvas.height - PADDLE_HEIGHT - 10, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillStyle = '#facc15'; // Yellow
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#facc15';
    ctx.fill();
    ctx.closePath();

    // Collision Detection: Bricks
    gameState.current.bricks.forEach(b => {
        if (b.status === 1) {
            if (gameState.current.x > b.x && gameState.current.x < b.x + 45 && gameState.current.y > b.y && gameState.current.y < b.y + 20) {
                gameState.current.dy = -gameState.current.dy;
                b.status = 0;
                gameState.current.score++;
                setScore(gameState.current.score);
            }
        }
    });

    // Collision: Walls
    if (gameState.current.x + gameState.current.dx > canvas.width - BALL_RADIUS || gameState.current.x + gameState.current.dx < BALL_RADIUS) {
        gameState.current.dx = -gameState.current.dx;
    }
    if (gameState.current.y + gameState.current.dy < BALL_RADIUS) {
        gameState.current.dy = -gameState.current.dy;
    } else if (gameState.current.y + gameState.current.dy > canvas.height - BALL_RADIUS - 10) {
        // Paddle Hit
        if (gameState.current.x > gameState.current.paddleX && gameState.current.x < gameState.current.paddleX + PADDLE_WIDTH) {
             // Angle change based on where it hit the paddle
             const hitPoint = gameState.current.x - (gameState.current.paddleX + PADDLE_WIDTH / 2);
             gameState.current.dx = hitPoint * 0.15;
             gameState.current.dy = -gameState.current.dy * 1.05; // Speed up slightly
        } else if (gameState.current.y + gameState.current.dy > canvas.height) {
            // Game Over
            setGameOver(true);
            setIsPlaying(false);
            if (gameState.current.score > highScore) setHighScore(gameState.current.score);
            cancelAnimationFrame(gameState.current.animationId);
            return;
        }
    }

    // Move
    gameState.current.x += gameState.current.dx;
    gameState.current.y += gameState.current.dy;

    gameState.current.animationId = requestAnimationFrame(draw);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !isPlaying) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    let clientX = 0;

    if ('touches' in e) {
        clientX = e.touches[0].clientX;
    } else {
        clientX = (e as React.MouseEvent).clientX;
    }

    const relativeX = clientX - rect.left;
    if (relativeX > 0 && relativeX < canvas.width) {
        gameState.current.paddleX = relativeX - PADDLE_WIDTH / 2;
    }
  };

  useEffect(() => {
    return () => cancelAnimationFrame(gameState.current.animationId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="flex justify-between w-full max-w-[480px] mb-4 px-2 font-arcade">
        <button 
           onClick={() => setShowRules(true)} 
           className="text-indigo-400 hover:text-white flex items-center gap-2 text-xs"
        >
          <Info size={16}/> HOW TO PLAY
        </button>
        <div className="flex gap-2 items-center text-yellow-400">
            <Trophy size={20}/> {score}
        </div>
        <div className="text-gray-500 text-xs">BEST: {highScore}</div>
      </div>

      <div className="relative rounded-xl overflow-hidden border-4 border-gray-700 shadow-2xl bg-gray-900">
        <canvas
            ref={canvasRef}
            width={480}
            height={400}
            className="w-full max-w-[480px] bg-gray-900 touch-none cursor-none"
            onMouseMove={handleMouseMove}
            onTouchMove={handleMouseMove}
        />

        {/* Rules Overlay */}
        {showRules && !isPlaying && (
          <div className="absolute inset-0 bg-gray-900/95 z-50 flex flex-col p-6 text-white overflow-y-auto">
             <h3 className="text-2xl font-arcade text-arcade-neon mb-6 border-b border-gray-700 pb-4 text-center">FLIGHT MANUAL</h3>
             
             <div className="space-y-6 flex-1">
               <div className="flex items-start gap-4">
                  <div className="p-3 bg-yellow-500/20 rounded-lg text-yellow-400">
                    <MoveHorizontal size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-yellow-300">CONTROLS</h4>
                    <p className="text-sm text-gray-400">Drag or slide your finger anywhere on the screen to move the paddle left and right.</p>
                  </div>
               </div>

               <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
                    <Target size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-300">MISSION</h4>
                    <p className="text-sm text-gray-400">Deflect the energy ball to destroy all the cosmic barriers.</p>
                  </div>
               </div>

               <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-500/20 rounded-lg text-red-400">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-red-300">WARNING</h4>
                    <p className="text-sm text-gray-400">Do not let the ball breach the bottom defense line. Gravity increases speed over time.</p>
                  </div>
               </div>
             </div>

             <button 
               onClick={initGame}
               className="mt-6 w-full py-4 bg-arcade-primary hover:bg-indigo-500 text-white font-arcade rounded-lg shadow-lg transform transition hover:scale-105"
             >
               INSERT COIN / START
             </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {(!isPlaying && !showRules) && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center backdrop-blur-sm">
                {gameOver && <h2 className="text-red-500 font-arcade text-3xl mb-4">GAME OVER</h2>}
                
                <button 
                    onClick={initGame}
                    className="px-8 py-4 bg-arcade-primary hover:bg-indigo-500 text-white font-bold rounded-full shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
                >
                    {gameOver ? <RotateCcw/> : <Play/>}
                    {gameOver ? 'TRY AGAIN' : 'LAUNCH BALL'}
                </button>
                <p className="mt-4 text-gray-400 text-xs">Drag/Touch to move paddle</p>
            </div>
        )}
      </div>
    </div>
  );
};