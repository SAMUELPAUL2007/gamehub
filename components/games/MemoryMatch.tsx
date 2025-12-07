import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

const THEMES = {
  classic: ['🚀', '🎮', '👾', '🤖', '🎲', '🎸', '🍕', '🐱'],
  food: ['🍔', '🍟', '🌭', '🍿', '🍩', '🍪', '🥑', '🌮'],
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼']
};

interface Card {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryMatchProps {
  theme?: 'classic' | 'food' | 'animals';
}

export const MemoryMatch: React.FC<MemoryMatchProps> = ({ theme = 'classic' }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [turns, setTurns] = useState(0);
  const [choiceOne, setChoiceOne] = useState<Card | null>(null);
  const [choiceTwo, setChoiceTwo] = useState<Card | null>(null);
  const [disabled, setDisabled] = useState(false);

  // Shuffle cards
  const shuffleCards = () => {
    const icons = THEMES[theme];
    const shuffledCards = [...icons, ...icons]
      .sort(() => Math.random() - 0.5)
      .map((icon) => ({ 
        id: Math.random(), 
        icon, 
        isFlipped: false, 
        isMatched: false 
      }));

    setChoiceOne(null);
    setChoiceTwo(null);
    setCards(shuffledCards);
    setTurns(0);
  };

  useEffect(() => {
    shuffleCards();
  }, [theme]);

  // Handle a choice
  const handleChoice = (card: Card) => {
    if (choiceOne) {
      setChoiceTwo(card);
    } else {
      setChoiceOne(card);
    }
  };

  // Compare 2 selected cards
  useEffect(() => {
    if (choiceOne && choiceTwo) {
      setDisabled(true);
      if (choiceOne.icon === choiceTwo.icon) {
        setCards(prevCards => {
          return prevCards.map(card => {
            if (card.icon === choiceOne.icon) {
              return { ...card, isMatched: true };
            }
            return card;
          });
        });
        resetTurn();
      } else {
        setTimeout(() => resetTurn(), 1000);
      }
    }
  }, [choiceOne, choiceTwo]);

  const resetTurn = () => {
    setChoiceOne(null);
    setChoiceTwo(null);
    setTurns(prevTurns => prevTurns + 1);
    setDisabled(false);
  };

  const isCompleted = cards.length > 0 && cards.every(c => c.isMatched);
  
  const getGradient = () => {
    if (theme === 'food') return 'from-orange-500 to-red-600';
    if (theme === 'animals') return 'from-green-500 to-emerald-700';
    return 'from-indigo-600 to-purple-700';
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-4">
      <div className="flex justify-between items-center w-full max-w-lg mb-6">
        <h2 className="text-2xl font-arcade uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
          {theme} MEMORY
        </h2>
        <div className="bg-gray-800 px-4 py-2 rounded-full font-bold">
          Turns: {turns}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 sm:gap-4 w-full max-w-lg aspect-square">
        {cards.map(card => (
          <div 
            key={card.id} 
            className="relative cursor-pointer group"
            onClick={() => {
              if (!disabled && !card.isFlipped && !card.isMatched) {
                handleChoice(card);
              }
            }}
          >
            <div 
              className={`
                w-full h-full aspect-square rounded-xl transition-all duration-500 transform-style-3d
                flex items-center justify-center text-3xl sm:text-5xl shadow-lg
                ${(card.isFlipped || card === choiceOne || card === choiceTwo || card.isMatched) ? 'rotate-y-180 bg-gray-800' : `bg-gradient-to-br ${getGradient()}`}
              `}
              style={{ 
                transformStyle: 'preserve-3d',
                transform: (card === choiceOne || card === choiceTwo || card.isMatched) ? 'rotateY(180deg)' : 'rotateY(0deg)'
               }}
            >
              {/* Front (Hidden state) */}
              <div 
                className="absolute inset-0 backface-hidden flex items-center justify-center"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <span className="text-white/20 font-bold text-2xl">?</span>
              </div>

              {/* Back (Revealed state) */}
              <div 
                className="absolute inset-0 backface-hidden flex items-center justify-center"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isCompleted && (
        <div className="mt-8 text-center animate-bounce">
          <h3 className="text-2xl font-bold text-arcade-success mb-2">Well Done!</h3>
          <button
            onClick={shuffleCards}
            className="px-6 py-2 bg-white text-gray-900 rounded-full font-bold hover:bg-gray-200 transition flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={18} />
            Restart
          </button>
        </div>
      )}
      
      {!isCompleted && (
        <button
          onClick={shuffleCards}
          className="mt-6 px-4 py-2 text-sm text-gray-400 hover:text-white flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Reset Board
        </button>
      )}
    </div>
  );
};