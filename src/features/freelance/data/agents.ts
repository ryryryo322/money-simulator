// ============================================
// エージェントの情報データ（広告情報は affiliates.ts に分離。診断・比較表の両方がこのデータを参照します）
//
// 【データの扱い】
// - 出典の kind が "official" のものは、エージェント公式サイトの案件ページ等で確認した内容です。
//   "third_party" のみの項目は、公式での確認が取れていない第三者メディアの情報です（画面にもそう表示されます）。
// - 確認できなかった項目は "unknown" / null にしています（推測で埋めない）。
// - 「フルリモート」と「リモート相談可能」は別項目です。案件が「ある」ことと、案件が「多い・割合が高い」ことも別です。
// - 公式サイトの案件ページは日々変わります。更新時は公式サイトで再確認してください。
// ============================================

import type { Agent, Source } from "../types";

const TODAY = "2026-10-31";
const official = (label: string, url: string): Source => ({ label, url, kind: "official", asOf: TODAY });

// ── 出典：公式サイト ─────────────────────────
const O = {
  itproTop: official("ITプロパートナーズ 公式トップ", "https://itpropartners.com/"),
  itproJava: official("ITプロパートナーズ 公式：Java案件一覧", "https://itpropartners.com/job/engineer/java"),
  itproJs: official("ITプロパートナーズ 公式：JavaScript案件一覧", "https://itpropartners.com/job/engineer/javascript"),
  itproFullRemote: official("ITプロパートナーズ 公式：フルリモート案件一覧", "https://itpropartners.com/job/engineer/full-remote"),
  itproWeek2: official("ITプロパートナーズ 公式：週2日の案件一覧", "https://itpropartners.com/job/week-2"),
  geechsTop: official("ギークスジョブ 公式トップ", "https://geechs-job.com/"),
  geechsJava: official("ギークスジョブ 公式：Java案件一覧", "https://geechs-job.com/project/java"),
  geechsRemote: official("ギークスジョブ 公式：リモート案件一覧", "https://geechs-job.com/project/preferences/remote"),
  geechsCase: official("ギークスジョブ 公式：Java案件詳細（自動車メーカー向け）", "https://geechs-job.com/project/details/7218"),
  pebankTop: official("PE-BANK 公式トップ", "https://pe-bank.jp/"),
  pebankWeek2: official("PE-BANK 公式：Java×週2の案件一覧", "https://pe-bank.jp/project/various-49/"),
  pebankFullRemote: official("PE-BANK 公式：Javaフルリモート案件", "https://pe-bank.jp/project/java/23663-43/"),
  pebankFukuoka: official("PE-BANK 公式：Java福岡案件", "https://pe-bank.jp/project/java/25655-Q04/"),
  pebankCase: official("PE-BANK 公式：Java案件詳細（官公庁向け）", "https://pe-bank.jp/project/java/27700-42/"),
  midworksAbout: official("Midworks 公式：Midworksとは", "https://mid-works.com/about"),
  midworksJava: official("Midworks 公式：Java案件一覧", "https://mid-works.com/projects/skills/3"),
  midworksCsharp: official("Midworks 公式：C#案件一覧", "https://mid-works.com/projects/skills/40"),
  levtechJava: official("レバテックフリーランス 公式：Java×リモート可の案件一覧", "https://freelance.levtech.jp/project/skill-3/remote/"),
  levtechCsharp: official("レバテックフリーランス 公式：C#の案件一覧", "https://freelance.levtech.jp/project/skill-11/"),
  levtechWeek3: official("レバテックフリーランス 公式：週3日から可能の案件一覧", "https://freelance.levtech.jp/project/fit-26/"),
  levtechFukuoka: official("レバテックフリーランス 公式：Javaフルリモート案件（福岡）", "https://freelance.levtech.jp/project/detail/90814/"),
};

