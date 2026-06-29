// ============================================
// トップページ
// シミュレーター一覧を表示します
// ============================================

import Layout from "@/components/Layout";
import SimulatorGrid from "@/components/SimulatorGrid";

export default function Home() {
  return (
    <Layout title="お金シミュレーターシリーズ">
      <div className="space-y-6">
        <div className="text-center py-4">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            お金に関する計算をかんたんに。全て無料でご利用いただけます。
          </p>
        </div>
        <SimulatorGrid title="シミュレーター一覧" />
      </div>
    </Layout>
  );
}
