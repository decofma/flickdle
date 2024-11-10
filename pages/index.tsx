import { useRouter } from "next/router";
import styles from "@/styles/Home.module.css";
import Image from "next/image";

const HomePage = () => {
  const router = useRouter();

  const startGame = () => {
    router.push("/game");
  };

  return (
    <div className={styles.container}>
      <div className={styles.container__content}>
        <Image
          className={styles.logo}
          src="/images/flickdle-logo.png"
          width={300}
          height={300}
          alt="Logo flickdle"
        />
        <h3 className={styles.subtitle}>Guess the movie/serie by the song!</h3>
        <button className={styles.startButton} onClick={startGame}>
          Start Guessing
        </button>
      </div>
    </div>
  );
};

export default HomePage;
