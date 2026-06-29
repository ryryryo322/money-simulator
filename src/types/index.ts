// ============================================
// 共通型定義
// 全シミュレーターで使い回す型をここに定義します
// ============================================

/** シミュレーターの一覧情報 */
export interface SimulatorInfo {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  available: boolean; // falseの場合はComing Soon表示
}

/** 広告スロットの種類 */
export type AdSlotType = "result" | "faq" | "footer";

/** アフィリエイトリンク情報 */
export interface AffiliateLink {
  href: string;
  label: string;
  description: string;
  subtext: string;
  icon: string;
  color: string; // Tailwind color class
}
