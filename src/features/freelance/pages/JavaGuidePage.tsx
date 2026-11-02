// /freelance/java/ Javaフリーランス向けガイド記事
//
// 【方針】
// - 案件数・単価・年収・リモート率などの数字は載せない（出典を確認できないため）
// - 実務経験年数を「各社共通の応募条件」として断定しない
// - 5社の確認状況・案件例は、比較ページと同じデータ（agents.ts）から生成して矛盾を防ぐ
// - 記事内に広告リンクは置かない（誘導は比較ページ・診断ページへの内部リンクのみ）
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { AGENTS } from "../data/agents";
import { JAVA_ARTICLE } from "../data/articles";
import { DATA_CHECKED_AT, SERVICE_NAME, SITE_ORIGIN } from "../config";
import { breadcrumbJsonLd, useDocumentHead } from "../lib/useDocumentHead";

const URL_FULL = `${SITE_ORIGIN}${JAVA_ARTICLE.path}`;

const LINK_CLS = "font-semibold text-blue-700 dark:text-blue-300 underline underline-offset-2";
const BTN_PRIMARY =
  "inline-flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-3 transition-colors";
const BTN_SECONDARY =
  "inline-flex items-center justify-center rounded-xl border border-blue-200 dark:border-blue-900 bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 text-sm font-semibold px-6 py-3 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors";

const TOC = [
  { id: "merit", label: "Javaエンジニアがフリーランスになるメリットと注意点" },
  { id: "work", label: "Javaフリーランス案件の主な仕事内容" },
  { id: "experience", label: "実務経験年数と案件獲得の関係" },
  { id: "remote", label: "Javaのリモート案件を探すときの注意点" },
  { id: "compare-points", label: "エージェントを比較するときのポイント" },
  { id: "five", label: "Java案件を扱う5社を比較する" },
  { id: "diagnosis", label: "自分の条件に合うエージェントを診断する" },
  { id: "checklist", label: "エージェントに登録する前に確認したいこと" },
];

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 space-y-4">
      <h2 className="text-xl font-black tracking-tight border-l-4 border-blue-600 pl-3">{title}</h2>
      {children}
    </section>
  );
}

function P({ children }: { children: ReactNode }) {
  return <p className="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-200">{children}</p>;
}

function H3({ children }: { children: ReactNode }) {
  return <h3 className="text-base font-bold mt-2">{children}</h3>;
}

function Ul({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-200">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}

function Callout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-blue-100 dark:border-slate-800 bg-blue-50 dark:bg-slate-900 p-4 text-sm leading-relaxed space-y-1">
      <p className="font-bold text-blue-800 dark:text-blue-300">{title}</p>
      <div className="text-slate-700 dark:text-slate-200">{children}</div>
    </div>
  );
}

function TableWrap({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      {children}
    </div>
  );
}

const th = "text-left p-3 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800";
const td = "p-3 align-top text-sm border-t border-slate-200 dark:border-slate-800";

