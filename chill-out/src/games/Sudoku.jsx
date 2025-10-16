// src/pages/Sudoku.jsx
import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./Sudoku.css";

// Utility: Generate a random solvable-ish 6x6 Sudoku board (demo puzzle generator)
const generateBoard = () => {
  const baseBoard = [
    [1, 2, 3, 4, 5, 6],
    [4, 5, 6, 1, 2, 3],
    [2, 3, 1, 5, 6, 4],
    [5, 6, 4, 2, 3, 1],
    [3, 1, 2, 6, 4, 5],
    [6, 4, 5, 3, 1, 2],
  ];

  const shuffle = (array) => array.sort(() => Math.random() - 0.5);
  const board = baseBoard.map((r) => [...r]);
  shuffle(board);
  // Remove some cells to create a puzzle
  return board.map((row) => row.map((val) => (Math.random() > 0.55 ? val : "")));
};

// Validate 6x6 Sudoku rules (rows, columns, 2x3 boxes)
const isValidBoard = (board) => {
  const size = 6;
  // rows
  for (let r = 0; r < size; r++) {
    const seen = new Set();
    for (let c = 0; c < size; c++) {
      const v = board[r][c];
      if (!v || seen.has(v)) return false;
      seen.add(v);
    }
  }
  // cols
  for (let c = 0; c < size; c++) {
    const seen = new Set();
    for (let r = 0; r < size; r++) {
      const v = board[r][c];
      if (!v || seen.has(v)) return false;
      seen.add(v);
    }
  }
  // 2x3 boxes (box rows step = 2, box cols step = 3)
  for (let br = 0; br < size; br += 2) {
    for (let bc = 0; bc < size; bc += 3) {
      const seen = new Set();
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 3; c++) {
          const v = board[br + r][bc + c];
          if (!v || seen.has(v)) return false;
          seen.add(v);
        }
      }
    }
  }
  return true;
};

