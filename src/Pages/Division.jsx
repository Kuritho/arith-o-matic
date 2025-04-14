import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Confetti from "react-confetti";
import "./Division.css";

const congratsAudio = new Audio("/congrats.mp3");
const failsAudio = new Audio("/fails.mp3");
const correctsAudio = new Audio("/corrects.mp3");

const ItemTypes = { STAR: "star" };

const Star = ({ id, emoticon, onDragStart }) => {
  return (
    <span
      className="star"
      data-id={id}
      onTouchStart={(e) => onDragStart(e, id)}
      onMouseDown={(e) => onDragStart(e, id)}
      style={{ fontSize: "2rem", cursor: "grab", touchAction: "none" }}
    >
      {emoticon}
    </span>
  );
};

const Box = ({ stars, boxIndex, boxRef }) => {
  return (
    <div
      ref={boxRef}
      className="drop-box"
      style={{
        width: "150px",
        height: "150px",
        backgroundColor: "#eee",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        border: "2px dashed #000",
        margin: "10px",
      }}
    >
      {stars.map((star, index) => (
        <span
          key={index}
          className="star"
          style={{ fontSize: "2rem", cursor: "pointer" }}
        >
          {star.emoticon}
        </span>
      ))}
    </div>
  );
};

export const Division = () => {
  const [dividend, setDividend] = useState(0);
  const [divisor, setDivisor] = useState(1);
  const [quotient, setQuotient] = useState(0);
  const [stars, setStars] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [userQuotient, setUserQuotient] = useState("?");
  const [isCorrect, setIsCorrect] = useState(null);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [selectedEmoticon, setSelectedEmoticon] = useState(".");
  const [selectedReward, setSelectedReward] = useState(null);

  const boxRefs = useRef([]);
  const dragData = useRef({ id: null });
  const initialCount = useRef(0);

  const rewards = [
    { emoji: 1, name: "🍫", name: "Reward 1" },
    { emoji: 2, name:"🍬", name: "Reward 2" },
    { emoji: 3, name: "🎖️", name: "Reward 3" }
  ];

  const playAudio = () => {
    const audio = new Audio("/congrats.mp3");
    document.body.addEventListener("click", () => {
      audio.play();
    }, { once: true }); // Ensures it only plays once per click
  };

  useEffect(() => {
    generateProblem();
  }, []);

  useEffect(() => {
    updateUserQuotient();
  }, [boxes]);

  useEffect(() => {
    if (showCongrats) {
      const audio = new Audio("/congrats.mp3");
      audio.play().catch((error) => console.error("Audio playback failed:", error));
    }
  }, [showCongrats]);

  const generateProblem = () => {
    let newDividend, newDivisor;
    do {
      newDivisor = Math.floor(Math.random() * 10) + 1;
      let newQuotient = Math.floor(Math.random() * 10) + 1;
      newDividend = newDivisor * newQuotient;
      setQuotient(newQuotient);
    } while (newDividend % newDivisor !== 0);

    const newStars = Array.from({ length: newDividend }, (_, i) => ({ id: i, emoticon: selectedEmoticon }));

    setDividend(newDividend);
    setDivisor(newDivisor);
    setStars(newStars);
    setBoxes(Array.from({ length: newDivisor }, () => []));
    setUserQuotient("?");
    setIsCorrect(null);
    dragData.current = { id: null };
    initialCount.current = newDividend;
    setSelectedReward(null);
  };

  useEffect(() => {
    if (stars.length === initialCount.current && boxes.every(b => b.length === 0)) {
      setStars((prev) => prev.map((s) => ({ ...s, emoticon: selectedEmoticon })));
    }
  }, [selectedEmoticon]);

  const updateUserQuotient = () => {
    const starsInBoxes = boxes.reduce((total, box) => total + box.length, 0);
    const averageStars = divisor > 0 ? (starsInBoxes / divisor).toFixed(2) : "?";
    setUserQuotient(averageStars);
  };

  const handleDrop = (starId, boxIndex) => {
    setBoxes((prevBoxes) => {
      const newBoxes = prevBoxes.map((box, index) =>
        index === boxIndex ? [...box, starId] : box
      );
      return newBoxes;
    });
    setStars((prevStars) => prevStars.filter((id) => id !== starId));
  };

  const handleRemoveStar = (starId, boxIndex) => {
    setBoxes((prevBoxes) =>
      prevBoxes.map((box, index) =>
        index === boxIndex ? box.filter((id) => id !== starId) : box
      )
    );
    setStars((prevStars) => [...prevStars, starId]);
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
      setShowCongrats(false);
      setCorrectStreak(0);
      generateProblem();
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
    if (parseFloat(userQuotient) === quotient) {
      setIsCorrect(true);
      correctsAudio.play();
      setCorrectStreak((prevStreak) => {
        const newStreak = prevStreak + 1;
        if (newStreak >= 3) {
          setShowConfetti(true);
          setShowCongrats(true);
        }
        return newStreak;
      });
      setTimeout(() => {
        if (correctStreak + 1 < 3) { // Only reset if not reaching 3 correct answers
          generateProblem();
        }
      }, 4000);
    } else {
      setIsCorrect(false);
      failsAudio.play();
      setCorrectStreak(0);
      setTimeout(generateProblem, 6000);
    }
  };

  const handleDragStart = (e, id) => {
    dragData.current = { id };
    const moveHandler = (eMove) => eMove.preventDefault();
    document.addEventListener("touchmove", moveHandler, { passive: false });

    const endHandler = (ev) => {
      const touch = ev.changedTouches?.[0] || ev;
      const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
      const dropIndex = boxRefs.current.findIndex((ref) => ref?.contains(dropTarget));
      const draggedStarIndex = stars.findIndex((s) => s.id === dragData.current.id);
      if (dropIndex !== -1 && draggedStarIndex !== -1) {
        const draggedStar = stars[draggedStarIndex];
        setBoxes((prev) =>
          prev.map((box, i) => (i === dropIndex ? [...box, draggedStar] : box))
        );
        setStars((prev) => prev.filter((_, i) => i !== draggedStarIndex));
      }
      dragData.current = { id: null };
      document.removeEventListener("touchmove", moveHandler);
      document.removeEventListener("mouseup", endHandler);
      document.removeEventListener("touchend", endHandler);
      updateUserQuotient();
    };

    document.addEventListener("mouseup", endHandler);
    document.addEventListener("touchend", endHandler);
  };

  return (
    <div className="containerz">
      {showConfetti && <Confetti />}
      {showCongrats && (
        <div className="congratulations-container">
          <h1 className="congrats-message"> - 🎉CONGRATULATIONS! YOU WON A REWARD! 🎉 -  Please Choose Your Reward! </h1>
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
      <Link to="/">
        <button className="home-button" style={{ position: "absolute", top: "10px", left: "10px" }}>Back to Home Page</button>
      </Link>
      <h1 className="title">Division</h1>
      <div className="problem-box" style={{ maxWidth: "100%", textAlign: "center" }}>
        <p className="problem">{dividend} ÷ {divisor} = {userQuotient}</p>
        {isCorrect !== null && (
          <p className="correct-answer" style={{ color: isCorrect ? "green" : "red" }}>
            {isCorrect ? "Correct Answer!" : "Incorrect Answer!"}
          </p>
        )} 
        
        <button onClick={checkAnswer} className="check-answer-button">Check Answer</button>
      </div>
      <label>Choose your Emoticon:</label>
      <select value={selectedEmoticon} onChange={(e) => setSelectedEmoticon(e.target.value)}>
        <option value="Shapes">...</option>
        <option value="💖">💖</option>
        <option value="🎉">🎉</option>
        <option value="🔥">🔥</option>
        <option value="🌟">🌟</option>
      </select>
      <div className="stars-container">
        {stars.map((star) => (
          <Star key={star.id} id={star.id} emoticon={star.emoticon} onDragStart={handleDragStart} />
        ))}
      </div>
      <div className="bottom-box-container">
        {boxes.map((boxStars, index) => (
          <Box
            key={index}
            boxIndex={index}
            stars={boxStars}
            boxRef={(el) => (boxRefs.current[index] = el)}
          />
        ))}
      </div>
    </div>
  );
};