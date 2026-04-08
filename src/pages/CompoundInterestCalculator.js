import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmt  = (n) => { if (!isFinite(n) || isNaN(n)) return "—"; return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
const parseN = (s) => { const v = parseFloat(String(s ?? "").replace(/,/g, "")); return isNaN(v) ? 0 : v; };

const ist = { width: "100%", background: "#f8f9ff", color: "#1e1b4b", border: "1.5px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: "9px 12px", fontSize: 14, fontWeight: 600, outline: "none", boxSizing: "border-box" };
const lst = { display: "block", fontSize: 11, fontWeight: 700, color: "#6b7a9e", marginBottom: 5, letterSpacing: "0.4px", textTransform: "uppercase" };
const fst = { marginBottom: 14 };
const sym = { color: "#6b7a9e", fontWeight: 700, flexShrink: 0 };

const FREQ = [
  { key: "annually",    label: "Annually",          n: 1 },
  { key: "semiannual",  label: "Semi-Annually",      n: 2 },
  { key: "quarterly",   label: "Quarterly",          n: 4 },
  { key: "monthly",     label: "Monthly",            n: 12 },
  { key: "semimonthly", label: "Semi-Monthly",       n: 24 },
  { key: "biweekly",    label: "Bi-Weekly",          n: 26 },
  { key: "weekly",      label: "Weekly",             n: 52 },
  { key: "daily",       label: "Daily",              n: 365 },
  { key: "continuous",  label: "Continuously",       n: Infinity },
];

function DonutChart({ principal, contrib, interest }) {
  const total = (principal || 0) + (contrib || 0) + (interest || 0);
  if (!(total > 0)) return null;
  const cx = 90, cy = 90, ro = 76, ri = 46;
  const colors = ["#4f46e5", "#10b981", "#f59e0b"];
  const vals = [principal, contrib, interest];
  const slices = [];
  let start = 0;
  const f = (n) => n.toFixed(3);
  const pt = (r, deg) => { const a = ((deg - 90) * Math.PI) / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
  for (let i = 0; i < vals.length; i++) {
    const sw = Math.max((vals[i] / total) * 359.999, 0.001);
    const end = start + sw;
    const [ox1, oy1] = pt(ro, start); const [ox2, oy2] = pt(ro, end);
    const [ix1, iy1] = pt(ri, end); const [ix2, iy2] = pt(ri, start);
    const lg = sw > 180 ? 1 : 0;
    slices.push(<path key={i} d={`M${f(ox1)} ${f(oy1)} A${ro} ${ro} 0 ${lg} 1 ${f(ox2)} ${f(oy2)} L${f(ix1)} ${f(iy1)} A${ri} ${ri} 0 ${lg} 0 ${f(ix2)} ${f(iy2)}Z`} fill={colors[i]} stroke="#fff" strokeWidth={1.5} />);
    start = end;
  }
  return <svg viewBox="0 0 180 180" style={{ width: 140, height: 140 }}>{slices}</svg>;
}

export default function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState("10000");
  const [contrib, setContrib]     = useState("100");
  const [contribFreq, setContribFreq] = useState("monthly");
  const [rate, setRate]           = useState("7");
  const [compFreq, setCompFreq]   = useState("monthly");
  const [years, setYears]         = useState("10");
  const [result, setResult]       = useState(null);
  const [err, setErr]             = useState("");
  const [tab, setTab]             = useState("year");

  function calculate() {
    setErr(""); setResult(null);
    const P = parseN(principal), c = parseN(contrib), r = parseN(rate), t = parseN(years);
    if (!(P >= 0)) { setErr("Principal must be 0 or greater."); return; }
    if (!(r >= 0)) { setErr("Interest rate must be 0 or greater."); return; }
    if (!(t > 0))  { setErr("Years must be greater than 0."); return; }

    const nComp = FREQ.find(f => f.key === compFreq)?.n ?? 12;
    const nContrib = FREQ.find(f => f.key === contribFreq)?.n ?? 12;
    const rPeriod = r / 100 / (nComp === Infinity ? 1 : nComp);

    const months = Math.round(t * 12);
    let balance = P, totalContrib = 0;
    const monthlyRows = [];
    const annualRows  = [];
    let yearBal = P, yearContrib = 0, yearInt = 0;
    let prevBal = P;

    for (let m = 1; m <= months; m++) {
      // Compound interest this month
      let intEarned;
      if (nComp === Infinity) {
        intEarned = balance * (Math.exp(r / 100 / 12) - 1);
      } else if (nComp >= 12) {
        intEarned = balance * rPeriod * (12 / nComp);
      } else {
        intEarned = balance * rPeriod * (nComp / 12);
      }
      // Simpler: monthly compounding equivalent
      const monthRate = nComp === Infinity ? Math.exp(r / 100 / 12) - 1 : Math.pow(1 + rPeriod, nComp / 12) - 1;
      intEarned = balance * monthRate;
      balance += intEarned;

      // Add contribution (approximate by distributing per month)
      const monthlyContrib = c * nContrib / 12;
      balance += monthlyContrib;
      totalContrib += monthlyContrib;
      yearContrib += monthlyContrib;
      yearInt += intEarned;

      const year = Math.ceil(m / 12);
      monthlyRows.push({ m, year, interest: intEarned, contrib: monthlyContrib, balance, cumContrib: totalContrib });

      if (m % 12 === 0 || m === months) {
        annualRows.push({ year, balance, contrib: yearContrib, interest: yearInt });
        yearContrib = 0; yearInt = 0;
      }
    }

    const totalInterest = balance - P - totalContrib;
    setResult({ balance, principal: P, totalContrib, totalInterest, annualRows, monthlyRows });
  }

  function clear() { setPrincipal("10000"); setContrib("100"); setContribFreq("monthly"); setRate("7"); setCompFreq("monthly"); setYears("10"); setResult(null); setErr(""); }

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Compound Interest Calculator</h1>
        <p className="muted">Calculate how your savings grow with compound interest, regular contributions, and different compounding frequencies.</p>
      </header>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 20 }}>
          <section className="card" style={{ flex: "0 0 312px", minWidth: 268 }}>
            <div style={fst}><label style={lst}>Initial Principal</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><span style={sym}>$</span><input style={ist} value={principal} onChange={e=>setPrincipal(e.target.value)} /></div></div>
            <div style={fst}><label style={lst}>Additional Contribution</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><span style={sym}>$</span><input style={ist} value={contrib} onChange={e=>setContrib(e.target.value)} /></div></div>
            <div style={fst}><label style={lst}>Contribution Frequency</label><select style={ist} value={contribFreq} onChange={e=>setContribFreq(e.target.value)}>{FREQ.filter(f=>f.key!=="continuous").map(f=><option key={f.key} value={f.key}>{f.label}</option>)}</select></div>
            <div style={fst}><label style={lst}>Annual Interest Rate</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><input style={ist} value={rate} onChange={e=>setRate(e.target.value)} /><span style={sym}>%</span></div></div>
            <div style={fst}><label style={lst}>Compound Frequency</label><select style={ist} value={compFreq} onChange={e=>setCompFreq(e.target.value)}>{FREQ.map(f=><option key={f.key} value={f.key}>{f.label}</option>)}</select></div>
            <div style={fst}><label style={lst}>Time Period (Years)</label><input style={ist} value={years} onChange={e=>setYears(e.target.value)} /></div>
            {err && <p style={{ color:"#ef4444",fontSize:13,marginBottom:10 }}>{err}</p>}
            <button className="btn" style={{ width:"100%",marginBottom:8 }} onClick={calculate}>Calculate</button>
            <button className="btn-sec" style={{ width:"100%" }} onClick={clear}>Clear</button>
          </section>

          {result && (
            <section className="card" style={{ flex:1,minWidth:300 }}>
              <div style={{ display:"flex",gap:24,flexWrap:"wrap",alignItems:"center",marginBottom:20 }}>
                <DonutChart principal={result.principal} contrib={result.totalContrib} interest={result.totalInterest} />
                <div style={{ flex:1,minWidth:200 }}>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 20px" }}>
                    {[["End Balance",fmt(result.balance)],["Initial Principal",fmt(result.principal)],["Total Contributions",fmt(result.totalContrib)],["Total Interest",fmt(result.totalInterest)]].map(([l,v])=>(
                      <div key={l}><div style={{ fontSize:11,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:2 }}>{l}</div><div style={{ fontSize:16,fontWeight:800,color:"#1e1b4b" }}>{v}</div></div>
                    ))}
                  </div>
                  <div style={{ display:"flex",gap:16,marginTop:14,fontSize:12,flexWrap:"wrap" }}>
                    <span style={{ display:"flex",alignItems:"center",gap:5 }}><span style={{ width:12,height:12,background:"#4f46e5",borderRadius:3,display:"inline-block" }} />Principal</span>
                    <span style={{ display:"flex",alignItems:"center",gap:5 }}><span style={{ width:12,height:12,background:"#10b981",borderRadius:3,display:"inline-block" }} />Contributions</span>
                    <span style={{ display:"flex",alignItems:"center",gap:5 }}><span style={{ width:12,height:12,background:"#f59e0b",borderRadius:3,display:"inline-block" }} />Interest</span>
                  </div>
                </div>
              </div>
              <div style={{ display:"flex",gap:8,marginBottom:14 }}>
                {["year","month"].map(t=><button key={t} onClick={()=>setTab(t)} style={{ padding:"6px 16px",borderRadius:8,border:"1.5px solid rgba(99,102,241,0.25)",background:tab===t?"#4f46e5":"#f8f9ff",color:tab===t?"#fff":"#4f46e5",fontWeight:700,fontSize:13,cursor:"pointer" }}>{t==="year"?"Annual":"Monthly"}</button>)}
              </div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                  <thead><tr style={{ background:"#f0f0ff" }}>{["Period","Contributions","Interest","End Balance"].map(h=><th key={h} style={{ padding:"8px 10px",textAlign:"right",fontWeight:700,color:"#4f46e5",whiteSpace:"nowrap" }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {(tab==="year" ? result.annualRows : result.monthlyRows).map((r,i)=>(
                      <tr key={i} style={{ borderBottom:"1px solid rgba(99,102,241,0.08)",background:i%2===0?"#fafbff":"#fff" }}>
                        <td style={{ padding:"7px 10px",fontWeight:600,color:"#1e1b4b",textAlign:"right" }}>{tab==="year"?`Year ${r.year}`:`Month ${r.m}`}</td>
                        <td style={{ padding:"7px 10px",textAlign:"right",color:"#10b981" }}>{fmt(r.contrib)}</td>
                        <td style={{ padding:"7px 10px",textAlign:"right",color:"#f59e0b" }}>{fmt(r.interest)}</td>
                        <td style={{ padding:"7px 10px",textAlign:"right",fontWeight:700,color:"#4f46e5" }}>{fmt(r.balance)}</td>
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
