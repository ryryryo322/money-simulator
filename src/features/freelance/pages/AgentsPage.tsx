// /freelance/agents/ エージェント比較ページ
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { AGENTS } from "../data/agents";
import { COMPARE_ROWS, TONE_CLASS } from "../lib/format";
import { breadcrumbJsonLd, useDocumentHead } from "../lib/useDocumentHead";
import { DATA_CHECKED_AT, SERVICE_NAME, SITE_ORIGIN } from "../config";
import AgentLink from "../components/AgentLink";
import AgentDetails from "../components/AgentDetails";
import { AdNotice } from "../components/Notices";
import { track } from "../lib/track";

export default function AgentsPage() {
  useDocumentHead({
    title: `ITフリーランスエージェント比較（${AGENTS.length}社）｜${SERVICE_NAME}`,
    description: `レバテックフリーランス・ギークスジョブ・ITプロパートナーズ・Midworks・PE-BANKを、Java案件・フルリモート・リモート相談可・支払いサイト・福利厚生・対応地域で比較。出典と時点つき、未確認の項目は「未確認」と表示。`,
    jsonLd: breadcrumbJsonLd([
      { name: SERVICE_NAME, url: `${SITE_ORIGIN}/freelance/` },
      { name: "エージェント比較", url: `${SITE_ORIGIN}/freelance/agents/` },
    ]),
  });

  useEffect(() => {
    track("freelance_compare_view");
  }, []);

  return (
    <div className="space-y-6">
      <nav className="text-xs text-slate-500 dark:text-slate-400" aria-label="パンくず">
        <Link to="/freelance/" className="hover:underline">
          {SERVICE_NAME}
        </Link>{" "}
        ＞ エージェント比較
      </nav>

      <div>
        <h1 className="text-2xl font-black tracking-tight">ITフリーランスエージェント比較（{AGENTS.length}社）</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          公式サイトの案件ページで確認できた内容を優先し、確認できていない項目は「未確認」と表示しています（「なし」「非対応」の意味ではありません）。
          調査日：{DATA_CHECKED_AT}
        </p>
        <ul className="mt-3 list-disc pl-5 space-y-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          <li>「フルリモート」（出社不要が原則）と「リモート相談可能」（一部出社を含む）は別の項目です。</li>
          <li>案件が「ある」ことと、案件が「多い」ことは別です。割合や件数は、確認できた場合のみ記載しています。</li>
          <li>「公式未確認」と付いた項目は第三者メディアの情報です。案件数は公式表記と第三者調査値を分けて表示しており、集計範囲が異なる場合があります。</li>
        </ul>
      </div>

      <AdNotice />

      {/* ── PC：比較表（横スクロール対応） ── */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <table className="min-w-[960px] w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800">
              <th className="sticky left-0 z-10 bg-slate-100 dark:bg-slate-800 text-left p-3 w-40 text-xs text-slate-500 dark:text-slate-400">
                項目
              </th>
              {AGENTS.map((a) => (
                <th key={a.id} className="text-left p-3 align-top min-w-[170px]">
                  <span className="block font-bold">{a.name}</span>
                  <span className="block text-[11px] font-normal text-slate-500 dark:text-slate-400">{a.operator}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE_ROWS.map((row) => (
              <tr key={row.key} className="border-t border-slate-200 dark:border-slate-800 align-top">
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-white dark:bg-slate-900 text-left p-3 text-xs font-semibold text-slate-500 dark:text-slate-400"
                >
                  {row.label}
                </th>
                {AGENTS.map((a) => {
                  const c = row.cell(a);
                  return (
                    <td key={a.id} className="p-3">
                      <span className={TONE_CLASS[c.tone]}>{c.main}</span>
                      {c.sub && (
                        <span className="block mt-0.5 text-[11px] leading-snug text-slate-500 dark:text-slate-400">
                          {c.sub}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="border-t border-slate-200 dark:border-slate-800 align-top">
              <th
                scope="row"
                className="sticky left-0 z-10 bg-white dark:bg-slate-900 text-left p-3 text-xs font-semibold text-slate-500 dark:text-slate-400"
              >
                出典・補足
              </th>
              {AGENTS.map((a) => (
                <td key={a.id} className="p-3">
                  <AgentDetails agent={a} placement="table" />
                </td>
              ))}
            </tr>
            <tr className="border-t border-slate-200 dark:border-slate-800">
              <th
                scope="row"
                className="sticky left-0 z-10 bg-white dark:bg-slate-900 text-left p-3 text-xs font-semibold text-slate-500 dark:text-slate-400"
              >
                公式サイト
              </th>
              {AGENTS.map((a) => (
                <td key={a.id} className="p-3">
                  <AgentLink agent={a} placement="table" showPixel />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── スマホ：カード表示 ── */}
      <div className="md:hidden space-y-4">
        {AGENTS.map((a) => (
          <section
            key={a.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
          >
            <h2 className="text-base font-bold">{a.name}</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{a.operator}</p>
            <dl className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
              {COMPARE_ROWS.map((row) => {
                const c = row.cell(a);
                return (
                  <div key={row.key} className="py-2">
                    <dt className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{row.label}</dt>
                    <dd className="mt-0.5 text-sm">
                      <span className={TONE_CLASS[c.tone]}>{c.main}</span>
                      {c.sub && (
                        <span className="block text-[11px] leading-snug text-slate-500 dark:text-slate-400">{c.sub}</span>
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>
            <div className="mt-2">
              <AgentDetails agent={a} placement="card" />
            </div>
            <div className="mt-3">
              <AgentLink agent={a} placement="card" showPixel />
            </div>
          </section>
        ))}
      </div>

      <section className="rounded-2xl bg-blue-50 dark:bg-slate-900 border border-blue-100 dark:border-slate-800 p-5 text-center">
        <p className="text-sm font-bold">条件を入力して、自分との相性を確かめる</p>
        <Link
          to="/freelance/diagnosis/"
          className="mt-3 inline-flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-3 transition-colors"
        >
          条件別診断をはじめる
        </Link>
      </section>
    </div>
  );
}
