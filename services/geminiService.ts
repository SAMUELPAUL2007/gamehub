import { TriviaQuestion } from "../types";

// --- OFFLINE DATABASE (Fallback) ---
const QUESTION_DATABASE: Record<string, TriviaQuestion[]> = {
  "Science": [
    {
      question: "What is the chemical symbol for Gold?",
      options: ["Au", "Ag", "Fe", "Cu"],
      correctAnswerIndex: 0,
      explanation: "Au comes from the Latin word for gold, 'Aurum'."
    },
    {
      question: "Which planet is known as the Red Planet?",
      options: ["Venus", "Mars", "Jupiter", "Saturn"],
      correctAnswerIndex: 1,
      explanation: "Mars appears red due to iron oxide (rust) on its surface."
    },
    {
      question: "What is the powerhouse of the cell?",
      options: ["Nucleus", "Mitochondria", "Ribosome", "Cytoplasm"],
      correctAnswerIndex: 1,
      explanation: "Mitochondria generate most of the chemical energy needed to power the cell's biochemical reactions."
    },
    {
      question: "At what temperature does water boil (at sea level)?",
      options: ["90°C", "100°C", "110°C", "212°C"],
      correctAnswerIndex: 1,
      explanation: "Water boils at 100 degrees Celsius or 212 degrees Fahrenheit at standard atmospheric pressure."
    },
    {
      question: "Light travels fastest through which medium?",
      options: ["Water", "Glass", "Vacuum", "Air"],
      correctAnswerIndex: 2,
      explanation: "Light encounters zero resistance in a vacuum, travelling at roughly 300,000 km/s."
    }
  ],
  "History": [
    {
      question: "Who was the first President of the United States?",
      options: ["Thomas Jefferson", "Abraham Lincoln", "George Washington", "John Adams"],
      correctAnswerIndex: 2,
      explanation: "George Washington served as the first president of the United States from 1789 to 1797."
    },
    {
      question: "In which year did the Titanic sink?",
      options: ["1910", "1912", "1914", "1920"],
      correctAnswerIndex: 1,
      explanation: "The RMS Titanic sank in the North Atlantic Ocean on April 15, 1912."
    },
    {
      question: "Who wrote the play 'Romeo and Juliet'?",
      options: ["Charles Dickens", "Jane Austen", "William Shakespeare", "Mark Twain"],
      correctAnswerIndex: 2,
      explanation: "William Shakespeare wrote Romeo and Juliet early in his career about two young star-crossed lovers."
    },
    {
      question: "The Great Wall of China was built to protect against which group?",
      options: ["Mongols", "Romans", "Vikings", "Persians"],
      correctAnswerIndex: 0,
      explanation: "It was built to protect the Chinese states and empires against the raids and invasions of the nomadic groups of the Eurasian Steppe."
    }
  ],
  "Technology": [
    {
      question: "What does 'CPU' stand for?",
      options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Computer Power User"],
      correctAnswerIndex: 0,
      explanation: "The CPU is the primary component of a computer that acts as its 'brain'."
    },
    {
      question: "Who co-founded Microsoft?",
      options: ["Steve Jobs", "Bill Gates", "Mark Zuckerberg", "Jeff Bezos"],
      correctAnswerIndex: 1,
      explanation: "Bill Gates co-founded Microsoft with Paul Allen in 1975."
    },
    {
      question: "What represents a bit in a computer?",
      options: ["1 or 2", "0 or 1", "A or B", "True or False"],
      correctAnswerIndex: 1,
      explanation: "A bit is a binary digit, the smallest unit of data, represented by a 0 or a 1."
    }
  ],
  "General": [
    {
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Madrid", "Paris"],
      correctAnswerIndex: 3,
      explanation: "Paris is the capital and most populous city of France."
    },
    {
      question: "How many colors are in a rainbow?",
      options: ["5", "6", "7", "8"],
      correctAnswerIndex: 2,
      explanation: "The 7 colors are Red, Orange, Yellow, Green, Blue, Indigo, and Violet."
    },
    {
      question: "Which is the largest ocean on Earth?",
      options: ["Atlantic", "Indian", "Arctic", "Pacific"],
      correctAnswerIndex: 3,
      explanation: "The Pacific Ocean is the largest and deepest of Earth's oceanic divisions."
    }
  ]
};

// Fallback pool combining all questions
const ALL_QUESTIONS = [
  ...QUESTION_DATABASE.Science,
  ...QUESTION_DATABASE.History,
  ...QUESTION_DATABASE.Technology,
  ...QUESTION_DATABASE.General
];

// --- HELPER FUNCTIONS ---

const getRandomOfflineQuestion = (topic: string): TriviaQuestion => {
  let pool: TriviaQuestion[] = [];
  if (topic.toLowerCase().includes("science")) pool = QUESTION_DATABASE.Science;
  else if (topic.toLowerCase().includes("history")) pool = QUESTION_DATABASE.History;
  else if (topic.toLowerCase().includes("tech")) pool = QUESTION_DATABASE.Technology;
  else if (topic.toLowerCase().includes("general")) pool = QUESTION_DATABASE.General;
  else pool = ALL_QUESTIONS;

  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
};

// --- MAIN SERVICE ---

export const generateTriviaQuestion = async (topic: string): Promise<TriviaQuestion | null> => {
  try {
    // 1. Attempt to access Key (Safe check)
    // We use process.env.API_KEY as the variable name, assuming your .env has API_KEY=...
    const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : undefined;

    // 2. If Key exists and looks like a Groq key (usually starts with gsk_), try Online
    if (apiKey && apiKey.length > 10) {
       console.log("Attempting Online Generation with Groq...");
       
       const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${apiKey}`,
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({
           messages: [{
             role: "user",
             content: `Generate a multiple choice trivia question about "${topic}". 
             Return ONLY raw JSON (no markdown) with this format: 
             { "question": "string", "options": ["string", "string", "string", "string"], "correctAnswerIndex": number, "explanation": "string" }`
           }],
           model: "llama3-8b-8192", // Fast, free model on Groq
           response_format: { type: "json_object" }
         })
       });

       if (response.ok) {
         const data = await response.json();
         const content = JSON.parse(data.choices[0].message.content);
         return content;
       } else {
         console.warn("Groq API returned error, switching to offline.", response.status);
       }
    }
  } catch (error) {
    console.warn("Online generation failed (Network/Key Error), switching to offline.", error);
  }

  // 3. Fallback (Offline Mode)
  // Simulate a small delay so the UI doesn't flicker too fast
  await new Promise(resolve => setTimeout(resolve, 600));
  return getRandomOfflineQuestion(topic);
};