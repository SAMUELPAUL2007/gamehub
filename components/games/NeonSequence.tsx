import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Zap } from 'lucide-react';

const COLORS = [
  { id: 0, color: 'bg-green-500', active: 'bg-green-300 shadow-[0_0_30px_#4ade80]', sound: 261.63 }, // C4
  { id: 1, color: 'bg-red-500', active: 'bg-red-300 shadow-[0_0_30px_#f87171]', sound: 329.63 },   // E4
  { id: 2, color: 'bg-yellow-400', active: 'bg-yellow-200 shadow-[0_0_30px_#facc15]', sound: 392.00 }, // G4
  { id: 3, color: 'bg-blue-500', active: 'bg-blue-300 shadow-[0_0_30px_#60a5fa]', sound: 523.25 }    // C5
];

export const NeonSequence: React.FC = () => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [isPlayingSeq, setIsPlayingSeq] = useState(false);
  const [userStep, setUserStep] = useState(0);
  const [activeLight, setActiveLight] = useState<number | null>(null);
  const [gameStatus, setGameStatus] = useState<'IDLE' | 'PLAYING' | 'GAME_OVER'>('IDLE');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // --- Game Logic ---

  const startGame = () => {
    setSequence([]);
    setScore(0);
    setGameStatus('PLAYING');
    setUserStep(0);
    // Wait a sec then start round 1
    setTimeout(() => nextRound([]), 1000);
  };

  const nextRound = (currentSeq: number[]) => {
    const nextColor = Math.floor(Math.random() * 4);
    const newSeq = [...currentSeq, nextColor];
    setSequence(newSeq);
    setUserStep(0);
    setIsPlayingSeq(true);
    playSequence(newSeq);
  };

  const playSequence = async (seq: number[]) => {
    // Delay between lights speeds up as you go further
    const delay = Math.max(300, 800 - (seq.length * 40)); 
    
    for (let i = 0; i < seq.length; i++) {
      await new Promise(resolve => setTimeout(resolve, delay));
      flashLight(seq[i]);
      await new Promise(resolve => setTimeout(resolve, delay / 2));
    }
    setIsPlayingSeq(false);
  };

  const flashLight = (index: number) => {
    setActiveLight(index);
    setTimeout(() => setActiveLight(null), 300);
  };

  const handlePadClick = (index: number) => {
    if (gameStatus !== 'PLAYING' || isPlayingSeq) return;

    flashLight(index);

    if (index === sequence[userStep]) {
      // Correct
      if (userStep === sequence.length - 1) {
        // Round Complete
        const newScore = score + 1;
        setScore(newScore);
        if (newScore > highScore) setHighScore(newScore);
        setTimeout(() => nextRound(sequence), 1000);
      } else {
        // Continue sequence
        setUserStep(prev => prev + 1);
      }
    } else {
      // Wrong
      setGameStatus('GAME_OVER');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="flex justify-between w-full max-w-sm mb-8 px-4 font-arcade text-sm sm:text-base">
        <div className="text-gray-400">BEST: <span className="text-white">{highScore}</span></div>
        <div className="text-arcade-neon">SCORE: {score}</div>
      </div>

      <div className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gray-800 border-8 border-gray-700 shadow-2xl overflow-hidden">
        {/* Center Hub */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 bg-gray-900 rounded-full z-10 border-4 border-gray-700 flex items-center justify-center">
          {gameStatus === 'IDLE' && (
            <button 
              onClick={startGame}
              className="text-white font-arcade hover:text-arcade-neon transition-colors flex flex-col items-center"
            >
              <Play size={32} />
              <span className="text-xs mt-2">START</span>
            </button>
          )}
          {gameStatus === 'GAME_OVER' && (
             <button 
             onClick={startGame}
             className="text-red-500 font-arcade hover:text-white transition-colors flex flex-col items-center"
           >
             <RotateCcw size={32} />
             <span className="text-xs mt-2">RETRY</span>
           </button>
          )}
           {gameStatus === 'PLAYING' && (
             <div className="text-arcade-neon animate-pulse font-bold text-2xl">
               {isPlayingSeq ? 'WATCH' : 'GO!'}
             </div>
           )}
        </div>

        {/* Pads */}
        <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
          {COLORS.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => handlePadClick(item.id)}
              className={`
                w-full h-full transition-all duration-100 border-2 border-gray-900/50
                ${activeLight === item.id ? item.active : item.color}
                ${item.id === 0 ? 'rounded-tl-full' : ''}
                ${item.id === 1 ? 'rounded-tr-full' : ''}
                ${item.id === 2 ? 'rounded-bl-full' : ''}
                ${item.id === 3 ? 'rounded-br-full' : ''}
                ${gameStatus === 'PLAYING' && !isPlayingSeq ? 'hover:opacity-90 active:scale-95' : 'cursor-default opacity-80'}
              `}
            />
          ))}
        </div>
      </div>

      <div className="mt-8 text-center text-gray-500 text-sm max-w-xs">
        {gameStatus === 'IDLE' ? 'Repeat the growing pattern of lights.' : 
         gameStatus === 'GAME_OVER' ? 'Pattern broken!' : 
         'Memorize the sequence...'}
      </div>
    </div>
  );
};