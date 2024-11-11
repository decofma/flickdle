import { useState, useEffect, useRef, useCallback } from "react";
import { useGame } from "@/context/GameContext";
import styles from "@/styles/game.module.css";
import { MovieThemes, musicMovies } from "@/data/movieThemes";

const GamePage = () => {
  const {
    currentSong,
    checkAnswer,
    isGameOver,
    playDuration,
    filteredAnswers,
    filterTitles,
    dailySong,
  } = useGame();

  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState("");
  const [countdown, setCountdown] = useState(3);
  const [guesses, setGuesses] = useState<MovieThemes[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const formatNumber = (num: number) => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + " bi";
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + " mi";
    } else {
      return num.toString();
    }
  };

  const handleGuess = () => {
    if (filteredAnswers.includes(guess)) {
      const correct = checkAnswer(guess);
      setFeedback(correct ? "Correct!" : "Try again!");

      // Encontre o filme correspondente ao palpite do usuário
      const guessedMovie = musicMovies.find((movie) => movie.answer === guess);
      if (guessedMovie) {
        setGuesses((prev) => [...prev, guessedMovie]); // Adiciona o palpite ao histórico de palpites
      }

      setCountdown(correct ? 0 : 3); // Reinicia contagem ou termina jogo
    } else {
      setFeedback("Please choose a movie from the suggestions.");
    }
    setGuess(""); // Limpa a entrada
  };

  // Função de filtro otimizada para sugestões
  const memoizedFilterTitles = useCallback(() => {
    if (guess) {
      filterTitles(guess);
    }
  }, [guess, filterTitles]);

  useEffect(() => {
    memoizedFilterTitles();
  }, [memoizedFilterTitles]);

  useEffect(() => {
    if (countdown === 0) {
      playAudio();
    }
  }, [countdown]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Função para tocar o áudio e pausar após o tempo especificado
  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();

      const timer = setTimeout(() => {
        if (audioRef.current) audioRef.current.pause();
      }, playDuration * 1000);

      return () => clearTimeout(timer);
    }
  };

  // Função para definir as classes de cor com base nas regras
  const getColorClass = (
    guessedMovie: MovieThemes,
    field: keyof MovieThemes
  ) => {
    const answerValue = dailySong[field];
    const guessedValue = guessedMovie[field];

    if (field === "release" || field === "intake") {
      if (guessedValue === answerValue) return styles.green;
      return guessedValue > answerValue
        ? styles.red__greater
        : styles.red__smaller;
    }

    if (field === "genre") {
      // Verificar se o gênero é único (um único item no array) ou múltiplo (vários itens no array)
      if (guessedMovie.genre.length === 1) {
        // Quando há apenas um gênero, comparamos diretamente
        return dailySong.genre.includes(guessedMovie.genre[0])
          ? styles.green
          : styles.red;
      } else {
        // Quando há vários gêneros, verificamos se ao menos um gênero do palpite está presente no filme do dia
        const genreMatches = guessedMovie.genre.some((genre) =>
          dailySong.genre.includes(genre)
        );
        return genreMatches ? styles.orange : styles.red;
      }
    }

    return guessedValue === answerValue ? styles.green : styles.red;
  };

  if (isGameOver) {
    return (
      <div className={styles.container}>
        <div className={styles.container__content}>
          <h1>Congratulations!</h1>
          <p className={styles.congratulations}>
            You guessed the Flickdle of the day. Come back tomorrow!
          </p>
          <h3>Your guessings:</h3>
          {/* Exibindo todos os palpites do jogador */}
          <div className={styles.guessesContainer}>
            {guesses.map((guessedMovie, index) => (
              <div key={index} className={styles.guessRow}>
                <div
                  className={`${styles.guessBox} ${getColorClass(
                    guessedMovie,
                    "name"
                  )}`}
                >
                  {guessedMovie.answer}
                </div>
                <div
                  className={`${styles.guessBox} ${getColorClass(
                    guessedMovie,
                    "release"
                  )}`}
                >
                  Release: {guessedMovie.release}
                </div>
                <div
                  className={`${styles.guessBox} ${getColorClass(
                    guessedMovie,
                    "intake"
                  )}`}
                >
                  Intake: ${guessedMovie.intake}
                </div>
                <div
                  className={`${styles.guessBox} ${getColorClass(
                    guessedMovie,
                    "genre"
                  )}`}
                >
                  Genres: {guessedMovie.genre.join(", ")}
                </div>
              </div>
            ))}
          </div>

          {/* Exibindo informações detalhadas do filme correto */}
          <div className={styles.movieDetails}>
            <h3>{dailySong.name}</h3>
            <p>Curiosity: {dailySong.info}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.container__content}>
        <h2 className={styles.title}>Guess The Movie</h2>

        {/* Exibir contagem regressiva ou botão de replay */}
        {countdown > 0 ? (
          <div className={styles.countdown}>Playing in {countdown}</div>
        ) : (
          <button
            className={styles.replayButton}
            onClick={() => setCountdown(3)}
          >
            Replay
          </button>
        )}

        <audio
          controls={false}
          src={currentSong}
          ref={audioRef}
          className={styles.audio}
        />

        {/* Caixa de entrada e sugestões de palpites */}
        <div className={styles.container__guessbox}>
          <input
            type="text"
            placeholder="Guess the movie..."
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            className={styles.input}
          />
          {filteredAnswers.length > 0 && (
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
          )}
          <button className={styles.guessButton} onClick={handleGuess}>
            Submit
          </button>
        </div>

        <p className={styles.feedback}>{feedback}</p>

        {/* Histórico de palpites com feedback visual */}
        <div className={styles.guessesContainer}>
          <div className={styles.guessRow}>
            <div className={styles.guessBox}>Movie Name</div>
            <div className={styles.guessBox}>Release Date</div>
            <div className={styles.guessBox}>Total Income $</div>
            <div className={styles.guessBox}>Genres</div>
          </div>
          {guesses.map((guessedMovie, index) => (
            <div key={index} className={styles.guessRow}>
              <div
                className={`${styles.guessBox} ${getColorClass(
                  guessedMovie,
                  "name"
                )}`}
              >
                {guessedMovie.answer}
              </div>
              <div
                className={`${styles.guessBox} ${getColorClass(
                  guessedMovie,
                  "release"
                )}`}
              >
                {guessedMovie.release}
              </div>
              <div
                className={`${styles.guessBox} ${getColorClass(
                  guessedMovie,
                  "intake"
                )}`}
              >
                ${formatNumber(guessedMovie.intake)}
              </div>
              <div
                className={`${styles.guessBox} ${getColorClass(
                  guessedMovie,
                  "genre"
                )}`}
              >
                {guessedMovie.genre.join(", ")}
              </div>
            </div>
          ))}
        </div>
        <div className={styles.guessesContainer}>
          <h3> Indicators </h3>
          <div className={styles.guessRow}>
            <div className={`${styles.guessBox} ${styles.green}`}>Correct</div>
            <div className={`${styles.guessBox} ${styles.red}`}>Incorrect</div>
            <div className={`${styles.guessBox} ${styles.orange}`}>
              Almost, something is right
            </div>
            <div className={`${styles.guessBox} ${styles.red__smaller}`}>
              The value is smaller
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
