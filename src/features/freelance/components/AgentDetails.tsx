// ============================================
// 出典・補足の詳細（開閉式）。開いた時に「詳細クリック」を計測します。
// ============================================

import type { Agent } from "../types";
import { collectSources } from "../lib/format";
import { track } from "../lib/track";

export default function AgentDetails({ agent, placement }: { agent: Agent; placement: string }) {
  const sources = collectSources(agent);
  return (
    <details
      className="group text-xs"
      onToggle={(e) => {
        if ((e.currentTarget as HTMLDetailsElement).open) {
          track("freelance_agent_detail_click", { agent_id: agent.id, placement });
        }
      }}
    >
      <summary className="cursor-pointer select-none text-blue-700 dark:text-blue-300 font-medium py-1">
        出典・補足を見る
      </summary>
      <div className="mt-2 space-y-2 text-slate-600 dark:text-slate-300">
        <p>運営会社：{agent.operator}</p>
        {agent.languages.note && <p>言語：{agent.languages.note}</p>}
        <ul className="space-y-1.5">
          {sources.map((s) => (
            <li key={s.url} className="leading-snug">
              <span
                className={`inline-block mr-1.5 rounded px-1 py-0.5 text-[10px] ${
                  s.kind === "official"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {s.kind === "official" ? "公式" : "第三者"}
              </span>
              <a href={s.url} target="_blank" rel="nofollow noopener noreferrer" className="underline break-all">
                {s.label}
              </a>
              <span className="ml-1 text-slate-400">{s.asOf ? `（${s.asOf}）` : "（時点不明）"}</span>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
