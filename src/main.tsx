import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/index.css";

import Home from "./pages/Home";
import LoanNisa from "./pages/LoanNisa";
import Income from "./pages/Income";
import MicroCorp from "./pages/MicroCorp";
import Furusato from "./pages/Furusato";
import Ideco from "./pages/Ideco";
import Kokuho from "./pages/Kokuho";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/loan-nisa" element={<LoanNisa />} />
        <Route path="/income" element={<Income />} />
        <Route path="/micro-corp" element={<MicroCorp />} />
        <Route path="/furusato" element={<Furusato />} />
        <Route path="/ideco" element={<Ideco />} />
        <Route path="/kokuho" element={<Kokuho />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
