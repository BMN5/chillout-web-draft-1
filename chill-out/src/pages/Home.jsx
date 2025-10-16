import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import "./Home.css";

export default function Home() {
  const [userName, setUserName] = useState("");
  const [pendingTasks, setPendingTasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // watch auth state
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.isAnonymous ? "Guest User" : user.displayName || "Unnamed User");

        // ✅ reference to this user's todos subcollection
        const tasksRef = collection(db, "users", user.uid, "todos");

        // ✅ query: only tasks where completed == false
        const q = query(
          tasksRef,
          where("completed", "==", false),
          orderBy("createdAt", "desc")
        );

        // realtime listener
        const unsubTasks = onSnapshot(
          q,
          (snapshot) => {
            const tasks = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setPendingTasks(tasks);
          },
          (error) => {
            console.error("Error fetching pending tasks:", error.message);
          }
        );

        return () => unsubTasks();
      } else {
        navigate("/");
      }
    });

    return () => unsubAuth();
  }, [navigate]);

  return (
    <div className="home-container">
      <Navbar userName={userName} />

      <section className="welcome-section">
        <h1>Welcome, {userName}!</h1>
        <p>
          Choose a game to play and keep track of your reminders so you never
          forget!
        </p>
      </section>

      {/* ✅ Split view: Todos left, Games right */}
      <section className="content-section">
        {/* Todo Section */}
        <section className="todo-section">
          <h2>⏳ Pending Reminders</h2>
          {pendingTasks.length === 0 ? (
            <p className="empty-msg">No pending tasks 🎉</p>
          ) : (
            <ul className="todo-list">
              {pendingTasks.map((task) => (
                <li key={task.id} className="todo-item">
                  {task.text}
                </li>
              ))}
            </ul>
          )}
          <Link to="/todo" className="todo-link-btn">
            😇click on me to manage All Tasks
          </Link>
        </section>

        {/* Games Section */}
        {/* Games Section */}
<section className="games-grid">
  <Link to="/tic-tac-toe" className="game-card">
    <img src="/tictactoe.jpg" alt="Tic Tac Toe" />
    <span>Tic Tac Toe</span>
  </Link>
  <Link to="/snake" className="game-card">
    <img src="/snake.jpg" alt="Snake" />
    <span>Snake</span>
  </Link>
  <Link to="/sudoku" className="game-card">
    <img src="/sudoku.jpg" alt="Sudoku" />
    <span>Sudoku</span>
  </Link>
  <Link to="/2048" className="game-card">
    <img src="/game-2048.jpg" alt="2048" />
    <span>2048</span>
  </Link>
</section>

      </section>
    </div>
  );
}