export default function Sudoku() {
  // generate once and keep initial puzzle in ref so we can compute fixed cells once
  const initialBoardRef = useRef(generateBoard());
  const [board, setBoard] = useState(initialBoardRef.current);

  // fixed cells computed from the initial puzzle only
  const [fixedCells, setFixedCells] = useState(() => {
    const list = [];
    initialBoardRef.current.forEach((row, i) =>
      row.forEach((cell, j) => {
        if (typeof cell === "number") list.push(`${i}-${j}`);
      })
    );
    return list;
  });

  const [userName, setUserName] = useState("");
  const [timer, setTimer] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [selectedCell, setSelectedCell] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const timerRef = useRef(null);

  // Auth check
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

  // timer
  useEffect(() => {
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // handle direct typing / change (desktop)
  const handleChange = (row, col, value) => {
    const key = `${row}-${col}`;
    if (fixedCells.includes(key)) return; // never edit fixed

    const currentValue = board[row][col];

    // clear if empty string
    if (value === "") {
      if (currentValue !== "") {
        const nb = board.map((r) => [...r]);
        nb[row][col] = "";
        setBoard(nb);
      }
      return;
    }

    // only accept 1-6 and only if currently empty
    if (/^[1-6]$/.test(value) && (currentValue === "" || currentValue === null)) {
      const nb = board.map((r) => [...r]);
      nb[row][col] = parseInt(value, 10);
      setBoard(nb);
    }
  };

  // keyboard handler for each cell: supports Backspace/Delete and numeric keys
  const handleInputKeyDown = (e, row, col) => {
    const key = `${row}-${col}`;
    if (fixedCells.includes(key)) {
      // don't allow editing fixed cell
      return;
    }
    // Backspace/Delete => clear the cell
    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      if (board[row][col] !== "") {
        const nb = board.map((r) => [...r]);
        nb[row][col] = "";
        setBoard(nb);
      }
      return;
    }

    // allow numeric entry via keyboard (1-6), only if the cell is empty
    if (/^[1-6]$/.test(e.key)) {
      e.preventDefault();
      if (board[row][col] === "" || board[row][col] === null) {
        const nb = board.map((r) => [...r]);
        nb[row][col] = parseInt(e.key, 10);
        setBoard(nb);
      }
    }

    // optional: allow arrow navigation between cells (nice UX)
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
      let [r, c] = [row, col];
      if (e.key === "ArrowUp") r = Math.max(0, r - 1);
      if (e.key === "ArrowDown") r = Math.min(5, r + 1);
      if (e.key === "ArrowLeft") c = Math.max(0, c - 1);
      if (e.key === "ArrowRight") c = Math.min(5, c + 1);
      setSelectedCell([r, c]);
      // focus moved will be handled by click selection; you may call focus programmatically if needed
    }
  };

  // mobile keypad input (number or empty string to clear)
  const handleKeypad = (num) => {
    if (!selectedCell) return;
    const [row, col] = selectedCell;
    const key = `${row}-${col}`;
    if (fixedCells.includes(key)) return;

    const cur = board[row][col];
    if (num === "") {
      if (cur !== "") {
        const nb = board.map((r) => [...r]);
        nb[row][col] = "";
        setBoard(nb);
      }
      return;
    }

    if (/^[1-6]$/.test(String(num)) && (cur === "" || cur === null)) {
      const nb = board.map((r) => [...r]);
      nb[row][col] = parseInt(num, 10);
      setBoard(nb);
    }
  };

  // reset -> generate brand new board and recompute fixed cells (from new puzzle)
  const resetBoard = () => {
    const newB = generateBoard();
    setBoard(newB);
    const fixed = [];
    newB.forEach((row, i) =>
      row.forEach((cell, j) => {
        if (typeof cell === "number") fixed.push(`${i}-${j}`);
      })
    );
    setFixedCells(fixed);
    setTimer(0);
    setSelectedCell(null);
    setMessage("");
    setHighScore((prev) => Math.max(prev, board.flat().filter((v) => v !== "").length));
  };

  const handleSubmit = () => {
    if (isValidBoard(board)) {
      setMessage("🎉 Congratulations! Sudoku solved correctly!");
      setHighScore((prev) => Math.max(prev, Math.max(0, 1000 - timer)));
    } else {
      setMessage("❌ Invalid solution. Try again!");
    }
  };

  return (
    <div className="sudoku-page">
      <Navbar userName={userName} />
      <div className="sudoku-container">
        <h2>6x6 Sudoku</h2>

        <div className="sudoku-info">
          <span>⏱ Timer: {timer}s</span>
          <span>🏆 High Score: {highScore}</span>
        </div>

        <div className="sudoku-board" role="grid" aria-label="6x6 Sudoku board">
          {board.map((row, r) => (
            <div key={r} className="sudoku-row" role="row">
              {row.map((cell, c) => {
                const cellKey = `${r}-${c}`;
                const isFixed = fixedCells.includes(cellKey);
                return (
                  <input
                    key={c}
                    role="gridcell"
                    inputMode="numeric"
                    pattern="[1-6]*"
                    maxLength={1}
                    className={`sudoku-cell ${isFixed ? "fixed" : ""} ${
                      selectedCell && selectedCell[0] === r && selectedCell[1] === c ? "selected" : ""
                    }`}
                    value={cell === null || cell === undefined ? "" : cell}
                    onClick={() => setSelectedCell([r, c])}
                    onChange={(e) => handleChange(r, c, e.target.value.trim())}
                    onKeyDown={(e) => handleInputKeyDown(e, r, c)}
                    disabled={isFixed}
                    aria-readonly={isFixed}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* mobile keypad */}
        <div className="mobile-keypad" aria-hidden={false}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <button key={n} onClick={() => handleKeypad(n)}>
              {n}
            </button>
          ))}
          <button onClick={() => handleKeypad("")}>⌫</button>
        </div>

        <div className="sudoku-actions">
          <button className="reset-btn" onClick={resetBoard}>
            🔄 New Sudoku
          </button>
          <button className="submit-btn" onClick={handleSubmit}>
            ✅ Submit
          </button>
        </div>

        {message && <p className="sudoku-message">{message}</p>}
      </div>
    </div>
  );
}
