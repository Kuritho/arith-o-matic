import { useState, useEffect } from "react"; 
import { Link } from "react-router-dom";
import { useDrag, useDrop } from "react-dnd";
import Confetti from "react-confetti";
import "./Subtraction.css";

const congratsAudio = new Audio("/congrats.mp3");
const failsAudio = new Audio("/fails.mp3");
const correctsAudio = new Audio("/corrects.mp3");

const ItemTypes = {
  GRID: "grid",
};

const DraggableGrid = ({ type, className, index, boxIndex, onRemove }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.GRID,
    item: { type, index, boxIndex },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={className}
      style={{ opacity: isDragging ? 0.5 : 1, cursor: "pointer" }}
      onClick={() => onRemove && onRemove(boxIndex, index)}
    />
  );
};

const DroppableBox = ({ acceptTypes, className, onDrop, children, boxIndex }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.GRID,
    drop: (item) => onDrop(boxIndex, item.type),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div ref={drop} className={className} style={{ backgroundColor: isOver ? "lightgreen" : "lightgray" }}>
      {children}
    </div>
  );
};

const DeleteBox = ({ onRemove }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.GRID,
    drop: (item) => onRemove(item.boxIndex, item.index),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div ref={drop} className="delete-box" style={{ backgroundColor: isOver ? "red" : "gray" }}>
      Delete
    </div>
  );
};

export const Subtraction = () => {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [droppedItems, setDroppedItems] = useState({ 1: [], 2: [], 3: []}); //, 4: [], 5: [], 6: [] 
  const [userTotal, setUserTotal] = useState(0);
  const [message, setMessage] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [showReloadButton, setShowReloadButton] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(1);

  const generateNewQuestion = () => {
    let firstNum, secondNum;

    if (questionNumber === 1) {
      // Easy: 1-digit numbers
      firstNum = Math.floor(1 + Math.random() * 9);
      secondNum = Math.floor(1 + Math.random() * 9);
    } else if (questionNumber === 2) {
      // Hard: 2-digit numbers
      firstNum = Math.floor(10 + Math.random() * 90);
      secondNum = Math.floor(10 + Math.random() * 90);
    } else {
      // Extremely Hard: 3-digit numbers
      firstNum = Math.floor(100 + Math.random() * 900);
      secondNum = Math.floor(100 + Math.random() * 900);
    }

    // Ensure the first number is greater than or equal to the second number for non-negative result
    if (firstNum < secondNum) {
      [firstNum, secondNum] = [secondNum, firstNum]; // Swap to avoid negative answers
    }

    setNum1(firstNum);
    setNum2(secondNum);
    setDroppedItems({ 1: [], 2: [], 3: [] }); //, 4: [], 5: [], 6: []
    setUserTotal(0);
    setMessage("");
    setQuestionNumber((prev) => (prev < 3 ? prev + 1 : 1));
  };

  useEffect(() => {
    generateNewQuestion();
  }, []);

  useEffect(() => {
    const sum = Object.values(droppedItems).flat().reduce((acc, type) => {
      return acc + (type === "hundreds" ? 100 : type === "tens" ? 10 : 1);
    }, 0);
    setUserTotal(sum);
  }, [droppedItems]);

  const handleDrop = (boxIndex, type) => {
    setDroppedItems((prev) => {
      if (prev[boxIndex].length < 9) {
        return { ...prev, [boxIndex]: [...prev[boxIndex], type] };
      }
      return prev;
    });
  };

  const handleRemove = (boxIndex, index) => {
    setDroppedItems((prev) => {
      const newItems = [...prev[boxIndex]];
      newItems.splice(index, 1);
      return { ...prev, [boxIndex]: newItems };
    });
  };

  const checkAnswer = () => {
    if (userTotal === num1 - num2) {
      setMessage("✅ Correct! Next Question");

      correctsAudio.play();

      setCorrectStreak((prev) => prev + 1);

      if (correctStreak + 1 === 3) {
        setShowConfetti(true);
        setMessage("🎉 CONGRATULATIONS! YOU GOT THE REWARDS! 🎊");
        setShowReloadButton(true);

        congratsAudio.play();

        setTimeout(() => {
          setMessage("");
        }, 10000);

        setTimeout(() => setShowConfetti(false), 10000);
        setCorrectStreak(0);
      } else {
        setTimeout(() => {
          generateNewQuestion();
          setMessage("");
        }, 4000);
      }
    } else {
      setMessage("❌ Sorry, wrong answer. Try again!");

      failsAudio.play();

      setTimeout(() => {
        setMessage("");
      }, 6000);
      setCorrectStreak(0);
    }
  };

  return (
    <div>
      {showConfetti && <Confetti />}
      <h1>{message}</h1>
      <div className="addition-container">
        <div className="top-left">
          <h1 className="addition-title">Subtraction</h1>
          <Link to="/">
            <button className="btn btn-home">Back to Home Page</button>
          </Link>
        </div>

        <div className="top-center-hundreds">
          <DraggableGrid type="hundreds" className="ten-by-ten-grid" />
          <h1 className="hundred-label">Hundreds</h1>
        </div>
        <div className="top-center-tens">
          <DraggableGrid type="tens" className="one-by-ten-grid" />
          <h1 className="tens-label">Tens</h1>
        </div>
        <div className="top-center-ones">
          <DraggableGrid type="ones" className="one-by-one-grid" />
          <h1 className="ones-label">Ones</h1>
        </div>

        <div className="left-center">
          <div className="problem-text">
            <p>{num1}</p>
            <p>- {num2}</p>
            <p className="underline"> = </p>
            <p className="answer">{userTotal}</p>
          </div>
          <button className="btn-btn-check" onClick={checkAnswer}>Check Answer</button>
        </div>

        <div className="right-center">
          <div className="grid-container">
            {[1, 2, 3].map((boxIndex) => ( //, 4, 5, 6
              <DroppableBox
                key={boxIndex}
                acceptTypes={["hundreds", "tens", "ones"]}
                className="grid-box"
                onDrop={handleDrop}
                boxIndex={boxIndex}
              >
                {droppedItems[boxIndex].map((type, index) => (
                  <DraggableGrid
                    key={index}
                    type={type}
                    className={type === "hundreds" ? "ten-by-ten-grid" : type === "tens" ? "one-by-ten-grid" : "one-by-one-grid"}
                    index={index}
                    boxIndex={boxIndex}
                    onRemove={handleRemove}
                  />
                ))}
              </DroppableBox>
            ))}
          </div>
        </div>
        <div className="delete-box-container">
          <DeleteBox onRemove={handleRemove} />
        </div>
        <div>
          <p>{message}</p>
          {showReloadButton && (
            <button 
              onClick={() => window.location.reload()} 
              className="restart-button"
            >
              🔄 Play Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Subtraction;
