// ============================================
// ガイド記事のメタ情報（トップページの記事セクションなどで使用）
// 記事を増やすときは、ここに追記して、pages/ に記事ページを作り、FreelanceApp.tsx にルートを足します。
// ============================================

export interface ArticleMeta {
  path: string;
  title: string;
  summary: string;
  publishedAt: string;
  updatedAt: string;
}

export const ARTICLES: ArticleMeta[] = [
  {
    path: "/freelance/java/",
    title: "Javaフリーランスエージェントの選び方｜案件・リモート・実務経験で比較",
    summary:
      "Javaエンジニアがフリーランスエージェントを選ぶときの見方を解説。案件の仕事内容、実務経験と応募条件、フルリモートとリモート相談可の違い、登録前の確認事項をまとめました。",
    publishedAt: "2026-11-01",
    updatedAt: "2026-11-01",
  },
];

export const JAVA_ARTICLE = ARTICLES[0];
