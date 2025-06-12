import { useState, useRef, useEffect, use } from "react";
import Die from "./Die";
import { nanoid } from "nanoid";
import Confetti from "react-confetti";
import logo from "./img/Tenzez_logo.png";

// Main game component
export default function App() {
  // Set up state: dice values, roll counter, best try, animation state
  const [dice, setDice] = useState(() => generateAllNewDice());
  const buttonRef = useRef(null);
  const [rollsCnt, setRollsCnt] = useState(0);
  const [bestTry, setBestTry] = useState(Infinity);
  const [isRolling, setIsRolling] = useState(false);

  // Check if game is won: all dice are held and have the same value
  const gameWon =
    dice.every((die) => die.isHeld) &&
    dice.every((die) => die.value === dice[0].value);

  // Auto-focus the roll/new game button when game is won
  useEffect(() => {
    if (gameWon) {
      buttonRef.current.focus();
    }
  }, [gameWon]);

  // Generates a fresh set of 10 random dice
  function generateAllNewDice() {
    return new Array(10).fill(0).map(() => ({
      value: Math.ceil(Math.random() * 6),
      isHeld: false,
      id: nanoid(),
    }));
  }

  // Handles roll logic: reroll unheld dice, or reset game if won
  function rollDice() {
    if (!gameWon) {
      setIsRolling(true);
      setDice((oldDice) =>
        oldDice.map((die) =>
          die.isHeld ? die : { ...die, value: Math.ceil(Math.random() * 6) }
        )
      );
      setRollsCnt((prev) => prev + 1);

      // Stop rolling animation after 500ms
      setTimeout(() => {
        setIsRolling(false);
      }, 500);
    } else {
      // Update best try if needed, then reset game
      setBestTry(rollsCnt < bestTry ? rollsCnt : bestTry);
      newGame();
    }
  }

  // Toggles a die's held state when clicked
  function hold(id) {
    setDice((oldDice) =>
      oldDice.map((die) =>
        die.id === id ? { ...die, isHeld: !die.isHeld } : die
      )
    );
  }

  // Starts a completely new game
  function newGame() {
    setDice(generateAllNewDice());
    setRollsCnt(0);
    setIsRolling(true);
    setTimeout(() => {
      setIsRolling(false);
    }, 500);
  }

  // Create all dice elements to render
  const diceElements = dice.map((dieObj) => (
    <Die
      key={dieObj.id}
      value={dieObj.value}
      isHeld={dieObj.isHeld}
      hold={() => hold(dieObj.id)}
      isRolling={isRolling}
    />
  ));

  // Load best try from localStorage when app starts
  useEffect(() => {
    const storedBest = localStorage.getItem("bestTry");
    if (storedBest) setBestTry(Number(storedBest));
  }, []);

  // Update best try in localStorage if game was won
  useEffect(() => {
    if (gameWon) {
      const newBest = rollsCnt < bestTry ? rollsCnt : bestTry;
      setBestTry(newBest);
      localStorage.setItem("bestTry", newBest);
    }
  }, [gameWon]);

  return (
    <main>
      <div className="status">
        <img src={logo} alt="logo" className="logo" />
        <div className="best">
          <div>
            Best shot <span>{bestTry !== Infinity ? bestTry : "-"}</span>
          </div>
          <button onClick={() => setBestTry(Infinity)}>reset</button>
        </div>
        <div className="cnt">{rollsCnt > 0 && rollsCnt}</div>
      </div>

      <div className="main">
        {gameWon && <Confetti />}
        {/* Screen reader message */}
        <div aria-live="polite" className="sr-only">
          {gameWon && (
            <p>Congratulations! You won! Press "New Game" to start again.</p>
          )}
        </div>
        <h1 className="title">Tenzies</h1>
        <p className="instructions">
          Roll until all dice are the same. Click each die to freeze it at its
          current value between rolls.
        </p>
        <div className="dice-container">{diceElements}</div>
        <button ref={buttonRef} className="roll-dice" onClick={rollDice}>
          {gameWon ? "New Game" : "Roll"}
        </button>
        <button className="new-game" onClick={() => newGame()}>
          new game
        </button>
      </div>
    </main>
  );
}