// ── 出典：第三者メディア（公式未確認の情報にのみ使用） ──
const T = {
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
  exideaMidworks: {
    label: "Midworksの評判（エクシデア）",
    url: "https://exidea.co.jp/blog/job/freelance/midworks/",
    kind: "third_party",
    asOf: "2026-09",
  },
  alcMidworks: {
    label: "Midworksの評判（ALC）",
    url: "https://www.alc.co.jp/programming/agent/midworks-review/",
    kind: "third_party",
    asOf: "2026-05",
  },
  morejobMidworks: {
    label: "Midworksの評判（morejob）",
    url: "https://morejob.co.jp/mirai/midworks/",
    kind: "third_party",
    asOf: "2026-10頃",
  },
  qiita: {
    label: "フリーランスエージェント16社比較（Qiita Jobs）",
    url: "https://jobs.qiita.com/freelanceagent-recommend/",
    kind: "third_party",
    asOf: "2026-10",
  },
  qiitaLevtech: {
    label: "レバテックフリーランスの評判（Qiita Jobs）",
    url: "https://jobs.qiita.com/freelance-levtech/",
    kind: "third_party",
    asOf: "2026-10",
  },
  exideaLevtech: {
    label: "レバテックフリーランスの評判（エクシデア）",
    url: "https://exidea.co.jp/blog/job/freelance/levtech-freelance/",
    kind: "third_party",
    asOf: "2026-06",
  },
  aiHackLevtech: {
    label: "レバテックフリーランスの評判（AI HACKキャリア）",
    url: "https://ai-hack.jp/career/services/levtech-freelance",
    kind: "third_party",
    asOf: "2026-10",
  },
  indieverseLevtechCare: {
    label: "C#のフルリモート案件（インディバース）",
    url: "https://freelance.indieverse.co.jp/media/remote/csharp-remote",
    kind: "third_party",
    asOf: "2025-10頃",
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
  jobsQiitaItpro: {
    label: "ITプロパートナーズの評判（Qiita Jobs）",
    url: "https://jobs.qiita.com/itpropartners/",
    kind: "third_party",
    asOf: "2026-10",
  },
  sakufuriItpro: {
    label: "ITプロパートナーズの評判（サクフリ）",
    url: "https://sakufuri.jp/media/itpropartners/",
    kind: "third_party",
    asOf: "2026-10",
  },
  innoMarkItpro: {
    label: "ITプロパートナーズの評判（inno-mark）",
    url: "https://inno-mark.jp/e-engineer/itpro-partners-review/",
    kind: "third_party",
    asOf: "2026-06頃",
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
      value: ["java", "php", "python", "javascript"],
      sources: [O.itproTop, O.itproJava, O.itproJs],
      note: "公式の案件一覧で、各言語の案件掲載を確認しました。",
    },
    jobCount: {
      official: { text: "10,000件以上", asOf: TODAY, source: O.itproTop },
      thirdParty: { value: 10613, asOf: "2026-10-27", source: T.alc2610 },
      note: "公式トップの表記は「10,000件以上」です。",
    },
    fullRemote: {
      value: "yes",
      sources: [O.itproFullRemote, O.itproTop],
      note: "公式にフルリモート案件の一覧があり、Javaのフルリモート案件も確認しました（案件数・割合は未確認）。",
    },
    fullRemoteLanguages: {
      value: ["java", "php", "python", "javascript"],
      sources: [O.itproTop, O.itproFullRemote],
    },
    remoteConsult: {
      value: "yes",
      sources: [O.itproTop],
      note: "公式の案件に「基本リモート一部出社」の区分があります。",
    },
    experience: {
      agencyCondition: null,
      caseExample: {
        text: "公式の案件例：「Webシステム開発の実務経験（5年以上）」を求める案件がある一方、案件ごとに条件は異なります。",
        source: O.itproTop,
      },
    },
    weekly3OrLess: {
      value: "yes",
      sources: [O.itproWeek2, O.itproTop],
      note: "公式に「週2日」「週3日」の案件一覧があります（案件数は未確認）。",
    },
    paymentSite: {
      value: null,
      sources: [T.jobsQiitaItpro, T.sakufuriItpro, T.innoMarkItpro],
      note: "第三者メディアで「翌月20日払い」「翌々月5日払い」などと記載が分かれており、公式で確認できませんでした。",
    },
    benefits: {
      value: null,
      sources: [T.jobsQiitaItpro, T.sakufuriItpro],
      note: "第三者メディアで「ITプロトータルサポートあり」「福利厚生サービスなし」と記載が分かれており、公式で確認できなかったため掲載していません。",
    },
    regions: {
      value: {
        label: "東京の案件を公式一覧で確認（福岡県など都道府県別の案件ページあり。案件の有無は未確認）",
        keys: ["kanto"],
        exhaustive: false,
      },
      sources: [O.itproTop],
    },
  },
  // ─────────────── ギークスジョブ ───────────────
  {
    id: "geechs",
    name: "ギークスジョブ",
    kana: "ぎーくすじょぶ",
    operator: "ギークス株式会社",
    officialUrl: "https://geechs-job.com/",
    languages: {
      value: ["java", "php", "javascript"],
      sources: [O.geechsJava, O.geechsRemote, O.geechsTop],
      note: "公式の案件一覧で各言語の案件掲載を確認しました。C#は公式で確認できていません。",
    },
    jobCount: {
      thirdParty: { value: 10004, asOf: "2026-07-01", source: T.exideaCompare },
      note: "公式サイトで総数の表記を確認できていません。",
    },
    fullRemote: {
      value: "yes",
      sources: [O.geechsCase],
      note: "公式案件に「参画時のみ出社、その後は完全フルリモート」のJava案件を確認しました（案件数・割合は未確認）。",
    },
    fullRemoteLanguages: { value: ["java"], sources: [O.geechsCase] },
    remoteConsult: {
      value: "yes",
      sources: [O.geechsCase, O.geechsRemote],
      note: "公式案件ページに「掲載案件はリモートワークでの参画がご相談可能」との記載があります（フルリモートの割合ではありません）。",
    },
    experience: {
      agencyCondition: null,
      caseExample: {
        text: "公式の案件例：Java案件に「Javaの開発経験3年以上」を求めるものがある一方、「未経験OK」と表示された案件もあります。",
        source: O.geechsCase,
      },
    },
    weekly3OrLess: {
      value: "yes",
      sources: [O.geechsTop],
      note: "公式の検索条件に「週3作業」があります（案件数は未確認）。",
    },
    paymentSite: {
      value: "月末締め翌月25日払い",
      sources: [T.atsohoOsusume, T.alcTable],
      note: "公式で未確認の第三者情報です。",
    },
    benefits: {
      value: "福利厚生プログラム「フリノベ」",
      sources: [O.geechsTop],
      note: "公式トップに掲載。対象者・利用条件・内容は公式サイトで確認してください。",
    },
    regions: {
      value: {
        label: "東京・愛知・福岡・沖縄などの案件を公式一覧で確認",
        keys: ["kanto", "tokai", "kyushu"],
        exhaustive: false,
      },
      sources: [O.geechsRemote, O.geechsCase, O.geechsJava],
    },
  },
  // ─────────────── PE-BANK ───────────────
  {
    id: "pebank",
    name: "PE-BANK",
    kana: "ぴーいーばんく",
    operator: "株式会社PE-BANK",
    officialUrl: "https://pe-bank.jp/",
    languages: {
      value: ["java", "csharp"],
      sources: [O.pebankTop, O.pebankFullRemote, T.alc2610],
      note: "Javaは公式案件で確認。C#は公式の検索スキルに掲載（案件数は第三者調査で978件・2026-10-27）。",
    },
    javaInfo: {
      label: "公式の「Java×週2」一覧",
      count: 47,
      asOf: TODAY,
      official: true,
      source: O.pebankWeek2,
    },
    jobCount: {
      thirdParty: { value: 13030, asOf: "2026-07-01", source: T.exideaCompare },
      note: "公式サイトで総数の表記を確認できていません。",
    },
    fullRemote: {
      value: "yes",
      sources: [O.pebankFullRemote, O.pebankFukuoka],
      note: "公式にJavaのフルリモート案件を確認（案件数・割合は未確認）。「フルリモートは不可」と明記した案件もあります。",
    },
    fullRemoteLanguages: { value: ["java"], sources: [O.pebankFullRemote] },
    remoteConsult: {
      value: "yes",
      sources: [O.pebankTop, O.pebankCase],
      note: "公式の検索条件に「リモート可」があり、「週2リモート」などの案件を確認しました。",
    },
    experience: {
      agencyCondition: null,
      caseExample: {
        text: "公式の案件例：「JAVA等の設計・開発経験5年程度が望ましい（5年未満でも検討可）」とする案件があります。",
        source: O.pebankCase,
      },
    },
    weekly3OrLess: {
      value: "yes",
      sources: [O.pebankWeek2, O.pebankTop],
      note: "公式に「Java×週2」の案件が47件掲載されています。検索条件にも「週1〜4可」があります。",
    },
    paymentSite: {
      value: null,
      sources: [T.alcTable, T.atsohoOsusume],
      note: "公式で確認できませんでした。第三者メディアでも記載が分かれています。",
    },
    benefits: {
      value: null,
      sources: [],
      note: "公式で確認できなかったため掲載していません。",
    },
    regions: {
      value: {
        label: "北海道・東京・愛知・福岡・愛媛などの案件を公式で確認（拠点は全国主要12〜13都市と表記。拠点と案件地域は別の情報です）",
        keys: ["tohoku_hokkaido", "kanto", "tokai", "kyushu", "chugoku_shikoku"],
        exhaustive: false,
      },
      sources: [O.pebankCase, O.pebankFukuoka, O.pebankTop],
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
      value: ["java", "csharp"],
      sources: [O.midworksJava, O.midworksCsharp],
      note: "公式の案件一覧でJava・C#の案件掲載を確認しました。",
    },
    javaInfo: {
      label: "公式の「Java(その他FW・FWなし)」検索結果",
      count: 922,
      asOf: TODAY,
      official: true,
      source: {
        label: "Midworks 公式：Java案件の検索結果",
        url: "https://mid-works.com/projects?order=pay_min&page=3&skill=Java%28%E3%81%9D%E3%81%AE%E4%BB%96FW%29%2CJava%28FW%E3%81%AA%E3%81%97%29",
        kind: "official",
        asOf: TODAY,
      },
    },
    jobCount: {
      official: { text: "25,000件以上", asOf: TODAY, source: O.midworksCsharp },
      thirdParty: { value: 32548, asOf: "2026-09-01", source: T.exideaMidworks },
      note: "公式の表記はページにより「25,000件以上」「10,000件以上」と異なります。",
    },
    fullRemote: {
      value: "yes",
      sources: [O.midworksCsharp, O.midworksJava],
      note: "公式にJava・C#のフルリモート案件を確認（案件数・割合は未確認）。公式の「リモート案件87％以上」はフルリモートの割合ではありません。",
    },
    fullRemoteLanguages: { value: ["java", "csharp"], sources: [O.midworksCsharp, O.midworksJava] },
    remoteConsult: {
      value: "yes",
      sources: [O.midworksCsharp],
      note: "公式表記は「リモート案件が全体の87％以上」。フルリモートか一部出社かの内訳は未確認です。",
    },
    experience: { agencyCondition: null },
    weekly3OrLess: {
      value: "yes",
      sources: [O.midworksAbout],
      note: "公式FAQに「週3,4日などで常駐は可能」とあります（週2日以下は未確認）。",
    },
    paymentSite: {
      value: "月末締め翌月20日払い（基本）",
      sources: [T.exideaMidworks, T.alcMidworks, T.morejobMidworks],
      note: "公式で未確認の第三者情報です。案件・契約条件による違いの有無は確認できていません。",
    },
    benefits: {
      value: "交通費・書籍/勉強会費用の支給、経理支援クラウド利用料の負担、スポーツクラブ・育児介護などの福利厚生サービス",
      sources: [O.midworksAbout, T.alcMidworks],
      note: "公式「Midworksとは」の記載。給与保障などの利用には、第三者メディアで月額3万円の有料パッケージプラン加入や審査・条件があるとされています。利用条件は公式で確認してください。",
    },
    regions: {
      value: {
        label: "東京・神奈川・大阪の案件を公式一覧で確認（福岡などは未確認。全国どこからでも勤務可とする案件あり）",
        keys: ["kanto", "kansai"],
        exhaustive: false,
      },
      sources: [O.midworksJava, O.midworksCsharp],
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
      value: ["java", "csharp", "javascript", "python"],
      sources: [O.levtechJava, O.levtechCsharp],
      note: "公式の案件一覧で確認。JavaScript・Pythonは案件の開発環境欄の記載にもとづきます。",
    },
    javaInfo: {
      label: "公式の「Java×在宅・リモート可」一覧",
      count: 9242,
      asOf: TODAY,
      official: true,
      source: O.levtechJava,
    },
    jobCount: {
      thirdParty: { value: 126108, asOf: "2026-10-27", source: T.alc2610 },
      note: "第三者の調査元により「12万件以上」〜「13万件超」と幅があり、公式サイトの総数は確認できていません。",
    },
    fullRemote: {
      value: "yes",
      sources: [O.levtechJava, O.levtechCsharp],
      note: "公式にJava・C#のフルリモート案件を確認（案件数・割合は未確認）。",
    },
    fullRemoteLanguages: { value: ["java", "csharp", "python"], sources: [O.levtechJava, O.levtechCsharp, O.levtechFukuoka] },
    remoteConsult: {
      value: "yes",
      sources: [O.levtechJava],
      note: "公式の案件に「一部リモート」「リモートOK」の区分があります。",
    },
    experience: {
      agencyCondition: null,
      caseExample: {
        text: "公式の案件例：「サーバーサイドの開発実務経験（3年以上）」を求める案件があり、案件ごとに条件は異なります。",
        source: O.levtechCsharp,
      },
    },
    weekly3OrLess: {
      value: "yes",
      sources: [O.levtechWeek3],
      note: "公式に「週3日から可能」の案件一覧があり、週1日の案件も確認しました（案件数は未確認）。",
    },
    paymentSite: {
      value: "月末締め翌月15日払い（基本）",
      sources: [T.qiita, T.exideaLevtech, T.aiHackLevtech],
      note: "公式で未確認の第三者情報です。案件・契約による違いの有無は確認できていません。",
    },
    benefits: {
      value: "福利厚生プログラム「レバテックケア」",
      sources: [T.indieverseLevtechCare, T.aiHackLevtech],
      note: "公式で未確認の第三者情報です。対象は「登録または参画が決定したフリーランス」とされています。条件は公式で確認してください。",
    },
    regions: {
      value: {
        label: "東京・埼玉・愛知・大阪・福岡・熊本などの案件を公式一覧で確認",
        keys: ["kanto", "tokai", "kansai", "kyushu"],
        exhaustive: false,
      },
      sources: [O.levtechJava, O.levtechCsharp, O.levtechFukuoka],
    },
  },
];

export function getAgent(id: string): Agent | undefined {
  return AGENTS.find((a) => a.id === id);
}
