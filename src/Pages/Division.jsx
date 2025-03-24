import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";
import Confetti from "react-confetti";
import "./Division.css";

const congratsAudio = new Audio("/congrats.mp3");
const failsAudio = new Audio("/fails.mp3");
const correctsAudio = new Audio("/corrects.mp3");

const ItemTypes = { STAR: "star" };

const Star = ({ id, onRemove, emoticon }) => { 
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.STAR,
    item: { id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <span
      ref={drag}
      className="star"
      onClick={() => onRemove && onRemove(id)}
      style={{ fontSize: "2rem", opacity: isDragging ? 0.5 : 1, cursor: "pointer" }}
    >
      {emoticon}
    </span>
  );
};

const Box = ({ stars, onDrop, onRemove, boxIndex, selectedEmoticon }) => { 
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.STAR,
    drop: (item) => onDrop(item.id, boxIndex),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className="drop-box"
      style={{
        width: "150px",
        height: "150px",
        backgroundColor: isOver ? "lightblue" : "#eee",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        border: "2px dashed #000",
        margin: "10px",
      }}
    >
{stars.map((id) => (
  <Star key={id} id={id} onRemove={() => onRemove(id, boxIndex)} emoticon={selectedEmoticon} />
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

    setDividend(newDividend);
    setDivisor(newDivisor);
    setStars(Array.from({ length: newDividend }, (_, i) => i));
    setBoxes(Array.from({ length: newDivisor }, () => []));
    setUserQuotient("?");
    setIsCorrect(null);
  };

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

  const checkAnswer = () => {
    if (parseFloat(userQuotient) === quotient) {
      setIsCorrect(true);
      correctsAudio.play();
      setCorrectStreak((prevStreak) => prevStreak + 1);
      if (correctStreak + 1 >= 3) {
        setShowConfetti(true);
        setShowCongrats(true);
        setTimeout(() => {
          setShowConfetti(false);
          setShowCongrats(false);
          setCorrectStreak(0);
          generateProblem();
        }, 10000);
      } else {
        setTimeout(generateProblem, 4000);
      }
    } else {
      setIsCorrect(false);
      failsAudio.play();
      setCorrectStreak(0);
      setTimeout(generateProblem, 6000);
    }
  };

  return (
    <div className="containerz">
      {showConfetti && <Confetti />}
      {showCongrats && <h1 className="congrats-message">CONGRATULATIONS! YOU WON A REWARDS! 🎉</h1>}
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
        {stars.map((id) => (
          <Star key={id} id={id} emoticon={selectedEmoticon} />
        ))}
      </div>
      <div className="bottom-box-container">
        {boxes.map((boxStars, index) => (
          <Box key={index} boxIndex={index} stars={boxStars} onDrop={handleDrop} onRemove={handleRemoveStar} selectedEmoticon={selectedEmoticon} />
        ))}
      </div>
    </div>
  );
};
