import { useState, useEffect, useRef, useCallback } from "react";
import { useGame } from "@/context/GameContext";
import styles from "@/styles/game.module.css";

const GamePage = () => {
  const {
    currentSong,
    checkAnswer,
    isGameOver,
    playDuration,
    filteredAnswers,
    filterTitles,
  } = useGame();
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState("");
  const [countdown, setCountdown] = useState(3);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleGuess = () => {
    if (filteredAnswers.includes(guess)) {
        if (checkAnswer(guess)) {
        setFeedback("Correct!");
        } else {
        setFeedback("Try again!");
        setCountdown(3); // Reinicia a contagem regressiva quando errar
        }
    } else {
        setFeedback("Please choose a movie from the suggestions.");
    }
    setGuess("");  // Reseta a entrada de texto do usuário
  };

  // Usando useCallback para memorizar a função filterTitles e evitar redefinições desnecessárias
  const memoizedFilterTitles = useCallback(() => {
    if (guess) {
      filterTitles(guess); // Chama apenas quando "guess" mudar
    }
  }, [guess, filterTitles]);

  useEffect(() => {
    memoizedFilterTitles(); // Executa somente quando "guess" muda
  }, [memoizedFilterTitles]); // Dependência apenas do "memoizedFilterTitles"

  useEffect(() => {
    if (countdown === 0) {
      playAudio();
    }
  }, [countdown]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer); // Limpa o timer ao limpar o efeito
    }
  }, [countdown]);

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reinicia o áudio
      audioRef.current.play();

      const timer = setTimeout(() => {
        if (audioRef.current) audioRef.current.pause();
      }, playDuration * 1000);

      return () => clearTimeout(timer);
    }
  };

  if (isGameOver) {
    return (
      <div className={styles.container}>
        <div className={styles.container__content}>
          <p className={styles.congratulations}>
            Congratulations! You guessed the Flickdle of the day. Come back tomorrow!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.container__content}>
        <h2 className={styles.title}>Guess The Movie</h2>

        {/* Exibir a contagem regressiva */}
        {countdown > 0 ? (
          <div className={styles.countdown}>Playing in {countdown}</div>
        ) : (
            <button className={styles.replayButton} onClick={() => setCountdown(3)}>
            Replay
          </button>  
        )}
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
              onChange={(e) => setGuess(e.target.value)} // Atualiza "guess"
              className={styles.input}
            />

            {filteredAnswers.length > 0 ? (
              <ul className={styles.suggestions}>
                {filteredAnswers.map((title, index) => (
                  <li
                    key={index}
                    className={styles.suggestion}
                    onClick={() => setGuess(title)} // Atualiza "guess" ao selecionar
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
