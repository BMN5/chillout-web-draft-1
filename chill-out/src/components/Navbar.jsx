import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useState } from "react";
import "./Navbar.css";

export default function Navbar({ userName }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [gamesOpen, setGamesOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h2 className="app-title">🌿 Chill Out</h2>
      </div>

      <div className="navbar-links desktop-only">
        <Link className="nav-link" to="/home">Home</Link>
        <Link className="nav-link" to="/todo">ToDo</Link>
        <Link className="nav-link" to="/tic-tac-toe">Tic Tac Toe</Link>
        <Link className="nav-link" to="/snake">Snake</Link>
        <Link className="nav-link" to="/sudoku">Sudoku</Link>
        <Link className="nav-link" to="/2048">2048</Link>
      </div>

      <div className="navbar-right desktop-only">
        <span className="user-name">{userName}</span>
        <button className="signout-btn" onClick={handleLogout}>Sign Out</button>
      </div>

      <div className="hamburger mobile-only" onClick={() => setMenuOpen(!menuOpen)}>
        <span></span><span></span><span></span>
      </div>

      <div className={`mobile-menu ${menuOpen ? "active" : ""}`}>
        <Link className="nav-link" to="/home" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link className="nav-link" to="/todo" onClick={() => setMenuOpen(false)}>ToDo</Link>
        <button className="nav-link games-toggle" onClick={() => setGamesOpen(!gamesOpen)}>
          {gamesOpen ? "Hide Games ▲" : "Show Games ▼"}
        </button>
        {gamesOpen && (
          <div className="games-dropdown">
            <Link className="nav-link" to="/tic-tac-toe" onClick={() => setMenuOpen(false)}>Tic Tac Toe</Link>
            <Link className="nav-link" to="/snake" onClick={() => setMenuOpen(false)}>Snake</Link>
            <Link className="nav-link" to="/sudoku" onClick={() => setMenuOpen(false)}>Sudoku</Link>
            <Link className="nav-link" to="/2048" onClick={() => setMenuOpen(false)}>2048</Link>
          </div>
        )}
        <span className="user-name">{userName}</span>
        <button className="signout-btn" onClick={handleLogout}>Sign Out</button>
      </div>
    </nav>
  );
}
