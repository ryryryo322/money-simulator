// ============================================
// 広告スロットコンポーネント
// 広告コードを後から簡単に貼り付けられるように設計しています
//
// 使い方:
//   <AdSlot slot="result" />   ← 結果の下
//   <AdSlot slot="faq" />      ← FAQの下
//   <AdSlot slot="footer" />   ← ページ最下部
// ============================================

import type { AffiliateLink, AdSlotType } from "@/types";

// ── アフィリエイトリンクの設定 ──────────────────
// 承認されたリンクをここに追記するだけでOKです
const AFFILIATE_LINKS: AffiliateLink[] = [
  {
    href: "https://px.a8.net/svt/ejp?a8mat=4B650H+AO0LYQ+1WP2+15ORS2",
    label: "DMM株ではじめる！株式取引",
    description: "株式取引・NISA口座開設",
    subtext: "口座開設無料・手数料業界最安水準 →",
    icon: "📈",
    color: "green",
  },
  // ↓ 承認されたらここに追加してください
  // {
  //   href: "https://YOUR_AFFILIATE_LINK_LOAN_HERE",
  //   label: "住宅ローン金利を比較する",
  //   description: "住宅ローン",
  //   subtext: "変動・固定の最新金利をチェック →",
  //   icon: "🏦",
  //   color: "blue",
  // },
  // {
  //   href: "https://YOUR_AFFILIATE_LINK_FP_HERE",
  //   label: "無料FP相談をはじめる",
  //   description: "無料FP相談",
  //   subtext: "オンラインで何度でも無料 →",
  //   icon: "💬",
  //   color: "purple",
  // },
];

const colorMap: Record<string, string> = {
  blue:   "text-blue-500",
  green:  "text-green-500",
  purple: "text-purple-500",
  orange: "text-brand-500",
};

const bgMap: Record<string, string> = {
  blue:   "bg-blue-500",
  green:  "bg-green-500",
  purple: "bg-purple-500",
  orange: "bg-brand-500",
};

interface AdSlotProps {
  slot: AdSlotType;
  // 特定のスロットに特定の広告だけ表示したい場合はidsを指定
  ids?: string[];
}

export default function AdSlot({ slot }: AdSlotProps) {
  // 広告が一件もなければ何も表示しない
  if (AFFILIATE_LINKS.length === 0) return null;

  // スロットによって表示する広告を絞ることもできます
  // 今は全スロットで全広告を表示
  const links = AFFILIATE_LINKS;

  return (
    <section aria-label="おすすめサービス">
      <div className="flex items-center gap-3 mb-4 px-1">
        <div className="w-1 h-5 rounded-full bg-brand-500" />
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 tracking-tight">
          ✨ あなたにおすすめ
        </h2>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
      </div>

      <div className="space-y-3">
        {links.map((link, i) => (
          <a
            key={i}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-gray-700/60 shadow-sm p-4 active:opacity-70 transition-opacity"
            aria-label={link.label}
          >
            <div className={`w-12 h-12 rounded-xl ${bgMap[link.color] ?? bgMap.green} flex items-center justify-center text-2xl flex-shrink-0`}>
              {link.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs ${colorMap[link.color] ?? colorMap.green} font-semibold mb-0.5`}>
                {link.description}
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">
                {link.label}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{link.subtext}</p>
            </div>
            <span className="text-gray-300 dark:text-gray-600 text-lg flex-shrink-0">›</span>
          </a>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-3">
        ※ 広告・PR を含みます
      </p>
    </section>
  );
}
