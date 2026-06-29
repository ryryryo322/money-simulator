// ============================================
// 共通レイアウト
// 全シミュレーターで使うヘッダー・フッター付きのラッパー
// ============================================

import { Link, useLocation } from "react-router-dom";
import { SIMULATORS } from "@/utils/simulators";

interface LayoutProps {
  children: React.ReactNode;
  title: string;         // ページタイトル（ヘッダーに表示）
  description?: string;  // ページの説明（SEO用meta descriptionに使用）
}

export default function Layout({ children, title }: LayoutProps) {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans antialiased">

      {/* ── ヘッダー ── */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/60">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* トップ以外はバックボタンを表示 */}
            {!isHome && (
              <Link
                to="/"
                className="text-brand-500 text-sm font-medium flex items-center gap-1"
                aria-label="トップに戻る"
              >
                ‹ 一覧
              </Link>
            )}
            <div className="flex flex-col leading-tight">
              <span className="text-base font-black text-gray-900 dark:text-white tracking-tight">
                {isHome ? "お金シミュレーターシリーズ" : title}
              </span>
              {isHome && (
                <span className="text-xs text-gray-400 dark:text-gray-500 font-medium tracking-widest">
                  — 無料で使えるお金の計算ツール —
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── メインコンテンツ ── */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {children}
      </main>

      {/* ── フッター ── */}
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-8 py-6">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mb-3">
            {SIMULATORS.filter(s => s.available).map(s => (
              <Link
                key={s.id}
                to={s.path}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-brand-500 transition-colors"
              >
                {s.title}
              </Link>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 dark:text-gray-600">
            ※本シミュレーションは参考値です。実際の数値は専門家にご確認ください。
          </p>
        </div>
      </footer>
    </div>
  );
}
