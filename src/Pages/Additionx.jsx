import React, { useState, useEffect } from "react";
import Confetti from "react-confetti";
import "./Additionx.css";
import HundredImage from "./assets/hundred_enhanced-removebg-preview.png";
import TenImage from "./assets/ten_enhanced-removebg-preview.png";
import OneImage from "./assets/Screenshot_2025-03-22_195903_enhanced-removebg-preview.png";
const congratsAudio = new Audio("/congrats.mp3");
const failsAudio = new Audio("/fails.mp3");
const correctsAudio = new Audio("/corrects.mp3");

const Additionx = () => {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [sum, setSum] = useState(0);
  const [droppedItems, setDroppedItems] = useState([]);
  const [targetSum, setTargetSum] = useState(0);
  const [isCorrect, setIsCorrect] = useState(null);
  const [correctStreak, setCorrectStreak] = useState(parseInt(localStorage.getItem("correctStreak")) || 0);
  const [showReward, setShowReward] = useState(false);

  const playAudio = () => {
    const audio = new Audio("/congrats.mp3");
    document.body.addEventListener("click", () => {
      audio.play();
    }, { once: true }); // Ensures it only plays once per click
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
      return; // ✅ Stop execution beyond 3-digit level
    }
  
    const newNum1 = Math.floor(Math.random() * (max - min + 1)) + min;
    const newNum2 = Math.floor(Math.random() * (max - min + 1)) + min;
  
    // ✅ Only update state if numbers actually change (prevents redundant re-renders)
    setNum1(prevNum1 => (prevNum1 !== newNum1 ? newNum1 : prevNum1));
    setNum2(prevNum2 => (prevNum2 !== newNum2 ? newNum2 : prevNum2));
  };
  

  const handleNextQuestion = () => {
    setQuestionIndex(prevIndex => (prevIndex + 1) % 3);
  };

  // useEffect(() => {
  //   generateNumbers();
  //   setTargetSum(num1 + num2); // <-- Ensure targetSum updates with new numbers
  // }, [questionIndex, num1, num2])

  useEffect(() => {
    if (questionIndex <= 2) { 
      generateNumbers(); // ✅ Only generate numbers when moving to a new question
    }
  }, [questionIndex]); 

  useEffect(() => {
    if (showReward) {
      // fetch("http://localhost:3001/dispense", { method: "POST" })
      // .then(response => response.json())
      // .then(data => console.log(data.message))
      // .catch(error => console.error("Error dispensing:", error));
      const audio = new Audio("/congrats.mp3");
      audio.play().catch((error) => console.error("Audio playback failed:", error));
    }
  }, [showReward]);

  // const handleDragStart = (event, type, index = null) => {
  //   event.dataTransfer.setData("type", type);
  //   event.dataTransfer.setData("index", index);
  // };

  const handleDrop = (event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData("type");
    const index = event.dataTransfer.getData("index");
  
    if (type === "hammer") return; // Prevent hammer from being dropped
  
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
  
    // **✅ Convert ONLY sets of 10**
    
    // 1️⃣ Convert 10 ones → 1 ten (Keep extra ones)
    const onesCount = newItems.filter(item => item.type === "ones").length;
    if (onesCount >= 10) {
      newItems = newItems.filter(item => item.type !== "ones"); // Remove all ones
      const remainingOnes = onesCount % 10; // Keep extra ones
      for (let i = 0; i < remainingOnes; i++) {
        newItems.push({ type: "ones", x, y });
      }
      newItems.push({ type: "tens", x, y }); // Add 1 ten
    }
  
    // 2️⃣ Convert 10 tens → 1 hundred (Keep extra tens)
    const tensCount = newItems.filter(item => item.type === "tens").length;
    if (tensCount >= 10) {
      newItems = newItems.filter(item => item.type !== "tens"); // Remove all tens
      const remainingTens = tensCount % 10; // Keep extra tens
      for (let i = 0; i < remainingTens; i++) {
        newItems.push({ type: "tens", x, y });
      }
      newItems.push({ type: "hundreds", x, y }); // Add 1 hundred
    }
  
    setDroppedItems(newItems);
  };
  
  const handleHammerDrop = (event, index) => {
    event.preventDefault();
    const type = event.dataTransfer.getData("type");
    if (type !== "hammer") return;
    
    setDroppedItems(prevItems => {
      const newItems = [...prevItems];
      const { type: itemType, x, y } = newItems[index];
      newItems.splice(index, 1);
      
      if (itemType === "hundreds") {
        for (let i = 0; i < 10; i++) {
          newItems.push({ type: "tens", x: x + (i % 5) * 30, y: y + Math.floor(i / 5) * 30 });
        }
      } else if (itemType === "tens") {
        for (let i = 0; i < 10; i++) {
          newItems.push({ type: "ones", x: x + (i % 5) * 20, y: y + Math.floor(i / 5) * 20 });
        }
      }
      return newItems;
    });
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const calculateSum = () => {
    let sum = 0;
    droppedItems.forEach(item => {
      if (item.type === "hundreds") sum += 100;
      if (item.type === "tens") sum += 10;
      if (item.type === "ones") sum += 1;
    });
    return sum;
  };

  const checkAnswer = () => {
    const isAnswerCorrect = calculateSum() === (num1 + num2);
    setIsCorrect(isAnswerCorrect);
  
    if (isAnswerCorrect) {
      const newStreak = correctStreak + 1; // Increase streak
      console.log("New Correct Streak:", newStreak); // Debugging log
      localStorage.setItem("correctStreak", newStreak);
      setCorrectStreak(newStreak);
      correctsAudio.play();
  
      setTimeout(() => {
        setIsCorrect(null); // ✅ Hide "Correct Answer!" message
        setDroppedItems([]); // ✅ Clear obstacles inside big box
  
        if (newStreak >= 3) { // ✅ Trigger Congratulations at 3+
          console.log("Showing Congratulations!"); // Debugging log
          setShowReward(true); // ✅ Show Congratulations effect 🎉
          
          setTimeout(() => {
            console.log("Resetting Game..."); // Debugging log
            setShowReward(false);
            localStorage.setItem("correctStreak", 0);
            setCorrectStreak(0); // ✅ Reset streak to start fresh
            setQuestionIndex(0); // ✅ Restart back to 1-digit question
            setDroppedItems([]); // ✅ Reset obstacles
          }, 10000);
        } else {
          setQuestionIndex(prevIndex => prevIndex + 1); // ✅ Move to the next question
        }
      }, 4000);
    } else {
      // ❌ Incorrect answer: Reset everything
      console.log("Incorrect Answer - Resetting Streak"); // Debugging log
      localStorage.setItem("correctStreak", 0);
      failsAudio.play();
      setCorrectStreak(0);
      setQuestionIndex(0);
      setDroppedItems([]);
    }
  };
  

  const handleDragStart = (event, type, index = null) => {
    event.dataTransfer.setData("type", type);
    event.dataTransfer.setData("index", index);
  };

  // const handleDrops = (event) => {
  //   event.preventDefault();
  //   const type = event.dataTransfer.getData("type");
  //   if (type !== "remove") {
  //     setDroppedItems([...droppedItems, { type }]);
  //   }
  // };


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
    <div className="container right-align">
    <p className="home-text">Addition</p>
    <p className="home-text-problem">Given Problem</p>
    <button className="home-button" onClick={() => window.location.href = '/'}>Back to Homepage</button>
    <div className="hammer-icon" draggable onDragStart={(e) => handleDragStart(e, "hammer")} style={{ cursor: "grab" }}>🔨</div>
      <p className="addition-box">
        <h1 className="plus">+</h1>
           {num1} <br/>{num2} <br/>=<br/> 
      </p>

      <div className="big-box bordered" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
        {droppedItems.map((item, index) => (
          <div 
          key={index} 
          className="dropped-item"
          draggable
          onDragStart={(e) => handleDragStart(e, item.type, index)}
          onDrop={(e) => handleHammerDrop(e, index)}
          onClick={() => handleRemoveItem(index)}
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

      <p className="result-text">Your Answer: {calculateSum()}</p>
      <button className="check-button" onClick={checkAnswer}>Check Answer</button>
      {isCorrect !== null && (
        <p className="success-text">{isCorrect ? "🎉 Correct Answer! 🎉" : "❌ Incorrect Answer. Try Again!"}</p>
      )}
              {showReward && <Confetti />} 
      {showReward && <p className="reward-text">🎁 Congratulations! You won a reward! 🎁</p>}

      <div className="small-box-container">
      <div className="small-box-hundreds" draggable onDragStart={(e) => handleDragStart(e, "hundreds", null)}>
          <img src={HundredImage} alt="100" style={{ width: "150px", height: "150px" }} />
        </div>
        <div className="small-box-tens" draggable onDragStart={(e) => handleDragStart(e, "tens", null)}>
          <img src={TenImage} alt="100" style={{ width: "50px", height: "150px" }} />
        </div>
        <div className="small-box-ones" draggable onDragStart={(e) => handleDragStart(e, "ones", null)}>
          <img src={OneImage} alt="100" style={{ width: "50px", height: "70px" }} />
        </div>
      </div>
  </div>
);
};

export default Additionx;
