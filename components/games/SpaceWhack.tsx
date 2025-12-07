import React, { useState, useEffect, useRef } from 'react';
import { Ghost, Crosshair, Play, RotateCcw, Timer, Zap } from 'lucide-react';

const GRID_SIZE = 9;

interface SpaceWhackProps {
  mode?: 'CLASSIC' | 'BLITZ';
}

export const SpaceWhack: React.FC<SpaceWhackProps> = ({ mode = 'CLASSIC' }) => {
  const GAME_DURATION = mode === 'BLITZ' ? 15 : 30;
  
  const [activeHole, setActiveHole] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const moleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setIsPlaying(true);
    setGameResult(null);
    runGameLoop();
  };

  const runGameLoop = () => {
    // Timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Mole Spawning logic
    spawnMole();
  };

  const spawnMole = () => {
    if (moleTimerRef.current) clearTimeout(moleTimerRef.current);
    
    // Pick random time for how long mole stays up (400ms to 900ms) - gets faster with score?
    // Blitz mode is 30% faster
    const speedModifier = mode === 'BLITZ' ? 0.7 : 1;
    const stayTime = Math.max(300, (1000 - (score * 10)) * speedModifier); 
    
    // Pick random hole
    const randomHole = Math.floor(Math.random() * GRID_SIZE);
    
    setActiveHole(randomHole);

    // Hide mole after time
    moleTimerRef.current = setTimeout(() => {
      setActiveHole(null);
      // Wait a tiny bit before next spawn
      const gap = (Math.random() * 500 + 200) * speedModifier;
      if (timeLeft > 0) {
          setTimeout(spawnMole, gap);
      }
    }, stayTime);
  };

  const endGame = () => {
    setIsPlaying(false);
    setActiveHole(null);
    if (timerRef.current) clearInterval(timerRef.current);
    if (moleTimerRef.current) clearTimeout(moleTimerRef.current);
    
    let result = "Cadet";
    if (score > 15) result = "Space Ranger";
    if (score > 30) result = "Galactic Hero";
    if (score > 50) result = "Legendary Hunter";
    setGameResult(result);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (moleTimerRef.current) clearTimeout(moleTimerRef.current);
    };
  }, []);

  const handleWhack = (index: number) => {
    if (!isPlaying) return;
    
    if (index === activeHole) {
      setScore(s => s + 1);
      setActiveHole(null); // Hide immediately
      // Spawn next one faster
      if (moleTimerRef.current) clearTimeout(moleTimerRef.current);
      setTimeout(spawnMole, 200);
    } else {
        // Penalty? Maybe simply miss.
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto h-full">
      {/* Header */}
      <div className="flex justify-between items-center w-full mb-6 px-4">
        <div className="flex items-center gap-2">
            <Timer className="text-yellow-400"/>
            <span className="font-arcade text-xl w-12">{timeLeft}s</span>
        </div>
        <div className="flex flex-col items-center">
            <h2 className="text-2xl font-arcade text-arcade-neon text-center">SPACE WHACK</h2>
            {mode === 'BLITZ' && <span className="text-xs font-bold text-red-400 flex items-center gap-1"><Zap size={10}/> BLITZ MODE</span>}
        </div>
        <div className="flex items-center gap-2">
            <Crosshair className="text-red-400"/>
            <span className="font-arcade text-xl">{score}</span>
        </div>
      </div>

      {/* Grid */}
      <div className="relative bg-gray-800 p-6 rounded-3xl border-4 border-gray-700 shadow-2xl">
        
        {/* Game Over / Start Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center">
             {gameResult ? (
                 <>
                   <div className="text-gray-400 text-sm mb-2">TIME UP!</div>
                   <div className="text-4xl font-arcade text-white mb-2">{score}</div>
                   <div className="text-arcade-neon text-xl mb-6">Rank: {gameResult}</div>
                 </>
             ) : (
                <div className="mb-6">
                    <Ghost size={48} className="text-arcade-primary mx-auto mb-2 animate-bounce"/>
                    <p className="text-gray-300">Whack the aliens before they vanish!</p>
                </div>
             )}
             
             <button 
               onClick={startGame}
               className="px-8 py-4 bg-arcade-primary hover:bg-arcade-accent text-white font-bold rounded-full flex items-center gap-2 transition-transform hover:scale-105 shadow-lg"
             >
               {gameResult ? <RotateCcw/> : <Play/>}
               {gameResult ? 'PLAY AGAIN' : 'START MISSION'}
             </button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: GRID_SIZE }).map((_, i) => (
            <button
              key={i}
              onClick={() => handleWhack(i)}
              disabled={!isPlaying}
              className={`
                w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 relative overflow-hidden transition-all active:scale-95
                ${activeHole === i ? 'border-arcade-neon bg-gray-900' : 'border-gray-600 bg-black'}
                flex items-center justify-center
              `}
            >
                {/* Hole background effect */}
                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,rgba(0,0,0,1)_70%)]"></div>
                
                {/* Alien */}
                <div className={`
                    relative z-10 transition-all duration-100 transform
                    ${activeHole === i ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-50'}
                `}>
                    <Ghost size={48} className={`drop-shadow-[0_0_15px_rgba(0,243,255,0.8)] ${mode === 'BLITZ' ? 'text-red-500' : 'text-arcade-neon'}`} />
                </div>
            </button>
          ))}
        </div>
      </div>
      
      <div className="mt-6 text-gray-500 text-sm">
        Tap the aliens as fast as you can!
      </div>
    </div>
  );
};