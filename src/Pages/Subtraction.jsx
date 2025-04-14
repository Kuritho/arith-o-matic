import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Confetti from "react-confetti";
import "./Subtraction.css";
import HundredImage from "./assets/hundred_enhanced-removebg-preview.png";
import TenImage from "./assets/ten_enhanced-removebg-preview.png";
import OneImage from "./assets/Screenshot_2025-03-22_195903_enhanced-removebg-preview.png";

const congratsAudio = new Audio("/congrats.mp3");
const failsAudio = new Audio("/fails.mp3");
const correctsAudio = new Audio("/corrects.mp3");

const Subtraction = () => {
  const [minuend, setMinuend] = useState(0);
  const [subtrahend, setSubtrahend] = useState(0);
  const [difference, setDifference] = useState(0);
  const [droppedItems, setDroppedItems] = useState([]);
  const [isCorrect, setIsCorrect] = useState(null);
  const [correctStreak, setCorrectStreak] = useState(parseInt(localStorage.getItem("correctStreak")) || 0);
  const [showReward, setShowReward] = useState(false);
  const touchItemRef = useRef(null);
  const boxRef = useRef(null);
  const [userAnswer, setUserAnswer] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);

  const generateNumbers = () => {
    let min, max;
    if (questionIndex === 0) {
      min = 1;
      max = 9;
    } else if (questionIndex === 1) {
      min = 10;
      max = 99;
    } else if (questionIndex === 2) {
      min = 100;
      max = 999;
    } else return;
    
    const newSubtrahend = Math.floor(Math.random() * (max - min + 1)) + min;
    const newMinuend = Math.floor(Math.random() * (max - min + 1)) + newSubtrahend;
    
    setMinuend(newMinuend);
    setSubtrahend(newSubtrahend);
    setDifference(newMinuend - newSubtrahend);
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

  const handleTouchStart = (e, type) => {
    const touch = e.touches[0];
    const clone = document.createElement("div");
    clone.style.position = "absolute";
    clone.style.zIndex = 1000;
    clone.style.left = `${touch.clientX}px`;
    clone.style.top = `${touch.clientY}px`;
    
    if (type === "hammer") {
      clone.innerHTML = '<span style="font-size: 48px">🔨</span>';
    } else {
      const img = document.createElement("img");
      img.src = type === "hundreds" ? HundredImage : type === "tens" ? TenImage : OneImage;
      img.style.width = type === "hundreds" ? "100px" : type === "tens" ? "50px" : "40px";
      img.style.height = type === "ones" ? "70px" : "150px";
      clone.appendChild(img);
    }
    
    document.body.appendChild(clone);
    touchItemRef.current = { type, clone, startX: touch.clientX, startY: touch.clientY };
  };

  const handleTouchMove = (e) => {
    if (!touchItemRef.current) return;
    const touch = e.touches[0];
    const { clone } = touchItemRef.current;
    clone.style.left = `${touch.clientX}px`;
    clone.style.top = `${touch.clientY}px`;
  };

  const handleTouchEnd = (e) => {
    if (!touchItemRef.current || !boxRef.current) {
      if (touchItemRef.current?.clone) {
        document.body.removeChild(touchItemRef.current.clone);
      }
      touchItemRef.current = null;
      return;
    }

    const { type, clone, startX, startY } = touchItemRef.current;
    const box = boxRef.current;
    const rect = box.getBoundingClientRect();
    const endX = parseInt(clone.style.left);
    const endY = parseInt(clone.style.top);

    // Check if dropped inside the box
    if (endX > rect.left && endX < rect.right && endY > rect.top && endY < rect.bottom) {
      const x = endX - rect.left;
      const y = endY - rect.top;
      
      if (type === "hammer") {
        // Find the item closest to the drop position
        let closestItem = null;
        let minDistance = Infinity;
        
        droppedItems.forEach((item, index) => {
          const distance = Math.sqrt(Math.pow(item.x - x, 2) + Math.pow(item.y - y, 2));
          if (distance < minDistance && distance < 100) { // 100px threshold
            minDistance = distance;
            closestItem = { ...item, index };
          }
        });

        if (closestItem) {
          // Break down the item
          setDroppedItems(prevItems => {
            const newItems = [...prevItems];
            newItems.splice(closestItem.index, 1);
            
            if (closestItem.type === "hundreds") {
              for (let i = 0; i < 10; i++) {
                newItems.push({ 
                  type: "tens", 
                  x: closestItem.x + (i % 5) * 30, 
                  y: closestItem.y + Math.floor(i / 5) * 30 
                });
              }
            } else if (closestItem.type === "tens") {
              for (let i = 0; i < 10; i++) {
                newItems.push({ 
                  type: "ones", 
                  x: closestItem.x + (i % 5) * 20, 
                  y: closestItem.y + Math.floor(i / 5) * 20 
                });
              }
            }
            return newItems;
          });
        }
      } else {
        // Regular item drop
        setDroppedItems(prev => [...prev, { type, x, y }]);
      }
    }

    document.body.removeChild(clone);
    touchItemRef.current = null;
  };

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

  const calculateAnswer = () => {
    let sum = 0;
    droppedItems.forEach(item => {
      if (item.type === "hundreds") sum += 100;
      if (item.type === "tens") sum += 10;
      if (item.type === "ones") sum += 1;
    });
    setUserAnswer(sum);
    return sum;
  };

  const checkAnswer = () => {
    const isAnswerCorrect = calculateAnswer() === (minuend - subtrahend);
    setIsCorrect(isAnswerCorrect);
  
    if (isAnswerCorrect) {
      const newStreak = correctStreak + 1;
      localStorage.setItem("correctStreak", newStreak);
      setCorrectStreak(newStreak);
      correctsAudio.play();
  
      setTimeout(() => {
        setIsCorrect(null);
        setDroppedItems([]);
  
        if (newStreak >= 3) {
          setShowReward(true);
          
          setTimeout(() => {
            setShowReward(false);
            localStorage.setItem("correctStreak", 0);
            setCorrectStreak(0);
            setQuestionIndex(0);
            setDroppedItems([]);
          }, 10000);
        } else {
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

  const handleDragStart = (event, type, index = null) => {
    event.dataTransfer.setData("type", type);
    event.dataTransfer.setData("index", index);
  };

  const handleRemoveItem = (index) => {
    setDroppedItems(prevItems => prevItems.filter((_, i) => i !== index));
  };

  return (
    <div 
      className="container right-align" 
      onTouchMove={handleTouchMove} 
      onTouchEnd={handleTouchEnd}
    >
      <p className="home-text">Subtraction</p>
      <p className="home-text-problem">Given Problem</p>
      <button className="home-button" onClick={() => window.location.href = '/'}>Back to Homepage</button>
      
      <div 
        className="hammer-icon" 
        draggable
        onDragStart={(e) => handleDragStart(e, "hammer")}
        onTouchStart={(e) => handleTouchStart(e, "hammer")}
      >
        <span style={{ fontSize: '48px' }}>🔨</span>
      </div>
      
      <p className="subtraction-box">
        <h1 className="minus">-</h1>
        {minuend} <br/>{subtrahend} <br/>=<br/> 
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

      <p className="result-text">Your Answer: {userAnswer}</p>
      <button className="check-button" onClick={checkAnswer}>Check Answer</button>
      {isCorrect !== null && (
        <p className="success-text">{isCorrect ? "🎉 Correct Answer! 🎉" : "❌ Incorrect Answer. Try Again!"}</p>
      )}
      {showReward && <Confetti />} 
      {showReward && <p className="reward-text">🎁 Congratulations! You won a reward! 🎁</p>}

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

export default Subtraction;