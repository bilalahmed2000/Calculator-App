import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

/** ---------- Helpers ---------- */
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

function formatMoney(n, currency = "USD") {
  if (!isFinite(n)) return "-";
  return n.toLocaleString(undefined, { style: "currency", currency });
}

function yearsToMonths(years) {
  return Math.max(0, Math.round(Number(years || 0) * 12));
}

function fv(present, ratePerPeriod, nper, pmt = 0) {
  const r = Number(ratePerPeriod || 0);
  const N = Math.max(0, Math.round(Number(nper || 0)));
  const PV = Number(present || 0);
  const PMT = Number(pmt || 0);

  if (!N) return PV;
  if (r === 0) return PV + PMT * N;

  const factor = Math.pow(1 + r, N);
  return PV * factor + PMT * ((factor - 1) / r);
}

function pvOfAnnuity(pmt, ratePerPeriod, nper) {
  const r = Number(ratePerPeriod || 0);
  const N = Math.max(0, Math.round(Number(nper || 0)));
  const PMT = Number(pmt || 0);

  if (!N) return 0;
  if (r === 0) return PMT * N;

  return (PMT * (1 - Math.pow(1 + r, -N))) / r;
}

function pmtFromPV(pv, ratePerPeriod, nper) {
  const r = Number(ratePerPeriod || 0);
  const N = Math.max(0, Math.round(Number(nper || 0)));
  const PV = Number(pv || 0);

  if (!N) return 0;
  if (r === 0) return PV / N;

  return (PV * r) / (1 - Math.pow(1 + r, -N));
}

function payoffMonthsFromWithdrawal(balance, monthlyWithdrawal, monthlyRate) {
  const B = Number(balance || 0);
  const w = Number(monthlyWithdrawal || 0);
  const r = Number(monthlyRate || 0);

  if (!B || !w) return 0;

  // growth >= withdrawal => never runs out (simplified)
  if (r > 0 && w <= B * r) return Infinity;

  if (r === 0) return Math.ceil(B / w);

  const denom = w - B * r;
  if (denom <= 0) return Infinity;

  const ratio = w / denom;
  const t = Math.log(ratio) / Math.log(1 + r);
  return Math.ceil(t);
}

// ✅ ADDED: percent helpers
const pct = (num, den) => (den > 0 ? (num / den) * 100 : 0);
const fmtPct0 = (x) => `${Math.round(x)}%`;

// ✅ ADDED: calculator.net style "Result" bar
function ResultBar({ title = "Result" }) {
  return (
    <div
      style={{
        background: "rgba(120,255,140,0.18)",
        border: "1px solid rgba(120,255,140,0.25)",
        borderRadius: 12,
        padding: "10px 12px",
        fontWeight: 900,
        margin: "10px 0 12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "rgba(255,255,255,0.92)",
      }}
    >
      <span>{title}</span>
      <span style={{ fontSize: 12, opacity: 0.8 }}>save</span>
    </div>
  );
}

// ✅ ADDED: mini "You will have vs need" bars
function TwoBar({ have, need, currency = "USD" }) {
  const max = Math.max(have, need, 1);
  const haveH = Math.round((have / max) * 140);
  const needH = Math.round((need / max) * 140);
  const havePct = fmtPct0(pct(have, need));

  return (
    <div style={{ display: "flex", gap: 50, alignItems: "flex-end", marginTop: 14 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ marginBottom: 8 }}>
          <b>~{formatMoney(round2(have), currency)}</b>{" "}
          <span style={{ opacity: 0.8 }}>({havePct})</span>
        </div>
        <div style={{ width: 110, height: haveH, background: "#e6d200", borderRadius: 6 }} />
        <div style={{ marginTop: 8 }}>You will have</div>
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{ marginBottom: 8 }}>
          <b>~{formatMoney(round2(need), currency)}</b>
        </div>
        <div style={{ width: 110, height: needH, background: "#3a6ea5", borderRadius: 6 }} />
        <div style={{ marginTop: 8 }}>You will need</div>
      </div>
    </div>
  );
}

