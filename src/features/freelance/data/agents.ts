// ============================================
// エージェントの公式情報データ（広告情報は affiliates.ts に分離）
//
// 【データの扱い】
// - 各項目に出典（Source）を付けています。出典の kind が "third_party" のものは
//   第三者メディアの記載であり、エージェント公式での照合は未実施です。
// - 確認できなかった項目は "unknown" / null にしています（推測で埋めない）。
// - 「フルリモート」と「リモート相談可能」は別項目です。
// - 数値・条件は変わります。公開前・更新時に公式サイトで再確認してください。
// ============================================

import type { Agent, Source } from "../types";

// ── 出典 ────────────────────────────────────
const S = {
  alc2610: {
    label: "フリーランスエージェント22社比較（ALC・編集部調べ）",
    url: "https://www.alc.co.jp/programming/agent/freelance-agent-recommendation/",
    kind: "third_party",
    asOf: "2026-10-27",
  },
  exideaCompare: {
    label: "フリーランスエージェント16社比較（エクシデア）",
    url: "https://exidea.co.jp/blog/job/freelance/agent-comparison/",
    kind: "third_party",
    asOf: "2026-07-01",
  },
  qiita: {
    label: "フリーランスエージェント16社比較（Qiita Jobs）",
    url: "https://jobs.qiita.com/freelanceagent-recommend/",
    kind: "third_party",
    asOf: "2026-10",
  },
  coetecoLevtech: {
    label: "レバテックフリーランスの口コミ（コエテコキャリア）",
    url: "https://coeteco.jp/career/freelance/levtech-freelance",
    kind: "third_party",
    asOf: "2026-05",
  },
  coetecoJava: {
    label: "Javaフリーランス案件紹介エージェント（コエテコ）",
    url: "https://coeteco.jp/articles/13927",
    kind: "third_party",
    asOf: "2026-05",
  },
  freelanceHub: {
    label: "フリーランスエージェント比較（フリーランスHub）",
    url: "https://freelance-hub.jp/agent/recommendation/",
    kind: "third_party",
    asOf: "2024頃（掲載時期が古い可能性）",
  },
  aiHackLevtech: {
    label: "レバテックフリーランスの評判（AI HACKキャリア）",
    url: "https://ai-hack.jp/career/services/levtech-freelance",
    kind: "third_party",
    asOf: "2026-10",
  },
  exideaLevtech: {
    label: "レバテックフリーランスの評判（エクシデア）",
    url: "https://exidea.co.jp/blog/job/freelance/levtech-freelance/",
    kind: "third_party",
    asOf: "2026-06",
  },
  shincru: {
    label: "レバテックフリーランスの評判（シンクル）",
    url: "https://shincru.jp/levtechfreelance/",
    kind: "third_party",
    asOf: "更新時期不明（古い可能性）",
  },
  terrblog: {
    label: "レバテックフリーランスの評判（terrblog）",
    url: "https://terrblog.com/levtech-freelance-review/",
    kind: "third_party",
    asOf: "2026-08",
  },
  indieverseLevtech: {
    label: "レバテックの副業案件（インディバース）",
    url: "https://freelance.indieverse.co.jp/media/freelance-sites-reputation/levtech-sidework",
    kind: "third_party",
    asOf: "2026-04頃",
  },
  alcLevtech: {
    label: "レバテックフリーランスの評判（ALC）",
    url: "https://www.alc.co.jp/programming/?p=15212",
    kind: "third_party",
  },
  geechsExidea: {
    label: "ギークスジョブの評判（エクシデア）",
    url: "https://exidea.co.jp/blog/job/freelance/geechs-job/",
    kind: "third_party",
  },
  geechsOutside: {
    label: "フリーランスエージェント28選（no-limit）",
    url: "https://outside.no-limit.careers/freelance-agent-recommendation/",
    kind: "third_party",
    asOf: "2026-10",
  },
  geechsAtsoho: {
    label: "ギークスジョブの評判（atsoho）",
    url: "https://atsoho.com/blog/geechs-job-hyoban",
    kind: "third_party",
  },
  atsohoOsusume: {
    label: "フリーランスエージェントおすすめ（atsoho）",
    url: "https://atsoho.com/blog/freelance-agent-osusume",
    kind: "third_party",
  },
  alcTable: {
    label: "フリーランスエージェント比較表（ALC）",
    url: "https://www.alc.co.jp/programming/?p=12309",
    kind: "third_party",
  },
  itproBlog: {
    label: "ITプロパートナーズ公式ブログ",
    url: "https://itpropartners.com/blog/14129/",
    kind: "official",
    asOf: "2025-12",
  },
  alcItpro: {
    label: "ITプロパートナーズの評判（ALC）",
    url: "https://www.alc.co.jp/programming/?p=12573",
    kind: "third_party",
  },
  mersenneItpro: {
    label: "ITプロパートナーズの評判（Mersenne）",
    url: "https://www.mersenne.co.jp/itpropartners",
    kind: "third_party",
  },
  asikaze: {
    label: "Javaエンジニアのフリーランス案件（Tech Hive）",
    url: "https://asikaze.net/media/1631/",
    kind: "third_party",
    asOf: "2024-10",
  },
  coetecoMidworks: {
    label: "Midworksの口コミ（コエテコキャリア）",
    url: "https://coeteco.jp/career/freelance/mid-works",
    kind: "third_party",
    asOf: "2026-05",
  },
  coetecoMidworksSvc: {
    label: "Midworksの求人数・対応職種（コエテコキャリア）",
    url: "https://coeteco.jp/career/services/mid-works",
    kind: "third_party",
    asOf: "2026-05",
  },
  coetecoMidworksBenefit: {
    label: "Midworksの保障パッケージ（コエテコ）",
    url: "https://coeteco.jp/articles/11744",
    kind: "third_party",
  },
  onamaeMidworks: {
    label: "Midworks（お名前.com）",
    url: "https://www.onamae.com/business/product/200416/",
    kind: "third_party",
  },
  alcMidworks: {
    label: "Midworksの評判（ALC）",
    url: "https://www.alc.co.jp/programming/?p=12886",
    kind: "third_party",
  },
  myBestMidworks: {
    label: "Midworksの検証レビュー（マイベスト）",
    url: "https://my-best.com/products/200585",
    kind: "third_party",
    asOf: "2026-03",
  },
  alcPebank: {
    label: "PE-BANKの評判（ALC）",
    url: "https://www.alc.co.jp/programming/?p=12588",
    kind: "third_party",
  },
  sokudanPebank: {
    label: "PE-BANKの口コミ（sokudan）",
    url: "https://magazine.sokudan.work/post/tips_508",
    kind: "third_party",
  },
} satisfies Record<string, Source>;

