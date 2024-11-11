// components/GuessFeedback.tsx
import React from "react";
import styles from "@/styles/guessFeedback.module.css";
import { MovieThemes } from "@/data/movieThemes";

type GuessFeedbackProps = {
  guess: MovieThemes;
  correctMovie: MovieThemes;
};

const GuessFeedback: React.FC<GuessFeedbackProps> = ({ guess, correctMovie }) => {
  const getColorClass = (field: string, guessValue: any, correctValue: any) => {
    if (field === "release" || field === "intake") {
      if (guessValue === correctValue) return styles.correct;
      return guessValue > correctValue ? styles.higher : styles.lower;
    } else if (field === "genre") {
      return correctValue.some((genre: string) => guessValue.includes(genre))
        ? styles.partial
        : styles.incorrect;
    } else {
      return guessValue === correctValue ? styles.correct : styles.incorrect;
    }
  };

  return (
    <div className={styles.feedbackContainer}>
      <div className={`${styles.feedbackItem} ${getColorClass("name", guess.answer, correctMovie.answer)}`}>
        {guess.name}
      </div>
      <div className={`${styles.feedbackItem} ${getColorClass("release", guess.release, correctMovie.release)}`}>
        Release Date: {guess.release}
      </div>
      <div className={`${styles.feedbackItem} ${getColorClass("intake", guess.intake, correctMovie.intake)}`}>
        Total Intake: {guess.intake}
      </div>
      <div className={`${styles.feedbackItem} ${getColorClass("genre", guess.genre, correctMovie.genre)}`}>
        Genres: {guess.genre.join(", ")}
      </div>
    </div>
  );
};

export default GuessFeedback;
