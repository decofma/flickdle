import type { AppProps } from "next/app";
import { GameProvider } from "@/context/GameContext";
import "@/styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <GameProvider>
      <Component {...pageProps} />
    </GameProvider>
  );
}

export default MyApp;
