import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./TicTacToe.css";

export default function TicTacToe() {
  const [userName, setUserName] = useState("");
  // Always enforce a 3x3 board
  const [board, setBoard] = useState(() => Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState(null);
  const [scores, setScores] = useState({ player: 0, computer: 0, draws: 0 });
  const navigate = useNavigate();

  // Redirects to home if no user is authenticated
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.isAnonymous ? "Guest User" : user.displayName || "Unnamed User");
      } else {
        navigate("/");
      }
    });
    return () => unsub();
  }, [navigate]);

  // Handles computer's turn
  useEffect(() => {
    if (!isPlayerTurn && !winner) {
      const timer = setTimeout(() => {
        const bestMove = getBestMove(board);
        if (bestMove !== -1) {
          makeMove(bestMove, "O");
        }
        setIsPlayerTurn(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, winner, board]);

  // Handles player's move
  const handleClick = (index) => {
    // Prevents making a move if it's not the player's turn, the cell is already filled, or the game is over
    if (!isPlayerTurn || board[index] || winner) return;
    makeMove(index, "X");
    setIsPlayerTurn(false);
  };

  // Updates the board and checks for a winner or a draw
  const makeMove = (index, symbol) => {
    const newBoard = [...board];
    newBoard[index] = symbol;
    setBoard(newBoard);

    const win = calculateWinner(newBoard);
    if (win) {
      setWinner(win);
      updateScores(win);
    } else if (newBoard.every((cell) => cell)) {
      setWinner("Draw");
      setScores((s) => ({ ...s, draws: s.draws + 1 }));
    }
  };

  // Updates the score based on the winner
  const updateScores = (win) => {
    setScores((s) => {
      if (win === "X") {
        return { ...s, player: s.player + 1 };
      } else if (win === "O") {
        return { ...s, computer: s.computer + 1 };
      }
      return s;
    });
  };

  // Resets the game state
  const handleReset = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setWinner(null);
  };

  return (
    <div className="tic-wrapper">
      <Navbar userName={userName} />
      <div className="tic-container">
        <h2 className="tic-title">Tic Tac Toe</h2>
        <div className="scoreboard">
          <div className="score">👤 You: {scores.player}</div>
          <div className="score">🤖 Computer: {scores.computer}</div>
          <div className="score">➖ Draws: {scores.draws}</div>
        </div>

        <div className="status">
          {winner ? (
            winner === "Draw" ? (
              "It's a Draw!"
            ) : (
              `Winner: ${winner === "X" ? "You 🎉" : "Computer 🤖"}`
            )
          ) : isPlayerTurn ? (
            "Your Turn (X)"
          ) : (
            "Computer's Turn (O)"
          )}
        </div>

        <div
  className="board"
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)", // always 3 columns
    gap: "10px",
    width: "100%",
    maxWidth: "360px",
    margin: "20px auto"
  }}
>
  {Array.from({ length: 9 }).map((_, idx) => (
    <button
      key={idx}
      className={`cell ${board[idx] ? "filled" : ""} ${
        winner && winner !== "Draw" && isWinningCell(board, idx, winner)
          ? "winner-cell"
          : ""
      }`}
      onClick={() => handleClick(idx)}
    >
      {board[idx]}
    </button>
  ))}
</div>


        <button className="reset-btn" onClick={handleReset}>
          🔄 Reset Game
        </button>
      </div>
    </div>
  );
}

// Determines if there is a winner and returns their symbol ("X" or "O")
function calculateWinner(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

// Checks if a specific cell is part of a winning line
function isWinningCell(board, index, winner) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  return lines.some(([a, b, c]) => {
    return (
      board[a] === winner &&
      board[b] === winner &&
      board[c] === winner &&
      [a, b, c].includes(index)
    );
  });
}

// Simple AI logic for the computer's move
function getBestMove(board) {
  const emptySquares = board.map((value, index) => (value === null ? index : null)).filter(val => val !== null);
  
  if (emptySquares.length === 0) return -1;

  // 1. Check if computer can win
  for (const index of emptySquares) {
    const tempBoard = [...board];
    tempBoard[index] = "O";
    if (calculateWinner(tempBoard) === "O") {
      return index;
    }
  }

  // 2. Check if player can win and block them
  for (const index of emptySquares) {
    const tempBoard = [...board];
    tempBoard[index] = "X";
    if (calculateWinner(tempBoard) === "X") {
      return index;
    }
  }

  // 3. Take the center square if available
  if (emptySquares.includes(4)) return 4;

  // 4. Take any corner square if available
  const corners = [0, 2, 6, 8];
  const availableCorners = emptySquares.filter(index => corners.includes(index));
  if (availableCorners.length > 0) {
    return availableCorners[Math.floor(Math.random() * availableCorners.length)];
  }

  // 5. Take any side square if available
  const sides = [1, 3, 5, 7];
  const availableSides = emptySquares.filter(index => sides.includes(index));
  if (availableSides.length > 0) {
    return availableSides[Math.floor(Math.random() * availableSides.length)];
  }

  // Fallback to a random move (should not be reached in most cases)
  return emptySquares[Math.floor(Math.random() * emptySquares.length)];
}