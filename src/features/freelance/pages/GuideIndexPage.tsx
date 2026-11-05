// /freelance/guide/ ガイド一覧（技術別・テーマ別の記事の入口）
import { Link } from "react-router-dom";
import { ARTICLES, GUIDE_PATH } from "../data/articles";
import { SERVICE_NAME, SITE_ORIGIN } from "../config";
import { breadcrumbJsonLd, useDocumentHead } from "../lib/useDocumentHead";

export default function GuideIndexPage() {
  useDocumentHead({
    title: `ガイド｜ITフリーランスのエージェント選びを技術別・テーマ別に解説｜${SERVICE_NAME}`,
    description:
      "ITフリーランスがエージェントを比較するときの見方を、技術別・テーマ別に解説するガイドの一覧です。リモートの区別、実務経験と案件条件、登録前の確認事項などを、比較表・診断とあわせて確認できます。",
    jsonLd: breadcrumbJsonLd([
      { name: SERVICE_NAME, url: `${SITE_ORIGIN}/freelance/` },
      { name: "ガイド", url: `${SITE_ORIGIN}${GUIDE_PATH}` },
    ]),
  });

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <nav className="text-xs text-slate-500 dark:text-slate-400" aria-label="パンくず">
        <Link to="/freelance/" className="hover:underline">
          {SERVICE_NAME}
        </Link>{" "}
        ＞ ガイド
      </nav>

      <header className="space-y-3">
        <h1 className="text-2xl font-black tracking-tight">ガイド</h1>
        <p className="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-200">
          ITフリーランスがエージェントを比較するときの見方を、技術別・テーマ別にまとめています。言語や経験年数、希望する働き方は人によって異なるため、自分の条件に近い記事を選んで読めるようにしています。
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">技術別・テーマ別のガイド</h2>
        <ul className="space-y-3">
          {ARTICLES.map((a) => (
            <li key={a.path}>
              <Link
                to={a.path}
                className="block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              >
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">{a.topic}</p>
                <p className="mt-1 text-base font-bold">{a.title}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{a.summary}</p>
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">最終更新：{a.updatedAt}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">ガイドの書き方</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>案件数・単価・年収などの数字は、出典を確認できないものを載せません。</li>
          <li>公式サイトで確認できた内容と、一般的な考え方を分けて書きます。</li>
          <li>記事内には広告リンクを置かず、比較表・診断への内部リンクでご案内します。</li>
        </ul>
      </section>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/freelance/agents/"
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-3 transition-colors"
        >
          エージェントの比較表を見る
        </Link>
        <Link
          to="/freelance/diagnosis/"
          className="inline-flex items-center justify-center rounded-xl border border-blue-200 dark:border-blue-900 bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 text-sm font-semibold px-6 py-3 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
        >
          条件別診断をはじめる
        </Link>
      </div>
    </div>
  );
}
