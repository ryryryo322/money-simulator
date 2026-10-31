// ============================================
// フリーランスナビ専用レイアウト（専用ヘッダー・ナビ・フッター）
// お金シミュレーター側のLayoutとは独立しています。
// ============================================

import { Link, NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import { useScrollTop } from "@/hooks/useScrollTop";
import { SERVICE_NAME } from "../config";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
      : "text-slate-600 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300"
  }`;

export default function FreelanceLayout({ children }: { children: ReactNode }) {
  useScrollTop();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans antialiased">
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Link to="/freelance/" className="flex items-baseline gap-2 min-w-0">
            <span className="text-lg font-black tracking-tight text-blue-700 dark:text-blue-400 whitespace-nowrap">
              {SERVICE_NAME}
            </span>
            <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400">
              ITフリーランスのエージェント比較
            </span>
          </Link>
          <nav className="flex items-center gap-1" aria-label="フリーランスナビ メニュー">
            <NavLink to="/freelance/agents/" className={navClass}>
              エージェント比較
            </NavLink>
            <NavLink to="/freelance/diagnosis/" className={navClass}>
              条件別診断
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">{children}</main>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <Link to="/freelance/" className="hover:text-blue-700 dark:hover:text-blue-300">
              トップ
            </Link>
            <Link to="/freelance/agents/" className="hover:text-blue-700 dark:hover:text-blue-300">
              エージェント比較
            </Link>
            <Link to="/freelance/diagnosis/" className="hover:text-blue-700 dark:hover:text-blue-300">
              条件別診断
            </Link>
          </div>
          <p>
            掲載情報は第三者メディア等で公開されている情報にもとづき、各項目に出典と時点を記載しています。
            内容は変更されている場合があります。登録・契約の前に、必ず各社の公式サイトで最新の情報をご確認ください。
          </p>
          <p>
            一部のリンクは広告（アフィリエイト）です。広告の有無や報酬額は、比較表の並び順や診断結果に影響しません。
          </p>
          <p>
            個人事業主の手取り・国保などの計算は、姉妹ツールの{" "}
            <Link to="/" className="underline hover:text-blue-700 dark:hover:text-blue-300">
              お金シミュレーター（R Tool Lab）
            </Link>{" "}
            をご利用ください。
          </p>
        </div>
      </footer>
    </div>
  );
}
