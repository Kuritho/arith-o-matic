import { useState, useEffect, useRef } from "react";
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
  const [selectedEmoji, setSelectedEmoji] = useState(".");
  const [draggingEmoji, setDraggingEmoji] = useState(null);
  const [selectedReward, setSelectedReward] = useState(null);
  const touchRef = useRef(null);
  const dragEmojiRef = useRef(null);
  const touchPosition = useRef({ x: 0, y: 0 });

  const rewards = [
    { emoji: 1, name: "🍫", name: "Reward 1" },
    { emoji: 2, name: "🍬", name: "Reward 2" },
    { emoji: 3, name: "🍭", name: "Reward 3" }
  ];

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchPosition.current = { x: touch.clientX, y: touch.clientY };

    const emoji = e.currentTarget.textContent;
    const ghost = document.createElement('div');
    ghost.textContent = emoji;
    ghost.style.position = 'fixed';
    ghost.style.top = `${touch.clientY}px`;
    ghost.style.left = `${touch.clientX}px`;
    ghost.style.pointerEvents = 'none';
    ghost.style.fontSize = '40px';
    ghost.style.zIndex = 1000;

    document.body.appendChild(ghost);
    dragEmojiRef.current = ghost;
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    touchPosition.current = { x: touch.clientX, y: touch.clientY };

    if (dragEmojiRef.current) {
      dragEmojiRef.current.style.top = `${touch.clientY}px`;
      dragEmojiRef.current.style.left = `${touch.clientX}px`;
    }
  };

  const handleTouchEnd = (e) => {
    if (dragEmojiRef.current) {
      const { x, y } = touchPosition.current;
      const element = document.elementFromPoint(x, y);
      if (element && element.dataset.dropIndex !== undefined) {
        const index = parseInt(element.dataset.dropIndex, 10);
        handleDrop({
          preventDefault: () => {},
          dataTransfer: {
            getData: () => selectedEmoji,
          }
        }, index);
      }

      document.body.removeChild(dragEmojiRef.current);
      dragEmojiRef.current = null;
    }
  };

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
    setSelectedReward(null);
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

  const selectReward = (reward) => {
    setSelectedReward(reward);
    if(reward.emoji === 1) { 
      sendCommand("open1");
       
    }
    else if(reward.emoji === 2) { 
        
      sendCommand("open2");
    }
    else if(reward.emoji === 3) { 
      sendCommand("open3"); 
      
    }
    // Hide the congratulations after reward is selected
    setTimeout(() => {
      setShowConfetti(false);
      setShowCongratulations(false);
      setCorrectCount(0);
      resetGame();
    }, 2000);
  };

  function sendCommand(command) {
    fetch('http://192.168.110.185/'+command)
        .then(response => response.text())
        .then(data => {
            console.log("Server says:", data);
        })
        .catch(error => {
            console.error("Error:", error);
        });
  }

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
        }
        return newCount;
      });
    }
    setTimeout(() => {
      if (correctCount + 1 < 3) { // Only reset if not reaching 3 correct answers
        resetGame();
      }
    }, 3000);
  };

  return (
    <div className="multiplication-container">
      {showConfetti && <Confetti />}
      {showCongratulations && (
        <div className="congratulations-container">
          <h2 className="congratulations-message"> - 🎉 CONGRATULATIONS! YOU WON A REWARD! 🎉 - Please Choose Your Reward</h2>
          {!selectedReward ? (
            <div className="reward-buttons">
              {rewards.map((reward, index) => (
                <button
                  key={index}
                  className="reward-button"
                  onClick={() => selectReward(reward)}
                >
                  {reward.emoji} {reward.name}
                </button>
              ))}
            </div>
          ) : (
            <div className="reward-selected">
              <h3>You selected: {selectedReward.emoji} {selectedReward.name}</h3>
            </div>
          )}
        </div>
      )}
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
              className="drop-zone"
              data-drop-index={index}  
              onDrop={(event) => handleDrop(event, index)} 
              onDragOver={handleDragOver}
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
        <div className="shape-container" style={{ fontSize: "40px", marginTop: "10px" }}>
        <div
          className="emoji-draggable"
          draggable
          onDragStart={handleDragStart}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            width: "55px",
            height: "55px",
            textAlign: "center",
            lineHeight: "50px",
            borderRadius: "50%",
            userSelect: "none",

          }}
        >
          {selectedEmoji}
        </div>
        </div>
      </div>
      
      <button className="check-button" onClick={checkAnswer}>Check Answer</button>
      
      <Link to="/">
        <button className="back-button">Back to Home Page</button>
      </Link>
    </div>
  );
};