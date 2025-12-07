export enum GameType {
  NONE = 'NONE',
  TIC_TAC_TOE = 'TIC_TAC_TOE',
  TIC_TAC_TOE_NEON = 'TIC_TAC_TOE_NEON',
  SNAKE = 'SNAKE',
  SNAKE_FAST = 'SNAKE_FAST',
  SNAKE_EXTREME = 'SNAKE_EXTREME',
  MEMORY = 'MEMORY',
  MEMORY_FOOD = 'MEMORY_FOOD',
  MEMORY_ANIMALS = 'MEMORY_ANIMALS',
  TRIVIA_AI = 'TRIVIA_AI',
  TRIVIA_SCIENCE = 'TRIVIA_SCIENCE',
  TRIVIA_HISTORY = 'TRIVIA_HISTORY',
  TRIVIA_TECH = 'TRIVIA_TECH',
  GRAVITY_CONNECT = 'GRAVITY_CONNECT',
  NEON_SEQUENCE = 'NEON_SEQUENCE',
  CYBER_2048 = 'CYBER_2048',
  SPACE_WHACK = 'SPACE_WHACK',
  SPACE_WHACK_BLITZ = 'SPACE_WHACK_BLITZ',
  COSMIC_BREAKER = 'COSMIC_BREAKER',
  CYBER_MINES = 'CYBER_MINES',
  PIXEL_PILOT = 'PIXEL_PILOT',
  MATH_SPRINT = 'MATH_SPRINT',
  MATH_EXPERT = 'MATH_EXPERT'
}

export interface GameMetadata {
  id: GameType;
  title: string;
  description: string;
  icon: string;
  color: string;
  playerCount: string;
}

// Trivia Types
export interface TriviaQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

// Snake Types
export interface Point {
  x: number;
  y: number;
}