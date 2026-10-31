// ============================================
// フリーランスナビのエントリ（/freelance/* 配下のルーティング）
// main.tsx から React.lazy で読み込まれるため、
// お金シミュレーター側のバンドルサイズには影響しません。
// ============================================

import { Routes, Route } from "react-router-dom";
import FreelanceLayout from "./components/FreelanceLayout";
import FreelanceHome from "./pages/FreelanceHome";
import AgentsPage from "./pages/AgentsPage";
import DiagnosisPage from "./pages/DiagnosisPage";
import NotFound from "./pages/NotFound";

export default function FreelanceApp() {
  return (
    <FreelanceLayout>
      <Routes>
        <Route index element={<FreelanceHome />} />
        <Route path="agents" element={<AgentsPage />} />
        <Route path="diagnosis" element={<DiagnosisPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </FreelanceLayout>
  );
}
