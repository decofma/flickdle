import { useState, useEffect, useRef } from "react";
import { useGame } from "@/context/GameContext";
import styles from "@/styles/game.module.css";

const GamePage = () => {
  const {
    currentSong,
    checkAnswer,
    score,
    isGameOver,
    playDuration,
    filteredAnswers,
    filterTitles,
  } = useGame();
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleGuess = () => {
    if (checkAnswer(guess)) {
      setFeedback("Correct!");
    } else {
      setFeedback("Try again!");
    }
    setGuess("");
  };

  useEffect(() => {
    if (guess) {
      filterTitles(guess);
    }
  }, [guess, filterTitles]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();

      const timer = setTimeout(() => {
        if (audioRef.current) audioRef.current.pause();
      }, playDuration * 1000);

      return () => clearTimeout(timer);
    }
  }, [currentSong, playDuration]);

  if (isGameOver) {
    return (
      <div className={styles.container}>
        <h2 className={styles.score}>Score: {score}</h2>
        <p className={styles.congratulations}>
          Congratulations! You guessed all Flickdles of the day. Come back
          tomorrow!
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.container__content}>
        <h2 className={styles.title}>Guess The Movie</h2>
        <h3 className={styles.score}>Score: {score}</h3>
        <audio
          controls={false}
          src={currentSong}
          ref={audioRef}
          className={styles.audio}
        />
        <div className={styles.container__guessbox}>
            <div>
                <input
                type="text"
                placeholder="Guess the movie..."
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                className={styles.input}
                />

                {filteredAnswers.length > 0 ? (
                <ul className={styles.suggestions}>
                    {filteredAnswers.map((title, index) => (
                    <li
                        key={index}
                        className={styles.suggestion}
                        onClick={() => setGuess(title)}
                    >
                        {title}
                    </li>
                    ))}
                </ul>
                ) : (
                guess && (
                    <ul className={styles.suggestions}>
                    <li className={styles.suggestion}>
                        No movies found with this name.
                    </li>
                    </ul>
                )
                )}

            </div>
            <div>
                <button className={styles.guessButton} onClick={handleGuess}>
                Submit
                </button>

            </div>
        </div>

        <p className={styles.feedback}>{feedback}</p>
      </div>
    </div>
  );
};

export default GamePage;
