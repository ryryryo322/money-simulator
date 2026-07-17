// ============================================
// ふるさと納税シミュレーター
// /furusato
// ============================================

import { useState, useMemo } from "react";
import Layout from "@/components/Layout";
import { Card, SectionTitle, SliderInput, StatRow } from "@/components/ui";
import AdSlot from "@/components/AdSlot";
import SimulatorGrid from "@/components/SimulatorGrid";

// ── 定数 ─────────────────────────────────────

/** 給与所得控除テーブル */
function calcKyuyoDeduction(income: number): number {
  if (income <= 162.5) return 55;
  if (income <= 180) return income * 0.4 - 10;
  if (income <= 360) return income * 0.3 + 8;
  if (income <= 660) return income * 0.2 + 44;
  if (income <= 850) return income * 0.1 + 110;
  return 195;
}

/** 所得税率テーブル */
function calcIncomeTaxRate(taxableIncome: number): number {
  if (taxableIncome <= 195) return 0.05;
  if (taxableIncome <= 330) return 0.10;
  if (taxableIncome <= 695) return 0.20;
  if (taxableIncome <= 900) return 0.23;
  if (taxableIncome <= 1800) return 0.33;
  if (taxableIncome <= 4000) return 0.40;
  return 0.45;
}

// ── 計算ロジック ─────────────────────────────

interface FurusatoInputs {
  incomeType: "employee" | "freelance"; // 会社員 or 個人事業主
  income: number;           // 年収・売上（万円）
  expense: number;          // 経費（個人事業主のみ）
  blueReturn: number;       // 青色申告控除（個人事業主のみ）
  dependents: number;       // 扶養家族人数
  hasSpouse: boolean;       // 配偶者控除あり
  hasDisability: boolean;   // 障害者控除あり
  donation: number;         // 寄付金額（万円）
}

interface FurusatoResult {
  limit: number;            // 控除上限額（万円）
  deduction: number;        // 実質負担額（万円）
  benefit: number;          // お得になる金額（万円）
  incomeTaxRefund: number;  // 所得税還付（万円）
  residentTaxRefund: number;// 住民税控除（万円）
  isOver: boolean;          // 上限超えているか
}

function calcFurusato(inp: FurusatoInputs): FurusatoResult {
  const { incomeType, income, expense, blueReturn, dependents, hasSpouse, hasDisability, donation } = inp;

  // 所得計算（会社員 vs 個人事業主で異なる）
  let baseIncome: number;
  let socialInsurance: number;

  if (incomeType === "employee") {
    // 会社員：給与所得控除を適用
    const kyuyoDeduction = calcKyuyoDeduction(income);
    baseIncome = income - kyuyoDeduction;
    socialInsurance = income * 0.147;
  } else {
    // 個人事業主：売上 - 経費 - 青色申告控除
    const businessIncome = Math.max(0, income - expense);
    baseIncome = Math.max(0, businessIncome - blueReturn);
    // 国保・国民年金の概算
    socialInsurance = Math.min(baseIncome * 0.10 + 5, 87) + 20.4;
  }

  // 所得控除
  const basicDeduction = 48;
  const dependentDeduction = dependents * 38;
  const spouseDeduction = hasSpouse ? 38 : 0;
  const disabilityDeduction = hasDisability ? 27 : 0;

  const totalDeductions = basicDeduction + dependentDeduction + spouseDeduction
    + disabilityDeduction + socialInsurance;

  // 課税所得
  const taxableIncome = Math.max(0, baseIncome - totalDeductions);

  // 所得税率
  const taxRate = calcIncomeTaxRate(taxableIncome);

  // ふるさと納税の控除上限額計算
  // 住民税所得割額 × 20% ÷ (1 - 所得税率 × 1.021 - 0.1) + 2000円
  const residentTaxBase = taxableIncome * 0.10;
  const limit = Math.round(
    residentTaxBase * 0.20 / (1 - taxRate * 1.021 - 0.10) + 0.2
  );

  const effectiveDonation = Math.min(donation, limit);
  const isOver = donation > limit;

  // 所得税還付 = (寄付額 - 2000) × 所得税率 × 1.021
  const incomeTaxRefund = Math.max(0, (effectiveDonation - 0.2) * taxRate * 1.021);

  // 住民税控除（基本分 + 特例分）
  const residentBasic = Math.max(0, (effectiveDonation - 0.2) * 0.10);
  const residentSpecial = Math.max(0, (effectiveDonation - 0.2) * (1 - taxRate * 1.021 - 0.10));
  const residentTaxRefund = residentBasic + residentSpecial;

  // 実質負担 = 寄付額 - 所得税還付 - 住民税控除
  const totalRefund = incomeTaxRefund + residentTaxRefund;
  const deduction = Math.max(0, effectiveDonation - totalRefund);

  return {
    limit: Math.round(limit * 10) / 10,
    deduction: Math.round(deduction * 10) / 10,
    benefit: Math.round((effectiveDonation - deduction) * 10) / 10,
    incomeTaxRefund: Math.round(incomeTaxRefund * 10) / 10,
    residentTaxRefund: Math.round(residentTaxRefund * 10) / 10,
    isOver,
  };
}

