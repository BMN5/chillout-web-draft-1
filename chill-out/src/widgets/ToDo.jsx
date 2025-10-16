import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "./ToDo.css";
import Navbar from "../components/Navbar";

export default function ToDo() {
  const [task, setTask] = useState("");
  const [pendingTasks, setPendingTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [userId, setUserId] = useState(null);

  // 🔹 Track logged-in user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        const tasksRef = collection(db, "users", user.uid, "todos");
        const q = query(tasksRef, orderBy("createdAt", "desc"));

        onSnapshot(q, (snapshot) => {
          const allTasks = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setPendingTasks(allTasks.filter((t) => !t.completed));
          setCompletedTasks(allTasks.filter((t) => t.completed));
        });
      } else {
        setUserId(null);
        setPendingTasks([]);
        setCompletedTasks([]);
      }
    });
    return () => unsub();
  }, []);

  // 🔹 Add new task
  const addTask = async (e) => {
    e.preventDefault();
    if (!task.trim() || !userId) return;

    await addDoc(collection(db, "users", userId, "todos"), {
      text: task,
      completed: false,
      createdAt: serverTimestamp(),
    });
    setTask("");
  };

  // 🔹 Toggle task
  const toggleTask = async (id, currentStatus) => {
    if (!userId) return;
    const taskRef = doc(db, "users", userId, "todos", id);
    await updateDoc(taskRef, { completed: !currentStatus });
  };

  // 🔹 Delete task
  const deleteTask = async (id) => {
    if (!userId) return;
    await deleteDoc(doc(db, "users", userId, "todos", id));
  };

  return (
    <div className="todo-page">
      <Navbar />
      <div className="todo-container">
        <form className="todo-form" onSubmit={addTask}>
          <input
            type="text"
            placeholder="Write a reminder..."
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />
          <button type="submit">Add</button>
        </form>

        {/* Two-column task layout */}
        <div className="todo-lists">
          {/* Pending Tasks */}
          <div className="task-column">
            <h3>⏳ Pending Tasks</h3>
            <ul className="todo-list">
              {pendingTasks.map((t) => (
                <li key={t.id} className="todo-item">
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => toggleTask(t.id, t.completed)}
                  />
                  <span>{t.text}</span>
                  <button onClick={() => deleteTask(t.id)}>❌</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Completed Tasks */}
          <div className="task-column">
            <h3>✅ Completed Tasks</h3>
            <ul className="todo-list completed">
              {completedTasks.map((t) => (
                <li key={t.id} className="todo-item">
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => toggleTask(t.id, t.completed)}
                  />
                  <span style={{ textDecoration: "line-through", color: "gray" }}>
                    {t.text}
                  </span>
                  <button onClick={() => deleteTask(t.id)}>❌</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
