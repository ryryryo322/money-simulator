import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/index.css";

// ページのインポート
// 新しいシミュレーターを追加するときはここに追記するだけでOK
import Home from "./pages/Home";
import LoanNisa from "./pages/LoanNisa";
import Income from "./pages/Income";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/loan-nisa" element={<LoanNisa />} />
        <Route path="/income" element={<Income />} />
        {/* 新しいシミュレーターはここに追加 */}
        {/* <Route path="/furusato" element={<Furusato />} /> */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
