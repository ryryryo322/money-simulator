import React, { lazy, Suspense } from "react";
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
import Ikukyu from "./pages/Ikukyu";
import TokyoKokuho from "./pages/TokyoKokuho";
import UsdJpySimulation from "./pages/UsdJpySimulation";
import CanonicalManager from "./lib/seo/CanonicalManager";

// フリーランスナビ（/freelance/ 以下）。遅延読み込みで既存ページに影響しない
const FreelanceApp = lazy(() => import("./features/freelance/FreelanceApp"));

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <CanonicalManager />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/loan-nisa" element={<LoanNisa />} />
        <Route path="/income" element={<Income />} />
        <Route path="/micro-corp" element={<MicroCorp />} />
        <Route path="/furusato" element={<Furusato />} />
        <Route path="/ideco" element={<Ideco />} />
        <Route path="/kokuho" element={<Kokuho />} />
        <Route path="/ikukyu" element={<Ikukyu />} />
        <Route path="/tokyo-kokuho" element={<TokyoKokuho />} />
        <Route path="/usd-jpy-simulation" element={<UsdJpySimulation />} />
        <Route
          path="/freelance/*"
          element={
            <Suspense fallback={null}>
              <FreelanceApp />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
