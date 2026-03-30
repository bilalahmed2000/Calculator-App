import React, { useRef, useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

/* ══════════════════════════════════════════════════════
   US STATES — state-level auto sales tax rates
══════════════════════════════════════════════════════ */
const US_STATES = [
  { name: "-- Select State --", rate: null },
  { name: "Alabama",         rate: 2.000 },
  { name: "Alaska",          rate: 0.000 },
  { name: "Arizona",         rate: 5.600 },
  { name: "Arkansas",        rate: 6.500 },
  { name: "California",      rate: 7.250 },
  { name: "Colorado",        rate: 2.900 },
  { name: "Connecticut",     rate: 6.350 },
  { name: "Delaware",        rate: 0.000 },
  { name: "Florida",         rate: 6.000 },
  { name: "Georgia",         rate: 7.000 },
  { name: "Hawaii",          rate: 4.000 },
  { name: "Idaho",           rate: 6.000 },
  { name: "Illinois",        rate: 6.250 },
  { name: "Indiana",         rate: 7.000 },
  { name: "Iowa",            rate: 5.000 },
  { name: "Kansas",          rate: 7.500 },
  { name: "Kentucky",        rate: 6.000 },
  { name: "Louisiana",       rate: 4.450 },
  { name: "Maine",           rate: 5.500 },
  { name: "Maryland",        rate: 6.000 },
  { name: "Massachusetts",   rate: 6.250 },
  { name: "Michigan",        rate: 6.000 },
  { name: "Minnesota",       rate: 6.875 },
  { name: "Mississippi",     rate: 5.000 },
  { name: "Missouri",        rate: 4.225 },
  { name: "Montana",         rate: 0.000 },
  { name: "Nebraska",        rate: 5.500 },
  { name: "Nevada",          rate: 6.850 },
  { name: "New Hampshire",   rate: 0.000 },
  { name: "New Jersey",      rate: 6.625 },
  { name: "New Mexico",      rate: 5.125 },
  { name: "New York",        rate: 8.490 },
  { name: "North Carolina",  rate: 3.000 },
  { name: "North Dakota",    rate: 5.000 },
  { name: "Ohio",            rate: 5.750 },
  { name: "Oklahoma",        rate: 3.250 },
  { name: "Oregon",          rate: 0.000 },
  { name: "Pennsylvania",    rate: 6.000 },
  { name: "Rhode Island",    rate: 7.000 },
  { name: "South Carolina",  rate: 5.000 },
  { name: "South Dakota",    rate: 4.500 },
  { name: "Tennessee",       rate: 7.000 },
  { name: "Texas",           rate: 6.250 },
  { name: "Utah",            rate: 6.850 },
  { name: "Vermont",         rate: 6.000 },
  { name: "Virginia",        rate: 4.150 },
  { name: "Washington",      rate: 6.500 },
  { name: "Washington D.C.", rate: 6.000 },
  { name: "West Virginia",   rate: 6.000 },
  { name: "Wisconsin",       rate: 5.000 },
  { name: "Wyoming",         rate: 4.000 },
];

/* ══════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════ */

/** Parse a possibly comma-formatted string → non-negative number */
const parseNum = (s) => {
  const v = parseFloat(String(s ?? "").replace(/,/g, ""));
  return isNaN(v) || v < 0 ? 0 : v;
};

/** Format as USD currency string */
const ccy = (n) => {
  if (!isFinite(n) || isNaN(n)) return "$0.00";
  return "$" + Math.max(n, 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/** Standard fixed-rate monthly loan payment */
const calcPayment = (P, mr, n) => {
  if (P <= 0 || n <= 0) return 0;
  if (mr === 0) return P / n;
  const pow = Math.pow(1 + mr, n);
  return (P * mr * pow) / (pow - 1);
};

/** Reverse: max loan principal for a given monthly payment */
const calcPrincipalFromPayment = (M, mr, n) => {
  if (M <= 0 || n <= 0) return 0;
  if (mr === 0) return M * n;
  const pow = Math.pow(1 + mr, n);
  return (M * (pow - 1)) / (mr * pow);
};

/** Build month-by-month amortization rows */
const buildMonthlyRows = (P, mr, payment, n) => {
  const rows = [];
  let bal = P, cumInt = 0;
  for (let i = 1; i <= n && bal > 0.005; i++) {
    const intP  = bal * mr;
    const prinP = Math.min(Math.max(payment - intP, 0), bal);
    bal     = Math.max(bal - prinP, 0);
    cumInt += intP;
    rows.push({ month: i, interest: intP, principal: prinP, endBalance: bal, cumInterest: cumInt });
    if (bal <= 0) break;
  }
  return rows;
};

/* ══════════════════════════════════════════════════════
   SVG DONUT CHART — Principal vs Interest
══════════════════════════════════════════════════════ */
function DonutChart({ principal, interest }) {
  const total = principal + interest;
  if (!total) return null;
  const cx = 90, cy = 90, ro = 76, ri = 48;

  const arc = (startDeg, sweepDeg, color) => {
    const sweep = Math.min(sweepDeg, 359.999);
    const toXY  = (deg, r) => {
      const a = ((deg - 90) * Math.PI) / 180;
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    };
    const [ox1, oy1] = toXY(startDeg, ro);
    const [ox2, oy2] = toXY(startDeg + sweep, ro);
    const [ix1, iy1] = toXY(startDeg + sweep, ri);
    const [ix2, iy2] = toXY(startDeg, ri);
    const lg = sweep > 180 ? 1 : 0;
    const f  = (n) => n.toFixed(3);
    const d  = `M${f(ox1)} ${f(oy1)} A${ro} ${ro} 0 ${lg} 1 ${f(ox2)} ${f(oy2)} L${f(ix1)} ${f(iy1)} A${ri} ${ri} 0 ${lg} 0 ${f(ix2)} ${f(iy2)}Z`;
    return <path d={d} fill={color} stroke="#fff" strokeWidth={2} />;
  };

  const pAngle = (principal / total) * 360;

  if (interest <= 0.01) {
    return (
      <svg viewBox="0 0 180 180" style={{ width: 164, height: 164 }}>
        <circle cx={cx} cy={cy} r={ro} fill="#4f46e5" />
        <circle cx={cx} cy={cy} r={ri} fill="#fff" />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize={9.5} fill="#1e1b4b" fontWeight="800">{ccy(principal)}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize={8.5} fill="#6b7a9e">principal</text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 180 180" style={{ width: 164, height: 164 }}>
      {arc(0, pAngle, "#4f46e5")}
      {arc(pAngle, 360 - pAngle, "#f59e0b")}
      <circle cx={cx} cy={cy} r={ri} fill="#fff" />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize={9.5} fill="#1e1b4b" fontWeight="800">{ccy(total)}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize={8.5} fill="#6b7a9e">total loan</text>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   SVG AMORTIZATION LINE CHART
══════════════════════════════════════════════════════ */
function AmorChart({ rows }) {
  if (!rows || rows.length < 2) return null;
  const W = 560, H = 200, PL = 66, PB = 30, PT = 22, PR = 14;
  const cW = W - PL - PR, cH = H - PB - PT;
  const n   = rows.length;
  const maxVal = Math.max(rows[0]?.endBalance + rows[0]?.cumInterest ?? 0,
    ...rows.map(r => r.endBalance),
    ...rows.map(r => r.cumInterest)
  ) * 1.08 || 1;

  const toX = (i) => PL + (i / Math.max(n - 1, 1)) * cW;
  const toY = (v) => PT + cH - (Math.max(v, 0) / maxVal) * cH;

  const balPts = rows.map((r, i) => `${toX(i).toFixed(1)},${toY(r.endBalance).toFixed(1)}`).join(" ");
  const intPts = rows.map((r, i) => `${toX(i).toFixed(1)},${toY(r.cumInterest).toFixed(1)}`).join(" ");

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((p) => ({ v: maxVal * p, y: toY(maxVal * p) }));
  const step   = Math.max(1, Math.floor(n / 6));
  const xLbls  = rows
    .filter((_, i) => i === 0 || i % step === 0 || i === n - 1)
    .map((r) => ({ label: `Mo ${r.month}`, x: toX(rows.indexOf(r)) }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, height: "auto", display: "block" }}>
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={PL} y1={t.y} x2={W - PR} y2={t.y} stroke="#f1f0fe" strokeWidth={1} />
          <text x={PL - 5} y={t.y + 3.5} textAnchor="end" fontSize={8.5} fill="#9ca3af">
            {t.v >= 1000 ? `${(t.v / 1000).toFixed(0)}k` : t.v.toFixed(0)}
          </text>
        </g>
      ))}
      <line x1={PL} y1={PT}     x2={PL}     y2={H - PB} stroke="#e5e7eb" strokeWidth={1} />
      <line x1={PL} y1={H - PB} x2={W - PR} y2={H - PB} stroke="#e5e7eb" strokeWidth={1} />
      <polyline points={balPts} fill="none" stroke="#4f46e5" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={intPts} fill="none" stroke="#f59e0b" strokeWidth={2}   strokeLinejoin="round" strokeLinecap="round" />
      {xLbls.map((xl, i) => (
        <text key={i} x={xl.x} y={H - PB + 13} textAnchor="middle" fontSize={8.5} fill="#9ca3af">{xl.label}</text>
      ))}
      <rect x={PL + 4}   y={PT} width={13} height={4} rx={2} fill="#4f46e5" />
      <text x={PL + 21}  y={PT + 4} fontSize={9} fill="#4b5280">Balance</text>
      <rect x={PL + 82}  y={PT} width={13} height={4} rx={2} fill="#f59e0b" />
      <text x={PL + 99}  y={PT + 4} fontSize={9} fill="#4b5280">Cum. Interest</text>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function AutoLoanCalculator() {
  /* ── tab ── */
  const [tab, setTab] = useState("total"); // "total" | "monthly"

  /* ── inputs ── */
  const [autoPriceStr,   setAutoPriceStr]   = useState("25,000");
  const [monthlyPayStr,  setMonthlyPayStr]  = useState("450");
  const [loanTermStr,    setLoanTermStr]    = useState("60");
  const [aprStr,         setAprStr]         = useState("6");
  const [cashIncStr,     setCashIncStr]     = useState("0");
  const [downPayStr,     setDownPayStr]     = useState("0");
  const [tradeInStr,     setTradeInStr]     = useState("0");
  const [owedTradeStr,   setOwedTradeStr]   = useState("0");
  const [selectedState,  setSelectedState]  = useState("-- Select State --");
  const [salesTaxStr,    setSalesTaxStr]    = useState("7.5");
  const [feesStr,        setFeesStr]        = useState("0");
  const [inclTaxFees,    setInclTaxFees]    = useState(false);

  /* ── output ── */
  const [result,   setResult]   = useState(null);
  const [err,      setErr]      = useState("");
  const [amorTab,  setAmorTab]  = useState("monthly");
  const schedRef = useRef(null);

  /* ── when state selected → auto-fill tax rate ── */
  const handleStateChange = (e) => {
    const name = e.target.value;
    setSelectedState(name);
    const st = US_STATES.find((s) => s.name === name);
    if (st && st.rate !== null) setSalesTaxStr(String(st.rate));
  };

  /* ══════════════════════════════════════════════
     CALCULATE
  ══════════════════════════════════════════════ */
  const calculate = () => {
    setErr("");

    const n       = Math.max(Math.round(parseNum(loanTermStr)), 1);
    const r       = parseNum(aprStr);
    const mr      = r / 100 / 12;
    const CI      = parseNum(cashIncStr);
    const DP      = parseNum(downPayStr);
    const TI      = parseNum(tradeInStr);
    const AOT     = parseNum(owedTradeStr);
    const taxRate = parseNum(salesTaxStr) / 100;
    const F       = parseNum(feesStr);

    /* net trade-in: positive = equity; negative = deficit (rolls into loan) */
    const netTrade = TI - AOT;

    let ap, loanPrincipal, salesTaxAmt, upfront, payment;

    if (tab === "total") {
      ap = parseNum(autoPriceStr);
      if (!(ap > 0)) { setErr("Auto price must be greater than 0."); return; }

      /* Sales tax applies to (autoPrice − cashIncentives) */
      salesTaxAmt = Math.max(ap - CI, 0) * taxRate;

      if (inclTaxFees) {
        /* Tax + fees rolled into loan */
        loanPrincipal = Math.max(ap - CI - DP - netTrade + salesTaxAmt + F, 0);
        upfront       = DP + Math.max(netTrade, 0);
      } else {
        /* Tax + fees paid upfront */
        loanPrincipal = Math.max(ap - CI - DP - netTrade, 0);
        upfront       = DP + Math.max(netTrade, 0) + salesTaxAmt + F;
      }
      payment = calcPayment(loanPrincipal, mr, n);

    } else {
      /* Monthly Payment tab: reverse-solve for autoPrice
         If NOT inclTaxFees: loanPrincipal = ap − CI − DP − netTrade
           → ap = loanPrincipal + CI + DP + netTrade
         If inclTaxFees:     loanPrincipal = (ap−CI)(1+taxRate) − DP − netTrade + F
           → (ap−CI) = (loanPrincipal + DP + netTrade − F) / (1+taxRate)
           → ap = (loanPrincipal + DP + netTrade − F) / (1+taxRate) + CI               */
      const M = parseNum(monthlyPayStr);
      if (!(M > 0)) { setErr("Monthly payment must be greater than 0."); return; }

      loanPrincipal = calcPrincipalFromPayment(M, mr, n);
      payment       = M;

      if (inclTaxFees) {
        ap = Math.max((loanPrincipal + DP + netTrade - F) / Math.max(1 + taxRate, 0.001) + CI, 0);
      } else {
        ap = Math.max(loanPrincipal + CI + DP + netTrade, 0);
      }

      salesTaxAmt = Math.max(ap - CI, 0) * taxRate;

      if (inclTaxFees) {
        upfront = DP + Math.max(netTrade, 0);
      } else {
        upfront = DP + Math.max(netTrade, 0) + salesTaxAmt + F;
      }
    }

    const totalLoanPayments = payment * n;
    const totalInterest     = Math.max(totalLoanPayments - loanPrincipal, 0);
    const totalCost         = upfront + totalLoanPayments;

    /* Build monthly amortization rows */
    const monthlyRows = buildMonthlyRows(loanPrincipal, mr, payment, n);

    /* Annual aggregation */
    const annualRows = [];
    for (let start = 0; start < monthlyRows.length; start += 12) {
      const slice = monthlyRows.slice(start, start + 12);
      annualRows.push({
        year:       Math.floor(start / 12) + 1,
        interest:   slice.reduce((s, r) => s + r.interest,  0),
        principal:  slice.reduce((s, r) => s + r.principal, 0),
        endBalance: slice[slice.length - 1].endBalance,
      });
    }

    setResult({ tab, autoPrice: ap, loanPrincipal, salesTaxAmt, upfront, payment, n, totalLoanPayments, totalInterest, totalCost, monthlyRows, annualRows, fees: F });
  };

  const clear = () => {
    setAutoPriceStr("25,000"); setMonthlyPayStr("450"); setLoanTermStr("60"); setAprStr("6");
    setCashIncStr("0"); setDownPayStr("0"); setTradeInStr("0"); setOwedTradeStr("0");
    setSelectedState("-- Select State --"); setSalesTaxStr("7.5"); setFeesStr("0");
    setInclTaxFees(false); setResult(null); setErr(""); setAmorTab("monthly");
  };

  /* ── handle Enter on inputs ── */
  const onKey = (e) => { if (e.key === "Enter") calculate(); };

  /* ══════════════════════════════════════════════
     STYLE ATOMS
  ══════════════════════════════════════════════ */
  const ist  = { width: "100%", background: "#f8f9ff", color: "#1e1b4b", border: "1.5px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: "9px 12px", fontSize: 14, fontWeight: 600, outline: "none", boxSizing: "border-box" };
  const lst  = { display: "block", fontSize: 11, fontWeight: 700, color: "#6b7a9e", marginBottom: 5, letterSpacing: "0.4px", textTransform: "uppercase" };
  const fst  = { marginBottom: 12 };
  const sym  = { color: "#6b7a9e", fontWeight: 700, flexShrink: 0, fontSize: 14 };
  const irow = (children) => <div style={{ display: "flex", alignItems: "center", gap: 6 }}>{children}</div>;

  /* Tab button style */
  const tabBtn = (active) => ({
    flex: 1, padding: "9px 6px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13.5,
    background: active ? "#4f46e5" : "transparent",
    color: active ? "#fff" : "#6b7a9e",
    borderRadius: active ? "10px 10px 0 0" : "10px 10px 0 0",
    transition: "background 0.2s, color 0.2s",
  });

  /* ══════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════ */
  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Auto Loan Calculator</h1>
        <p className="muted">
          Calculate your monthly auto loan payment, total cost, and full amortization schedule — including taxes, fees, trade-in, and incentives.
        </p>
      </header>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* ══ TOP ROW: Form + Results ══ */}
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 20 }}>

          {/* ─── INPUT FORM ─── */}
          <section className="card" style={{ flex: "0 0 340px", minWidth: 280 }}>

            {/* Tab bar */}
            <div style={{ display: "flex", borderBottom: "2px solid rgba(99,102,241,0.15)", marginBottom: 20, marginLeft: -2, marginRight: -2 }}>
              <button style={tabBtn(tab === "total")}   onClick={() => { setTab("total");   setResult(null); setErr(""); }}>Total Price</button>
              <button style={tabBtn(tab === "monthly")} onClick={() => { setTab("monthly"); setResult(null); setErr(""); }}>Monthly Payment</button>
            </div>

            {/* Tab-specific primary input */}
            {tab === "total" ? (
              <div style={fst}>
                <label style={lst}>Auto Price</label>
                {irow(<><span style={sym}>$</span><input style={ist} value={autoPriceStr} onChange={(e) => setAutoPriceStr(e.target.value)} onKeyDown={onKey} /></>)}
              </div>
            ) : (
              <div style={fst}>
                <label style={lst}>Desired Monthly Pay</label>
                {irow(<><span style={sym}>$</span><input style={ist} value={monthlyPayStr} onChange={(e) => setMonthlyPayStr(e.target.value)} onKeyDown={onKey} /></>)}
              </div>
            )}

            {/* Loan Term */}
            <div style={fst}>
              <label style={lst}>Loan Term (Months)</label>
              {irow(<><input style={{ ...ist, textAlign: "center" }} type="number" min="1" max="120" value={loanTermStr} onChange={(e) => setLoanTermStr(e.target.value)} onKeyDown={onKey} /><span style={{ color: "#4b5280", fontWeight: 600, flexShrink: 0 }}>mo</span></>)}
            </div>

            {/* Interest Rate */}
            <div style={fst}>
              <label style={lst}>Interest Rate (APR)</label>
              {irow(<><input style={{ ...ist, textAlign: "right" }} value={aprStr} onChange={(e) => setAprStr(e.target.value)} onKeyDown={onKey} /><span style={sym}>%</span></>)}
            </div>

            {/* Cash Incentives */}
            <div style={fst}>
              <label style={lst}>Cash Incentives</label>
              {irow(<><span style={sym}>$</span><input style={ist} value={cashIncStr} onChange={(e) => setCashIncStr(e.target.value)} onKeyDown={onKey} /></>)}
            </div>

            {/* Down Payment */}
            <div style={fst}>
              <label style={lst}>Down Payment</label>
              {irow(<><span style={sym}>$</span><input style={ist} value={downPayStr} onChange={(e) => setDownPayStr(e.target.value)} onKeyDown={onKey} /></>)}
            </div>

            {/* Trade-in + Owed */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div>
                <label style={lst}>Trade-in Value</label>
                {irow(<><span style={sym}>$</span><input style={ist} value={tradeInStr} onChange={(e) => setTradeInStr(e.target.value)} onKeyDown={onKey} /></>)}
              </div>
              <div>
                <label style={lst}>Owed on Trade-in</label>
                {irow(<><span style={sym}>$</span><input style={ist} value={owedTradeStr} onChange={(e) => setOwedTradeStr(e.target.value)} onKeyDown={onKey} /></>)}
              </div>
            </div>

            {/* State */}
            <div style={fst}>
              <label style={lst}>Your State</label>
              <select style={{ ...ist, cursor: "pointer" }} value={selectedState} onChange={handleStateChange}>
                {US_STATES.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
            </div>

            {/* Sales Tax */}
            <div style={fst}>
              <label style={lst}>Sales Tax</label>
              {irow(<><input style={{ ...ist, textAlign: "right" }} value={salesTaxStr} onChange={(e) => setSalesTaxStr(e.target.value)} onKeyDown={onKey} /><span style={sym}>%</span></>)}
            </div>

            {/* Fees */}
            <div style={fst}>
              <label style={lst}>Title, Registration &amp; Other Fees</label>
              {irow(<><span style={sym}>$</span><input style={ist} value={feesStr} onChange={(e) => setFeesStr(e.target.value)} onKeyDown={onKey} /></>)}
            </div>

            {/* Include taxes checkbox */}
            <label style={{ display: "flex", alignItems: "flex-start", gap: 9, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 18, lineHeight: 1.4 }}>
              <input type="checkbox" checked={inclTaxFees} onChange={(e) => setInclTaxFees(e.target.checked)} style={{ accentColor: "#6366f1", width: 14, height: 14, marginTop: 2, flexShrink: 0 }} />
              Include taxes and fees in loan
            </label>

            {err && <div className="rng-error" style={{ marginBottom: 12 }}>{err}</div>}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button className="btn" style={{ width: "100%", padding: "11px" }} onClick={calculate}>Calculate</button>
              <button type="button" onClick={clear} style={{ width: "100%", padding: "11px", borderRadius: 12, border: "1.5px solid rgba(99,102,241,0.22)", background: "#fff", color: "#6b7a9e", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Clear</button>
            </div>
          </section>

          {/* ─── RESULTS ─── */}
          {result ? (
            <section className="card" style={{ flex: 1, minWidth: 290 }}>

              {/* Green header */}
              <div className="result-header" style={{ fontSize: 18, marginBottom: 20 }}>
                {result.tab === "total"
                  ? <>Monthly Pay: <strong>{ccy(result.payment)}</strong></>
                  : <>Affordable Auto Price: <strong>{ccy(result.autoPrice)}</strong></>
                }
              </div>

              {/* Breakdown table */}
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, marginBottom: 20 }}>
                <tbody>
                  {[
                    result.tab === "total"
                      ? { label: "Monthly Pay",                   val: ccy(result.payment) }
                      : { label: "Auto Price",                    val: ccy(result.autoPrice) },
                    { label: "Total Loan Amount",                  val: ccy(result.loanPrincipal) },
                    { label: "Sale Tax",                           val: ccy(result.salesTaxAmt) },
                    { label: "Upfront Payment",                    val: ccy(result.upfront) },
                    { label: `Total of ${result.n} Loan Payments`, val: ccy(result.totalLoanPayments) },
                    { label: "Total Loan Interest",                val: ccy(result.totalInterest) },
                    { label: "Total Cost (price+interest+tax+fees)", val: ccy(result.totalCost) },
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(99,102,241,0.08)" }}>
                      <td style={{ padding: "8px 0", fontWeight: 600, color: "#374151", fontSize: 13 }}>{row.label}</td>
                      <td style={{ padding: "8px 0", textAlign: "right", fontFamily: "monospace", color: "#1e1b4b", fontSize: 13, fontWeight: 700 }}>{row.val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Loan Breakdown: donut + legend */}
              <div style={{ fontSize: 11, fontWeight: 800, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
                Loan Breakdown
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                <DonutChart principal={result.loanPrincipal} interest={result.totalInterest} />
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { color: "#4f46e5", label: "Principal", val: ccy(result.loanPrincipal) },
                    { color: "#f59e0b", label: "Interest",  val: ccy(result.totalInterest) },
                  ].map((s) => (
                    <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                      <span style={{ width: 12, height: 12, borderRadius: 3, background: s.color, flexShrink: 0 }} />
                      <span style={{ color: "#4b5280" }}>{s.label}: <strong>{s.val}</strong></span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Link to amortization */}
              <button className="link-btn" style={{ marginTop: 18, display: "block" }}
                onClick={() => schedRef.current?.scrollIntoView({ behavior: "smooth" })}>
                View Amortization Schedule ↓
              </button>

              <div style={{ marginTop: 12, fontSize: 12, color: "#9ca3af" }}>
                Find average tax rate and fees in your state →{" "}
                <span style={{ color: "#6366f1", cursor: "default", fontWeight: 600 }}>
                  (select your state above)
                </span>
              </div>
            </section>
          ) : (
            <section className="card" style={{ flex: 1, minWidth: 260, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200 }}>
              <div style={{ textAlign: "center" }}>
                <svg viewBox="0 0 24 24" style={{ width: 52, height: 52, marginBottom: 14 }} fill="none" stroke="#c4b5fd" strokeWidth={1.4}>
                  <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="9" y="11" width="14" height="10" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="16" r="1" fill="#c4b5fd" />
                </svg>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#9ca3af" }}>Enter your details and press <strong>Calculate</strong></div>
              </div>
            </section>
          )}
        </div>

        {/* ══ AMORTIZATION SCHEDULE ══ */}
        {result && (
          <section className="card" ref={schedRef} style={{ marginBottom: 28 }}>
            <h2 className="card-title" style={{ marginBottom: 6 }}>Amortization Schedule</h2>
            <p style={{ fontSize: 13, color: "#6b7a9e", marginBottom: 20 }}>
              {ccy(result.loanPrincipal)} loan at {aprStr}% APR over {result.n} months.
              Monthly payment: <strong>{ccy(result.payment)}</strong>.
            </p>

            {/* Line chart */}
            <div style={{ marginBottom: 22, overflowX: "auto" }}>
              <AmorChart rows={result.monthlyRows} />
            </div>

            {/* Chart legend */}
            <div style={{ display: "flex", gap: 22, marginBottom: 20, flexWrap: "wrap" }}>
              {[{ color: "#4f46e5", label: "Remaining Balance" }, { color: "#f59e0b", label: "Cumulative Interest" }].map((l) => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6b7a9e" }}>
                  <span style={{ width: 22, height: 4, borderRadius: 2, background: l.color, flexShrink: 0 }} />
                  {l.label}
                </div>
              ))}
            </div>

            {/* Schedule tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {["monthly", "annual"].map((t) => (
                <button key={t} onClick={() => setAmorTab(t)} style={{
                  padding: "7px 18px", borderRadius: 10, border: "1.5px solid rgba(99,102,241,0.2)",
                  background: amorTab === t ? "#4f46e5" : "#fff",
                  color: amorTab === t ? "#fff" : "#6b7a9e",
                  fontWeight: 700, fontSize: 13, cursor: "pointer",
                }}>
                  {t === "monthly" ? "Monthly Schedule" : "Annual Schedule"}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="table-scroll">
              {amorTab === "monthly" ? (
                <table className="table" style={{ fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Interest</th>
                      <th>Principal</th>
                      <th>Ending Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.monthlyRows.map((r) => (
                      <tr key={r.month}>
                        <td>{r.month}</td>
                        <td>{ccy(r.interest)}</td>
                        <td>{ccy(r.principal)}</td>
                        <td>{ccy(r.endBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ fontWeight: 700, background: "#f0eeff" }}>
                      <td>Total</td>
                      <td>{ccy(result.totalInterest)}</td>
                      <td>{ccy(result.loanPrincipal)}</td>
                      <td>{ccy(0)}</td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <table className="table" style={{ fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th>Year</th>
                      <th>Interest</th>
                      <th>Principal</th>
                      <th>Ending Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.annualRows.map((r) => (
                      <tr key={r.year}>
                        <td>{r.year}</td>
                        <td>{ccy(r.interest)}</td>
                        <td>{ccy(r.principal)}</td>
                        <td>{ccy(r.endBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ fontWeight: 700, background: "#f0eeff" }}>
                      <td>Total</td>
                      <td>{ccy(result.totalInterest)}</td>
                      <td>{ccy(result.loanPrincipal)}</td>
                      <td>{ccy(0)}</td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
