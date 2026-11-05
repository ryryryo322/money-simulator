// ============================================
// フリーランスナビのエントリ（/freelance/* 配下のルーティング）
// main.tsx から React.lazy で読み込まれるため、
// お金シミュレーター側のバンドルサイズには影響しません。
// ============================================

import { Routes, Route, Navigate } from "react-router-dom";
import FreelanceLayout from "./components/FreelanceLayout";
import FreelanceHome from "./pages/FreelanceHome";
import AgentsPage from "./pages/AgentsPage";
import DiagnosisPage from "./pages/DiagnosisPage";
import GuideIndexPage from "./pages/GuideIndexPage";
import JavaGuidePage from "./pages/JavaGuidePage";
import NotFound from "./pages/NotFound";

export default function FreelanceApp() {
  return (
    <FreelanceLayout>
      <Routes>
        <Route index element={<FreelanceHome />} />
        <Route path="agents" element={<AgentsPage />} />
        <Route path="diagnosis" element={<DiagnosisPage />} />
        <Route path="guide">
          <Route index element={<GuideIndexPage />} />
          <Route path="java" element={<JavaGuidePage />} />
        </Route>
        {/* 旧URL。本番ではCloudflareの301リダイレクト（public/_redirects）が先に働く。これはその補助 */}
        <Route path="java" element={<Navigate to="/freelance/guide/java/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </FreelanceLayout>
  );
}
