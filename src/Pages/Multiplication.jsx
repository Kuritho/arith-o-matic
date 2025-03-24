import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Confetti from "react-confetti";
import "./Multiplication.css";

const congratsAudio = new Audio("/congrats.mp3");
const failsAudio = new Audio("/fails.mp3");
const correctsAudio = new Audio("/corrects.mp3");

export const Multiplication = () => {
  const getRandomNumber = (max) => Math.floor(Math.random() * max) + 1;

  const [numerator, setNumerator] = useState(getRandomNumber(10));
  const [denominator, setDenominator] = useState(getRandomNumber(10));
  const [droppedEmojis, setDroppedEmojis] = useState(Array(numerator).fill([]));
  const [currentTotal, setCurrentTotal] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState("🟢");

  const playAudio = () => {
    const audio = new Audio("/congrats.mp3");
    document.body.addEventListener("click", () => {
      audio.play();
    }, { once: true }); // Ensures it only plays once per click
  };

  useEffect(() => {
    setCurrentTotal(droppedEmojis.reduce((sum, row) => sum + row.length, 0));
  }, [droppedEmojis]);

  useEffect(() => {
    if (showCongratulations) {
      const audio = new Audio("/congrats.mp3");
      audio.play().catch((error) => console.error("Audio playback failed:", error));
    }
  }, [showCongratulations]);

  const resetGame = () => {
    const newNumerator = getRandomNumber(10);
    setNumerator(newNumerator);
    setDenominator(getRandomNumber(10));
    setDroppedEmojis(Array(newNumerator).fill([]));
    setCurrentTotal(0);
    setStatusMessage("");
  };

  const handleDragStart = (event) => {
    event.dataTransfer.setData("text/plain", selectedEmoji);
  };

  const handleDrop = (event, index) => {
    event.preventDefault();
    setDroppedEmojis((prev) => {
      const newEmojis = [...prev];
      newEmojis[index] = [...newEmojis[index], selectedEmoji];
      return newEmojis;
    });
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleEmojiClick = (rowIndex, emojiIndex) => {
    setDroppedEmojis((prev) => {
      const newEmojis = [...prev];
      newEmojis[rowIndex] = newEmojis[rowIndex].filter((_, i) => i !== emojiIndex);
      return newEmojis;
    });
  };

  const checkAnswer = () => {
    if (currentTotal !== numerator * denominator) {
      setStatusMessage("❌ Incorrect");
      failsAudio.play();
      setCorrectCount(0);
    } else {
      setStatusMessage("✅ Correct!");
      correctsAudio.play();
      setCorrectCount((prev) => {
        const newCount = prev + 1;
        if (newCount === 3) {
          setShowConfetti(true);
          setShowCongratulations(true);
          setTimeout(() => {
            setShowConfetti(false);
            setShowCongratulations(false); 
            setCorrectCount(0);
          }, 10000);
        }
        return newCount;
      });
    }
    setTimeout(() => {
      resetGame();
    }, 3000);
  };

  return (
    <div className="multiplication-container">
      {showConfetti && <Confetti />}
      {showCongratulations && <h2 className="congratulations-message">🎉 CONGRATULATIONS! YOU WON A REWARD! 🎉</h2>}
      <h1 className="titled">Multiplication</h1>
      <p className="problem">Solve: {numerator} × {denominator} = {currentTotal} <span className='status-right'>{statusMessage}</span></p>
      <div className="shape-selector">
        <label className="shape-label">Choose your shape: </label>
        <select className="shape-dropdown" value={selectedEmoji} onChange={(e) => setSelectedEmoji(e.target.value)}>
          <option value="🟢">Green Circle</option>
          <option value="🟦">Blue Square</option>
          <option value="🔴">Red Circle</option>
        </select>
      </div>
      
      <div className="visual-container">
        <div className="box-container">
          {Array.from({ length: numerator }).map((_, index) => (
            <div 
              key={index} 
              className="box" 
              onDrop={(event) => handleDrop(event, index)} 
              onDragOver={handleDragOver}
              style={{ display: "flex", flexWrap: "wrap", gap: "5px", padding: "5px", fontSize: "24px" }}
            >
              {droppedEmojis[index].map((emoji, emojiIndex) => (
                <span 
                  key={emojiIndex} 
                  style={{ cursor: "pointer" }}
                  onClick={() => handleEmojiClick(index, emojiIndex)}
                >
                  {emoji}
                </span>
              ))}
            </div>
          ))}
        </div>
        <div className="shape-container" style={{ fontSize: "40px" }}>
          <span draggable="true" onDragStart={handleDragStart}>{selectedEmoji}</span>
        </div>
      </div>
      
      <button className="check-button" onClick={checkAnswer}>Check Answer</button>
      
      <Link to="/">
        <button className="back-button">Back to Home Page</button>
      </Link>
    </div>
  );
};
