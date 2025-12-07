import React, { useState } from 'react';
import { GameType, GameMetadata } from './types';
import { TicTacToe } from './components/games/TicTacToe';
import { Snake } from './components/games/Snake';
import { MemoryMatch } from './components/games/MemoryMatch';
import { AiTrivia } from './components/games/AiTrivia';
import { GravityConnect } from './components/games/GravityConnect';
import { NeonSequence } from './components/games/NeonSequence';
import { Cyber2048 } from './components/games/Cyber2048';
import { SpaceWhack } from './components/games/SpaceWhack';
import { CosmicBreaker } from './components/games/CosmicBreaker';
import { CyberMines } from './components/games/CyberMines';
import { PixelPilot } from './components/games/PixelPilot';
import { MathSprint } from './components/games/MathSprint';
import { GameCard } from './components/GameCard';
import { ArrowLeft, Gamepad2, Info, Star, Code, Cpu, Palette, Zap } from 'lucide-react';

const GAMES: GameMetadata[] = [
  // --- Featured / New ---
  {
    id: GameType.PIXEL_PILOT,
    title: "Pixel Pilot",
    description: "Tap to fly. Avoid the pipes. The ultimate reflex test.",
    icon: "✈️",
    color: "text-yellow-400",
    playerCount: "Endless"
  },
  
  // --- Strategy Games ---
  {
    id: GameType.GRAVITY_CONNECT,
    title: "Gravity Connect",
    description: "Connect 4 discs in a row. Drop wisely!",
    icon: "🔴",
    color: "text-blue-500",
    playerCount: "PvP / CPU"
  },
  {
    id: GameType.TIC_TAC_TOE,
    title: "Tic Tac Toe",
    description: "Classic Xs and Os. Professional Mode.",
    icon: "⭕",
    color: "text-blue-500",
    playerCount: "PvP / PvE"
  },
  {
    id: GameType.TIC_TAC_TOE_NEON,
    title: "Neon Tic Tac Toe",
    description: "Glowing futuristic version of the classic.",
    icon: "💠",
    color: "text-cyan-500",
    playerCount: "PvP / PvE"
  },
  {
    id: GameType.CYBER_2048,
    title: "Cyber 2048",
    description: "Merge the neon tiles. Reach 2048.",
    icon: "🔢",
    color: "text-yellow-400",
    playerCount: "Puzzle"
  },
  {
    id: GameType.CYBER_MINES,
    title: "Cyber Mines",
    description: "Hack the grid. Avoid the security nodes.",
    icon: "💣",
    color: "text-green-500",
    playerCount: "Logic"
  },

  // --- Reflex Games ---
  {
    id: GameType.COSMIC_BREAKER,
    title: "Cosmic Breaker",
    description: "Smash bricks with physics-based action.",
    icon: "🧱",
    color: "text-indigo-400",
    playerCount: "Arcade"
  },
  {
    id: GameType.NEON_SEQUENCE,
    title: "Neon Sequence",
    description: "Follow the light pattern. How far can you go?",
    icon: "🔊",
    color: "text-green-400",
    playerCount: "Reflex"
  },
  {
    id: GameType.SPACE_WHACK,
    title: "Space Whack",
    description: "Whack the alien invaders! Fast paced action.",
    icon: "👽",
    color: "text-purple-400",
    playerCount: "Action"
  },
  {
    id: GameType.SPACE_WHACK_BLITZ,
    title: "Alien Blitz",
    description: "Extreme speed mode. 15 seconds of chaos.",
    icon: "⚡",
    color: "text-red-400",
    playerCount: "Speed"
  },
  {
    id: GameType.SNAKE,
    title: "Snake Classic",
    description: "The original grid navigator. Eat, grow, survive.",
    icon: "🐍",
    color: "text-green-500",
    playerCount: "Classic"
  },
  {
    id: GameType.SNAKE_EXTREME,
    title: "Snake Extreme",
    description: "High velocity snake for the pros.",
    icon: "🐉",
    color: "text-red-500",
    playerCount: "Hardcore"
  },
  
  // --- Brain & Trivia ---
  {
    id: GameType.MATH_SPRINT,
    title: "Math Sprint",
    description: "Solve rapid-fire math problems against the clock.",
    icon: "➗",
    color: "text-orange-400",
    playerCount: "Brain"
  },
  {
    id: GameType.MATH_EXPERT,
    title: "Math Expert",
    description: "Complex equations for the true genius.",
    icon: "🧮",
    color: "text-red-500",
    playerCount: "Hardcore"
  },
  {
    id: GameType.MEMORY,
    title: "Memory Core",
    description: "Match the pairs. Train your brain.",
    icon: "🧠",
    color: "text-pink-500",
    playerCount: "Casual"
  },
  {
    id: GameType.MEMORY_FOOD,
    title: "Food Match",
    description: "Hungry? Match the delicious snacks.",
    icon: "🍔",
    color: "text-orange-500",
    playerCount: "Casual"
  },
  {
    id: GameType.MEMORY_ANIMALS,
    title: "Animal Match",
    description: "Cute animal pairs for relaxing fun.",
    icon: "🐼",
    color: "text-teal-500",
    playerCount: "Casual"
  },
  {
    id: GameType.TRIVIA_AI,
    title: "Trivia Master",
    description: "Infinite quiz on any topic you can imagine.",
    icon: "🤖",
    color: "text-purple-500",
    playerCount: "AI Host"
  },
  {
    id: GameType.TRIVIA_SCIENCE,
    title: "Science Lab",
    description: "Physics, Chemistry, and Biology challenges.",
    icon: "🧬",
    color: "text-blue-400",
    playerCount: "Learning"
  },
  {
    id: GameType.TRIVIA_HISTORY,
    title: "Time Travel",
    description: "Test your knowledge of historical events.",
    icon: "🏛️",
    color: "text-amber-600",
    playerCount: "History"
  },
];

