import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { musicMovies } from "@/data/movieThemes";

type GameContextType = {
  score: number;
  currentSong: string;
  checkAnswer: (answer: string) => boolean;
  nextRound: () => void;
  isGameOver: boolean;
  playDuration: number;
  filteredAnswers: string[];
  filterTitles: (query: string) => void;
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
  const [guess, setGuess] = useState("");
  const [filteredAnswers, setFilteredAnswers] = useState<string[]>([]);

  const selectedSongs = React.useMemo(() => {
    const shuffledSongs = [...musicMovies].sort(() => 0.5 - Math.random());
    return shuffledSongs.slice(0, 3);
  }, []);

  useEffect(() => {
    if (selectedSongs.length > 0) setCurrentSong(selectedSongs[0].src);
  }, [selectedSongs]);

  const checkAnswer = (answer: string) => {
    const correct =
      answer.toLowerCase() === selectedSongs[score].answer.toLowerCase();
    if (correct) {
      setScore((prev) => prev + 1);
      setAttempt(0);
      setPlayDuration(5);

      if (score + 1 === selectedSongs.length) {
        setIsGameOver(true);
      } else {
        nextRound();
      }
    } else {
      setAttempt((prev) => prev + 1);
      if (attempt === 0) setPlayDuration(10);
      else if (attempt === 1) setPlayDuration(20);
    }
    return correct;
  };

  const nextRound = () => {
    const nextSong = selectedSongs[score + 1];
    if (nextSong) setCurrentSong(nextSong.src);
  };

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
        nextRound,
        isGameOver,
        playDuration,
        filteredAnswers,
        filterTitles,
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