export default function JavaGuidePage() {
  useDocumentHead({
    title: `${JAVA_ARTICLE.title}｜${SERVICE_NAME}`,
    description: JAVA_ARTICLE.summary,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Article",
          headline: JAVA_ARTICLE.title,
          description: JAVA_ARTICLE.summary,
          inLanguage: "ja",
          datePublished: JAVA_ARTICLE.publishedAt,
          dateModified: JAVA_ARTICLE.updatedAt,
          mainEntityOfPage: { "@type": "WebPage", "@id": URL_FULL },
          author: { "@type": "Organization", name: SERVICE_NAME },
          publisher: { "@type": "Organization", name: "R Tool Lab", url: SITE_ORIGIN },
        },
        breadcrumbJsonLd([
          { name: SERVICE_NAME, url: `${SITE_ORIGIN}/freelance/` },
          { name: "Javaフリーランスエージェントの選び方", url: URL_FULL },
        ]),
      ],
    },
  });

  // ── 比較データから生成する（比較ページと矛盾させない） ──
  const javaAgents = AGENTS.filter((a) => a.languages.value.includes("java"));
  const javaFullRemoteAgents = AGENTS.filter((a) => a.fullRemoteLanguages.value.includes("java"));
  const week3Agents = AGENTS.filter((a) => a.weekly3OrLess.value === "yes");
  const allNames = (list: typeof AGENTS) => list.map((a) => a.name).join("、");
  const caseExamples = AGENTS.filter((a) => a.experience.caseExample);

  const goTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <article className="max-w-3xl mx-auto space-y-10">
      <nav className="text-xs text-slate-500 dark:text-slate-400" aria-label="パンくず">
        <Link to="/freelance/" className="hover:underline">
          {SERVICE_NAME}
        </Link>{" "}
        ＞ Javaフリーランスエージェントの選び方
      </nav>

      <header className="space-y-4">
        <h1 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight">
          Javaフリーランスエージェントの選び方｜案件・リモート・実務経験で比較
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          公開日：{JAVA_ARTICLE.publishedAt}　最終更新：{JAVA_ARTICLE.updatedAt}　情報の調査日：{DATA_CHECKED_AT}
        </p>
        <P>
          Javaエンジニアがフリーランスとして案件を探すとき、多くの人が最初に迷うのが「どのエージェントに登録するか」です。
          この記事では、Javaの案件を探す人が、エージェントを比べるときに見ておきたい点を、仕事内容・実務経験・リモートの3つを軸にまとめました。
        </P>
        <Callout title="この記事の数字について">
          案件数・平均単価・年収・リモート案件の割合といった数字は、この記事には載せていません。時期や集計方法で大きく変わり、出典を確認できないものを載せると誤解につながるためです。
          最新の数字は、各社の公式サイトでご確認ください。
        </Callout>

        <nav className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4" aria-label="目次">
          <p className="text-sm font-bold mb-2">目次</p>
          <ol className="list-decimal pl-5 space-y-1 text-sm">
            {TOC.map((t) => (
              <li key={t.id}>
                <a href={`#${t.id}`} onClick={goTo(t.id)} className="text-blue-700 dark:text-blue-300 hover:underline">
                  {t.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </header>

      {/* 1 */}
      <Section id="merit" title="Javaエンジニアがフリーランスになるメリットと注意点">
        <H3>メリット：経験を活かせる領域が広い</H3>
        <P>
          Javaは業務システムからWebサービス、スマートフォンアプリまで使われる範囲が広く、各社の公式案件ページにも、金融機関・官公庁・通信事業会社・自動車メーカー向けのシステム開発など、さまざまな分野のJava案件が掲載されています。
          これまでの業務で経験した分野に近い案件を選びやすいのは、Javaエンジニアの強みです。
        </P>
        <P>
          働き方も、会社員のときより選べる場合があります。{allNames(javaFullRemoteAgents)}では、公式の案件ページでJavaのフルリモート案件の掲載を確認できました。
          また、{allNames(week3Agents)}では、週3日以下の案件の掲載を確認できています。
          ただし、「案件がある」ことと「案件が多い」ことは別です。件数や割合は、比較ページで確認できた範囲でのみ記載しています。
        </P>
        <H3>注意点：収入と仕事の安定は保証されない</H3>
        <Ul
          items={[
            "契約が終わったあとの次の案件を、自分で探す必要があります。案件の合間に空白期間が生じる可能性も考えておきましょう。",
            "社会保険や年金、税金の手続き、確定申告を自分で行います。会社員のときに会社が代わりにしてくれていた部分が、自己負担になります。",
            "契約は業務委託（準委任など）が一般的です。稼働時間の精算ルール、契約期間、更新の条件は案件ごとに異なるため、契約前に必ず確認しましょう。",
            "「Javaが書ける」だけでなく、フレームワーク、データベース、クラウド、設計の経験などを案件ごとに求められることがあります。",
          ]}
        />
      </Section>

      {/* 2 */}
      <Section id="work" title="Javaフリーランス案件の主な仕事内容">
        <P>
          各社の公式案件ページを見ると、Javaの案件は次のような内容に分けられます。
          これは掲載されている案件の傾向であり、それぞれの件数や割合を示すものではありません。
        </P>
        <TableWrap>
          <table className="w-full min-w-[560px] text-sm border-collapse">
            <thead>
              <tr>
                <th className={th}>仕事内容</th>
                <th className={th}>案件に書かれている例</th>
                <th className={th}>応募前に見るところ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={td + " font-semibold"}>既存システムの改修・機能追加</td>
                <td className={td}>金融機関向けシステムの改修、通信事業会社向けの機能追加、システムの性能改善など</td>
                <td className={td}>既存コードの規模、ドキュメントの有無、テスト体制</td>
              </tr>
              <tr>
                <td className={td + " font-semibold"}>新規開発・刷新・移行</td>
                <td className={td}>制度改正への対応、システム移行、官公庁向けシステムの設計・開発など</td>
                <td className={td}>担当する工程（要件定義・設計・開発・テスト）</td>
              </tr>
              <tr>
                <td className={td + " font-semibold"}>Webサービス・アプリ開発</td>
                <td className={td}>Spring Bootなどのフレームワークを使った開発、フロントエンドとの組み合わせなど</td>
                <td className={td}>使う技術の範囲、チームの規模と開発の進め方</td>
              </tr>
              <tr>
                <td className={td + " font-semibold"}>Androidアプリ開発（Java）</td>
                <td className={td}>Androidエンジニアを募集する案件。フルリモートと書かれたものもあります</td>
                <td className={td}>Kotlinなど他言語の併用の有無</td>
              </tr>
              <tr>
                <td className={td + " font-semibold"}>リーダー・PM</td>
                <td className={td}>設計・開発に加えて、進行管理やメンバーのとりまとめを求める案件</td>
                <td className={td}>マネジメントと開発の比率、チームの人数</td>
              </tr>
            </tbody>
          </table>
        </TableWrap>
        <P>
          同じ「Java案件」でも、使うフレームワークや担当する工程で、求められる経験は大きく変わります。
          自分が「どの工程を、どの技術で担当してきたか」を言葉にしておくと、案件を探しやすくなります。
        </P>
      </Section>

      {/* 3 */}
      <Section id="experience" title="実務経験年数と案件獲得の関係">
        <P>
          「実務経験は何年あればフリーランスになれるのか」は、よくある疑問です。
          結論から言うと、<strong>各社共通の登録条件としての年数は、公式サイトでは確認できていません</strong>。
          実務経験の条件は、エージェントごとではなく、<strong>案件ごと</strong>に書かれています。
        </P>
        <P>実際に、公式の案件ページには次のような条件が書かれた案件がありました。いずれも個別の案件の例で、各社共通の条件ではありません。</P>
        <TableWrap>
          <table className="w-full min-w-[520px] text-sm border-collapse">
            <thead>
              <tr>
                <th className={th}>エージェント</th>
                <th className={th}>公式の案件ページにあった条件の例（個別案件）</th>
              </tr>
            </thead>
            <tbody>
              {caseExamples.map((a) => (
                <tr key={a.id}>
                  <td className={td + " font-semibold whitespace-nowrap"}>{a.name}</td>
                  <td className={td}>
                    {(a.experience.caseExample as { text: string }).text.replace(/^公式の案件例：/, "")}
                    <a
                      href={(a.experience.caseExample as { source: { url: string } }).source.url}
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      className="ml-1 text-xs text-blue-700 dark:text-blue-300 underline"
                    >
                      公式ページ↗
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
        <P>この例から分かるのは、次の3点です。</P>
        <Ul
          items={[
            "求められる経験は、案件によって「3年以上」「5年程度」「未経験OK」など大きく異なります。年数だけで応募できるかどうかを決めつけないほうがよいでしょう。",
            "「望ましい」「検討可」と書かれた条件は、条件に少し届かなくても相談できる場合があります。ただし、必須条件なのかを面談などで確認しましょう。",
            "年数よりも、担当した工程、使った技術、チームでの役割のほうが、判断の材料になりやすい項目です。職務経歴書には、年数だけでなくこれらを具体的に書いておきましょう。",
          ]}
        />
        <P>
          「自分の経験で応募できる案件があるか」を知りたいときは、各社の公式サイトで、使っている技術や稼働条件を入力して案件を絞り込むのが確実です。
        </P>
      </Section>

      {/* 4 */}
      <Section id="remote" title="Javaのリモート案件を探すときの注意点">
        <H3>「フルリモート」と「リモート相談可能」は別のもの</H3>
        <Ul
          items={[
            <>
              <strong>フルリモート</strong>：原則として出社が不要な案件です。
            </>,
            <>
              <strong>リモート相談可能</strong>：一部出社や、出社の頻度を相談できる案件を含みます。
            </>,
          ]}
        />
        <P>
          「リモート可」と書かれていても、週に何日か出社が必要なことがあります。
          たとえば、公式の案件ページには、参画の最初のタイミングだけ出社して、そのあとはフルリモートで働く、というJava案件もありました。
          比較ページでも、この2つは別の項目として表示しています。
        </P>
        <H3>案件ページで確認すること</H3>
        <Ul
          items={[
            "出社の頻度と場所（毎週か、月数回か、参画時のみか）",
            "客先常駐かどうか、開始時の出社や研修の有無",
            "フルリモートの条件が、契約期間の途中で変わる可能性があるか",
            "貸与されるパソコンやセキュリティ要件、開発環境へのアクセス方法",
            "稼働日数や時間帯の指定（週5日か、週3日以下か）",
          ]}
        />
        <H3>条件を重ねるほど、案件は絞られる</H3>
        <P>
          「Java」「フルリモート」「週3日以下」「地方在住でも可」と条件を重ねるほど、該当する案件は少なくなります。
          どの条件が譲れないかを先に決めておくと、希望と現実の折り合いをつけやすくなります。
          地方にお住まいの方は、フルリモートの案件か、近隣への出社が必要な案件かを、特に確認してください。
        </P>
      </Section>

      {/* 5 */}
      <Section id="compare-points" title="エージェントを比較するときのポイント">
        <Ul
          items={[
            <>
              <strong>Java案件の掲載があるか</strong>：自分が使うフレームワークや、希望する働き方（フルリモート、週3日以下など）の案件が掲載されているかを見ます。
            </>,
            <>
              <strong>リモートの区別</strong>：フルリモート案件と、リモート相談可能な案件を分けて確認します。
            </>,
            <>
              <strong>稼働日数の幅</strong>：週5日だけでなく、週3日以下の案件を扱っているかを確認します。副業から始めたい場合に役立ちます。
            </>,
            <>
              <strong>支払いサイト</strong>：報酬が入金されるまでの期間です。独立直後は、手元の資金繰りに直結します。
            </>,
            <>
              <strong>福利厚生</strong>：対象になる人や利用条件、有料のプランかどうかを確認します。「あり」と書かれていても、すべての登録者が無条件で使えるとは限りません。
            </>,
            <>
              <strong>対応地域</strong>：案件の勤務地と、自分の住んでいる地域の相性を確認します。
            </>,
            <>
              <strong>情報の出どころ</strong>：公式サイトに書かれた情報か、第三者メディアの情報かを区別して見ることが大切です。
            </>,
          ]}
        />
        <P>
          複数のエージェントに登録して、案件の量や担当者との相性を見比べるという方法もあります。
          ただし、連絡の頻度や面談の回数が増えるため、無理のない範囲で絞ることをおすすめします。
        </P>
      </Section>

      {/* 6 */}
      <Section id="five" title="Java案件を扱う5社を比較する">
        <P>
          フリーランスナビでは、公式サイトの案件ページで確認できた内容を優先して、5社を比較しています。
          Javaに関する確認状況は次のとおりです（比較ページと同じデータです）。
        </P>
        <TableWrap>
          <table className="w-full min-w-[520px] text-sm border-collapse">
            <thead>
              <tr>
                <th className={th}>エージェント</th>
                <th className={th}>Java案件の掲載</th>
                <th className={th}>Javaのフルリモート案件</th>
                <th className={th}>週3日以下の案件</th>
              </tr>
            </thead>
            <tbody>
              {AGENTS.map((a) => {
                const yes = (ok: boolean) => (
                  <span className={ok ? "font-semibold text-emerald-700 dark:text-emerald-400" : "text-slate-400"}>
                    {ok ? "確認" : "未確認"}
                  </span>
                );
                return (
                  <tr key={a.id}>
                    <td className={td + " font-semibold"}>{a.name}</td>
                    <td className={td}>{yes(javaAgents.includes(a))}</td>
                    <td className={td}>{yes(javaFullRemoteAgents.includes(a))}</td>
                    <td className={td}>{yes(week3Agents.includes(a))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableWrap>
        <P>
          「確認」は、公式の案件ページで掲載を確認できたという意味です。案件の数が多い、割合が高いという意味ではありません。
          「未確認」は、確認できていないだけで、「ない」という意味でもありません。
          支払いサイトや福利厚生、対応地域などの詳しい違いは、比較ページにまとめています。
        </P>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/freelance/agents/" className={BTN_PRIMARY}>
            5社の比較表を見る
          </Link>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          比較ページの表示順は、サービス名の五十音順で固定です。広告の有無や報酬額は、並び順にも診断結果にも影響しません。
          この記事の中には、広告リンクを置いていません（比較ページ・診断ページ内の一部のリンクは広告で、「PR」と表示しています）。
        </p>
      </Section>

      {/* 7 */}
      <Section id="diagnosis" title="自分の条件に合うエージェントを診断する">
        <P>
          比較表を見ても、自分の条件にどの会社が近いかが分かりにくいときは、条件別診断が便利です。
          次の5つを入力すると、各社が条件にどれだけ当てはまるかを、理由つきで表示します。
        </P>
        <Ul items={["使用言語（例：Java）", "実務経験年数", "希望する勤務形態（フルリモート／リモート相談可／出社可）", "希望勤務地", "希望単価（任意）"]} />
        <P>
          診断では、公式サイト等で確認できた条件だけを使い、確認できていない項目は「未確認」として、一致率の計算に含めません。
          実務経験年数と希望単価は、各社を比較できる公式データがないため、一致率の計算には使っていません。
        </P>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/freelance/diagnosis/" className={BTN_PRIMARY}>
            条件別診断をはじめる
          </Link>
          <Link to="/freelance/agents/" className={BTN_SECONDARY}>
            比較表から探す
          </Link>
        </div>
      </Section>

      {/* 8 */}
      <Section id="checklist" title="エージェントに登録する前に確認したいこと">
        <P>登録の前後に、次の点を確認しておくと、条件の食い違いを防げます。</P>
        <TableWrap>
          <table className="w-full min-w-[480px] text-sm border-collapse">
            <thead>
              <tr>
                <th className={th}>確認すること</th>
                <th className={th}>具体的には</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["希望条件の整理", "勤務形態（フルリモート／出社の頻度）、稼働日数、希望する開始時期、譲れない条件と妥協できる条件"],
                ["契約形態と精算", "業務委託の種類、稼働時間の精算ルール、契約期間と更新の条件"],
                ["報酬と支払い", "報酬の決まり方、手数料（マージン）の考え方や開示の有無、支払いサイト"],
                ["福利厚生", "対象になる人、利用の条件、有料のプランかどうか"],
                ["案件の詳細", "出社の頻度と場所、使う技術、チームの体制、面談の回数、開始日"],
                ["担当者とのやりとり", "連絡の方法と頻度、希望を伝えたときの対応"],
                ["情報の鮮度", "案件の条件や制度は変わります。登録前に、公式サイトで最新の内容を確認する"],
              ].map(([k, v]) => (
                <tr key={k}>
                  <td className={td + " font-semibold whitespace-nowrap"}>{k}</td>
                  <td className={td}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
        <P>
          収入や条件は人によって異なります。この記事の内容は一般的な目安であり、実際の案件条件や契約の内容を保証するものではありません。
          最終的な条件は、各社の公式サイトや面談で必ずご確認ください。
        </P>
      </Section>

      <aside className="rounded-2xl bg-blue-50 dark:bg-slate-900 border border-blue-100 dark:border-slate-800 p-5 text-center space-y-3">
        <p className="text-sm font-bold">Javaの案件を探すエージェントを絞り込む</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/freelance/diagnosis/" className={BTN_PRIMARY}>
            条件別診断をはじめる
          </Link>
          <Link to="/freelance/agents/" className={BTN_SECONDARY}>
            5社を比較表で見る
          </Link>
        </div>
      </aside>
    </article>
  );
}
