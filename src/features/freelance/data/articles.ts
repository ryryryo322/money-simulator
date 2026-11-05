// ============================================
// ガイド記事のメタ情報（トップページ・ガイド一覧などで使用）
//
// 【URLの構造】
//   /freelance/guide/          ガイド一覧（技術別・テーマ別の記事の入口）
//   /freelance/guide/java/     Javaエンジニア向けの記事
//   今後の追加例：/freelance/guide/csharp/ ・ /freelance/guide/php/ ・ /freelance/guide/python/ など
//
// 記事を増やすときは、ここに追記して、pages/ に記事ページを作り、FreelanceApp.tsx の
// "guide" 配下にルートを足します。
// ============================================

export const GUIDE_PATH = "/freelance/guide/";

export interface ArticleMeta {
  path: string;
  /** 何についての記事か（一覧のラベル用） */
  topic: string;
  title: string;
  summary: string;
  publishedAt: string;
  updatedAt: string;
}

export const ARTICLES: ArticleMeta[] = [
  {
    path: "/freelance/guide/java/",
    topic: "Java",
    title: "Javaフリーランスエージェントの選び方｜案件・リモート・実務経験で比較",
    summary:
      "Javaエンジニアがフリーランスエージェントを選ぶときの見方を解説。案件の仕事内容、実務経験と応募条件、フルリモートとリモート相談可の違い、登録前の確認事項をまとめました。",
    publishedAt: "2026-11-01",
    updatedAt: "2026-11-02",
  },
];

export const JAVA_ARTICLE = ARTICLES[0];
