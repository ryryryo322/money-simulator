// ============================================
// シミュレーター一覧グリッド
// トップページと各シミュレーターの下部に使います
// ============================================

import { Link } from "react-router-dom";
import { SIMULATORS } from "@/utils/simulators";
import type { SimulatorInfo } from "@/types";

interface SimulatorGridProps {
  // 除外するシミュレーターID（現在表示中のページを除く場合など）
  excludeId?: string;
  title?: string;
}

export default function SimulatorGrid({
  excludeId,
  title = "他のシミュレーターも使ってみる",
}: SimulatorGridProps) {
  const list = excludeId
    ? SIMULATORS.filter((s) => s.id !== excludeId)
    : SIMULATORS;

  return (
    <section aria-label="シミュレーター一覧">
      <div className="flex items-center gap-3 mb-4 px-1">
        <div className="w-1 h-5 rounded-full bg-brand-500" />
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 tracking-tight">
          🧮 {title}
        </h2>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {list.map((sim) => (
          <SimulatorCard key={sim.id} sim={sim} />
        ))}
      </div>
    </section>
  );
}

function SimulatorCard({ sim }: { sim: SimulatorInfo }) {
  const base =
    "flex flex-col gap-2 p-4 rounded-2xl border transition-all";

  // 公開済み
  if (sim.available) {
    return (
      <Link
        to={sim.path}
        className={`${base} bg-white/80 dark:bg-gray-900/80 border-white/60 dark:border-gray-700/60 shadow-sm active:opacity-70`}
        aria-label={sim.title}
      >
        <span className="text-2xl">{sim.icon}</span>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">
            {sim.title}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{sim.description}</p>
        </div>
      </Link>
    );
  }

  // Coming Soon
  return (
    <div
      className={`${base} bg-gray-100/80 dark:bg-gray-800/40 border-gray-200/60 dark:border-gray-700/40 opacity-60 cursor-not-allowed`}
      aria-label={`${sim.title}（近日公開）`}
    >
      <span className="text-2xl grayscale">{sim.icon}</span>
      <div>
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 leading-snug">
          {sim.title}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">近日公開予定</p>
        <span className="inline-block mt-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
          Coming Soon
        </span>
      </div>
    </div>
  );
}
