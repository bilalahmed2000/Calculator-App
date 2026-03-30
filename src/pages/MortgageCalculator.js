import React, { useRef, useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

/* ── helpers ── */
const ccy = (n) => {
  if (!isFinite(n) || isNaN(n)) return "—";
  const s = n < 0 ? "-" : "";
  return s + "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const parseN = (s) => { const v = parseFloat(String(s ?? "").replace(/,/g, "")); return isNaN(v) ? 0 : v; };
const pct = (n) => isFinite(n) ? n.toFixed(2) + "%" : "—";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const TODAY  = new Date();

/* ══════════════════════════════════════════
   SVG DONUT CHART
══════════════════════════════════════════ */
const _pt = (cx, cy, r, deg) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};
const _f = (n) => n.toFixed(3);

function DonutChart({ slices, centerLabel, centerSub }) {
  const total = slices.reduce((s, sl) => s + (sl.value || 0), 0);
  if (!total) return null;
  const [cx, cy, ro, ri] = [100, 100, 80, 50];
  const active = slices.filter((s) => s.value > 0);

  if (active.length === 1) {
    return (
      <svg viewBox="0 0 200 200" style={{ width: 180, height: 180 }}>
        <circle cx={cx} cy={cy} r={ro} fill={active[0].color} />
        <circle cx={cx} cy={cy} r={ri} fill="#fff" />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize={10} fill="#1e1b4b" fontWeight="800">{centerLabel}</text>
        <text x={cx} y={cy + 13} textAnchor="middle" fontSize={9} fill="#6b7a9e">{centerSub}</text>
      </svg>
    );
  }

  let deg = 0;
  const paths = active.map((sl, i) => {
    const sweep = Math.min((sl.value / total) * 360, 359.999);
    const end   = deg + sweep;
    const [ox1, oy1] = _pt(cx, cy, ro, deg);
    const [ox2, oy2] = _pt(cx, cy, ro, end);
    const [ix1, iy1] = _pt(cx, cy, ri, end);
    const [ix2, iy2] = _pt(cx, cy, ri, deg);
    const lg = sweep > 180 ? 1 : 0;
    const d  = `M${_f(ox1)} ${_f(oy1)} A${ro} ${ro} 0 ${lg} 1 ${_f(ox2)} ${_f(oy2)} L${_f(ix1)} ${_f(iy1)} A${ri} ${ri} 0 ${lg} 0 ${_f(ix2)} ${_f(iy2)}Z`;
    deg = end;
    return <path key={i} d={d} fill={sl.color} stroke="#fff" strokeWidth={1.5} />;
  });

  return (
    <svg viewBox="0 0 200 200" style={{ width: 180, height: 180 }}>
      {paths}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize={10} fill="#1e1b4b" fontWeight="800">{centerLabel}</text>
      <text x={cx} y={cy + 13} textAnchor="middle" fontSize={9} fill="#6b7a9e">{centerSub}</text>
    </svg>
  );
}

/* ══════════════════════════════════════════
   SVG BALANCE / INTEREST CHART
══════════════════════════════════════════ */
function BalanceChart({ annual }) {
  if (!annual || annual.length < 2) return null;
  const W = 580, H = 230, PL = 72, PB = 34, PT = 26, PR = 18;
  const cW = W - PL - PR, cH = H - PB - PT;
  const n  = annual.length;

  const maxVal = Math.max(
    annual[0]?.startBalance ?? 0,
    ...annual.map((r) => r.cumInterest ?? 0)
  ) * 1.08 || 1;

  const toX = (i) => PL + (i / Math.max(n - 1, 1)) * cW;
  const toY = (v) => PT + cH - (Math.max(v, 0) / maxVal) * cH;

  const balPts = annual.map((r, i) => `${toX(i).toFixed(1)},${toY(r.endBalance).toFixed(1)}`).join(" ");
  const intPts = annual.map((r, i) => `${toX(i).toFixed(1)},${toY(r.cumInterest).toFixed(1)}`).join(" ");

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((p) => ({ v: maxVal * p, y: toY(maxVal * p) }));
  const step   = Math.max(1, Math.floor(n / 7));
  const xLbls  = annual
    .filter((_, i) => i === 0 || i % step === 0 || i === n - 1)
    .map((r, _, arr) => ({ label: String(r.year), x: toX(annual.indexOf(r)) }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, height: "auto", display: "block" }}>
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={PL} y1={t.y} x2={W - PR} y2={t.y} stroke="#f1f0fe" strokeWidth={1} />
          <text x={PL - 6} y={t.y + 3.5} textAnchor="end" fontSize={8.5} fill="#9ca3af">
            {t.v >= 1e6 ? `${(t.v / 1e6).toFixed(1)}M` : t.v >= 1000 ? `${(t.v / 1000).toFixed(0)}k` : t.v.toFixed(0)}
          </text>
        </g>
      ))}
      <line x1={PL} y1={PT} x2={PL} y2={H - PB} stroke="#e5e7eb" strokeWidth={1} />
      <line x1={PL} y1={H - PB} x2={W - PR} y2={H - PB} stroke="#e5e7eb" strokeWidth={1} />
      <polyline points={balPts} fill="none" stroke="#4f46e5" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={intPts} fill="none" stroke="#f59e0b" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {xLbls.map((xl, i) => (
        <text key={i} x={xl.x} y={H - PB + 14} textAnchor="middle" fontSize={8.5} fill="#9ca3af">{xl.label}</text>
      ))}
      <rect x={PL + 4}   y={PT + 2} width={13} height={4} rx={2} fill="#4f46e5" />
      <text x={PL + 22}  y={PT + 6} fontSize={9} fill="#4b5280">Remaining Balance</text>
      <rect x={PL + 142} y={PT + 2} width={13} height={4} rx={2} fill="#f59e0b" />
      <text x={PL + 160} y={PT + 6} fontSize={9} fill="#4b5280">Cumulative Interest</text>
    </svg>
  );
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function MortgageCalculator() {
  /* ── core ── */
  const [homePrice,  setHomePrice]  = useState("300,000");
  const [dpValue,    setDpValue]    = useState("20");
  const [dpUnit,     setDpUnit]     = useState("%");
  const [loanTerm,   setLoanTerm]   = useState("30");
  const [rate,       setRate]       = useState("6.500");
  const [startMonth, setStartMonth] = useState(String(TODAY.getMonth() + 1));
  const [startYear,  setStartYear]  = useState(String(TODAY.getFullYear()));

  /* ── taxes & costs ── */
  const [inclTax,     setInclTax]     = useState(false);
  const [propTax,     setPropTax]     = useState("1.2");
  const [propTaxUnit, setPropTaxUnit] = useState("%");
  const [homeIns,     setHomeIns]     = useState("1,200");
  const [homeInsUnit, setHomeInsUnit] = useState("$");
  const [pmiVal,      setPmiVal]      = useState("0");
  const [pmiUnit,     setPmiUnit]     = useState("$");
  const [hoaVal,      setHoaVal]      = useState("0");
  const [hoaUnit,     setHoaUnit]     = useState("$");
  const [otherVal,    setOtherVal]    = useState("0");
  const [otherUnit,   setOtherUnit]   = useState("$");

  /* ── more options ── */
  const [moreOpts,  setMoreOpts]  = useState(false);
  const [extraMo,   setExtraMo]   = useState("0");
  const [extraYr,   setExtraYr]   = useState("0");
  const [extraOnce, setExtraOnce] = useState("0");
  const [onceMonth, setOnceMonth] = useState(String(TODAY.getMonth() + 1));
  const [onceYear,  setOnceYear]  = useState(String(TODAY.getFullYear() + 1));

  /* ── output ── */
  const [result,  setResult]  = useState(null);
  const [err,     setErr]     = useState("");
  const [amorTab, setAmorTab] = useState("annual");
  const schedRef = useRef(null);

  /* ── derived dp ── */
  const hp    = parseN(homePrice);
  const dpAmt = dpUnit === "%" ? hp * parseN(dpValue) / 100 : parseN(dpValue);
  const dpPct = hp > 0 ? (dpAmt / hp) * 100 : 0;

  /* ── calculate ── */
  const calculate = () => {
    setErr("");
    const hpv = parseN(homePrice);
    const r   = parseN(rate);
    const n   = Math.round(parseN(loanTerm)) * 12;
    const sm  = parseInt(startMonth, 10);
    const sy  = parseInt(startYear,  10);
    const dp  = dpUnit === "%" ? hpv * parseN(dpValue) / 100 : parseN(dpValue);

    if (!(hpv > 0))  { setErr("Home price must be greater than 0."); return; }
    if (dp < 0)      { setErr("Down payment cannot be negative."); return; }
    if (dp >= hpv)   { setErr("Down payment must be less than home price."); return; }
    if (r  < 0)      { setErr("Interest rate cannot be negative."); return; }
    if (n  <= 0)     { setErr("Loan term must be at least 1 year."); return; }

    const principal = hpv - dp;
    const mr = r / 100 / 12;
    const pi = mr === 0
      ? principal / n
      : (principal * mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);

    /* monthly costs */
    const toMo = (val, unit) => unit === "%" ? (parseN(val) / 100 * hpv) / 12 : parseN(val) / 12;
    const mTax   = inclTax ? toMo(propTax, propTaxUnit) : 0;
    const mIns   = inclTax ? toMo(homeIns, homeInsUnit) : 0;
    const mPmi   = inclTax ? toMo(pmiVal,  pmiUnit)    : 0;
    const mHoa   = inclTax ? toMo(hoaVal,  hoaUnit)    : 0;
    const mOther = inclTax ? toMo(otherVal, otherUnit)  : 0;
    const monthlyTotal = pi + mTax + mIns + mPmi + mHoa + mOther;

    /* extra payments */
    const eMo   = Math.max(0, parseN(extraMo));
    const eYr   = Math.max(0, parseN(extraYr));
    const eOnce = Math.max(0, parseN(extraOnce));
    const eOM   = parseInt(onceMonth, 10);
    const eOY   = parseInt(onceYear,  10);

    /* build payment-by-payment schedule */
    let balance = principal, cumInt = 0;
    const rows = [];

    for (let i = 0; i < n && balance > 0.005; i++) {
      const date  = new Date(sy, sm - 1 + i);
      const mo    = date.getMonth() + 1;
      const yr    = date.getFullYear();
      const intP  = balance * mr;
      let prinP   = mr === 0 ? pi : pi - intP;
      if (prinP < 0) prinP = 0;

      let extra = eMo;
      if (i > 0 && (i + 1) % 12 === 0) extra += eYr;          // once per year
      if (yr === eOY && mo === eOM)      extra += eOnce;        // one-time

      const totalPrin = Math.min(prinP + extra, balance);
      balance  = Math.max(balance - totalPrin, 0);
      cumInt  += intP;

      rows.push({ n: i + 1, date, mo, yr, interest: intP, principal: totalPrin, extra, endBalance: balance, cumInterest: cumInt });
      if (balance <= 0) break;
    }

    /* annual aggregation */
    const byYear = {};
    rows.forEach((r) => { (byYear[r.yr] = byYear[r.yr] || []).push(r); });

    let runCumInt = 0;
    const annual = Object.entries(byYear).map(([yr, rws]) => {
      const totInt  = rws.reduce((s, r) => s + r.interest,  0);
      const totPrin = rws.reduce((s, r) => s + r.principal, 0);
      runCumInt += totInt;
      return { year: +yr, interest: totInt, principal: totPrin, endBalance: rws[rws.length - 1].endBalance, cumInterest: runCumInt };
    });
    annual.forEach((a, i) => { a.startBalance = i === 0 ? principal : annual[i - 1].endBalance; });

    const last        = rows[rows.length - 1];
    const payoffStr   = last ? `${MONTHS[last.date.getMonth()]} ${last.date.getFullYear()}` : "—";
    const totalInterest = rows.reduce((s, r) => s + r.interest, 0);
    const hasExtra    = eMo > 0 || eYr > 0 || eOnce > 0;

    setResult({ pi, mTax, mIns, mPmi, mHoa, mOther, monthlyTotal, rows, annual, hp: hpv, dp, principal, n, payoffStr, totalInterest, eMo, eYr, eOnce, hasExtra });
  };

  const clear = () => {
    setHomePrice("300,000"); setDpValue("20"); setDpUnit("%");
    setLoanTerm("30"); setRate("6.500");
    setStartMonth(String(TODAY.getMonth() + 1)); setStartYear(String(TODAY.getFullYear()));
    setInclTax(false);
    setPropTax("1.2"); setPropTaxUnit("%"); setHomeIns("1,200"); setHomeInsUnit("$");
    setPmiVal("0"); setPmiUnit("$"); setHoaVal("0"); setHoaUnit("$"); setOtherVal("0"); setOtherUnit("$");
    setExtraMo("0"); setExtraYr("0"); setExtraOnce("0");
    setOnceMonth(String(TODAY.getMonth() + 1)); setOnceYear(String(TODAY.getFullYear() + 1));
    setResult(null); setErr(""); setAmorTab("annual");
  };

  /* ── donut slices ── */
  const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#a78bfa", "#34d399", "#fb7185"];
  const slices = result ? [
    { label: "Principal & Interest", value: result.pi,     color: COLORS[0] },
    { label: "Property Tax",         value: result.mTax,   color: COLORS[1] },
    { label: "Home Insurance",       value: result.mIns,   color: COLORS[2] },
    { label: "PMI Insurance",        value: result.mPmi,   color: COLORS[3] },
    { label: "HOA Fee",              value: result.mHoa,   color: COLORS[4] },
    { label: "Other Costs",          value: result.mOther, color: COLORS[5] },
  ].filter((s) => s.value > 0.005) : [];

  /* ── style atoms ── */
  const ist  = { width: "100%", background: "#f8f9ff", color: "#1e1b4b", border: "1.5px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: "9px 12px", fontSize: 14, fontWeight: 600, outline: "none", boxSizing: "border-box" };
  const lst  = { display: "block", fontSize: 11, fontWeight: 700, color: "#6b7a9e", marginBottom: 5, letterSpacing: "0.4px", textTransform: "uppercase" };
  const fst  = { marginBottom: 12 };
  const sym  = { color: "#6b7a9e", fontWeight: 700, flexShrink: 0 };
  const selS = { ...ist, width: 58, padding: "9px 4px", cursor: "pointer", flexShrink: 0, textAlign: "center" };
  const row  = (children, xtra = {}) => <div style={{ display: "flex", alignItems: "center", gap: 6, ...xtra }}>{children}</div>;

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Mortgage Calculator</h1>
        <p className="muted">Estimate monthly payments, total interest, taxes, and view a complete amortization schedule — with support for extra payments.</p>
      </header>

      <div style={{ maxWidth: 1120, margin: "0 auto" }}>

        {/* ══ FORM + RESULTS (top row) ══ */}
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 20 }}>

          {/* ─── INPUT FORM ─── */}
          <section className="card" style={{ flex: "0 0 312px", minWidth: 268 }}>

            {/* Home Price */}
            <div style={fst}>
              <label style={lst}>Home Price</label>
              {row(<>
                <span style={sym}>$</span>
                <input style={ist} value={homePrice}
                  onChange={(e) => setHomePrice(e.target.value)}
                  onBlur={(e) => { const v = parseN(e.target.value); if (v > 0) setHomePrice(v.toLocaleString("en-US", { maximumFractionDigits: 0 })); }} />
              </>)}
            </div>

            {/* Down Payment */}
            <div style={fst}>
              <label style={lst}>Down Payment</label>
              {row(<>
                {dpUnit === "$" && <span style={sym}>$</span>}
                <input
                  style={{ ...ist, textAlign: dpUnit === "%" ? "right" : "left" }}
                  value={dpValue}
                  onChange={(e) => setDpValue(e.target.value)}
                  onBlur={(e) => {
                    const v = parseN(e.target.value);
                    setDpValue(dpUnit === "%" ? v.toFixed(2) : v.toLocaleString("en-US", { maximumFractionDigits: 0 }));
                  }} />
                <select style={selS} value={dpUnit} onChange={(e) => setDpUnit(e.target.value)}>
                  <option value="%">%</option>
                  <option value="$">$</option>
                </select>
              </>)}
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                {dpUnit === "%" ? `= ${ccy(dpAmt)}` : `= ${pct(dpPct)} of home price`}
              </div>
            </div>

            {/* Loan Term */}
            <div style={fst}>
              <label style={lst}>Loan Term</label>
              {row(<>
                <input style={{ ...ist, width: 82, textAlign: "center" }} type="number" min="1" max="50" value={loanTerm} onChange={(e) => setLoanTerm(e.target.value)} />
                <span style={{ color: "#4b5280", fontWeight: 600, flexShrink: 0 }}>Years</span>
              </>)}
            </div>

            {/* Interest Rate */}
            <div style={fst}>
              <label style={lst}>Interest Rate (APR)</label>
              {row(<>
                <input style={{ ...ist, textAlign: "right" }} value={rate} onChange={(e) => setRate(e.target.value)} />
                <span style={sym}>%</span>
              </>)}
            </div>

            {/* Start Date */}
            <div style={fst}>
              <label style={lst}>Start Date</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 84px", gap: 8 }}>
                <select style={{ ...ist, cursor: "pointer" }} value={startMonth} onChange={(e) => setStartMonth(e.target.value)}>
                  {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
                <input style={{ ...ist, textAlign: "center" }} type="number" min="2000" max="2100" value={startYear} onChange={(e) => setStartYear(e.target.value)} />
              </div>
            </div>

            {/* ── Include Taxes & Costs ── */}
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 10 }}>
              <input type="checkbox" checked={inclTax} onChange={(e) => setInclTax(e.target.checked)} style={{ accentColor: "#6366f1", width: 14, height: 14 }} />
              Include Taxes &amp; Costs Below
            </label>

            {inclTax && (
              <div style={{ borderTop: "1px dashed rgba(99,102,241,0.2)", paddingTop: 14, marginBottom: 4 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
                  Annual Tax &amp; Cost
                </div>
                {[
                  { label: "Property Taxes", val: propTax,  set: setPropTax,  unit: propTaxUnit, setUnit: setPropTaxUnit },
                  { label: "Home Insurance", val: homeIns,  set: setHomeIns,  unit: homeInsUnit, setUnit: setHomeInsUnit },
                  { label: "PMI Insurance",  val: pmiVal,   set: setPmiVal,   unit: pmiUnit,     setUnit: setPmiUnit },
                  { label: "HOA Fee",        val: hoaVal,   set: setHoaVal,   unit: hoaUnit,     setUnit: setHoaUnit },
                  { label: "Other Costs",    val: otherVal, set: setOtherVal, unit: otherUnit,   setUnit: setOtherUnit },
                ].map(({ label, val, set, unit, setUnit }) => (
                  <div key={label} style={fst}>
                    <label style={lst}>{label}</label>
                    {row(<>
                      {unit === "$" && <span style={sym}>$</span>}
                      <input style={{ ...ist, textAlign: unit === "%" ? "right" : "left" }} value={val} onChange={(e) => set(e.target.value)} />
                      <select style={selS} value={unit} onChange={(e) => setUnit(e.target.value)}>
                        <option value="%">%</option>
                        <option value="$">$</option>
                      </select>
                    </>)}
                  </div>
                ))}
              </div>
            )}

            {/* ── More Options ── */}
            <button type="button" className="link-btn" style={{ display: "block", marginBottom: 10, fontSize: 13 }} onClick={() => setMoreOpts((v) => !v)}>
              {moreOpts ? "− Less Options" : "+ More Options"}
            </button>

            {moreOpts && (
              <div style={{ background: "#f5f3ff", borderRadius: 12, padding: "14px 14px 6px", marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
                  Extra Payments
                </div>

                <div style={fst}>
                  <label style={lst}>Extra Monthly Payment</label>
                  {row(<><span style={sym}>$</span><input style={ist} value={extraMo} onChange={(e) => setExtraMo(e.target.value)} /></>)}
                </div>

                <div style={fst}>
                  <label style={lst}>Extra Yearly Payment</label>
                  {row(<><span style={sym}>$</span><input style={ist} value={extraYr} onChange={(e) => setExtraYr(e.target.value)} /></>)}
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>Applied at every 12th payment</div>
                </div>

                <div style={fst}>
                  <label style={lst}>Extra One-Time Payment</label>
                  {row(<><span style={sym}>$</span><input style={ist} value={extraOnce} onChange={(e) => setExtraOnce(e.target.value)} /></>)}
                </div>

                <div style={{ ...fst, marginTop: 2 }}>
                  <label style={lst}>One-Time Payment Date</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 84px", gap: 8 }}>
                    <select style={{ ...ist, cursor: "pointer" }} value={onceMonth} onChange={(e) => setOnceMonth(e.target.value)}>
                      {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                    </select>
                    <input style={{ ...ist, textAlign: "center" }} type="number" min="2000" max="2100" value={onceYear} onChange={(e) => setOnceYear(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {err && <div className="rng-error" style={{ marginBottom: 12 }}>{err}</div>}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button className="btn" style={{ width: "100%" }} onClick={calculate}>Calculate</button>
              <button type="button" onClick={clear} style={{ width: "100%", padding: "9px", borderRadius: 12, border: "1.5px solid rgba(99,102,241,0.22)", background: "#fff", color: "#6b7a9e", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Clear</button>
            </div>
          </section>

          {/* ─── RESULTS ─── */}
          {result ? (
            <section className="card" style={{ flex: 1, minWidth: 300 }}>
              <div className="result-header" style={{ fontSize: 20, marginBottom: 20 }}>
                Monthly Pay: <strong>{ccy(result.monthlyTotal)}</strong>
              </div>

              <div style={{ display: "flex", gap: 30, flexWrap: "wrap", alignItems: "flex-start" }}>

                {/* Left: tables */}
                <div style={{ flex: 1, minWidth: 230 }}>
                  {/* Breakdown */}
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left",  padding: "0 0 8px",      color: "#6b7a9e", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px" }}> </th>
                        <th style={{ textAlign: "right", padding: "0 8px 8px 0",  color: "#6b7a9e", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px" }}>Monthly</th>
                        <th style={{ textAlign: "right", padding: "0 0 8px 8px",  color: "#6b7a9e", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px" }}>Total ({result.n / 12} yr)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: "Mortgage Payment",  v: result.pi     },
                        result.mTax   > 0.005 && { label: "Property Tax",    v: result.mTax   },
                        result.mIns   > 0.005 && { label: "Home Insurance",  v: result.mIns   },
                        result.mPmi   > 0.005 && { label: "PMI Insurance",   v: result.mPmi   },
                        result.mHoa   > 0.005 && { label: "HOA Fee",         v: result.mHoa   },
                        result.mOther > 0.005 && { label: "Other Costs",     v: result.mOther },
                      ].filter(Boolean).map((item, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid rgba(99,102,241,0.08)" }}>
                          <td style={{ padding: "8px 0",       fontWeight: 600, color: "#374151" }}>{item.label}</td>
                          <td style={{ padding: "8px 8px 8px 0", textAlign: "right", fontFamily: "monospace", color: "#1e1b4b", fontSize: 13 }}>{ccy(item.v)}</td>
                          <td style={{ padding: "8px 0 8px 8px", textAlign: "right", fontFamily: "monospace", color: "#1e1b4b", fontSize: 13 }}>{ccy(item.v * result.n)}</td>
                        </tr>
                      ))}
                      <tr style={{ background: "#f0eeff" }}>
                        <td style={{ padding: "9px 8px",      fontWeight: 800, color: "#312e81", borderRadius: "8px 0 0 8px" }}>Total Out-of-Pocket</td>
                        <td style={{ padding: "9px 8px 9px 0", textAlign: "right", fontFamily: "monospace", fontWeight: 800, color: "#312e81" }}>{ccy(result.monthlyTotal)}</td>
                        <td style={{ padding: "9px 0 9px 8px", textAlign: "right", fontFamily: "monospace", fontWeight: 800, color: "#312e81", borderRadius: "0 8px 8px 0" }}>{ccy(result.monthlyTotal * result.n)}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* House Price Summary */}
                  <div style={{ borderTop: "1px solid rgba(99,102,241,0.1)", marginTop: 22, paddingTop: 16 }}>
                    <div className="section-label" style={{ marginTop: 0 }}>House Price Summary</div>
                    <table className="kv-table">
                      <tbody>
                        <tr><td>House Price</td>                              <td>{ccy(result.hp)}</td></tr>
                        <tr><td>Loan Amount</td>                              <td>{ccy(result.principal)}</td></tr>
                        <tr><td>Down Payment</td>                             <td>{ccy(result.dp)} ({pct((result.dp / result.hp) * 100)})</td></tr>
                        <tr><td>Total of {result.n} Mortgage Payments</td>   <td>{ccy(result.pi * result.n)}</td></tr>
                        <tr><td>Total Interest Paid</td>                      <td>{ccy(result.totalInterest)}</td></tr>
                        <tr><td>Mortgage Payoff Date</td>                     <td style={{ fontFamily: "inherit", fontWeight: 600 }}>{result.payoffStr}</td></tr>
                      </tbody>
                    </table>
                  </div>

                  <button className="link-btn" style={{ marginTop: 14 }}
                    onClick={() => schedRef.current?.scrollIntoView({ behavior: "smooth" })}>
                    View Amortization Schedule ↓
                  </button>
                </div>

                {/* Right: Donut chart + legend */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <DonutChart slices={slices} centerLabel={ccy(result.monthlyTotal)} centerSub="per month" />
                  <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                    {slices.map((s, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                        <span style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                        <span style={{ color: "#4b5280" }}>{s.label}: <strong>{ccy(s.value)}</strong></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <section className="card" style={{ flex: 1, minWidth: 280, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 220 }}>
              <div style={{ textAlign: "center" }}>
                <svg viewBox="0 0 24 24" style={{ width: 54, height: 54, marginBottom: 14 }} fill="none" stroke="#c4b5fd" strokeWidth={1.4}>
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="9,22 9,12 15,12 15,22" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#9ca3af" }}>Fill in the form and press <strong>Calculate</strong></div>
              </div>
            </section>
          )}
        </div>

        {/* ══ AMORTIZATION SCHEDULE (lower half) ══ */}
        {result && (
          <section className="card" ref={schedRef} style={{ marginBottom: 28 }}>
            <h2 className="card-title" style={{ marginBottom: 6 }}>Amortization Schedule</h2>
            <p style={{ fontSize: 13, color: "#6b7a9e", marginBottom: 20 }}>
              Loan of {ccy(result.principal)} at {parseN(rate)}% APR over {result.n / 12} years.
              {result.hasExtra && " Includes extra payments — payoff accelerated."}
            </p>

            {/* Chart */}
            <div style={{ marginBottom: 24, padding: "0 2px", overflowX: "auto" }}>
              <BalanceChart annual={result.annual} />
            </div>

            {/* Chart legend note */}
            <div style={{ display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
              {[
                { color: "#4f46e5", label: "Remaining Balance" },
                { color: "#f59e0b", label: "Cumulative Interest Paid" },
              ].map((l) => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6b7a9e" }}>
                  <span style={{ width: 24, height: 4, borderRadius: 2, background: l.color, flexShrink: 0 }} />
                  {l.label}
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="tab-row">
              <button className={`tab-btn${amorTab === "annual"  ? " active" : ""}`} onClick={() => setAmorTab("annual")}>Annual Schedule</button>
              <button className={`tab-btn${amorTab === "monthly" ? " active" : ""}`} onClick={() => setAmorTab("monthly")}>Monthly Schedule</button>
            </div>

            {/* Table */}
            <div className="table-scroll" style={{ marginTop: 14 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Date</th>
                    <th>Interest</th>
                    <th>Principal</th>
                    {result.hasExtra && <th>Extra Payment</th>}
                    <th>Ending Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {amorTab === "annual"
                    ? result.annual.map((r, i) => (
                        <tr key={i}>
                          <td>{r.year}</td>
                          <td>Dec {r.year}</td>
                          <td>{ccy(r.interest)}</td>
                          <td>{ccy(r.principal)}</td>
                          {result.hasExtra && <td>—</td>}
                          <td>{ccy(r.endBalance)}</td>
                        </tr>
                      ))
                    : result.rows.map((r, i) => (
                        <tr key={i}>
                          <td>{r.yr}</td>
                          <td>{MONTHS[r.date.getMonth()].substring(0, 3)} {r.yr}</td>
                          <td>{ccy(r.interest)}</td>
                          <td>{ccy(r.principal)}</td>
                          {result.hasExtra && <td>{r.extra > 0.005 ? ccy(r.extra) : "—"}</td>}
                          <td>{ccy(r.endBalance)}</td>
                        </tr>
                      ))
                  }
                </tbody>
                {/* Totals footer */}
                <tfoot>
                  <tr style={{ fontWeight: 700, background: "#f0eeff" }}>
                    <td colSpan={2}>Total</td>
                    <td>{ccy(result.totalInterest)}</td>
                    <td>{ccy(result.principal)}</td>
                    {result.hasExtra && <td>—</td>}
                    <td>{ccy(0)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
