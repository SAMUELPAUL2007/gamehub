import React, { useState, useEffect, useRef } from 'react';
import { Timer, Check, X, Trophy, RefreshCw, Calculator, Play } from 'lucide-react';

interface MathSprintProps {
  difficulty?: 'STANDARD' | 'EXPERT';
}

export const MathSprint: React.FC<MathSprintProps> = ({ difficulty = 'STANDARD' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [problem, setProblem] = useState({ text: '', answer: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState<'CORRECT' | 'WRONG' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [userAnswer, setUserAnswer] = useState('');

  const generateProblem = () => {
    const types = ['+', '-', '*'];
    const type = types[Math.floor(Math.random() * 3)];
    
    // Difficulty Scaling
    const maxNum = difficulty === 'EXPERT' ? 50 : 20;
    const maxMult = difficulty === 'EXPERT' ? 15 : 12;

    let n1 = Math.floor(Math.random() * maxNum) + 1;
    let n2 = Math.floor(Math.random() * maxNum) + 1;
    let text = '';
    let answer = 0;

    if (type === '+') {
      text = `${n1} + ${n2}`;
      answer = n1 + n2;
    } else if (type === '-') {
      // Ensure positive result for simplicity
      if (n1 < n2) [n1, n2] = [n2, n1];
      text = `${n1} - ${n2}`;
      answer = n1 - n2;
    } else {
      // Simplify multiplication range
      n1 = Math.floor(Math.random() * maxMult) + 1;
      n2 = Math.floor(Math.random() * 10) + 1;
      text = `${n1} × ${n2}`;
      answer = n1 * n2;
    }
    setProblem({ text, answer });
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(difficulty === 'EXPERT' ? 45 : 30);
    setIsPlaying(true);
    setGameOver(false);
    setUserAnswer('');
    generateProblem();
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
      setGameOver(true);
    }
  }, [isPlaying, timeLeft]);

  const checkAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPlaying) return;

    const val = parseInt(userAnswer);
    if (val === problem.answer) {
      setScore(s => s + (difficulty === 'EXPERT' ? 20 : 10));
      setFeedback('CORRECT');
      setTimeLeft(t => t + (difficulty === 'EXPERT' ? 2 : 1)); // Bonus time
      generateProblem();
      setUserAnswer('');
    } else {
      setFeedback('WRONG');
      setTimeLeft(t => Math.max(0, t - 2)); // Penalty
    }

    setTimeout(() => setFeedback(null), 500);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto">
      <div className="flex justify-between w-full mb-6 px-4">
        <div className="flex items-center gap-2 text-arcade-neon font-arcade text-xl">
          <Timer className={timeLeft < 5 ? 'animate-ping text-red-500' : ''}/> {timeLeft}s
        </div>
        <div className="flex items-center gap-2 text-yellow-400 font-arcade text-xl">
          <Trophy /> {score}
        </div>
      </div>

      <div className={`
        w-full bg-gray-800 p-8 rounded-2xl border-4 shadow-2xl transition-colors duration-300
        ${feedback === 'CORRECT' ? 'border-green-500' : feedback === 'WRONG' ? 'border-red-500' : 'border-gray-700'}
      `}>
        {!isPlaying ? (
          <div className="text-center py-8">
             <div className="bg-gray-900 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-arcade-primary">
                <Calculator size={48} className="text-arcade-primary" />
             </div>
             <h2 className="text-3xl font-arcade text-white mb-2">{gameOver ? 'TIME UP!' : 'MATH SPRINT'}</h2>
             <span className="text-xs font-bold bg-gray-700 px-2 py-1 rounded text-gray-300 mb-4 inline-block">{difficulty} MODE</span>
             
             {gameOver && <p className="text-xl text-yellow-400 mb-6 font-bold">Final Score: {score}</p>}
             
             <button 
               onClick={startGame}
               className="w-full py-4 bg-arcade-primary hover:bg-arcade-accent text-white font-bold rounded-xl shadow-lg transform transition active:scale-95 flex items-center justify-center gap-2"
             >
               {gameOver ? <RefreshCw/> : <Play/>}
               {gameOver ? 'TRY AGAIN' : 'START SPRINT'}
             </button>
             <p className="mt-4 text-gray-500 text-xs">Solve fast to gain time. Wrong answers reduce time.</p>
          </div>
        ) : (
          <form onSubmit={checkAnswer} className="flex flex-col items-center">
             <div className="text-gray-400 text-sm mb-2 uppercase tracking-widest font-bold">Calculate</div>
             <div className="text-5xl sm:text-6xl font-black text-white mb-8 tracking-wide font-arcade text-center">
               {problem.text}
             </div>
             
             <div className="relative w-full">
               <input 
                 ref={inputRef}
                 type="number" 
                 value={userAnswer}
                 onChange={(e) => setUserAnswer(e.target.value)}
                 className="w-full bg-gray-900 border-2 border-gray-600 rounded-xl px-4 py-4 text-center text-3xl font-bold text-white focus:border-arcade-neon focus:ring-2 focus:ring-arcade-neon outline-none"
                 placeholder="?"
                 autoFocus
               />
               <button 
                 type="submit"
                 className="absolute right-2 top-2 bottom-2 bg-gray-700 hover:bg-arcade-primary px-4 rounded-lg transition-colors text-white"
               >
                 <Check />
               </button>
             </div>
          </form>
        )}
      </div>
      
      {/* Feedback Overlay Effect */}
      {feedback && (
        <div className={`
          absolute inset-0 flex items-center justify-center z-50 pointer-events-none animate-fadeOut
          ${feedback === 'CORRECT' ? 'bg-green-500/20' : 'bg-red-500/20'}
        `}>
           {feedback === 'CORRECT' ? 
             <Check size={120} className="text-green-400 drop-shadow-lg" /> : 
             <X size={120} className="text-red-500 drop-shadow-lg" />
           }
        </div>
      )}
    </div>
  );
};