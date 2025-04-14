import React, { useState, useEffect, useRef } from "react";
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
  const [selectedReward, setSelectedReward] = useState(null);
  const [rewardSelected, setRewardSelected] = useState(false);
  const [showRewardButtons, setShowRewardButtons] = useState(false);
  const touchItemRef = useRef(null);
  const boxRef = useRef(null);
  const [message, setMessage] = useState("");
  // const [port, setPort] = useState(null);

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
      min = 1;
      max = 9;
    } else if (questionIndex === 1) {
      min = 10;
      max = 99;
    } else if (questionIndex === 2) {
      min = 100;
      max = 999;
    } else return;
    const newNum1 = Math.floor(Math.random() * (max - min + 1)) + min;
    const newNum2 = Math.floor(Math.random() * (max - min + 1)) + min;
    setNum1(newNum1);
    setNum2(newNum2);
    setTargetSum(newNum1 + newNum2);
  };

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
    const touchData = touchItemRef.current;
  
    if (touchData?.clone?.style) {
      const touch = e.touches[0];
      touchData.clone.style.left = `${touch.clientX}px`;
      touchData.clone.style.top = `${touch.clientY}px`;
    } else if (touchData?.index !== undefined && boxRef.current) {
      const touch = e.touches[0];
      const rect = boxRef.current.getBoundingClientRect();
      const newX = touch.clientX - rect.left - touchData.offsetX;
      const newY = touch.clientY - rect.top - touchData.offsetY;
  
      setDroppedItems(prev => prev.map((item, i) =>
        i === touchData.index ? { ...item, x: newX, y: newY } : item
      ));
    }
  };

  const handleTouchEnd = (e) => {
    const touchData = touchItemRef.current;
  
    if (!touchData) return;
  
    if (touchData.clone?.style) {
      const { type, clone } = touchData;
  
      if (!boxRef.current) {
        document.body.removeChild(clone);
        touchItemRef.current = null;
        return;
      }
  
      const box = boxRef.current;
      const rect = box.getBoundingClientRect();
      const endX = parseInt(clone.style.left);
      const endY = parseInt(clone.style.top);
  
      if (endX > rect.left && endX < rect.right && endY > rect.top && endY < rect.bottom) {
        const x = endX - rect.left;
        const y = endY - rect.top;
  
        if (type !== "hammer") {
          setDroppedItems((prev) => [...prev, { type, x, y }]);
        }
      }
  
      document.body.removeChild(clone);
    }
  
    touchItemRef.current = null;
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

  useEffect(() => {
  const convertItems = () => {
    let newItems = [...droppedItems];
    const ones = newItems.filter(i => i.type === 'ones');
    const tens = newItems.filter(i => i.type === 'tens');

    if (ones.length >= 10) {
      newItems = newItems.filter(i => i.type !== 'ones');
      const remaining = ones.length % 10;
      for (let i = 0; i < remaining; i++) newItems.push({ type: 'ones', x: ones[i].x, y: ones[i].y });
      newItems.push({ type: 'tens', x: ones[0].x, y: ones[0].y });
    }
    if (newItems.filter(i => i.type === 'tens').length >= 10) {
      const allTens = newItems.filter(i => i.type === 'tens');
      newItems = newItems.filter(i => i.type !== 'tens');
      const remainTens = allTens.length % 10;
      for (let i = 0; i < remainTens; i++) newItems.push({ type: 'tens', x: allTens[i].x, y: allTens[i].y });
      newItems.push({ type: 'hundreds', x: allTens[0].x, y: allTens[0].y });
    }

    setDroppedItems(newItems);
  };
  convertItems();
}, [droppedItems.length]);

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
      const newStreak = correctStreak + 1;
      localStorage.setItem("correctStreak", newStreak);
      setCorrectStreak(newStreak);
      correctsAudio.play();
  
      setTimeout(() => {
        setIsCorrect(null);
        setDroppedItems([]);
  
        if (newStreak >= 3) {
          setShowReward(true);
          setShowRewardButtons(true);
          setRewardSelected(false);
          
          // setTimeout(() => {
          //   setShowReward(false);
          //   localStorage.setItem("correctStreak", 0);
          //   setCorrectStreak(0);
          //   setQuestionIndex(0);
          //   setDroppedItems([]);
          // }, 10000);
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

  const handleRewardSelection = async (reward) => {
    // Play a celebration sound when reward is selected
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
    console.log(reward.id);
    // Hide the buttons and confetti after selection
    setShowRewardButtons(false);
    setShowReward(false);
    setRewardSelected(true);
    // setSelectedReward(reward);

    // let command;
    // switch(reward.id) {
    //   case 1: command = "open1"; break;
    //   case 2: command = "open2"; break;
    //   case 3: command = "open3"; break;
    //   default: return;
    // }
  
  //   const success = await sendToArduino(command);
  //   if (!success) {
  //     alert("Failed to communicate with reward dispenser. Please check connection.");
  //   }

    // Reset the game
    setTimeout(() => {
      localStorage.setItem("correctStreak", 0);
      setCorrectStreak(0);
      setQuestionIndex(0);
      setDroppedItems([]);
      // setSelectedReward(null);
    }, 2000);
  };

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

  //---------------------------------------start

// let port;
// let writer;

// async function connectArduino(){
//   if ("serial" in navigator) {
//     try {
//       port = await navigator.serial.requestPort();
//       await port.open({ baudRate: 115200 });

//       const encoder = new TextEncoderStream();
//       encoder.readable.pipeTo(port.writable);
//       writer = encoder.writable.getWriter();

//       console.log("Serial port connected!");
//     } catch (err) {
//       console.error("Error connecting to serial port:", err);
//     }
//   } else {
//     alert("Web Serial API not supported in this browser.");
//   }
// }

// async function writeToArduino(data) {
//   if (writer) {
//     await writer.write("open1\n"); // \n is useful for Arduino's Serial.readStringUntil('\n')
//     console.log("Sent: Hello");
//   } else {
//     console.warn("Port not connected yet.");
//   }
// }
 

 

//-----------------------end

//------------------------------------------------------------------EPS START

function sendCommand(command) {
  fetch('http://160.187.221.146/'+command)
      .then(response => response.text())
      .then(data => {
          console.log("Server says:", data);
      })
      .catch(error => {
          console.error("Error:", error);
      });
}


//-------------------------------------------------------------------EPS END

//   //For Arduino serial arduino functionality
// const connectToArduino = async () => {
//   try {
//     // Request port from user
//     const newPort = await navigator.serial.requestPort();
//     await newPort.open({ baudRate: 115200,  path: "COM6" });
//     setPort(newPort);
//     console.log("Connected to Arduino");
//     return true;
//   } catch (error) {
//     console.error("Error connecting to Arduino:", error);
//     return false;
//   }
// };

// // Function to send data to Arduino
// const sendToArduino = async (data) => {
//   if (!port) {
//     const connected = await connectToArduino();
//     if (!connected) return false;
//   }

//   try {
//     const encoder = new TextEncoder();
//     const writer = port.writable.getWriter();
//     await writer.write(encoder.encode(data));
//     writer.releaseLock();
//     console.log("Sent to Arduino:", data);
//     return true;
//   } catch (error) {
//     console.error("Error sending to Arduino:", error);
//     return false;
//   }
// };
// function sendCommand(command) {
//   fetch(http://192.168.110.185/${command})
//       .then(response => response.text())
//       .then(data => {
//           console.log("Server says:", data);
//       })
//       .catch(error => {
//           console.error("Error:", error);
//       });
// }
// </script>

  return (
    <div 
      className="container right-align" 
      onTouchMove={handleTouchMove} 
      onTouchEnd={handleTouchEnd}
    >
       {/* <div className="header-buttons"> */}
      <p className="home-text">Addition</p>
      <p className="home-text-problem">Given Problem</p>
      <button className="home-button" onClick={() => window.location.href = '/'}>Back to Homepage</button>
      {/* <button onClick={}
        className="connect-button" 
        id="connectBtn"
      >
        Connect to REWARDS
      </button>
    </div> */}
      <div 
        className="hammer-icon" 
        draggable
        onDragStart={(e) => handleDragStart(e, "hammer")}
        onTouchStart={(e) => handleTouchStart(e, "hammer")}
      >
        <span style={{ fontSize: '48px' }}> </span>
      </div>
      
      <p className="addition-box">
        <h1 className="plus">+</h1>
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
            onDragStart={(e) => handleDragStart(e, item.type, index)}
            onDrop={(e) => handleHammerDrop(e, index)}
            onClick={() => handleRemoveItem(index)}
            onTouchStart={(e) => {
              const touch = e.touches[0];
              touchItemRef.current = {
                index,
                offsetX: touch.clientX - boxRef.current.getBoundingClientRect().left - item.x,
                offsetY: touch.clientY - boxRef.current.getBoundingClientRect().top - item.y,
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

      <p className="result-text">Your Answer: {calculateSum()}</p>
      <button className="check-button" onClick={checkAnswer}>Check Answer</button>
      {isCorrect !== null && (
        <p className="success-text">{isCorrect ? "🎉 Correct Answer! 🎉" : "❌ Incorrect Answer. Try Again!"}</p>
      )}
      {showReward && <Confetti />} 
      {showReward && (
        <div className="reward-celebration">
          <div className="reward-messages">
            <p className="reward-main-text">🎉 Congratulations! 🎉</p>
            <p className="reward-sub-text">You earned a reward!</p>
          </div>
          
          {!rewardSelected && (
            <div className="reward-options">
              <p className="reward-prompt">Choose your prize:</p>
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
              <p>Great choice! Enjoy your reward!</p>
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

export default Additionx; 