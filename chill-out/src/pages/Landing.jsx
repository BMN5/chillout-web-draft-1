import { useEffect } from "react";
import { auth, provider } from "../firebase";
import {
  signInWithPopup,
  signInAnonymously,
  onAuthStateChanged,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./Landing.css"; // Import the CSS file we'll create

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) navigate("/home");
    });
    return () => unsub();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate("/home");
    } catch (err) {
      console.error("Google sign-in error:", err);
    }
  };

  const handleGuestSignIn = async () => {
    try {
      await signInAnonymously(auth);
      navigate("/home");
    } catch (err) {
      alert("Guest sign-in failed: " + err.message);
      console.error("Guest sign-in error:", err);
    }
  };

  return (
    <div className="landing-container">
      {/* Overlay */}
      <div className="overlay"></div>

      {/* Content */}
      <div className="landing-content">
        <h1>🌿 Chill Out</h1>
        <p>
          Take a break, relax, and recharge. 🎮 Play fun games like Tic Tac Toe,
          Snake, Sudoku, and 2048 — or stay productive with your built-in To-Do
          app. Chill Out is your hub for balance between play and focus.
        </p>
        <div className="button-group">
          <button onClick={handleGoogleSignIn}>Sign in with Google</button>
          <button onClick={handleGuestSignIn}>Continue as Guest</button>
        </div>
      </div>
    </div>
  );
}
