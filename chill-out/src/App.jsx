import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import TicTacToe from "./games/TicTacToe";
import Snake from "./games/Snake";
import Sudoku from "./games/Sudoku";
import Game2048 from "./games/Game2048";
import ToDo from "./widgets/ToDo";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/tic-tac-toe" element={<TicTacToe />} />
        <Route path="/snake" element={<Snake />} />
        <Route path="/sudoku" element={<Sudoku />} />
        <Route path="/2048" element={<Game2048 />} />
        <Route path="/todo" element={<ToDo />} />
      </Routes>
    </Router>
  );
}

export default App;