export default function App() {
  const [activeGame, setActiveGame] = useState<GameType>(GameType.NONE);
  const [showAbout, setShowAbout] = useState(false);

  const renderGame = () => {
    switch (activeGame) {
      // New
      case GameType.PIXEL_PILOT:
        return <PixelPilot />;
      case GameType.MATH_SPRINT:
        return <MathSprint difficulty="STANDARD" />;
      case GameType.MATH_EXPERT:
        return <MathSprint difficulty="EXPERT" />;
      
      // Strategy
      case GameType.TIC_TAC_TOE:
        return <TicTacToe variant="classic" />;
      case GameType.TIC_TAC_TOE_NEON:
        return <TicTacToe variant="neon" />;
      case GameType.GRAVITY_CONNECT:
        return <GravityConnect />;
      case GameType.CYBER_2048:
        return <Cyber2048 />;
      case GameType.CYBER_MINES:
        return <CyberMines />;
        
      // Reflex
      case GameType.COSMIC_BREAKER:
        return <CosmicBreaker />;
      case GameType.NEON_SEQUENCE:
        return <NeonSequence />;
      case GameType.SPACE_WHACK:
        return <SpaceWhack mode="CLASSIC" />;
      case GameType.SPACE_WHACK_BLITZ:
        return <SpaceWhack mode="BLITZ" />;
      case GameType.SNAKE:
        return <Snake modeName="CLASSIC" initialSpeed={150} />;
      case GameType.SNAKE_FAST:
        return <Snake modeName="BLITZ" initialSpeed={100} />;
      case GameType.SNAKE_EXTREME:
        return <Snake modeName="EXTREME" initialSpeed={60} />;
        
      // Brain
      case GameType.MEMORY:
        return <MemoryMatch theme="classic" />;
      case GameType.MEMORY_FOOD:
        return <MemoryMatch theme="food" />;
      case GameType.MEMORY_ANIMALS:
        return <MemoryMatch theme="animals" />;
      case GameType.TRIVIA_AI:
        return <AiTrivia />;
      case GameType.TRIVIA_SCIENCE:
        return <AiTrivia defaultTopic="Science" />;
      case GameType.TRIVIA_HISTORY:
        return <AiTrivia defaultTopic="History" />;
      case GameType.TRIVIA_TECH:
        return <AiTrivia defaultTopic="Technology" />;
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-arcade-dark text-white font-sans selection:bg-arcade-primary selection:text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setActiveGame(GameType.NONE)}
          >
            <div className="bg-arcade-primary p-2 rounded-lg group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-500/20">
              <Gamepad2 size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-arcade tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 group-hover:to-arcade-neon transition-all">
              ARCADE<span className="text-arcade-primary">X</span> <span className="text-xs text-arcade-accent font-sans tracking-normal border border-arcade-accent px-1 rounded ml-1">ULTIMATE</span>
            </h1>
          </div>
          
          <button 
            onClick={() => setShowAbout(!showAbout)}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <Info size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-grow">
        
        {/* Modal: About */}
        {showAbout && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowAbout(false)}>
            <div className="bg-arcade-card p-6 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl font-arcade pointer-events-none">X</div>
              
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Info size={24} className="text-arcade-primary"/> About ArcadeX
              </h2>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                ArcadeX Ultimate is a professional, free-to-play multi-game platform. 
                Experience classic arcade action re-imagined with modern design and AI-powered infinite content.
              </p>

              {/* Tech Stack Badge Section */}
              <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                   <Zap size={12} className="text-yellow-400" /> Powered by Open Source
                </h3>
                <div className="grid grid-cols-2 gap-3">
                   <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Code size={16} className="text-blue-400"/> React + TypeScript
                   </div>
                   <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Palette size={16} className="text-teal-400"/> Tailwind CSS
                   </div>
                   <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Cpu size={16} className="text-arcade-neon"/> Gemini AI
                   </div>
                   <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Star size={16} className="text-orange-400"/> Lucide Icons
                   </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 font-mono bg-black/30 p-3 rounded text-center">
                v2.5.0 • 25+ Games • 100% Free
              </div>
              
              <button 
                onClick={() => setShowAbout(false)}
                className="mt-6 w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* View: Game Selection Dashboard */}
        {activeGame === GameType.NONE && (
          <div className="animate-fadeIn pb-10">
            <div className="text-center mb-12 space-y-4 pt-4">
              <div className="inline-flex items-center gap-2 bg-gray-800/50 px-4 py-1 rounded-full text-sm text-arcade-accent mb-2 border border-arcade-accent/20">
                 <Star size={14} fill="currentColor" /> 25+ Free Games Available
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
                SELECT YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-arcade-primary to-arcade-neon">GAME</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                The ultimate browser arcade collection. Strategy, Reflexes, and AI Knowledge.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {GAMES.map(game => (
                <GameCard 
                  key={game.id} 
                  game={game} 
                  onClick={() => setActiveGame(game.id)} 
                />
              ))}
            </div>
          </div>
        )}

        {/* View: Active Game Wrapper */}
        {activeGame !== GameType.NONE && (
          <div className="h-full flex flex-col animate-slideUp">
            <button 
              onClick={() => setActiveGame(GameType.NONE)}
              className="self-start mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors hover:-translate-x-1 transform duration-200"
            >
              <ArrowLeft size={20} /> Back to Library
            </button>
            
            <div className="flex-1 bg-gray-900/50 rounded-3xl border border-gray-800 shadow-2xl overflow-hidden backdrop-blur-sm relative min-h-[600px] flex items-center justify-center">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(99,102,241,0.1),rgba(255,255,255,0))]" />
               <div className="relative z-10 w-full h-full p-4 md:p-8 flex items-center justify-center">
                 {renderGame()}
               </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
           <h3 className="font-arcade text-gray-700 text-lg mb-2">ARCADE X</h3>
           <p className="text-gray-600 text-sm">
             &copy; {new Date().getFullYear()} Ultimate Game Collection. Free to play.
           </p>
        </div>
      </footer>
    </div>
  );
}