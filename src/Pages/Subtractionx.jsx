import React, { useState, useEffect, useRef } from "react";
import Confetti from "react-confetti";
import "./Additionx.css";
import HundredImage from "./assets/hundred_enhanced-removebg-preview.png";
import TenImage from "./assets/ten_enhanced-removebg-preview.png";
import OneImage from "./assets/Screenshot_2025-03-22_195903_enhanced-removebg-preview.png";
const congratsAudio = new Audio("/congrats.mp3");
const failsAudio = new Audio("/fails.mp3");
const correctsAudio = new Audio("/corrects.mp3");

const Subtractionx = () => {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [targetDifference, setTargetDifference] = useState(0);
  const [droppedItems, setDroppedItems] = useState([]);
  const [isCorrect, setIsCorrect] = useState(null);
  const [correctStreak, setCorrectStreak] = useState(parseInt(localStorage.getItem("correctStreak")) || 0);
  const [showReward, setShowReward] = useState(false);
  const touchItemRef = useRef(null);
  const boxRef = useRef(null);
  const hammerRef = useRef(null);
  const [showRewardButtons, setShowRewardButtons] = useState(false);
  const [rewardSelected, setRewardSelected] = useState(false);

  const rewards = [
    { id: 1, name: "Reward 1", color: "gold" },
    { id: 2, name: "Reward 2", color: "goldenrod" },
    { id: 3, name: "Reward 3", color: "silver" }
  ];

  const playAudio = () => {
    const audio = new Audio("/congrats.mp3");
    document.body.addEventListener("click", () => {
      audio.play();
    }, { once: true });
  };

  const generateNumbers = () => {
    let min, max;
    if (questionIndex === 0) {
      min = 1; max = 9;
    } else if (questionIndex === 1) {
      min = 10; max = 99;
    } else if (questionIndex === 2) {
      min = 100; max = 999;
    } else {
      return;
    }
    const randomNum1 = Math.floor(Math.random() * (max - min + 1)) + min;
    const randomNum2 = Math.floor(Math.random() * (randomNum1 - min + 1)) + min;
    setNum1(randomNum1);
    setNum2(randomNum2);
    setTargetDifference(randomNum1 - randomNum2);
  };

  // Touch handlers for items
  const handleTouchStart = (e, type) => {
    const touch = e.touches[0];
    const clone = document.createElement("img");
    clone.src = type === "hundreds" ? HundredImage : type === "tens" ? TenImage : OneImage;
    clone.style.position = "absolute";
    clone.style.width = type === "hundreds" ? "100px" : "50px";
    clone.style.height = type === "ones" ? "70px" : "150px";
    clone.style.zIndex = 1000;
    clone.style.left = `${touch.clientX}px`;
    clone.style.top = `${touch.clientY}px`;
    document.body.appendChild(clone);
    touchItemRef.current = { type, clone };
  };

  // Touch handlers for hammer
  const handleHammerTouchStart = (e) => {
    const touch = e.touches[0];
    const clone = document.createElement("div");
    clone.textContent = "🔨";
    clone.style.position = "absolute";
    clone.style.fontSize = "40px";
    clone.style.zIndex = 1000;
    clone.style.left = `${touch.clientX}px`;
    clone.style.top = `${touch.clientY}px`;
    document.body.appendChild(clone);
    touchItemRef.current = { type: "hammer", clone };
  };

  const handleTouchMove = (e) => {
    const touchData = touchItemRef.current;
    if (!touchData) return;
    const touch = e.touches[0];
  
    if (touchData.clone?.style) {
      touchData.clone.style.left = `${touch.clientX}px`;
      touchData.clone.style.top = `${touch.clientY}px`;
    } else if (touchData.index !== undefined && boxRef.current) {
      const rect = boxRef.current.getBoundingClientRect();
      const newX = touch.clientX - rect.left - touchData.offsetX;
      const newY = touch.clientY - rect.top - touchData.offsetY;
  
      setDroppedItems(prev => prev.map((item, i) =>
        i === touchData.index ? { ...item, x: newX, y: newY } : item
      ));
    }
  };
  const handleTouchEnd = (e) => {
    if (!touchItemRef.current || !boxRef.current) {
      if (touchItemRef.current?.clone) {
        document.body.removeChild(touchItemRef.current.clone);
      }
      touchItemRef.current = null;
      return;
    }

    const { type, clone } = touchItemRef.current;
    const box = boxRef.current;
    const rect = box.getBoundingClientRect();
    const x = parseInt(clone.style.left) - rect.left;
    const y = parseInt(clone.style.top) - rect.top;

    // Check if dropped inside the box
    if (
      parseInt(clone.style.left) > rect.left &&
      parseInt(clone.style.left) < rect.right &&
      parseInt(clone.style.top) > rect.top &&
      parseInt(clone.style.top) < rect.bottom
    ) {
      if (type === "hammer") {
        // Find which item the hammer was dropped on
        const elements = document.elementsFromPoint(
          parseInt(clone.style.left),
          parseInt(clone.style.top)
        );
        
        const droppedOnItem = elements.find(el => el.classList.contains("dropped-item"));
        if (droppedOnItem) {
          const index = parseInt(droppedOnItem.dataset.index);
          handleHammerBreakdown(index, x, y);
        }
      } else {
        setDroppedItems((prev) => [...prev, { type, x, y }]);
      }
    }

    document.body.removeChild(clone);
    touchItemRef.current = null;
  };

  const handleHammerBreakdown = (index, x, y) => {
    setDroppedItems(prevItems => {
      const newItems = [...prevItems];
      const { type: itemType } = newItems[index];
      
      if (itemType === "hundreds") {
        // Break hundred into 10 tens
        newItems.splice(index, 1);
        for (let i = 0; i < 10; i++) {
          newItems.push({ 
            type: "tens", 
            x: x + (i % 5) * 30, 
            y: y + Math.floor(i / 5) * 30 
          });
        }
      } else if (itemType === "tens") {
        // Break ten into 10 ones
        newItems.splice(index, 1);
        for (let i = 0; i < 10; i++) {
          newItems.push({ 
            type: "ones", 
            x: x + (i % 5) * 20, 
            y: y + Math.floor(i / 5) * 20 
          });
        }
      }
      
      return newItems;
    });
  };

  useEffect(() => {
    if (questionIndex <= 2) {
      generateNumbers();
    }
  }, [questionIndex]);

  useEffect(() => {
    if (showReward) {
      const audio = new Audio("/congrats.mp3");
      audio.play().catch((error) => console.error("Audio playback failed:", error));
    }
  }, [showReward]);

  const handleDrop = (event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData("type");
    const index = event.dataTransfer.getData("index");
  
    if (type === "hammer") return;
  
    const bigBox = event.currentTarget;
    const rect = bigBox.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
  
    let newItems = [...droppedItems];
  
    if (index !== "null") {
      newItems = newItems.map((item, i) => 
        i === parseInt(index) ? { ...item, x, y } : item
      );
    } else {
      newItems.push({ type, x, y });
    }
  
    // Convert sets of 10
    const onesCount = newItems.filter(item => item.type === "ones").length;
    if (onesCount >= 10) {
      newItems = newItems.filter(item => item.type !== "ones");
      const remainingOnes = onesCount % 10;
      for (let i = 0; i < remainingOnes; i++) {
        newItems.push({ type: "ones", x, y });
      }
      newItems.push({ type: "tens", x, y });
    }
  
    const tensCount = newItems.filter(item => item.type === "tens").length;
    if (tensCount >= 10) {
      newItems = newItems.filter(item => item.type !== "tens");
      const remainingTens = tensCount % 10;
      for (let i = 0; i < remainingTens; i++) {
        newItems.push({ type: "tens", x, y });
      }
      newItems.push({ type: "hundreds", x, y });
    }
  
    setDroppedItems(newItems);
  };
  
  const handleHammerDrop = (event, index) => {
    event.preventDefault();
    const type = event.dataTransfer.getData("type");
    if (type !== "hammer") return;
    
    handleHammerBreakdown(index, 
      event.clientX - event.currentTarget.getBoundingClientRect().left,
      event.clientY - event.currentTarget.getBoundingClientRect().top
    );
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const calculateDifference = () => {
    let difference = 0;
    droppedItems.forEach(item => {
      if (item.type === "hundreds") difference += 100;
      if (item.type === "tens") difference += 10;
      if (item.type === "ones") difference += 1;
    });
    return difference;
  };

  const checkAnswer = () => {
    const isAnswerCorrect = calculateDifference() === targetDifference;
    setIsCorrect(isAnswerCorrect);

    if (isAnswerCorrect) {
      const newStreak = correctStreak + 1;
      localStorage.setItem("correctStreak", newStreak);
      setCorrectStreak(newStreak);
      correctsAudio.play();

      setTimeout(() => {
        setIsCorrect(null);
        setDroppedItems([]);

        if (newStreak === 3) {
          setShowReward(true);
          setShowRewardButtons(true);
          setRewardSelected(false);

        } else if (questionIndex < 2) {
          setQuestionIndex(prevIndex => prevIndex + 1);
        }
      }, 4000);
    } else {
      localStorage.setItem("correctStreak", 0);
      failsAudio.play();
      setCorrectStreak(0);
      setQuestionIndex(0);
      setDroppedItems([]);
    }
  };

  const handleRewardSelection = (reward) => {
    const rewardAudio = new Audio("/congrats.mp3");
    rewardAudio.play();
    if(reward.id === 1) { 
      sendCommand("open1");
       
    }
    else if(reward.id === 2) { 
        
      sendCommand("open2");
    }
    else if(reward.id === 3) { 
      sendCommand("open3"); 
      
    }

    setRewardSelected(true);
    setShowRewardButtons(false);
    
    setTimeout(() => {
      setShowReward(false);
      localStorage.setItem("correctStreak", 0);
      setCorrectStreak(0);
      setQuestionIndex(0);
      setDroppedItems([]);
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

  const handleDragStart = (event, type, index = null) => {
    event.dataTransfer.setData("type", type);
    event.dataTransfer.setData("index", index);
  };

  const handleRemoveItem = (index) => {
    setDroppedItems(prevItems => prevItems.filter((_, i) => i !== index));
  };

  const handleDragOut = (event) => {
    event.preventDefault();
    const index = event.dataTransfer.getData("index");
    if (index !== "null") {
      handleRemoveItem(parseInt(index));
    }
  };

  return (
    <div 
      className="containerp right-align" 
      onTouchMove={handleTouchMove} 
      onTouchEnd={handleTouchEnd}
    >
      {showReward && <Confetti />} 
      <p className="home-text">Subtraction</p>
      <p className="home-text-problem">Given Problem</p>
      <button className="home-button" onClick={() => window.location.href = '/'}>Back to Homepage</button>
      
      {/* Hammer with touch support */}
      <div 
        ref={hammerRef}
        className="hammer-icon" 
        draggable 
        onDragStart={(e) => handleDragStart(e, "hammer")} 
        onTouchStart={handleHammerTouchStart}
        style={{ cursor: "grab" }}
      >
        🔨
      </div>
      
      <p className="addition-box">
        <h1 className="minus">-</h1>
        {num1} <br/>{num2} <br/>=<br/> 
      </p>

      <div
        ref={boxRef}
        className="big-box bordered"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {droppedItems.map((item, index) => (
          <div 
            key={index} 
            className="dropped-item"
            draggable
            data-index={index}
            onDragStart={(e) => handleDragStart(e, item.type, index)}
            onDrop={(e) => handleHammerDrop(e, index)}
            onDragOver={handleDragOver}
            onClick={() => handleRemoveItem(index)}
            onTouchStart={(e) => {
              const touch = e.touches[0];
              const rect = boxRef.current.getBoundingClientRect();
              touchItemRef.current = {
                index,
                offsetX: touch.clientX - rect.left - item.x,
                offsetY: touch.clientY - rect.top - item.y,
              };
            }}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => { touchItemRef.current = null; }}
            
            style={{
              position: "absolute",
              left: `${item.x}px`,
              top: `${item.y}px`,
              cursor: "grab"
            }}
          >
            {item.type === "hundreds" ? (
              <img src={HundredImage} alt="100" style={{ width: "110px", height: "110px" }} />
            ) : item.type === "tens" ? (
              <img src={TenImage} alt="10" style={{ width: "40px", height: "110px" }} />
            ) : (
              <img src={OneImage} alt="1" style={{ width: "40px", height: "60px" }} />
            )}
          </div>
        ))}
      </div>

      <p className="result-text">Your Answer: {calculateDifference()}</p>
      <button className="check-button" onClick={checkAnswer}>Check Answer</button>
      {isCorrect !== null && (
        <p className="success-text">{isCorrect ? "🎉 Correct Answer! 🎉" : "❌ Incorrect Answer. Try Again!"}</p>
      )}
        {showReward && (
        <div className="reward-celebration">
          <div className="reward-messages">
            <p className="reward-main-text">🎉 Congratulations! 🎉</p>
            <p className="reward-sub-text">You solved the subtraction!</p>
          </div>
          
          {showRewardButtons && !rewardSelected && (
            <div className="reward-options">
              <p className="reward-prompt">Choose your reward:</p>
              <div className="reward-buttons-container">
                {rewards.map((reward) => (
                  <button
                    key={reward.id}
                    className="reward-button"
                    style={{ backgroundColor: reward.color }}
                    onClick={() => handleRewardSelection(reward)}
                  >
                    <span className="reward-emoji">{reward.emoji}</span>
                    <span className="reward-label">{reward.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {rewardSelected && (
            <div className="reward-selected-message">
              <p>Great job! Enjoy your reward!</p>
            </div>
          )}
        </div>
      )}

      <div className="small-box-container">
        <div className="small-box-hundreds" onTouchStart={(e) => handleTouchStart(e, "hundreds", null)}>
          <img src={HundredImage} alt="100" style={{ width: "150px", height: "150px" }} />
        </div>
        <div className="small-box-tens" onTouchStart={(e) => handleTouchStart(e, "tens", null)}>
          <img src={TenImage} alt="100" style={{ width: "50px", height: "150px" }} />
        </div>
        <div className="small-box-ones" onTouchStart={(e) => handleTouchStart(e, "ones", null)}>
          <img src={OneImage} alt="100" style={{ width: "50px", height: "70px" }} />
        </div>
      </div>
    </div>
  );
};

export default Subtractionx;