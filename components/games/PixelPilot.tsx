import React, { useRef, useEffect, useState } from 'react';
import { Play, RotateCcw, Trophy, ArrowUp } from 'lucide-react';

export const PixelPilot: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Constants
  const GRAVITY = 0.6;
  const JUMP = -8;
  const OBSTACLE_SPEED = 3;
  const OBSTACLE_WIDTH = 50;
  const OBSTACLE_GAP = 150;
  const SPAWN_RATE = 100; // frames

  const gameState = useRef({
    birdY: 200,
    velocity: 0,
    obstacles: [] as { x: number; topHeight: number; passed: boolean }[],
    frameCount: 0,
    animationId: 0
  });

  const initGame = () => {
    gameState.current = {
      birdY: 200,
      velocity: 0,
      obstacles: [],
      frameCount: 0,
      animationId: 0
    };
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    loop();
  };

  const jump = () => {
    if (!isPlaying) return;
    gameState.current.velocity = JUMP;
  };

  const loop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Update Physics
    gameState.current.velocity += GRAVITY;
    gameState.current.birdY += gameState.current.velocity;
    gameState.current.frameCount++;

    // Spawn Obstacles
    if (gameState.current.frameCount % SPAWN_RATE === 0) {
      const minHeight = 50;
      const maxHeight = canvas.height - OBSTACLE_GAP - minHeight;
      const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
      
      gameState.current.obstacles.push({
        x: canvas.width,
        topHeight,
        passed: false
      });
    }

    // Move Obstacles
    gameState.current.obstacles.forEach(obs => {
      obs.x -= OBSTACLE_SPEED;
    });

    // Remove off-screen obstacles
    gameState.current.obstacles = gameState.current.obstacles.filter(obs => obs.x + OBSTACLE_WIDTH > 0);

    // Collision Detection
    const birdSize = 20;
    const birdX = 50;
    let collision = false;

    // Floor/Ceiling
    if (gameState.current.birdY + birdSize > canvas.height || gameState.current.birdY < 0) {
      collision = true;
    }

    // Pipes
    gameState.current.obstacles.forEach(obs => {
      // Check X overlap
      if (birdX + birdSize > obs.x && birdX < obs.x + OBSTACLE_WIDTH) {
        // Check Y overlap (Top pipe OR Bottom pipe)
        if (gameState.current.birdY < obs.topHeight || gameState.current.birdY + birdSize > obs.topHeight + OBSTACLE_GAP) {
          collision = true;
        }
      }
      
      // Score update
      if (!obs.passed && birdX > obs.x + OBSTACLE_WIDTH) {
        obs.passed = true;
        setScore(s => s + 1);
      }
    });

    // Draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Obstacles
    ctx.fillStyle = '#22c55e'; // Green
    gameState.current.obstacles.forEach(obs => {
      // Top Pipe
      ctx.fillRect(obs.x, 0, OBSTACLE_WIDTH, obs.topHeight);
      // Bottom Pipe
      ctx.fillRect(obs.x, obs.topHeight + OBSTACLE_GAP, OBSTACLE_WIDTH, canvas.height - (obs.topHeight + OBSTACLE_GAP));
      
      // Pipe Borders
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 2;
      ctx.strokeRect(obs.x, 0, OBSTACLE_WIDTH, obs.topHeight);
      ctx.strokeRect(obs.x, obs.topHeight + OBSTACLE_GAP, OBSTACLE_WIDTH, canvas.height);
    });

    // Draw Bird
    ctx.fillStyle = '#facc15'; // Yellow
    ctx.fillRect(birdX, gameState.current.birdY, birdSize, birdSize);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(birdX, gameState.current.birdY, birdSize, birdSize);

    if (collision) {
      setGameOver(true);
      setIsPlaying(false);
      if (score > highScore) setHighScore(score); // Note: score state inside loop might lag, usually ref used or effect. 
      // Fix: we use functional update for score, but for comparison we rely on current frame logic or effect. 
      // Simple fix: update high score in effect when game over changes.
    } else {
      gameState.current.animationId = requestAnimationFrame(loop);
    }
  };

  useEffect(() => {
    if (gameOver) {
       setHighScore(prev => Math.max(prev, score));
    }
  }, [gameOver]);

  useEffect(() => {
    return () => cancelAnimationFrame(gameState.current.animationId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="flex justify-between w-full max-w-[400px] mb-4 px-4 font-arcade">
        <div className="text-yellow-400">SCORE: {score}</div>
        <div className="text-gray-500">BEST: {highScore}</div>
      </div>

      <div className="relative rounded-xl overflow-hidden border-4 border-gray-700 shadow-2xl bg-sky-900">
        <canvas
          ref={canvasRef}
          width={400}
          height={500}
          onClick={jump}
          className="bg-gradient-to-b from-sky-800 to-sky-900 cursor-pointer"
        />

        {/* Start / Game Over Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center backdrop-blur-sm z-10 pointer-events-none">
             <div className="pointer-events-auto text-center">
                {gameOver && <h2 className="text-red-500 font-arcade text-3xl mb-4">CRASHED!</h2>}
                {!gameOver && <h2 className="text-yellow-400 font-arcade text-2xl mb-4">PIXEL PILOT</h2>}
                
                <button 
                  onClick={initGame}
                  className="px-8 py-4 bg-arcade-primary hover:bg-white hover:text-black text-white font-bold rounded-full shadow-lg flex items-center gap-2 transition-transform hover:scale-105 mx-auto"
                >
                  {gameOver ? <RotateCcw/> : <Play/>}
                  {gameOver ? 'RETRY' : 'FLY NOW'}
                </button>
                <p className="mt-6 text-gray-300 text-xs flex items-center justify-center gap-1">
                  <ArrowUp size={14}/> Tap or Click to Fly
                </p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};