// ── トグルボタン ─────────────────────────────

const ToggleBtn = ({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
      active
        ? "bg-brand-500 text-white border-brand-500"
        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
    }`}
  >
    {children}
  </button>
);

// ── FAQ ──────────────────────────────────────

const FAQ_LIST = [
  {
    q: "ふるさと納税の「実質2,000円」とは？",
    a: "ふるさと納税をすると、寄付額から2,000円を引いた金額が所得税の還付と住民税の控除で戻ってきます。つまり何万円寄付しても自己負担は2,000円だけになる仕組みです（控除上限額内の場合）。",
  },
  {
    q: "控除上限額を超えて寄付したらどうなる？",
    a: "上限を超えた分は控除されず、全額自己負担になります。例えば上限5万円のところに8万円寄付すると、超過分3万円は控除されません。",
  },
  {
    q: "ワンストップ特例とは？",
    a: "確定申告をしなくても寄付先の自治体に申請書を送るだけで控除が受けられる制度です。寄付先が5自治体以内で、確定申告の必要がない給与所得者が利用できます。",
  },
  {
    q: "いつまでに寄付すればいい？",
    a: "その年の1月1日〜12月31日の寄付が対象です。年末（特に12月末）は注文が集中するので余裕を持って行いましょう。",
  },
  {
    q: "副業収入がある場合は？",
    a: "副業収入があると確定申告が必要なため、ワンストップ特例は使えません。確定申告で寄付金控除を申告することになります。",
  },
] as const;

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left py-3 flex justify-between items-center gap-2"
      >
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{q}</span>
        <span className="text-gray-400 text-lg flex-shrink-0">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pb-3">{a}</p>
      )}
    </div>
  );
}

// ── メインコンポーネント ──────────────────────

export default function Furusato() {
  const [inp, setInp] = useState<FurusatoInputs>({
    incomeType: "employee",
    income: 500,
    expense: 100,
    blueReturn: 65,
    dependents: 0,
    hasSpouse: false,
    hasDisability: false,
    donation: 5,
  });

  const set = <K extends keyof FurusatoInputs>(key: K, val: FurusatoInputs[K]) =>
    setInp(prev => ({ ...prev, [key]: val }));

  const result = useMemo(() => calcFurusato(inp), [inp]);

  const fmtM = (n: number) => `${n.toLocaleString()}万円`;

  return (
    <Layout title="ふるさと納税シミュレーター">
      <div className="space-y-10">

        {/* ヘッダー */}
        <div className="text-center py-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            年収と家族構成を入力するだけで控除上限額がわかります
          </p>
        </div>

        {/* 入力 */}
        <section>
          <SectionTitle color="orange">👤 あなたの情報</SectionTitle>
          <Card>
            {/* 会社員 / 個人事業主 切り替え */}
            <div className="mb-5">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">職業</p>
              <div className="flex gap-2">
                <ToggleBtn active={inp.incomeType === "employee"} onClick={() => set("incomeType", "employee")}>
                  🏢 会社員
                </ToggleBtn>
                <ToggleBtn active={inp.incomeType === "freelance"} onClick={() => set("incomeType", "freelance")}>
                  💼 個人事業主
                </ToggleBtn>
              </div>
            </div>

            {inp.incomeType === "employee" ? (
              <SliderInput
                label="年収"
                value={inp.income}
                min={200} max={3000} step={10} unit="万円"
                onChange={v => set("income", v)}
              />
            ) : (
              <>
                <SliderInput
                  label="年間売上"
                  value={inp.income}
                  min={100} max={5000} step={10} unit="万円"
                  onChange={v => set("income", v)}
                />
                <SliderInput
                  label="年間経費"
                  value={inp.expense}
                  min={0} max={2000} step={10} unit="万円"
                  onChange={v => set("expense", v)}
                />
                <div className="mb-5">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">青色申告控除</p>
                  <div className="flex gap-2">
                    {([65, 55, 10, 0] as const).map(v => (
                      <ToggleBtn key={v} active={inp.blueReturn === v} onClick={() => set("blueReturn", v)}>
                        {v === 0 ? "白色" : `${v}万`}
                      </ToggleBtn>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* 扶養人数 */}
            <div className="mb-5">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">
                扶養家族の人数
              </label>
              <select
                value={inp.dependents}
                onChange={e => set("dependents", Number(e.target.value))}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {[0,1,2,3,4,5].map(n => (
                  <option key={n} value={n}>{n}人{n === 0 ? "（扶養なし）" : ""}</option>
                ))}
              </select>
            </div>

            {/* 配偶者控除 */}
            <div className="mb-5">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">配偶者控除</p>
              <div className="flex gap-2">
                <ToggleBtn active={inp.hasSpouse} onClick={() => set("hasSpouse", true)}>あり</ToggleBtn>
                <ToggleBtn active={!inp.hasSpouse} onClick={() => set("hasSpouse", false)}>なし</ToggleBtn>
              </div>
            </div>

            {/* 障害者控除 */}
            <div className="mb-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">障害者控除</p>
              <div className="flex gap-2">
                <ToggleBtn active={inp.hasDisability} onClick={() => set("hasDisability", true)}>あり</ToggleBtn>
                <ToggleBtn active={!inp.hasDisability} onClick={() => set("hasDisability", false)}>なし</ToggleBtn>
              </div>
            </div>
          </Card>
        </section>

        {/* 寄付金額 */}
        <section>
          <SectionTitle color="green">🎁 寄付金額</SectionTitle>
          <Card>
            <SliderInput
              label="寄付する金額"
              value={inp.donation}
              min={1} max={100} step={1} unit="万円"
              onChange={v => set("donation", v)}
            />
            {result.isOver && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mt-2">
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  ⚠️ 寄付額が上限（{fmtM(result.limit)}）を超えています。超過分は自己負担になります。
                </p>
              </div>
            )}
          </Card>
        </section>

        {/* 結果 */}
        <section>
          <SectionTitle color="blue">📊 シミュレーション結果</SectionTitle>

          {/* 上限額ハイライト */}
          <div className="bg-gradient-to-r from-brand-500 to-orange-400 rounded-2xl p-5 mb-4 text-center">
            <p className="text-white/80 text-xs font-medium mb-1">あなたの控除上限額</p>
            <p className="text-white text-4xl font-black mb-1">{fmtM(result.limit)}</p>
            <p className="text-white/70 text-xs">この金額まで実質2,000円で寄付できます</p>
          </div>

          <Card>
            <StatRow label="寄付金額" value={fmtM(Math.min(inp.donation, result.limit))} />
            <StatRow label="所得税還付（来年）" value={fmtM(result.incomeTaxRefund)} />
            <StatRow label="住民税控除（来年）" value={fmtM(result.residentTaxRefund)} />
            <StatRow label="実質自己負担" value="0.2万円（2,000円）" highlight />
            <StatRow label="お得になる金額" value={fmtM(result.benefit)} highlight />
          </Card>

          <p className="text-xs text-gray-400 mt-2 px-1">
            ※給与所得者・ワンストップ特例利用の場合。副業・医療費控除等がある場合は異なります。
          </p>
        </section>

        {/* おすすめサイト */}
        <section>
          <SectionTitle color="green">🛒 ふるさと納税サイト</SectionTitle>
          <div className="space-y-3">

            {/* ふるさと本舗 */}
            <a href="https://px.a8.net/svt/ejp?a8mat=4B8113+E4G7EA+5IMU+5YRHE"
              target="_blank" rel="nofollow noopener noreferrer"
              className="flex items-center gap-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-gray-700/60 shadow-sm p-4 active:opacity-70 transition-opacity"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-2xl flex-shrink-0">🏯</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-orange-500 font-semibold mb-0.5">ふるさと納税</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">ふるさと本舗</p>
                <p className="text-xs text-gray-400 mt-0.5">全国の美味しい特産品に特化したふるさと納税サイト →</p>
              </div>
              <span className="text-gray-300 dark:text-gray-600 text-lg flex-shrink-0">›</span>
            </a>
            <img width={1} height={1} src="https://www15.a8.net/0.gif?a8mat=4B8113+E4G7EA+5IMU+5YRHE" alt="" className="border-0" />

            {/* au PAY ふるさと納税 */}
            <a href="https://px.a8.net/svt/ejp?a8mat=4B8113+E22GZ6+54OC+5YRHE"
              target="_blank" rel="nofollow noopener noreferrer"
              className="flex items-center gap-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-gray-700/60 shadow-sm p-4 active:opacity-70 transition-opacity"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-500 flex items-center justify-center text-2xl flex-shrink-0">📱</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-brand-500 font-semibold mb-0.5">ふるさと納税</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">au PAY ふるさと納税</p>
                <p className="text-xs text-gray-400 mt-0.5">貯まったPontaポイントで寄附できる →</p>
              </div>
              <span className="text-gray-300 dark:text-gray-600 text-lg flex-shrink-0">›</span>
            </a>
            <img width={1} height={1} src="https://www11.a8.net/0.gif?a8mat=4B8113+E22GZ6+54OC+5YRHE" alt="" className="border-0" />

            {/* ウイスキーふるさと納税 */}
            <a href="https://px.a8.net/svt/ejp?a8mat=4B8113+E3URSI+5U6O+BX3J6"
              target="_blank" rel="nofollow noopener noreferrer"
              className="flex items-center gap-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-gray-700/60 shadow-sm p-4 active:opacity-70 transition-opacity"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-700 flex items-center justify-center text-2xl flex-shrink-0">🥃</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-amber-700 font-semibold mb-0.5">ふるさと納税</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">ウイスキーふるさと納税</p>
                <p className="text-xs text-gray-400 mt-0.5">投資家・富裕層に人気。希少ウイスキーをふるさと納税で →</p>
              </div>
              <span className="text-gray-300 dark:text-gray-600 text-lg flex-shrink-0">›</span>
            </a>
            <img width={1} height={1} src="https://www10.a8.net/0.gif?a8mat=4B8113+E3URSI+5U6O+BX3J6" alt="" className="border-0" />

          </div>
          <p className="text-xs text-gray-400 mt-2 px-1">※ 広告・PR を含みます</p>
        </section>

        {/* SEO解説 */}
        <section>
          <SectionTitle color="blue">📖 ふるさと納税の基礎知識</SectionTitle>
          <Card>
            <div className="space-y-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">ふるさと納税とは</h2>
                <p>好きな自治体に寄付をすることで、寄付額から2,000円を引いた金額が所得税の還付と翌年の住民税から控除される制度です。お礼の品（返礼品）がもらえるため、実質的にお得な制度として人気です。</p>
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">控除の仕組み</h2>
                <p>控除は所得税（確定申告またはワンストップ特例）と住民税の2段階で行われます。住民税の控除は翌年6月以降の住民税から差し引かれます。</p>
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">注意点</h2>
                <p>医療費控除や住宅ローン控除を受けている場合、住民税の控除額が変わることがあります。また返礼品の還元率は寄付額の30%以下と定められています。</p>
              </div>
            </div>
          </Card>
        </section>

        {/* 広告 */}
        <AdSlot slot="result" context="furusato" />

        {/* FAQ */}
        <section>
          <SectionTitle color="purple">❓ よくある質問</SectionTitle>
          <Card>
            {FAQ_LIST.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
          </Card>
        </section>

        {/* 他のシミュレーター */}
        <SimulatorGrid excludeId="furusato" />

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 pb-4">
          ※本シミュレーションは概算です。正確な金額は各ふるさと納税サイトの控除額シミュレーターでご確認ください。
        </p>
      </div>
    </Layout>
  );
}