/** ---------- Component ---------- */
export default function RetirementCalculator() {
  const currency = "USD";

  /** ---------- Defaults ---------- */
  const DEFAULTS = useMemo(
    () => ({
      // Section 1
      ageNow: 35,
      ageRetire: 67,
      lifeExpectancy: 85,
      incomeNow: 70000,
      incomeIncreasePct: 3,
      incomeNeededMode: "pct",
      incomeNeededPct: 75,
      incomeNeededAmount: 50000, // $/year
      avgReturnPct: 6,
      inflationPct: 3,
      otherIncomeMonthly: 0,
      savingsNow: 30000,
      futureSavingsMode: "pct",
      futureSavingsPct: 10,
      futureSavingsAmount: 500, // $/month

      // Section 2
      s2AgeNow: 35,
      s2AgeRetire: 67,
      s2NeedAtRetire: 600000,
      s2SavingsNow: 30000,
      s2ReturnPct: 6,

      // Section 3
      wAgeNow: 35,
      wAgeRetire: 67,
      wLifeExp: 85,
      wSavingsToday: 30000,
      wAnnualContrib: 0,
      wMonthlyContrib: 500,
      wReturnPct: 6,
      wInflationPct: 3,

      // Section 4
      lumpSum: 600000,
      withdrawMonthly: 5000,
      lReturnPct: 6,
    }),
    []
  );

  /** ---------- SECTION 1 State ---------- */
  const [ageNow, setAgeNow] = useState(DEFAULTS.ageNow);
  const [ageRetire, setAgeRetire] = useState(DEFAULTS.ageRetire);
  const [lifeExpectancy, setLifeExpectancy] = useState(DEFAULTS.lifeExpectancy);
  const [incomeNow, setIncomeNow] = useState(DEFAULTS.incomeNow);

  const [incomeIncreasePct, setIncomeIncreasePct] = useState(DEFAULTS.incomeIncreasePct);

  const [incomeNeededMode, setIncomeNeededMode] = useState(DEFAULTS.incomeNeededMode);
  const [incomeNeededPct, setIncomeNeededPct] = useState(DEFAULTS.incomeNeededPct);
  const [incomeNeededAmount, setIncomeNeededAmount] = useState(DEFAULTS.incomeNeededAmount);

  const [avgReturnPct, setAvgReturnPct] = useState(DEFAULTS.avgReturnPct);
  const [inflationPct, setInflationPct] = useState(DEFAULTS.inflationPct);

  const [otherIncomeMonthly, setOtherIncomeMonthly] = useState(DEFAULTS.otherIncomeMonthly);
  const [savingsNow, setSavingsNow] = useState(DEFAULTS.savingsNow);

  const [futureSavingsMode, setFutureSavingsMode] = useState(DEFAULTS.futureSavingsMode);
  const [futureSavingsPct, setFutureSavingsPct] = useState(DEFAULTS.futureSavingsPct);
  const [futureSavingsAmount, setFutureSavingsAmount] = useState(DEFAULTS.futureSavingsAmount);

  const [showS1, setShowS1] = useState(true);

  /** ---------- SECTION 2 State ---------- */
  const [s2AgeNow, setS2AgeNow] = useState(DEFAULTS.s2AgeNow);
  const [s2AgeRetire, setS2AgeRetire] = useState(DEFAULTS.s2AgeRetire);
  const [s2NeedAtRetire, setS2NeedAtRetire] = useState(DEFAULTS.s2NeedAtRetire);
  const [s2SavingsNow, setS2SavingsNow] = useState(DEFAULTS.s2SavingsNow);
  const [s2ReturnPct, setS2ReturnPct] = useState(DEFAULTS.s2ReturnPct);
  const [showS2, setShowS2] = useState(true);

  /** ---------- SECTION 3 State ---------- */
  const [wAgeNow, setWAgeNow] = useState(DEFAULTS.wAgeNow);
  const [wAgeRetire, setWAgeRetire] = useState(DEFAULTS.wAgeRetire);
  const [wLifeExp, setWLifeExp] = useState(DEFAULTS.wLifeExp);
  const [wSavingsToday, setWSavingsToday] = useState(DEFAULTS.wSavingsToday);
  const [wAnnualContrib, setWAnnualContrib] = useState(DEFAULTS.wAnnualContrib);
  const [wMonthlyContrib, setWMonthlyContrib] = useState(DEFAULTS.wMonthlyContrib);
  const [wReturnPct, setWReturnPct] = useState(DEFAULTS.wReturnPct);
  const [wInflationPct, setWInflationPct] = useState(DEFAULTS.wInflationPct);
  const [showS3, setShowS3] = useState(true);

  /** ---------- SECTION 4 State ---------- */
  const [lumpSum, setLumpSum] = useState(DEFAULTS.lumpSum);
  const [withdrawMonthly, setWithdrawMonthly] = useState(DEFAULTS.withdrawMonthly);
  const [lReturnPct, setLReturnPct] = useState(DEFAULTS.lReturnPct);
  const [showS4, setShowS4] = useState(true);

  /** ---------- Section 1 Calculate ---------- */
  const s1 = useMemo(() => {
    if (!showS1) return null;

    const A0 = clamp(ageNow, 0, 120);
    const AR = clamp(ageRetire, 0, 120);
    const LE = clamp(lifeExpectancy, 0, 130);

    const yearsToRetire = clamp(AR - A0, 0, 90);
    const yearsInRetirement = clamp(LE - AR, 0, 90);

    const income0 = clamp(incomeNow, 0, 1e12);
    const g = clamp(incomeIncreasePct, 0, 50) / 100;

    const rNom = clamp(avgReturnPct, -50, 50) / 100;
    const inf = clamp(inflationPct, -20, 20) / 100;
    const rReal = (1 + rNom) / (1 + inf) - 1;

    // Income at retirement (nominal)
    const incomeAtRetire = income0 * Math.pow(1 + g, yearsToRetire);

    // Target income (supports % OR $)
    const targetIncomeAnnual =
      incomeNeededMode === "pct"
        ? incomeAtRetire * (clamp(incomeNeededPct, 0, 200) / 100)
        : clamp(incomeNeededAmount, 0, 1e12);

    const otherAnnual = clamp(otherIncomeMonthly, 0, 1e12) * 12;
    const netNeededAnnual = Math.max(0, targetIncomeAnnual - otherAnnual);

    // Required nest egg at retirement (use real PV then inflate)
    const netNeededAnnualRealAtRetire =
      yearsToRetire > 0 ? netNeededAnnual / Math.pow(1 + inf, yearsToRetire) : netNeededAnnual;

    const monthsInRetirement = yearsToMonths(yearsInRetirement);
    const realMonthlyRate = rReal / 12;

    const requiredNestEggReal = pvOfAnnuity(
      netNeededAnnualRealAtRetire / 12,
      realMonthlyRate,
      monthsInRetirement
    );
    const requiredNestEggNominalAtRetire =
      yearsToRetire > 0 ? requiredNestEggReal * Math.pow(1 + inf, yearsToRetire) : requiredNestEggReal;

    // Project savings to retirement
    const rMonthlyNom = rNom / 12;
    const monthsToRetire = yearsToMonths(yearsToRetire);

    const gMonthly = Math.pow(1 + g, 1 / 12) - 1;
    const savePct = clamp(futureSavingsPct, 0, 100) / 100;

    let bal = clamp(savingsNow, 0, 1e12);
    let incomeMonth = income0 / 12;

    for (let m = 0; m < monthsToRetire; m++) {
      bal *= 1 + rMonthlyNom;

      const monthlySave =
        futureSavingsMode === "pct" ? incomeMonth * savePct : clamp(futureSavingsAmount, 0, 1e12);

      bal += monthlySave;
      incomeMonth *= 1 + gMonthly;
    }

    const projectedSavingsAtRetire = bal;
    const gap = projectedSavingsAtRetire - requiredNestEggNominalAtRetire;

    return {
      yearsToRetire,
      yearsInRetirement,
      incomeAtRetire,
      targetIncomeAnnual,
      netNeededAnnual,
      requiredNestEggNominalAtRetire,
      projectedSavingsAtRetire,
      gap,
    };
  }, [
    showS1,
    ageNow,
    ageRetire,
    lifeExpectancy,
    incomeNow,
    incomeIncreasePct,
    incomeNeededMode,
    incomeNeededPct,
    incomeNeededAmount,
    avgReturnPct,
    inflationPct,
    otherIncomeMonthly,
    savingsNow,
    futureSavingsMode,
    futureSavingsPct,
    futureSavingsAmount,
  ]);

  /** ---------- Section 2 Calculate (keep basic for validation) ---------- */
  const s2 = useMemo(() => {
    if (!showS2) return null;

    const A0 = clamp(s2AgeNow, 0, 120);
    const AR = clamp(s2AgeRetire, 0, 120);
    const yearsToRetire = clamp(AR - A0, 0, 90);

    const need = clamp(s2NeedAtRetire, 0, 1e12);
    const saved = clamp(s2SavingsNow, 0, 1e12);

    const r = clamp(s2ReturnPct, -50, 50) / 100;
    const rM = r / 12;
    const months = yearsToMonths(yearsToRetire);

    if (!months) return null;

    const fvSaved = fv(saved, rM, months, 0);
    const remaining = Math.max(0, need - fvSaved);

    const monthlyRequired = rM === 0 ? remaining / months : (remaining * rM) / (Math.pow(1 + rM, months) - 1);

    return { yearsToRetire, monthlyRequired, annualRequired: monthlyRequired * 12 };
  }, [showS2, s2AgeNow, s2AgeRetire, s2NeedAtRetire, s2SavingsNow, s2ReturnPct]);

  /** ---------- Section 3 Calculate (keep base) ---------- */
  const s3 = useMemo(() => {
    if (!showS3) return null;

    const A0 = clamp(wAgeNow, 0, 120);
    const AR = clamp(wAgeRetire, 0, 120);
    const LE = clamp(wLifeExp, 0, 130);

    const yearsToRetire = clamp(AR - A0, 0, 90);
    const yearsInRetirement = clamp(LE - AR, 0, 90);

    const saved = clamp(wSavingsToday, 0, 1e12);
    const annualContrib = clamp(wAnnualContrib, 0, 1e12);
    const monthlyContrib = clamp(wMonthlyContrib, 0, 1e12);
    const totalMonthlyContrib = monthlyContrib + annualContrib / 12;

    const rNom = clamp(wReturnPct, -50, 50) / 100;
    const inf = clamp(wInflationPct, -20, 20) / 100;
    const rReal = (1 + rNom) / (1 + inf) - 1;

    const monthsToRetire = yearsToMonths(yearsToRetire);
    const monthsInRet = yearsToMonths(yearsInRetirement);

    const rMNom = rNom / 12;
    const rMReal = rReal / 12;

    const fvAtRetireNom = fv(saved, rMNom, monthsToRetire, totalMonthlyContrib);
    const fvAtRetireReal = yearsToRetire > 0 ? fvAtRetireNom / Math.pow(1 + inf, yearsToRetire) : fvAtRetireNom;

    const withdrawRealMonthly = pmtFromPV(fvAtRetireReal, rMReal, monthsInRet);
    const withdrawNomMonthlyAtRetire =
      yearsToRetire > 0 ? withdrawRealMonthly * Math.pow(1 + inf, yearsToRetire) : withdrawRealMonthly;

    return { fvAtRetireNom, withdrawNomMonthlyAtRetire, withdrawRealMonthly };
  }, [showS3, wAgeNow, wAgeRetire, wLifeExp, wSavingsToday, wAnnualContrib, wMonthlyContrib, wReturnPct, wInflationPct]);

  /** ---------- Section 4 Calculate ---------- */
  const s4 = useMemo(() => {
    if (!showS4) return null;

    const B = clamp(lumpSum, 0, 1e12);
    const w = clamp(withdrawMonthly, 0, 1e12);

    const r = clamp(lReturnPct, -50, 50) / 100;
    const rM = r / 12;

    const months = payoffMonthsFromWithdrawal(B, w, rM);
    if (months === Infinity) return { months: Infinity, years: Infinity };

    return { months, years: months / 12 };
  }, [showS4, lumpSum, withdrawMonthly, lReturnPct]);

  /** ---------- Clear handlers ---------- */
  const clearS1 = () => {
    setAgeNow(DEFAULTS.ageNow);
    setAgeRetire(DEFAULTS.ageRetire);
    setLifeExpectancy(DEFAULTS.lifeExpectancy);
    setIncomeNow(DEFAULTS.incomeNow);
    setIncomeIncreasePct(DEFAULTS.incomeIncreasePct);
    setIncomeNeededMode(DEFAULTS.incomeNeededMode);
    setIncomeNeededPct(DEFAULTS.incomeNeededPct);
    setIncomeNeededAmount(DEFAULTS.incomeNeededAmount);
    setAvgReturnPct(DEFAULTS.avgReturnPct);
    setInflationPct(DEFAULTS.inflationPct);
    setOtherIncomeMonthly(DEFAULTS.otherIncomeMonthly);
    setSavingsNow(DEFAULTS.savingsNow);
    setFutureSavingsMode(DEFAULTS.futureSavingsMode);
    setFutureSavingsPct(DEFAULTS.futureSavingsPct);
    setFutureSavingsAmount(DEFAULTS.futureSavingsAmount);
    setShowS1(true);
  };

  const clearS2 = () => {
    setS2AgeNow(DEFAULTS.s2AgeNow);
    setS2AgeRetire(DEFAULTS.s2AgeRetire);
    setS2NeedAtRetire(DEFAULTS.s2NeedAtRetire);
    setS2SavingsNow(DEFAULTS.s2SavingsNow);
    setS2ReturnPct(DEFAULTS.s2ReturnPct);
    setShowS2(true);
  };

  const clearS3 = () => {
    setWAgeNow(DEFAULTS.wAgeNow);
    setWAgeRetire(DEFAULTS.wAgeRetire);
    setWLifeExp(DEFAULTS.wLifeExp);
    setWSavingsToday(DEFAULTS.wSavingsToday);
    setWAnnualContrib(DEFAULTS.wAnnualContrib);
    setWMonthlyContrib(DEFAULTS.wMonthlyContrib);
    setWReturnPct(DEFAULTS.wReturnPct);
    setWInflationPct(DEFAULTS.wInflationPct);
    setShowS3(true);
  };

  const clearS4 = () => {
    setLumpSum(DEFAULTS.lumpSum);
    setWithdrawMonthly(DEFAULTS.withdrawMonthly);
    setLReturnPct(DEFAULTS.lReturnPct);
    setShowS4(true);
  };

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Retirement Calculator</h1>
        <p className="muted">
          Estimate retirement needs, saving plan, monthly withdrawals, and how long your money can last.
        </p>
      </header>

      {/* ===== SECTION 1 (Form left, Results right) ===== */}
      <section className="card" style={{ marginBottom: 18 }}>
        <h2 className="card-title">How much do you need to retire?</h2>

        <div className="calc-grid" style={{ marginTop: 12 }}>
          {/* Left */}
          <div className="card" style={{ background: "rgba(255,255,255,0.04)" }}>
            <div className="row two">
              <div className="field">
                <label>Your current age</label>
                <input type="number" value={ageNow} onChange={(e) => setAgeNow(Number(e.target.value))} />
              </div>
              <div className="field">
                <label>Your planned retirement age</label>
                <input type="number" value={ageRetire} onChange={(e) => setAgeRetire(Number(e.target.value))} />
              </div>
            </div>

            <div className="row two">
              <div className="field">
                <label>Your life expectancy</label>
                <input type="number" value={lifeExpectancy} onChange={(e) => setLifeExpectancy(Number(e.target.value))} />
              </div>
              <div className="field">
                <label>Your current pre-tax income</label>
                <div className="input-group">
                  <span className="addon">$</span>
                  <input type="number" value={incomeNow} onChange={(e) => setIncomeNow(Number(e.target.value))} />
                  <span className="addon">/year</span>
                </div>
              </div>
            </div>

            <div className="bar-title">Assumptions</div>

            <div className="row two">
              <div className="field">
                <label>Your current income increase</label>
                <div className="input-group">
                  <input type="number" value={incomeIncreasePct} onChange={(e) => setIncomeIncreasePct(Number(e.target.value))} />
                  <span className="addon">%/year</span>
                </div>
              </div>

              <div className="field">
                <label>Income needed after retirement</label>
                <div className="input-group">
                  {incomeNeededMode === "pct" ? (
                    <>
                      <input type="number" value={incomeNeededPct} onChange={(e) => setIncomeNeededPct(Number(e.target.value))} />
                      <select value={incomeNeededMode} onChange={(e) => setIncomeNeededMode(e.target.value)}>
                        <option value="pct">%</option>
                        <option value="amount">$</option>
                      </select>
                      <span className="addon">of income</span>
                    </>
                  ) : (
                    <>
                      <span className="addon">$</span>
                      <input type="number" value={incomeNeededAmount} onChange={(e) => setIncomeNeededAmount(Number(e.target.value))} />
                      <select value={incomeNeededMode} onChange={(e) => setIncomeNeededMode(e.target.value)}>
                        <option value="pct">%</option>
                        <option value="amount">$</option>
                      </select>
                      <span className="addon">/year</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="row two">
              <div className="field">
                <label>Average investment return</label>
                <div className="input-group">
                  <input type="number" value={avgReturnPct} onChange={(e) => setAvgReturnPct(Number(e.target.value))} />
                  <span className="addon">%/year</span>
                </div>
              </div>
              <div className="field">
                <label>Inflation rate</label>
                <div className="input-group">
                  <input type="number" value={inflationPct} onChange={(e) => setInflationPct(Number(e.target.value))} />
                  <span className="addon">%/year</span>
                </div>
              </div>
            </div>

            <div className="bar-title">Optional</div>

            <div className="row two">
              <div className="field">
                <label>Other income after retirement</label>
                <div className="input-group">
                  <span className="addon">$</span>
                  <input type="number" value={otherIncomeMonthly} onChange={(e) => setOtherIncomeMonthly(Number(e.target.value))} />
                  <span className="addon">/month</span>
                </div>
              </div>
              <div className="field">
                <label>Your current retirement savings</label>
                <div className="input-group">
                  <span className="addon">$</span>
                  <input type="number" value={savingsNow} onChange={(e) => setSavingsNow(Number(e.target.value))} />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="field">
                <label>Future retirement savings</label>
                <div className="input-group">
                  {futureSavingsMode === "pct" ? (
                    <>
                      <input type="number" value={futureSavingsPct} onChange={(e) => setFutureSavingsPct(Number(e.target.value))} />
                      <select value={futureSavingsMode} onChange={(e) => setFutureSavingsMode(e.target.value)}>
                        <option value="pct">%</option>
                        <option value="amount">$</option>
                      </select>
                      <span className="addon">of income</span>
                    </>
                  ) : (
                    <>
                      <span className="addon">$</span>
                      <input type="number" value={futureSavingsAmount} onChange={(e) => setFutureSavingsAmount(Number(e.target.value))} />
                      <select value={futureSavingsMode} onChange={(e) => setFutureSavingsMode(e.target.value)}>
                        <option value="pct">%</option>
                        <option value="amount">$</option>
                      </select>
                      <span className="addon">/month</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="row two" style={{ alignItems: "center" }}>
              <button className="btn-primary" type="button" onClick={() => setShowS1(true)}>
                Calculate
              </button>
              <button className="btn-secondary" type="button" onClick={clearS1}>
                Clear
              </button>
            </div>
          </div>

          {/* Right (Results) */}
          <div className="card">
            {/* ✅ MODIFIED: calculator.net results */}
            {!s1 ? (
              <p className="muted">Click Calculate to see results.</p>
            ) : (
              <>
                <ResultBar />

                <p style={{ margin: "0 0 8px" }}>
                  You will need about{" "}
                  <b>{formatMoney(round2(s1.requiredNestEggNominalAtRetire), currency)}</b> at age{" "}
                  <b>{ageRetire}</b> to retire.
                </p>

                <p style={{ margin: 0 }}>
                  Based on your current plan, you will have about{" "}
                  <b>{formatMoney(round2(s1.projectedSavingsAtRetire), currency)}</b> at age{" "}
                  <b>{ageRetire}</b>,{" "}
                  {s1.projectedSavingsAtRetire < s1.requiredNestEggNominalAtRetire
                    ? "which is less than what you need for retirement."
                    : "which is more than what you need for retirement."}
                </p>

                <TwoBar
                  have={round2(s1.projectedSavingsAtRetire)}
                  need={round2(s1.requiredNestEggNominalAtRetire)}
                  currency={currency}
                />

                {/* ✅ ADDED: After retirement tables (Actual vs Today's money) */}
                {(() => {
                  const yearsToRetire = s1.yearsToRetire;
                  const yearsInRet = s1.yearsInRetirement;

                  const rNom = clamp(avgReturnPct, -50, 50) / 100;
                  const inf = clamp(inflationPct, -20, 20) / 100;
                  const monthsInRet = yearsToMonths(yearsInRet);

                  const rNomM = rNom / 12;

                  // payment from PV (nominal)
                  const payFromHaveNom = pmtFromPV(s1.projectedSavingsAtRetire, rNomM, monthsInRet);
                  const payFromNeedNom = pmtFromPV(s1.requiredNestEggNominalAtRetire, rNomM, monthsInRet);

                  // "today's money" deflator
                  const deflator = yearsToRetire > 0 ? Math.pow(1 + inf, yearsToRetire) : 1;
                  const payFromHaveToday = payFromHaveNom / deflator;
                  const payFromNeedToday = payFromNeedNom / deflator;

                  return (
                    <div style={{ marginTop: 14 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
                        <div>
                          <b>
                            After retirement (if saved{" "}
                            {formatMoney(round2(s1.projectedSavingsAtRetire), currency)}):
                          </b>
                          <table className="table" style={{ marginTop: 6 }}>
                            <thead>
                              <tr>
                                <th></th>
                                <th style={{ textAlign: "right" }}>Actual amount</th>
                                <th style={{ textAlign: "right" }}>Today's money</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>Income</td>
                                <td style={{ textAlign: "right" }}>
                                  {formatMoney(round2(payFromHaveNom), currency)}/month
                                </td>
                                <td style={{ textAlign: "right" }}>
                                  {formatMoney(round2(payFromHaveToday), currency)}/month
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <div>
                          <b>
                            After retirement (if saved{" "}
                            {formatMoney(round2(s1.requiredNestEggNominalAtRetire), currency)}):
                          </b>
                          <table className="table" style={{ marginTop: 6 }}>
                            <thead>
                              <tr>
                                <th></th>
                                <th style={{ textAlign: "right" }}>Actual amount</th>
                                <th style={{ textAlign: "right" }}>Today's money</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>Income</td>
                                <td style={{ textAlign: "right" }}>
                                  {formatMoney(round2(payFromNeedNom), currency)}/month
                                </td>
                                <td style={{ textAlign: "right" }}>
                                  {formatMoney(round2(payFromNeedToday), currency)}/month
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ===== SECTION 2 ===== */}
      <section className="card" style={{ marginBottom: 18 }}>
        <h2 className="card-title">How can you save for retirement?</h2>

        <div className="row two">
          <div className="field">
            <label>Your age now</label>
            <input type="number" value={s2AgeNow} onChange={(e) => setS2AgeNow(Number(e.target.value))} />
          </div>
          <div className="field">
            <label>Your planned retirement age</label>
            <input type="number" value={s2AgeRetire} onChange={(e) => setS2AgeRetire(Number(e.target.value))} />
          </div>
        </div>

        <div className="row two">
          <div className="field">
            <label>Amount needed at the retirement age</label>
            <div className="input-group">
              <span className="addon">$</span>
              <input type="number" value={s2NeedAtRetire} onChange={(e) => setS2NeedAtRetire(Number(e.target.value))} />
            </div>
          </div>

          <div className="field">
            <label>Your retirement savings now</label>
            <div className="input-group">
              <span className="addon">$</span>
              <input type="number" value={s2SavingsNow} onChange={(e) => setS2SavingsNow(Number(e.target.value))} />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="field">
            <label>Average investment return</label>
            <div className="input-group">
              <input type="number" value={s2ReturnPct} onChange={(e) => setS2ReturnPct(Number(e.target.value))} />
              <span className="addon">%/year</span>
            </div>
          </div>
        </div>

        <div className="row two" style={{ alignItems: "center" }}>
          <button className="btn-primary" type="button" onClick={() => setShowS2(true)}>
            Calculate
          </button>
          <button className="btn-secondary" type="button" onClick={clearS2}>
            Clear
          </button>
        </div>

        {/* ✅ MODIFIED: calculator.net style section 2 results */}
        {showS2 && (
          <>
            <ResultBar />

            {(() => {
              const A0 = clamp(s2AgeNow, 0, 120);
              const AR = clamp(s2AgeRetire, 0, 120);
              const yearsToRet = clamp(AR - A0, 0, 90);
              const months = yearsToMonths(yearsToRet);

              const target = clamp(s2NeedAtRetire, 0, 1e12);
              const start = clamp(s2SavingsNow, 0, 1e12);

              const rNom = clamp(s2ReturnPct, -50, 50) / 100;
              const rM = rNom / 12;

              if (!months) return <p className="muted">Enter valid ages to see results.</p>;

              const fvStart = fv(start, rM, months, 0);
              const rem = Math.max(0, target - fvStart);

              // Monthly plan
              const saveMonthly =
                rM === 0 ? rem / months : (rem * rM) / (Math.pow(1 + rM, months) - 1);

              const principalMonthly = start + saveMonthly * months;
              const interestMonthly = target - principalMonthly;

              // Yearly plan
              const rY = rNom;
              const fvStartY = start * Math.pow(1 + rY, yearsToRet);
              const remY = Math.max(0, target - fvStartY);
              const saveYearly =
                rY === 0 ? remY / yearsToRet : (remY * rY) / (Math.pow(1 + rY, yearsToRet) - 1);

              const principalYearly = start + saveYearly * yearsToRet;
              const interestYearly = target - principalYearly;

              // Have it now
              const additionalNeeded = Math.max(0, target - start);
              const principalHaveNow = start;
              const interestHaveNow = target - start;

              const blockTitle = (t) => (
                <div style={{ marginTop: 10, padding: "6px 10px", borderRadius: 10, background: "rgba(255,255,255,0.06)", fontWeight: 900 }}>
                  {t}
                </div>
              );

              const line = (label, value) => (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                  <div>{label}</div>
                  <div><b>{value}</b></div>
                </div>
              );

              return (
                <>
                  <p style={{ marginTop: -4 }}>
                    Following one of savings plans below will help you accumulate{" "}
                    <b>{formatMoney(round2(target), currency)}</b> at the retirement age of <b>{AR}</b>.
                  </p>

                  <div style={{ maxWidth: 520 }}>
                    {blockTitle(`If you save every month until ${AR}`)}
                    {line("Amount to Save Every Month:", formatMoney(round2(saveMonthly), currency))}
                    {line("Total Principal:", formatMoney(round2(principalMonthly), currency))}
                    {line("Total Interest:", formatMoney(round2(interestMonthly), currency))}

                    {blockTitle(`If you save every year until ${AR}`)}
                    {line("Amount to Save Every Year:", formatMoney(round2(saveYearly), currency))}
                    {line("Total Principal:", formatMoney(round2(principalYearly), currency))}
                    {line("Total Interest:", formatMoney(round2(interestYearly), currency))}

                    {blockTitle("If you have it now")}
                    {line("Additional Amount Needed:", formatMoney(round2(additionalNeeded), currency))}
                    {line("Total Principal:", formatMoney(round2(principalHaveNow), currency))}
                    {line("Total Interest:", formatMoney(round2(interestHaveNow), currency))}
                  </div>
                </>
              );
            })()}
          </>
        )}
      </section>

      {/* ===== SECTION 3 ===== */}
      <section className="card" style={{ marginBottom: 18 }}>
        <h2 className="card-title">How much can you withdraw after retirement?</h2>

        <div className="row two">
          <div className="field">
            <label>Your age now</label>
            <input type="number" value={wAgeNow} onChange={(e) => setWAgeNow(Number(e.target.value))} />
          </div>
          <div className="field">
            <label>Your planned retirement age</label>
            <input type="number" value={wAgeRetire} onChange={(e) => setWAgeRetire(Number(e.target.value))} />
          </div>
        </div>

        <div className="row two">
          <div className="field">
            <label>Your life expectancy</label>
            <input type="number" value={wLifeExp} onChange={(e) => setWLifeExp(Number(e.target.value))} />
          </div>

          <div className="field">
            <label>Your retirement savings today</label>
            <div className="input-group">
              <span className="addon">$</span>
              <input type="number" value={wSavingsToday} onChange={(e) => setWSavingsToday(Number(e.target.value))} />
            </div>
          </div>
        </div>

        <div className="row two">
          <div className="field">
            <label>Annual contribution</label>
            <div className="input-group">
              <span className="addon">$</span>
              <input type="number" value={wAnnualContrib} onChange={(e) => setWAnnualContrib(Number(e.target.value))} />
              <span className="addon">/year</span>
            </div>
          </div>
          <div className="field">
            <label>Monthly contribution</label>
            <div className="input-group">
              <span className="addon">$</span>
              <input type="number" value={wMonthlyContrib} onChange={(e) => setWMonthlyContrib(Number(e.target.value))} />
              <span className="addon">/month</span>
            </div>
          </div>
        </div>

        <div className="row two">
          <div className="field">
            <label>Average investment return</label>
            <div className="input-group">
              <input type="number" value={wReturnPct} onChange={(e) => setWReturnPct(Number(e.target.value))} />
              <span className="addon">%/year</span>
            </div>
          </div>
          <div className="field">
            <label>Inflation rate (annual)</label>
            <div className="input-group">
              <input type="number" value={wInflationPct} onChange={(e) => setWInflationPct(Number(e.target.value))} />
              <span className="addon">%/year</span>
            </div>
          </div>
        </div>

        <div className="row two" style={{ alignItems: "center" }}>
          <button className="btn-primary" type="button" onClick={() => setShowS3(true)}>
            Calculate
          </button>
          <button className="btn-secondary" type="button" onClick={clearS3}>
            Clear
          </button>
        </div>

        {/* ✅ MODIFIED: calculator.net style section 3 results */}
        {showS3 && (
          <>
            <ResultBar />

            {(() => {
              const yearsToRetire = Math.max(0, wAgeRetire - wAgeNow);
              const yearsInRet = Math.max(0, wLifeExp - wAgeRetire);

              const rNom = clamp(wReturnPct, -50, 50) / 100;
              const inf = clamp(wInflationPct, -20, 20) / 100;
              const rReal = (1 + rNom) / (1 + inf) - 1;

              const rNomM = rNom / 12;
              const rRealM = rReal / 12;

              const monthsToRet = yearsToMonths(yearsToRetire);
              const monthsInRet = yearsToMonths(yearsInRet);

              const saved = clamp(wSavingsToday, 0, 1e12);
              const annualContrib = clamp(wAnnualContrib, 0, 1e12);
              const monthlyContrib = clamp(wMonthlyContrib, 0, 1e12);
              const totalMonthlyContrib = monthlyContrib + annualContrib / 12;

              const balanceAtRetireNom = fv(saved, rNomM, monthsToRet, totalMonthlyContrib);

              const deflator67 = yearsToRetire > 0 ? Math.pow(1 + inf, yearsToRetire) : 1;
              const balanceTodayMoney = balanceAtRetireNom / deflator67;

              // fixed purchasing power: compute real withdrawal monthly, then show nominal at retirement
              const withdrawRealMonthly = pmtFromPV(balanceTodayMoney, rRealM, monthsInRet);
              const withdrawNomMonthlyAtRetire = withdrawRealMonthly * deflator67;

              // fixed amount: compute nominal withdrawal, show today's dollars at age 67 and 85
              const withdrawFixedNom = pmtFromPV(balanceAtRetireNom, rNomM, monthsInRet);
              const withdrawFixedTodayAt67 = withdrawFixedNom / deflator67;

              const deflator85 = (wLifeExp - wAgeNow) > 0 ? Math.pow(1 + inf, (wLifeExp - wAgeNow)) : 1;
              const withdrawFixedTodayAt85 = withdrawFixedNom / deflator85;

              return (
                <div style={{ maxWidth: 720 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div><b>Balance at the retirement age of {wAgeRetire}:</b></div>
                    <div><b>{formatMoney(round2(balanceAtRetireNom), currency)}</b></div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <div>Equivalent to current purchase power of:</div>
                    <div>{formatMoney(round2(balanceTodayMoney), currency)}</div>
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <b>If withdraw at fixed purchasing power amount after retirement</b>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                      <div>
                        The amount you can withdraw monthly at {wAgeRetire} and increase {wInflationPct}% annually:
                      </div>
                      <div><b>{formatMoney(round2(withdrawNomMonthlyAtRetire), currency)}</b></div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div>It is equivalent to current purchase power of:</div>
                      <div>{formatMoney(round2(withdrawRealMonthly), currency)}</div>
                    </div>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <b>If withdraw at fixed amount after retirement</b>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                      <div>The amount you can withdraw monthly from {wAgeRetire} to {wLifeExp}:</div>
                      <div><b>{formatMoney(round2(withdrawFixedNom), currency)}</b></div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div>At age {wAgeRetire}, equivalent to current purchase power of:</div>
                      <div>{formatMoney(round2(withdrawFixedTodayAt67), currency)}</div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div>At age {wLifeExp}, equivalent to current purchase power of:</div>
                      <div>{formatMoney(round2(withdrawFixedTodayAt85), currency)}</div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </section>

      {/* ===== SECTION 4 ===== */}
      <section className="card">
        <h2 className="card-title">How long can your money last?</h2>

        <div className="row two">
          <div className="field">
            <label>The amount you have</label>
            <div className="input-group">
              <span className="addon">$</span>
              <input type="number" value={lumpSum} onChange={(e) => setLumpSum(Number(e.target.value))} />
            </div>
          </div>
          <div className="field">
            <label>You plan to withdraw</label>
            <div className="input-group">
              <span className="addon">$</span>
              <input type="number" value={withdrawMonthly} onChange={(e) => setWithdrawMonthly(Number(e.target.value))} />
              <span className="addon">/month</span>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="field">
            <label>Average investment return</label>
            <div className="input-group">
              <input type="number" value={lReturnPct} onChange={(e) => setLReturnPct(Number(e.target.value))} />
              <span className="addon">%/year</span>
            </div>
          </div>
        </div>

        <div className="row two" style={{ alignItems: "center" }}>
          <button className="btn-primary" type="button" onClick={() => setShowS4(true)}>
            Calculate
          </button>
          <button className="btn-secondary" type="button" onClick={clearS4}>
            Clear
          </button>
        </div>

        {/* ✅ MODIFIED: calculator.net style section 4 results */}
        {showS4 && (
          <>
            <ResultBar />

            {(() => {
              const B = clamp(lumpSum, 0, 1e12);
              const w = clamp(withdrawMonthly, 0, 1e12);
              const rNom = clamp(lReturnPct, -50, 50) / 100;
              const rM = rNom / 12;

              const months = payoffMonthsFromWithdrawal(B, w, rM);

              if (months === Infinity) {
                return <p className="muted">With these settings, your balance may not run out (growth ≥ withdrawal).</p>;
              }

              const years = months / 12;
              const y = Math.floor(years);
              const m = round2((years - y) * 12);

              const rows = Array.from({ length: 8 }, (_, i) => {
                const yearsLen = i + 1;
                const monthsLen = yearsLen * 12;
                const amount = pmtFromPV(B, rM, monthsLen);
                return { yearsLen, amount };
              });

              return (
                <div style={{ maxWidth: 720 }}>
                  <p style={{ marginTop: -4 }}>
                    If withdraw <b>{formatMoney(round2(w), currency)}</b> per month,{" "}
                    <b>{formatMoney(round2(B), currency)}</b> can last{" "}
                    <b>{y} years and {m} months</b>.
                  </p>

                  <p style={{ marginTop: 10 }}>
                    The following are some other withdraw amount/length schedules.
                  </p>

                  <table className="table" style={{ maxWidth: 420 }}>
                    <thead>
                      <tr>
                        <th>Withdraw length</th>
                        <th style={{ textAlign: "right" }}>Withdraw amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.yearsLen}>
                          <td>{r.yearsLen} years</td>
                          <td style={{ textAlign: "right" }}>
                            {formatMoney(round2(r.amount), currency)}/month
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </>
        )}
      </section>
    </div>
  );
}
