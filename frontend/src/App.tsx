import { Routes, Route } from "react-router-dom";
import MainLayout from "./Layouts/MainLayout";

import Home from "./pages/Home";
import Analizar from "./pages/Analytics"

function App() {
  return (
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/analizar" element={<Analizar />} />
        </Route>
      </Routes>
  );
}

export default App;