// 並び順は「サービス名の五十音順」で固定（広告の有無・報酬額とは無関係）
export const AGENTS: Agent[] = [
  // ─────────────── ITプロパートナーズ ───────────────
  {
    id: "itpro",
    name: "ITプロパートナーズ",
    kana: "あいてぃーぷろぱーとなーず",
    operator: "株式会社Hajimari",
    officialUrl: "https://itpropartners.com/",
    languages: {
      value: ["java"],
      sources: [S.asikaze],
      note: "2024年10月時点の情報です。現在の取り扱い状況は公式サイトで確認してください。",
    },
    jobCount: { value: 10613, sources: [S.alcTable, S.alc2610], asOf: "2026-10-27", note: "公開案件数（第三者メディア調べ）" },
    fullRemote: {
      value: "unknown",
      sources: [S.qiita, S.asikaze],
      note: "リモート案件があるとの記載はありますが、フルリモートの可否は確認できていません。",
    },
    remoteConsult: { value: "unknown", sources: [S.qiita] },
    minExperienceYears: { value: 3, sources: [S.qiita, S.alcItpro], note: "実務経験3年以上が目安" },
    weekly3OrLess: { value: "yes", sources: [S.alcItpro, S.alc2610], note: "週2日〜の案件があるとの記載" },
    paymentSite: { value: "月末締め翌月20日払い", sources: [S.itproBlog, S.qiita] },
    benefits: {
      value: "福利厚生サービス「ITプロトータルサポート」あり",
      sources: [S.itproBlog, S.mersenneItpro],
      note: "内容の詳細は公式サイトで確認してください。",
    },
    regions: {
      value: {
        label: "東京・神奈川・茨城・千葉・埼玉・大阪・兵庫・福岡（2024年10月時点）",
        keys: ["kanto", "kansai", "kyushu"],
        exhaustive: false,
      },
      sources: [S.asikaze],
    },
  },
  // ─────────────── ギークスジョブ ───────────────
  {
    id: "geechs",
    name: "ギークスジョブ",
    kana: "ぎーくすじょぶ",
    operator: "ギークス株式会社",
    officialUrl: "https://geechs-job.com/",
    languages: { value: ["java", "php"], sources: [S.geechsOutside], note: "「JavaやPHPをはじめ幅広い開発案件」との記載" },
    jobCount: { value: 10004, sources: [S.exideaCompare], asOf: "2026-07-01", note: "公開案件数（第三者メディア調べ）" },
    fullRemote: { value: "yes", sources: [S.geechsExidea], note: "フルリモート案件も紹介可能との記載" },
    remoteConsult: { value: "yes", sources: [S.geechsOutside], note: "リモート相談可能な案件が83%以上との記載" },
    minExperienceYears: { value: 2, sources: [S.geechsAtsoho], note: "案件により2〜3年以上が目安" },
    weekly3OrLess: { value: "yes", sources: [S.geechsExidea], note: "週3日稼働の案件も紹介可能との記載" },
    paymentSite: { value: "月末締め翌月25日払い", sources: [S.atsohoOsusume, S.alcTable] },
    benefits: {
      value: "福利厚生プログラム「フリノベ」あり（健康診断・会計ソフト・学習サービス割引など）",
      sources: [S.geechsExidea, S.geechsAtsoho],
    },
    regions: {
      value: { label: "東京・大阪・名古屋・福岡など", keys: ["kanto", "kansai", "tokai", "kyushu"], exhaustive: false },
      sources: [S.exideaCompare, S.geechsAtsoho],
    },
  },
  // ─────────────── PE-BANK ───────────────
  {
    id: "pebank",
    name: "PE-BANK",
    kana: "ぴーいーばんく",
    operator: "株式会社PE-BANK",
    officialUrl: "https://pe-bank.jp/",
    languages: { value: ["java", "csharp"], sources: [S.alc2610] },
    javaJobCount: { count: 1729, asOf: "2026-10-27", source: S.alc2610 },
    jobCount: { value: 13030, sources: [S.exideaCompare], asOf: "2026-07-01", note: "公開案件数（第三者メディア調べ）" },
    fullRemote: { value: "limited", sources: [S.alcPebank], note: "常駐案件が中心で、フルリモートは限られるとの記載" },
    remoteConsult: { value: "unknown", sources: [S.alcPebank] },
    minExperienceYears: { value: 2, sources: [S.alcPebank], note: "実務経験2年前後以上が目安" },
    weekly3OrLess: { value: "limited", sources: [S.alcPebank], note: "週3日以下の案件は限られるとの記載" },
    paymentSite: {
      value: null,
      sources: [S.alcTable, S.atsohoOsusume],
      note: "情報源により記載が異なります（翌月第5営業日／翌月末払いなど）。公式サイトで確認してください。",
    },
    benefits: {
      value: "共済会などの福利厚生あり（健康診断サポート・メンタルヘルスケアなど）",
      sources: [S.alcPebank, S.sokudanPebank],
    },
    regions: {
      value: {
        label: "全国（12拠点）",
        keys: ["kanto", "tokai", "kansai", "kyushu", "tohoku_hokkaido", "chugoku_shikoku"],
        nationwide: true,
        exhaustive: true,
      },
      sources: [S.exideaCompare, S.alcPebank],
    },
  },
  // ─────────────── Midworks ───────────────
  {
    id: "midworks",
    name: "Midworks",
    kana: "みっどわーくす",
    operator: "株式会社Branding Engineer",
    officialUrl: "https://mid-works.com/",
    languages: {
      value: ["java", "javascript", "php", "python"],
      sources: [S.coetecoJava, S.freelanceHub],
      note: "Java以外は掲載時期の古い比較記事にもとづきます。",
    },
    jobCount: {
      value: 30783,
      sources: [S.exideaCompare],
      asOf: "2026-07-01",
      note: "公開案件数（第三者メディア調べ）。ほかに非公開案件が約8割との記載あり",
    },
    fullRemote: {
      value: "limited",
      sources: [S.coetecoMidworks, S.onamaeMidworks, S.myBestMidworks],
      note: "フルリモート案件は扱うが、リモート案件は多くないとする評価もあります。",
    },
    remoteConsult: { value: "unknown", sources: [S.coetecoMidworks] },
    minExperienceYears: { value: 2, sources: [S.qiita, S.onamaeMidworks], note: "案件により2〜3年以上が目安" },
    weekly3OrLess: { value: "yes", sources: [S.coetecoMidworks], note: "週3〜4日勤務の案件があるとの記載" },
    paymentSite: { value: "20日サイト", sources: [S.qiita], note: "締め日などの詳細は公式サイトで確認してください。" },
    benefits: {
      value: "報酬保証・保険料補助・経理支援など（有料プランや審査・条件あり）",
      sources: [S.coetecoMidworksBenefit, S.alcMidworks],
    },
    regions: {
      value: { label: "東京・大阪中心", keys: ["kanto", "kansai"], exhaustive: false },
      sources: [S.exideaCompare, S.coetecoMidworksSvc],
    },
  },
  // ─────────────── レバテックフリーランス ───────────────
  {
    id: "levtech",
    name: "レバテックフリーランス",
    kana: "ればてっくふりーらんす",
    operator: "レバテック株式会社",
    officialUrl: "https://freelance.levtech.jp/",
    languages: {
      value: ["java", "javascript", "php", "python"],
      sources: [S.coetecoJava, S.freelanceHub],
      note: "Java以外は掲載時期の古い比較記事にもとづきます。",
    },
    jobCount: { value: 126108, sources: [S.alc2610], asOf: "2026-10-27", note: "公開案件数（第三者メディア調べ）" },
    fullRemote: {
      value: "yes",
      sources: [S.shincru, S.terrblog],
      note: "フルリモート案件の掲載あり（割合は情報源により異なります）",
    },
    remoteConsult: { value: "unknown", sources: [S.coetecoLevtech] },
    minExperienceYears: { value: 2, sources: [S.qiita, S.alcLevtech], note: "実務経験2年以上が目安" },
    weekly3OrLess: {
      value: "yes",
      sources: [S.shincru, S.indieverseLevtech],
      note: "週1日〜の案件があるとの記載（週5日が中心）",
    },
    paymentSite: { value: "月末締め翌月15日払い（15日サイト）", sources: [S.qiita, S.exideaLevtech, S.aiHackLevtech] },
    benefits: {
      value: "福利厚生プログラム「レバテックケア」あり（参画者向け）",
      sources: [S.aiHackLevtech],
    },
    regions: {
      value: { label: "東京・愛知・大阪・福岡など", keys: ["kanto", "tokai", "kansai", "kyushu"], exhaustive: false },
      sources: [S.exideaCompare],
    },
  },
];

export function getAgent(id: string): Agent | undefined {
  return AGENTS.find((a) => a.id === id);
}
