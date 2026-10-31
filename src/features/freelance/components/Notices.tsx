// ============================================
// 共通の注意書き（広告表示・情報の取り扱い）
// ============================================

import { hasAnyApprovedAffiliate } from "../data/affiliates";
import { DATA_CHECKED_AT } from "../config";

export function AdNotice() {
  const hasAd = hasAnyApprovedAffiliate();
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-1">
      {hasAd && <p>【PR】このページには広告（アフィリエイト）リンクが含まれます。「PR」と表示されたリンクが広告です。</p>}
      <p>表示順はサービス名の五十音順で固定です。広告の有無・報酬額は、並び順や診断結果に影響しません。</p>
      <p>
        情報は第三者メディア等の公開情報にもとづきます（{DATA_CHECKED_AT}調査）。確認できない項目は「未確認」と表示しています。
        最新情報は各社の公式サイトでご確認ください。
      </p>
    </div>
  );
}
