import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const ccy = (n) => { if (!isFinite(n) || isNaN(n)) return "—"; const s = n < 0 ? "-" : ""; return s + "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
const parseN = (s) => { const v = parseFloat(String(s ?? "").replace(/,/g, "")); return isNaN(v) ? 0 : v; };
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const TODAY = new Date();

// VA Funding Fee table: [use][downPaymentTier] = %
const VA_FUNDING_FEE = {
  "first": { "0": 2.15, "5": 1.50, "10": 1.25 },
  "subsequent": { "0": 3.30, "5": 1.50, "10": 1.25 },
};

function DonutChart({ slices }) {
  const total = slices.reduce((s, sl) => s + (sl.v || 0), 0);
  if (!(total > 0)) return null;
  const cx = 90, cy = 90, ro = 76, ri = 46;
  const active = slices.filter(s => s.v > 0);
  if (active.length === 1) return <svg viewBox="0 0 180 180" style={{ width: 140, height: 140 }}><circle cx={cx} cy={cy} r={ro} fill={active[0].c} /><circle cx={cx} cy={cy} r={ri} fill="#fff" /></svg>;
  const f = (n) => n.toFixed(3); let deg = 0;
  const pt = (r, d) => { const a = ((d - 90) * Math.PI) / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
  const paths = active.map((sl, i) => {
    const sw = Math.min((sl.v / total) * 360, 359.999); const e = deg + sw;
    const [ox1,oy1]=pt(ro,deg),[ox2,oy2]=pt(ro,e),[ix1,iy1]=pt(ri,e),[ix2,iy2]=pt(ri,deg);
    const lg = sw > 180 ? 1 : 0;
    const d = `M${f(ox1)} ${f(oy1)} A${ro} ${ro} 0 ${lg} 1 ${f(ox2)} ${f(oy2)} L${f(ix1)} ${f(iy1)} A${ri} ${ri} 0 ${lg} 0 ${f(ix2)} ${f(iy2)}Z`;
    deg = e;
    return <path key={i} d={d} fill={sl.c} stroke="#fff" strokeWidth={1.5} />;
  });
  return <svg viewBox="0 0 180 180" style={{ width: 140, height: 140 }}>{paths}</svg>;
}

const ist = { width: "100%", background: "#f8f9ff", color: "#1e1b4b", border: "1.5px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: "9px 12px", fontSize: 14, fontWeight: 600, outline: "none", boxSizing: "border-box" };
const lst = { display: "block", fontSize: 11, fontWeight: 700, color: "#6b7a9e", marginBottom: 5, letterSpacing: "0.4px", textTransform: "uppercase" };
const fst = { marginBottom: 12 };
const sym = { color: "#6b7a9e", fontWeight: 700, flexShrink: 0 };
const row = (children, x = {}) => <div style={{ display: "flex", alignItems: "center", gap: 6, ...x }}>{children}</div>;

export default function VAMortgageCalculator() {
  const [homePrice, setHomePrice] = useState("350000");
  const [downPayment, setDownPayment] = useState("0");
  const [rate, setRate] = useState("6.5");
  const [term, setTerm] = useState("30");
  const [useType, setUseType] = useState("first");
  const [exempt, setExempt] = useState(false);
  const [propTax, setPropTax] = useState("1.2");
  const [insurance, setInsurance] = useState("1200");
  const [hoa, setHoa] = useState("0");
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState("year");

  function calculate() {
    setErr(""); setResult(null);
    const hp = parseN(homePrice), dp = parseN(downPayment), r = parseN(rate), t = parseN(term), pt = parseN(propTax), ins = parseN(insurance), hoaV = parseN(hoa);
    if (!(hp > 0)) { setErr("Home price must be greater than 0."); return; }
    if (!(t > 0)) { setErr("Loan term must be greater than 0."); return; }
    if (dp >= hp) { setErr("Down payment cannot exceed the home price."); return; }

    const dpPct = (dp / hp) * 100;
    let feePct = 0;
    if (!exempt) {
      const tier = dpPct >= 10 ? "10" : dpPct >= 5 ? "5" : "0";
      feePct = VA_FUNDING_FEE[useType]?.[tier] || 2.15;
    }

    const loanBeforeFee = hp - dp;
    const feeAmt = loanBeforeFee * feePct / 100;
    const P = loanBeforeFee + feeAmt; // VA funding fee financed into loan
    const n = t * 12;
    const mr = r / 100 / 12;
    const pi = mr === 0 ? P / n : (P * mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
    const monthlyTax = hp * pt / 100 / 12;
    const monthlyIns = ins / 12;
    const monthlyHoa = hoaV / 12;
    const monthlyTotal = pi + monthlyTax + monthlyIns + monthlyHoa;

    let bal = P, totalInt = 0, rows = [];
    const startD = new Date(TODAY.getFullYear(), TODAY.getMonth() + 1, 1);
    for (let i = 0; i < n && bal > 0.005; i++) {
      const intP = bal * mr;
      let prinP = pi - intP;
      if (prinP > bal) prinP = bal;
      bal -= prinP; totalInt += intP;
      const d = new Date(startD.getFullYear(), startD.getMonth() + i, 1);
      rows.push({ n: i + 1, label: MONTHS[d.getMonth()] + " " + d.getFullYear(), interest: intP, principal: prinP, balance: Math.max(bal, 0) });
      if (bal <= 0.005) break;
    }
    const annual = [];
    let yr = null, yRow = null;
    rows.forEach(r => {
      const y = r.label.split(" ")[1];
      if (y !== yr) { if (yRow) annual.push(yRow); yr = y; yRow = { year: y, interest: 0, principal: 0, balance: 0 }; }
      yRow.interest += r.interest; yRow.principal += r.principal; yRow.balance = r.balance;
    });
    if (yRow) annual.push(yRow);
    setResult({ pi, monthlyTotal, monthlyTax, monthlyIns, monthlyHoa, feeAmt, feePct, loanBeforeFee, P, totalInt, totalPaid: P + totalInt, dp, hp, rows, annual, payoff: rows[rows.length - 1]?.label });
  }

  function clear() { setHomePrice("350000"); setDownPayment("0"); setRate("6.5"); setTerm("30"); setUseType("first"); setExempt(false); setPropTax("1.2"); setInsurance("1200"); setHoa("0"); setResult(null); setErr(""); }

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>VA Mortgage Calculator</h1>
        <p className="muted">Calculate VA loan payments including the VA funding fee, property taxes, and insurance. No PMI required for VA loans.</p>
      </header>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 20 }}>
          <section className="card" style={{ flex: "0 0 312px", minWidth: 268 }}>
            <div style={fst}><label style={lst}>Home Price</label>{row([<span style={sym}>$</span>, <input style={ist} value={homePrice} onChange={e => setHomePrice(e.target.value)} />])}</div>
            <div style={fst}><label style={lst}>Down Payment</label>{row([<span style={sym}>$</span>, <input style={ist} value={downPayment} onChange={e => setDownPayment(e.target.value)} />])}</div>
            <div style={fst}><label style={lst}>Interest Rate (APR)</label>{row([<input style={ist} value={rate} onChange={e => setRate(e.target.value)} />, <span style={sym}>%</span>])}</div>
            <div style={fst}><label style={lst}>Loan Term (Years)</label>
              <select style={ist} value={term} onChange={e => setTerm(e.target.value)}>
                {["10","15","20","25","30"].map(y => <option key={y} value={y}>{y} years</option>)}
              </select>
            </div>
            <div style={fst}><label style={lst}>VA Loan Use</label>
              <select style={ist} value={useType} onChange={e => setUseType(e.target.value)}>
                <option value="first">First Use</option>
                <option value="subsequent">Subsequent Use</option>
              </select>
            </div>
            <div style={{ ...fst, display: "flex", alignItems: "center", gap: 10 }}>
              <input type="checkbox" checked={exempt} onChange={e => setExempt(e.target.checked)} id="exempt" style={{ width: 16, height: 16 }} />
              <label htmlFor="exempt" style={{ fontSize: 13, color: "#1e1b4b", fontWeight: 600 }}>Exempt from VA Funding Fee</label>
            </div>
            <div style={fst}><label style={lst}>Annual Property Tax Rate</label>{row([<input style={ist} value={propTax} onChange={e => setPropTax(e.target.value)} />, <span style={sym}>%</span>])}</div>
            <div style={fst}><label style={lst}>Annual Home Insurance</label>{row([<span style={sym}>$</span>, <input style={ist} value={insurance} onChange={e => setInsurance(e.target.value)} />])}</div>
            <div style={fst}><label style={lst}>HOA (Annual)</label>{row([<span style={sym}>$</span>, <input style={ist} value={hoa} onChange={e => setHoa(e.target.value)} />])}</div>
            {err && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 10 }}>{err}</p>}
            <button className="btn" style={{ width: "100%", marginBottom: 8 }} onClick={calculate}>Calculate</button>
            <button className="btn-sec" style={{ width: "100%" }} onClick={clear}>Clear</button>
          </section>

          {result && (
            <section className="card" style={{ flex: 1, minWidth: 300 }}>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center", marginBottom: 20 }}>
                <DonutChart slices={[{ v: result.pi, c: "#4f46e5" }, { v: result.totalInt, c: "#f59e0b" }, { v: result.monthlyTax * 360, c: "#10b981" }, { v: result.monthlyIns * 360, c: "#6366f1" }]} />
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 13, color: "#6b7a9e", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Monthly Payment</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: "#4f46e5", marginBottom: 12 }}>{ccy(result.monthlyTotal)}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
                    {[["P & I", ccy(result.pi)], ["Property Tax", ccy(result.monthlyTax)], ["Insurance", ccy(result.monthlyIns)], ["HOA", ccy(result.monthlyHoa)]].map(([l,v]) => (
                      <div key={l}><div style={{ fontSize: 10, color: "#6b7a9e", fontWeight: 700, textTransform: "uppercase" }}>{l}</div><div style={{ fontSize: 14, fontWeight: 700, color: "#1e1b4b" }}>{v}</div></div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px 16px", marginBottom: 20 }}>
                {[["Loan Amount", ccy(result.P)], ["VA Funding Fee", ccy(result.feeAmt) + (result.feePct > 0 ? ` (${result.feePct}%)` : "")], ["Total Interest", ccy(result.totalInt)], ["Total Paid", ccy(result.totalPaid)], ["Down Payment", ccy(result.dp)], ["Payoff Date", result.payoff]].map(([l,v]) => (
                  <div key={l}><div style={{ fontSize: 10, color: "#6b7a9e", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>{l}</div><div style={{ fontSize: 13, fontWeight: 700, color: "#1e1b4b" }}>{v}</div></div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                {["year","month"].map(t => <button key={t} onClick={() => setTab(t)} style={{ padding: "6px 16px", borderRadius: 8, border: "1.5px solid rgba(99,102,241,0.25)", background: tab === t ? "#4f46e5" : "#f8f9ff", color: tab === t ? "#fff" : "#4f46e5", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{t === "year" ? "Annual" : "Monthly"}</button>)}
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead><tr style={{ background: "#f0f0ff" }}>{["Date","Principal","Interest","Balance"].map(h => <th key={h} style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: "#4f46e5" }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {(tab === "year" ? result.annual : result.rows).map((r, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(99,102,241,0.08)", background: i % 2 === 0 ? "#fafbff" : "#fff" }}>
                        <td style={{ padding: "7px 10px", fontWeight: 600 }}>{tab === "year" ? r.year : r.label}</td>
                        <td style={{ padding: "7px 10px", textAlign: "right", color: "#4f46e5" }}>{ccy(r.principal)}</td>
                        <td style={{ padding: "7px 10px", textAlign: "right", color: "#f59e0b" }}>{ccy(r.interest)}</td>
                        <td style={{ padding: "7px 10px", textAlign: "right", fontWeight: 700 }}>{ccy(r.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
