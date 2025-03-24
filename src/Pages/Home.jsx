import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import "./Home.css";
import backgroundMusic from "./assets/background-music-kid.mp3";

export const Home = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((error) => console.error("Audio playback failed:", error));
      } else {
        audioRef.current.pause();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  return (
    <div className="home-container">
            <audio ref={audioRef} src={backgroundMusic} loop />
      <button className="audio-toggle" onClick={toggleAudio}>
        {isPlaying ? "🔇 Mute" : "🔊 Play"}
      </button>

      {/* Floating operators background */}
      <div className="floating-operators">
        {[..."➕➖✖️➗"].map((operator, index) => (
          <span key={index} className="operator">{operator}</span>
        ))}
      </div>

      <div className="header-container">
        <h1 className="main-title">Arith-O-Matic</h1>
        <p className="subtitle">An Arithmetic Interactive Machine</p>
      </div>

      <div className="transparent-container">
        <h1 className="home-title">Please Choose an Operation</h1>
        <div className="button-container">
          <Link to="/Additionx">
            <button className="btn btn-blue">➕ Addition</button>
          </Link>
          <Link to="/Subtractionx">
            <button className="btn btn-red">➖ Subtraction</button>
          </Link>
          <Link to="/Multiplication">
            <button className="btn btn-green">✖️ Multiplication</button>
          </Link>
          <Link to="/Division">
            <button className="btn btn-yellow">➗ Division</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
