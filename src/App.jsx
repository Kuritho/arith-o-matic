import './App.css';
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Home } from './Pages/Home';
import Addition from './Pages/Addition/Addition';
import { Subtraction } from './Pages/Subtraction';
import { Multiplication } from './Pages/Multiplication';
import { Division } from './Pages/Division';
import Sumreward from './Pages/Addition/Sumreward';
import Additionx from './Pages/Additionx';
import Subtractionx from './Pages/Subtractionx';

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/additionx" element={<Additionx />} />
          <Route path="/subtractionx" element={<Subtractionx />} />
          <Route path="/multiplication" element={<Multiplication />} />
          <Route path="/division" element={<Division />} />
          <Route path="/sumreward" element={<Sumreward />} />
        </Routes>
      </Router>
    </DndProvider>
  );
}

export default App;