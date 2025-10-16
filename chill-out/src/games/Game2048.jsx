import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./Game2048.css";

const SIZE = 4;

const createEmptyBoard = () =>
  Array(SIZE)
    .fill()
    .map(() => Array(SIZE).fill(0));

export default function Game2048() {
  const [board, setBoard] = useState(createEmptyBoard());
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  const addRandomTile = (b) => {
    const empty = [];
    b.forEach((row, i) =>
      row.forEach((cell, j) => {
        if (cell === 0) empty.push([i, j]);
      })
    );
    if (empty.length === 0) return b;
    const [i, j] = empty[Math.floor(Math.random() * empty.length)];
    b[i][j] = Math.random() < 0.9 ? 2 : 4;
    return b;
  };

  const initGame = () => {
    let b = createEmptyBoard();
    b = addRandomTile(b);
    b = addRandomTile(b);
    setBoard(b);
    setScore(0);
    setGameOver(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user)
        setUserName(
          user.isAnonymous ? "Guest User" : user.displayName || "Unnamed User"
        );
      else navigate("/");
    });
    return () => unsub();
  }, [navigate]);

  const slide = (arr) => {
    let newArr = arr.filter((v) => v);
    for (let i = 0; i < newArr.length - 1; i++) {
      if (newArr[i] === newArr[i + 1]) {
        newArr[i] *= 2;
        setScore((prev) => prev + newArr[i]);
        newArr[i + 1] = 0;
      }
    }
    newArr = newArr.filter((v) => v);
    while (newArr.length < SIZE) newArr.push(0);
    return newArr;
  };

  const rotate = (b) => b[0].map((_, i) => b.map((row) => row[i]));

  const move = (direction) => {
    if (gameOver) return;
    let newBoard = board.map((r) => [...r]);

    switch (direction) {
      case "LEFT":
        newBoard = newBoard.map(slide);
        break;
      case "RIGHT":
        newBoard = newBoard.map((r) => slide(r.reverse()).reverse());
        break;
      case "UP":
        newBoard = rotate(newBoard).map(slide);
        newBoard = rotate(newBoard);
        break;
      case "DOWN":
        newBoard = rotate(newBoard).map((r) => slide(r.reverse()).reverse());
        newBoard = rotate(newBoard);
        break;
      default:
        return;
    }

    if (JSON.stringify(board) !== JSON.stringify(newBoard)) {
      newBoard = addRandomTile(newBoard);
      setBoard(newBoard);
      if (checkGameOver(newBoard)) setGameOver(true);
    }
  };

  const checkGameOver = (b) => {
    if (b.some((row) => row.includes(0))) return false;
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE; j++) {
        if (
          (i < SIZE - 1 && b[i][j] === b[i + 1][j]) ||
          (j < SIZE - 1 && b[i][j] === b[i][j + 1])
        )
          return false;
      }
    }
    return true;
  };

  const handleKey = (e) => {
    switch (e.key) {
      case "ArrowUp":
        move("UP");
        break;
      case "ArrowDown":
        move("DOWN");
        break;
      case "ArrowLeft":
        move("LEFT");
        break;
      case "ArrowRight":
        move("RIGHT");
        break;
      default:
        break;
    }
  };

  // 🔹 Mobile swipe support
  useEffect(() => {
    let startX, startY;
    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > Math.abs(dy)) {
        dx > 0 ? move("RIGHT") : move("LEFT");
      } else {
        dy > 0 ? move("DOWN") : move("UP");
      }
    };
    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchend", handleTouchEnd);
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [board]);

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  });

  return (
    <div className="game2048-page">
      <Navbar userName={userName} />
      <div className="game2048-wrapper">
        <div className="game2048-container">
          <h2 className="title">2048</h2>
          <div className="score">Score: {score}</div>
          <div className={`board ${gameOver ? "game-over" : ""}`}>
            {board.map((row, i) =>
              row.map((cell, j) => (
                <div key={`${i}-${j}`} className={`tile tile-${cell}`}>
                  {cell !== 0 ? cell : ""}
                </div>
              ))
            )}
          </div>
          {gameOver && <div className="gameover">Game Over!</div>}
          <button className="reset-btn" onClick={initGame}>
            🔄 Reset 2048
          </button>
        </div>

        {/* 🔹 Instructions Panel */}
        <div className="instructions">
          <h3>How to Play</h3>
          <p>
            Join the numbers and get to the <strong>2048 tile!</strong>
          </p>
          <ul>
            <li>Use <b>Arrow Keys</b> on PC to move tiles.</li>
            <li>On Mobile, <b>swipe</b> in any direction.</li>
            <li>Tiles with the same number merge into one when they touch.</li>
            <li>Try to reach <b>2048</b> without running out of moves!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
