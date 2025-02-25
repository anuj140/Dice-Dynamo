import { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import Confetti from "react-confetti";
import "./App.css";
import Die from "./Components/Die";

const BONUS_TIME = 5;
const INITIAL_TIME = 60;
const COMBO_THRESHOLD = 2000; 

const App = () => {
  const [dice, setDice] = useState(() => generateAllNewDice());
  const [timeRemaining, setTimeRemaining] = useState(INITIAL_TIME);
  const [rollCount, setRollCount] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [lastHoldTime, setLastHoldTime] = useState(null);
  const [targetValue, setTargetValue] = useState(null);
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(null);
  const [scorePopup, setScorePopup] = useState(false);


  useEffect(() => {
    const allHeld = dice.every((die) => die.isHeld);
    const allSame = dice.every((die) => die.value === dice[0].value);
    if (allHeld && allSame) {
      setGameWon(true);
      const calculatedScore = timeRemaining * rollCount * comboMultiplier;
      setScore(calculatedScore);
      saveScore(calculatedScore);
      setScorePopup(true);
    }
  }, [dice, timeRemaining, rollCount, comboMultiplier]);

  
  useEffect(() => {
    if (timeRemaining <= 0 && !gameWon) {
      setGameOver(true);
    }
  }, [timeRemaining, gameWon]);


  useEffect(() => {
    if (gameWon || gameOver) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [gameWon, gameOver]);

  function generateAllNewDice() {
    return Array.from({ length: 10 }, () => ({
      id: nanoid(),
      value: Math.ceil(Math.random() * 6),
      isHeld: false,
    }));
  }

  function handleRollDice() {
    if (gameOver) return; 
    if (gameWon) {
      setDice(generateAllNewDice());
      setTimeRemaining(INITIAL_TIME);
      setRollCount(0);
      setComboMultiplier(1);
      setLastHoldTime(null);
      setTargetValue(null);
      setGameWon(false);
      setGameOver(false);
      setScore(null);
      setScorePopup(false);
    } else {
      setRollCount((prev) => prev + 1);
      setDice((oldDice) =>
        oldDice.map((die) =>
          die.isHeld ? die : { ...die, value: Math.ceil(Math.random() * 6) }
        )
      );
    }
  }

  function hold(id) {
    if (gameOver || gameWon) return;
    setDice((oldDice) =>
      oldDice.map((die) => {
        if (die.id === id) {
          if (!die.isHeld) {
            if (targetValue === null) {
              setTargetValue(die.value);
              setTimeRemaining((prev) => prev + BONUS_TIME);
              setComboMultiplier(1);
              setLastHoldTime(Date.now());
            } else if (die.value === targetValue) {
              const now = Date.now();
              if (lastHoldTime && now - lastHoldTime < COMBO_THRESHOLD) {
                setComboMultiplier((prev) => prev + 1);
              } else {
                setComboMultiplier(1);
              }
              setLastHoldTime(now);
              setTimeRemaining((prev) => prev + BONUS_TIME);
            }
          }
          return { ...die, isHeld: !die.isHeld };
        } else {
          return die;
        }
      })
    );
  }

  const saveScore = (newScore) => {
    const scores = JSON.parse(localStorage.getItem("tenziesScores")) || [];
    const updatedScores = [...scores, newScore]
      .sort((a, b) => b - a)
      .slice(0, 10);
    localStorage.setItem("tenziesScores", JSON.stringify(updatedScores));
  };

  const getMedal = () => {
    if (score === null) return null;
    const scores = JSON.parse(localStorage.getItem("tenziesScores")) || [];
    if (scores[0] === score) return "🥇";
    if (scores[1] === score) return "🥈";
    if (scores[2] === score) return "🥉";
    return null;
  };

  return (
    <main>
      {gameWon && <Confetti />}
      <div className="board">
        <div className="game-info">
          <h3>Tenzies</h3>
          <p>
            Roll until all dice are the same. Click <br />
            each die to freeze it at its current value.
          </p>
          <div className="stats">
            <div className="stat-item">Time: {timeRemaining}s</div>
            <div className="stat-item">Rolls: {rollCount}</div>
            <div className="stat-item">Score: {score !== null ? score : 0}</div>
          </div>
          {gameOver && <div className="game-over">Time's up! Game Over.</div>}
          {scorePopup && gameWon && (
            <div className="score-popup">
              Score: {score} {getMedal()}
            </div>
          )}
        </div>
        <div className="dices-board">
          {dice.map((item) => (
            <Die
              key={item.id}
              value={item.value}
              id={item.id}
              holdFn={hold}
              isHeld={item.isHeld}
            />
          ))}
        </div>
        <button className="roll-btn" type="button" onClick={handleRollDice}>
          {gameWon ? "New Game" : "Roll"}
        </button>
      </div>
    </main>
  );
};

export default App;
