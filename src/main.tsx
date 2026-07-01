import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/index.css";

import Home from "./pages/Home";
import LoanNisa from "./pages/LoanNisa";
import Income from "./pages/Income";
import MicroCorp from "./pages/MicroCorp";
// 新しいシミュレーターはここに追加
// import Furusato from "./pages/Furusato";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/loan-nisa" element={<LoanNisa />} />
        <Route path="/income" element={<Income />} />
        <Route path="/micro-corp" element={<MicroCorp />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
