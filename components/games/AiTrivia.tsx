import React, { useState, useEffect } from 'react';
import { generateTriviaQuestion } from '../../services/geminiService';
import { TriviaQuestion } from '../../types';
import { BrainCircuit, CheckCircle, XCircle, ArrowRight, Loader2, Sparkles, Wifi, WifiOff } from 'lucide-react';

interface AiTriviaProps {
  defaultTopic?: string;
}

export const AiTrivia: React.FC<AiTriviaProps> = ({ defaultTopic = '' }) => {
  const [topic, setTopic] = useState(defaultTopic);
  const [questionData, setQuestionData] = useState<TriviaQuestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
  
  // Check for API Key presence safely
  const hasKey = typeof process !== 'undefined' && process.env && process.env.API_KEY;

  // Auto-start if a specific topic is provided
  useEffect(() => {
    if (defaultTopic && !questionData && !loading) {
      fetchQuestion(defaultTopic);
    }
  }, [defaultTopic]);

  const fetchQuestion = async (customTopic?: string) => {
    const searchTopic = customTopic || topic || "General";
    setLoading(true);
    setQuestionData(null);
    setSelectedOption(null);
    
    // Attempt generation
    const data = await generateTriviaQuestion(searchTopic);
    
    // Heuristic: If we got a question from our known small database, we assume offline, 
    // but the service handles the logic. 
    // For UI purposes, we trust the key presence.
    setIsOffline(!hasKey);

    if (data) {
      setQuestionData(data);
    }
    setLoading(false);
  };

  const handleOptionClick = (index: number) => {
    if (selectedOption !== null) return; // Prevent changing answer
    setSelectedOption(index);
    if (questionData && index === questionData.correctAnswerIndex) {
      setScore(s => s + 100);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
  };

  const categories = ['General', 'Science', 'History', 'Technology'];

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-arcade-neon">
          <BrainCircuit />
          {defaultTopic ? `${defaultTopic.toUpperCase()} QUIZ` : 'TRIVIA MASTER'}
        </h2>
        <div className="flex gap-4 text-sm font-mono items-center">
          <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500">
             {hasKey ? <Wifi size={14} className="text-green-500"/> : <WifiOff size={14} className="text-gray-500"/>}
             {hasKey ? 'CLOUD' : 'LOCAL'}
          </div>
          <div className="bg-gray-800 px-3 py-1 rounded border border-gray-700">Score: {score}</div>
          <div className="bg-gray-800 px-3 py-1 rounded border border-gray-700 text-orange-400">Streak: {streak}</div>
        </div>
      </div>

      {/* START SCREEN */}
      {!questionData && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-light">
              {defaultTopic ? `Ready for some ${defaultTopic} questions?` : 'Select a Category'}
            </h3>
            <p className="text-gray-400 text-sm">
              {hasKey ? 'AI Generator Active' : 'Offline Library Active'}
            </p>
          </div>
          
          <div className="w-full max-w-md space-y-4">
            
            {defaultTopic ? (
               <button
               onClick={() => fetchQuestion()}
               className="w-full py-4 bg-gradient-to-r from-arcade-primary to-arcade-accent rounded-lg font-bold text-white shadow-lg hover:shadow-indigo-500/30 transition-all flex justify-center items-center gap-2"
             >
               <Sparkles size={18} />
               Start Quiz
             </button>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {categories.map(cat => (
                   <button
                   key={cat}
                   onClick={() => { setTopic(cat); fetchQuestion(cat); }}
                   className="py-6 bg-gray-800 hover:bg-arcade-primary border border-gray-700 hover:border-arcade-neon rounded-xl font-bold text-white shadow-lg transition-all flex flex-col items-center gap-2 group"
                 >
                   <span className="text-lg">{cat}</span>
                   <span className="text-xs text-gray-500 group-hover:text-white/80">Start Game</span>
                 </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-arcade-primary mb-4" size={48} />
          <p className="animate-pulse text-gray-400">
             {hasKey ? 'Generating Question...' : 'Accessing Archive...'}
          </p>
        </div>
      )}

      {/* QUESTION DISPLAY */}
      {questionData && !loading && (
        <div className="flex-1 flex flex-col justify-center animate-fadeIn">
          <div className="bg-arcade-card p-6 rounded-xl border border-gray-700 shadow-2xl mb-6">
            <h3 className="text-xl sm:text-2xl font-semibold mb-6 leading-relaxed">
              {questionData.question}
            </h3>
            
            <div className="space-y-3">
              {questionData.options.map((option, idx) => {
                let btnClass = "w-full p-4 rounded-lg text-left transition-all border-2 ";
                const isSelected = selectedOption === idx;
                const isCorrect = idx === questionData.correctAnswerIndex;
                const showResult = selectedOption !== null;

                if (showResult) {
                  if (isCorrect) btnClass += "bg-green-900/40 border-green-500 text-green-100";
                  else if (isSelected) btnClass += "bg-red-900/40 border-red-500 text-red-100";
                  else btnClass += "bg-gray-800 border-transparent opacity-50";
                } else {
                  btnClass += "bg-gray-800 border-gray-700 hover:bg-gray-700 hover:border-arcade-primary";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionClick(idx)}
                    disabled={selectedOption !== null}
                    className={btnClass}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {showResult && isCorrect && <CheckCircle size={20} className="text-green-400" />}
                      {showResult && isSelected && !isCorrect && <XCircle size={20} className="text-red-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedOption !== null && (
            <div className="animate-pulse-fast">
              <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30 mb-4 text-sm text-blue-100">
                <span className="font-bold">Fact: </span>
                {questionData.explanation}
              </div>
              <button
                onClick={() => fetchQuestion()}
                className="w-full py-3 bg-arcade-primary hover:bg-arcade-accent rounded-lg font-bold flex items-center justify-center gap-2 transition"
              >
                Next Question <ArrowRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};