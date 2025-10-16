import { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import "./Snake.css";

const BOARD_SIZE = 15;
const INITIAL_SNAKE = [[7, 7]];
const MOVE_INTERVAL = 200;

export default function Snake() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(generateFood());
  const [dir, setDir] = useState("RIGHT");
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [timePlayed, setTimePlayed] = useState(0);

  // refs for interval and mutable snake/dir for reliable moves
  const snakeRef = useRef(snake);
  const dirRef = useRef(dir);
  const intervalRef = useRef(null);
  const timerRef = useRef(null);

  function generateFood() {
    return [Math.floor(Math.random() * BOARD_SIZE), Math.floor(Math.random() * BOARD_SIZE)];
  }

  const moveSnake = () => {
    const currentSnake = snakeRef.current;
    const currentDir = dirRef.current;
    const head = currentSnake[currentSnake.length - 1];
    let newHead;

    switch (currentDir) {
      case "UP": newHead = [head[0], head[1] - 1]; break;
      case "DOWN": newHead = [head[0], head[1] + 1]; break;
      case "LEFT": newHead = [head[0] - 1, head[1]]; break;
      case "RIGHT": newHead = [head[0] + 1, head[1]]; break;
      default: newHead = head;
    }

    // Collision detection
    if (
      newHead[0] < 0 || newHead[0] >= BOARD_SIZE ||
      newHead[1] < 0 || newHead[1] >= BOARD_SIZE ||
      currentSnake.some(([x, y]) => x === newHead[0] && y === newHead[1])
    ) {
      setGameOver(true);
      clearInterval(intervalRef.current);
      clearInterval(timerRef.current);
      return;
    }

    let newSnake = [...currentSnake, newHead];

    // Eating food
    if (newHead[0] === food[0] && newHead[1] === food[1]) {
      setFood(generateFood());
      if (newSnake.length > highScore) setHighScore(newSnake.length);
    } else {
      newSnake.shift(); // remove tail
    }

    setSnake(newSnake);
    snakeRef.current = newSnake; // update ref
  };

  const handleKey = (e) => {
    const newDir = e.key === "ArrowUp" ? "UP"
      : e.key === "ArrowDown" ? "DOWN"
      : e.key === "ArrowLeft" ? "LEFT"
      : e.key === "ArrowRight" ? "RIGHT" : dirRef.current;

    // prevent reverse direction
    if (
      (newDir === "UP" && dirRef.current !== "DOWN") ||
      (newDir === "DOWN" && dirRef.current !== "UP") ||
      (newDir === "LEFT" && dirRef.current !== "RIGHT") ||
      (newDir === "RIGHT" && dirRef.current !== "LEFT")
    ) {
      setDir(newDir);
      dirRef.current = newDir;
    }
  };

  const handleMobileControl = (newDir) => {
    if (
      (newDir === "UP" && dirRef.current !== "DOWN") ||
      (newDir === "DOWN" && dirRef.current !== "UP") ||
      (newDir === "LEFT" && dirRef.current !== "RIGHT") ||
      (newDir === "RIGHT" && dirRef.current !== "LEFT")
    ) {
      setDir(newDir);
      dirRef.current = newDir;
    }
  };

  const resetGame = () => {
    const initialSnake = [[Math.floor(BOARD_SIZE/2), Math.floor(BOARD_SIZE/2)]];
    setSnake(initialSnake);
    snakeRef.current = initialSnake;
    setFood(generateFood());
    setDir("RIGHT");
    dirRef.current = "RIGHT";
    setGameOver(false);
    setTimePlayed(0);

    clearInterval(intervalRef.current);
    clearInterval(timerRef.current);

    timerRef.current = setInterval(() => setTimePlayed(prev => prev + 1), 1000);
    intervalRef.current = setInterval(moveSnake, MOVE_INTERVAL);
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    timerRef.current = setInterval(() => setTimePlayed(prev => prev + 1), 1000);
    intervalRef.current = setInterval(moveSnake, MOVE_INTERVAL);

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(timerRef.current);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  return (
    <div className="snake-page">
      <Navbar userName="Guest User" />
      <div className="snake-container">
        <h2>🐍 Snake Game</h2>

        <div className="scoreboard">
          <span>High Score: {highScore}</span>
          <span>Time Played: {timePlayed}s</span>
        </div>

        <div className="snake-board">
          {[...Array(BOARD_SIZE)].map((_, row) => (
            <div key={row} className="row">
              {[...Array(BOARD_SIZE)].map((_, col) => {
                const isSnake = snake.some(([x, y]) => x === col && y === row);
                const isFood = food[0] === col && food[1] === row;
                return <div key={col} className={`cell ${isSnake ? "snake" : ""} ${isFood ? "food" : ""}`}></div>;
              })}
            </div>
          ))}
        </div>

        {gameOver && <div className="gameover">Game Over!</div>}

        <button className="reset-btn" onClick={resetGame}>
          Reset Game
        </button>

        {/* Mobile Controls */}
        <div className="mobile-controls">
          <button onClick={() => handleMobileControl("UP")}>⬆️</button>
          <div>
            <button onClick={() => handleMobileControl("LEFT")}>⬅️</button>
            <button onClick={() => handleMobileControl("DOWN")}>⬇️</button>
            <button onClick={() => handleMobileControl("RIGHT")}>➡️</button>
          </div>
        </div>
      </div>
    </div>
  );
}
