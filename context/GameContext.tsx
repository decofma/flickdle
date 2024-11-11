import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
} from "react";
import { MovieThemes, musicMovies } from "@/data/movieThemes";

type GameContextType = {
  score: number;
  currentSong: string;
  checkAnswer: (answer: string) => boolean;
  isGameOver: boolean;
  playDuration: number;
  filteredAnswers: string[];
  filterTitles: (query: string) => void;
  dailySong: MovieThemes;
};

type GameProviderProps = {
  children: ReactNode;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [score, setScore] = useState(0);
  const [currentSong, setCurrentSong] = useState("");
  const [isGameOver, setIsGameOver] = useState(false);
  const [playDuration, setPlayDuration] = useState(5);
  const [attempt, setAttempt] = useState(0);
  const [filteredAnswers, setFilteredAnswers] = useState<string[]>([]);

  // Seed para música fixa do dia
  const getDailySeed = () => {
    const today = new Date();
    return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  };

  const getRandomSongBySeed = (seed: number) => {
    const index = seed % musicMovies.length;
    return musicMovies[index];
  };

  const dailySong = useMemo(() => {
    const seed = getDailySeed();
    return getRandomSongBySeed(seed);
  }, []);

  useEffect(() => {
    setCurrentSong(dailySong.src);
    loadGameState();
  }, [dailySong]);

  // Carrega o progresso do jogo do usuário do Local Storage
  const loadGameState = () => {
    const savedState = localStorage.getItem("gameState");
    if (savedState) {
      const { score, isGameOver } = JSON.parse(savedState);
      setScore(score);
      setIsGameOver(isGameOver);
    }
  };

  // Salva o progresso do jogo no Local Storage
  const saveGameState = () => {
    const gameState = { score, isGameOver };
    localStorage.setItem("gameState", JSON.stringify(gameState));
  };

  const checkAnswer = (answer: string) => {
    const correct =
      answer.toLowerCase() === dailySong.answer.toLowerCase();
    if (correct) {
      setScore(1);
      setIsGameOver(true);
      saveGameState();  // Salva o progresso ao acertar a resposta
    } else {
      setAttempt((prev) => prev + 1);
    }
    return correct;
  };

  useEffect(() => {
    if (attempt === 0) setPlayDuration(10);
    else if (attempt === 1) setPlayDuration(20);
    else if (attempt === 2) setPlayDuration(30);
    else if (attempt === 3) setPlayDuration(60);
  }, [attempt]);

  const filterTitles = (query: string) => {
    const lowerQuery = query.toLowerCase();
    const filtered = musicMovies
      .filter((movie: { answer: string }) =>
        movie.answer.toLowerCase().includes(lowerQuery)
      )
      .map((movie: { answer: any }) => movie.answer);
    setFilteredAnswers(filtered);
  };

  return (
    <GameContext.Provider
      value={{
        score,
        currentSong,
        checkAnswer,
        isGameOver,
        playDuration,
        filteredAnswers,
        filterTitles,
        dailySong
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within a GameProvider");
  return context;
};
