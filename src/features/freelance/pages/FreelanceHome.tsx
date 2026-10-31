// /freelance/ トップページ
import { Link } from "react-router-dom";
import { useDocumentHead } from "../lib/useDocumentHead";
import { SERVICE_NAME } from "../config";
import { AGENTS } from "../data/agents";

const CTA_PRIMARY =
  "inline-flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 transition-colors";
const CTA_SECONDARY =
  "inline-flex items-center justify-center rounded-xl border border-blue-200 dark:border-blue-900 bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 font-semibold px-6 py-3 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors";

export default function FreelanceHome() {
  useDocumentHead({
    title: `${SERVICE_NAME}｜ITフリーランスのエージェントを条件で比較・診断`,
    description:
      "使用言語・実務経験・勤務形態・勤務地から、自分に合うITフリーランスエージェントを比較・診断。フルリモートとリモート相談可の違い、支払いサイト、福利厚生を出典つきで掲載。無料で使えます。",
  });

  return (
    <div className="space-y-12">
      {/* ヒーロー */}
      <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-10">
        <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">ITフリーランス向け・無料</p>
        <h1 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight">
          自分に合うフリーランスエージェントを、
          <br className="hidden sm:inline" />
          条件で比べて選ぶ
        </h1>
        <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          使用言語・実務経験・希望の働き方・勤務地を入れるだけで、{AGENTS.length}社との相性を理由つきで確認できます。
          確認できていない情報は推測せず「未確認」と表示します。
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link to="/freelance/diagnosis/" className={CTA_PRIMARY}>
            条件別診断をはじめる
          </Link>
          <Link to="/freelance/agents/" className={CTA_SECONDARY}>
            {AGENTS.length}社を比較表で見る
          </Link>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          ※ 本サイトの比較・診断は無料です。会員登録やメールアドレスの入力は不要です。
        </p>
      </section>

      {/* できること */}
      <section>
        <h2 className="text-lg font-bold mb-4">このサイトでできること</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            to="/freelance/agents/"
            className="block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
          >
            <p className="text-base font-bold">エージェント比較</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Java案件の有無、案件数、フルリモート／リモート相談可、実務経験の目安、週3日以下、支払いサイト、福利厚生、対応地域を一覧で比較できます。
            </p>
            <p className="mt-3 text-sm font-medium text-blue-700 dark:text-blue-300">比較表を見る →</p>
          </Link>
          <Link
            to="/freelance/diagnosis/"
            className="block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
          >
            <p className="text-base font-bold">条件別診断</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              5つの条件を入力すると、各社との適合度と「なぜそう判定したか」を表示します。データが無い項目は点数に含めません。
            </p>
            <p className="mt-3 text-sm font-medium text-blue-700 dark:text-blue-300">診断をはじめる →</p>
          </Link>
        </div>
      </section>

      {/* おすすめの探し方 */}
      <section>
        <h2 className="text-lg font-bold mb-4">おすすめの探し方</h2>
        <ol className="space-y-3">
          {[
            {
              t: "譲れない条件を決める",
              d: "フルリモートが必須か、出社があってもよいか。週何日働きたいか。まずここを決めると、候補が絞れます。",
            },
            {
              t: "比較表と診断で候補を絞る",
              d: "「フルリモート」と「リモート相談可能」は別物です。表では分けて表示しているので、希望に合う方を見てください。",
            },
            {
              t: "気になる数社の公式サイトで最新情報を確認する",
              d: "案件数や条件は日々変わります。登録前に、支払いサイト・福利厚生・契約条件を公式サイトで確かめましょう。複数社を見比べるのも一つの方法です。",
            },
          ].map((s, i) => (
            <li
              key={s.t}
              className="flex gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
            >
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-bold">{s.t}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 掲載ポリシー */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">掲載情報のルール</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>各項目に出典と時点を記載します。確認できない項目は「未確認」と表示します。</li>
          <li>表示順は五十音順で固定。広告の有無や報酬額で並び順・診断結果は変わりません。</li>
          <li>一部のリンクは広告（アフィリエイト）です。広告のリンクには「PR」と表示します。</li>
        </ul>
      </section>
    </div>
  );
}
