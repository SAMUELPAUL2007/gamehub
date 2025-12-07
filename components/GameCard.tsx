import React from 'react';
import { GameMetadata } from '../types';
import { Gamepad2, Play } from 'lucide-react';

interface GameCardProps {
  game: GameMetadata;
  onClick: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="group relative overflow-hidden bg-arcade-card rounded-2xl p-6 border border-gray-700 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/20 hover:border-arcade-primary"
    >
      <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity text-9xl font-bold`}>
        {game.icon}
      </div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-gray-800 rounded-lg group-hover:bg-arcade-primary transition-colors text-3xl">
            {game.icon}
          </div>
          <span className="text-xs font-mono bg-black/40 px-2 py-1 rounded text-gray-400">
            {game.playerCount}
          </span>
        </div>
        
        <h3 className="text-xl font-bold mb-2 font-sans tracking-wide group-hover:text-arcade-neon transition-colors">
          {game.title}
        </h3>
        
        <p className="text-gray-400 text-sm mb-6 line-clamp-2">
          {game.description}
        </p>

        <button className="w-full py-2 rounded bg-gray-800 group-hover:bg-white group-hover:text-black font-bold text-sm transition-all flex items-center justify-center gap-2">
          <Play size={14} /> PLAY NOW
        </button>
      </div>
    </div>
  );
};