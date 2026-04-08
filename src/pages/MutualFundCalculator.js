import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmt  = (n) => { if (!isFinite(n)||isNaN(n)) return "—"; return "$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}); };
const parseN = (s) => { const v=parseFloat(String(s??"").replace(/,/g,"")); return isNaN(v)?0:v; };
const ist = { width:"100%",background:"#f8f9ff",color:"#1e1b4b",border:"1.5px solid rgba(99,102,241,0.2)",borderRadius:12,padding:"9px 12px",fontSize:14,fontWeight:600,outline:"none",boxSizing:"border-box" };
const lst = { display:"block",fontSize:11,fontWeight:700,color:"#6b7a9e",marginBottom:5,letterSpacing:"0.4px",textTransform:"uppercase" };
const fst = { marginBottom:14 };
const sym = { color:"#6b7a9e",fontWeight:700,flexShrink:0 };

export default function MutualFundCalculator() {
  const [initial,   setInitial]   = useState("10000");
  const [monthly,   setMonthly]   = useState("500");
  const [grossRate, setGrossRate] = useState("10");
  const [expense,   setExpense]   = useState("1.0");
  const [years,     setYears]     = useState("20");
  const [result,    setResult]    = useState(null);
  const [err,       setErr]       = useState("");

  function calculate() {
    setErr(""); setResult(null);
    const P=parseN(initial), c=parseN(monthly), gr=parseN(grossRate), er=parseN(expense), t=parseN(years);
    if (!(P>=0)) { setErr("Initial investment must be 0 or greater."); return; }
    if (!(gr>=0)){ setErr("Gross return must be 0 or greater."); return; }
    if (!(t>0))  { setErr("Years must be greater than 0."); return; }

    const netRate = gr - er;
    const months  = Math.round(t*12);
    const grossMr = gr/100/12;
    const netMr   = netRate/100/12;

    let grossBal=P, netBal=P, totalContrib=P;
    const rows=[];
    let yGrossInt=0, yNetInt=0;

    for (let m=1; m<=months; m++) {
      const gi = (grossBal+c)*grossMr; grossBal+=c+gi; yGrossInt+=gi;
      const ni = (netBal+c)*netMr;     netBal  +=c+ni; yNetInt  +=ni;
      totalContrib += c;
      if (m%12===0||m===months) {
        rows.push({ year:Math.ceil(m/12), grossBal, netBal, grossInt:yGrossInt, netInt:yNetInt, expenseCost:grossBal-netBal });
        yGrossInt=0; yNetInt=0;
      }
    }
    const expenseDrag = grossBal - netBal;
    setResult({ grossBal, netBal, expenseDrag, totalContrib, grossGain:grossBal-totalContrib, netGain:netBal-totalContrib, rows });
  }

  function clear() { setInitial("10000"); setMonthly("500"); setGrossRate("10"); setExpense("1.0"); setYears("20"); setResult(null); setErr(""); }

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Mutual Fund Calculator</h1>
        <p className="muted">See how expense ratios reduce your mutual fund returns over time. Compare gross vs. net growth to understand the real cost of fund fees.</p>
      </header>
      <div style={{ maxWidth:1120,margin:"0 auto" }}>
        <div style={{ display:"flex",gap:20,alignItems:"flex-start",flexWrap:"wrap",marginBottom:20 }}>
          <section className="card" style={{ flex:"0 0 312px",minWidth:268 }}>
            <div style={fst}><label style={lst}>Initial Investment</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><span style={sym}>$</span><input style={ist} value={initial} onChange={e=>setInitial(e.target.value)} /></div></div>
            <div style={fst}><label style={lst}>Monthly Contribution</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><span style={sym}>$</span><input style={ist} value={monthly} onChange={e=>setMonthly(e.target.value)} /></div></div>
            <div style={fst}><label style={lst}>Gross Annual Return</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><input style={ist} value={grossRate} onChange={e=>setGrossRate(e.target.value)} /><span style={sym}>%</span></div></div>
            <div style={fst}><label style={lst}>Annual Expense Ratio</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><input style={ist} value={expense} onChange={e=>setExpense(e.target.value)} /><span style={sym}>%</span></div></div>
            <div style={fst}><label style={lst}>Investment Period (Years)</label><input style={ist} value={years} onChange={e=>setYears(e.target.value)} /></div>
            {err && <p style={{ color:"#ef4444",fontSize:13,marginBottom:10 }}>{err}</p>}
            <button className="btn" style={{ width:"100%",marginBottom:8 }} onClick={calculate}>Calculate</button>
            <button className="btn-sec" style={{ width:"100%" }} onClick={clear}>Clear</button>
          </section>

          {result && (
            <section className="card" style={{ flex:1,minWidth:300 }}>
              <div style={{ background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:12,padding:"14px 18px",marginBottom:20 }}>
                <div style={{ fontWeight:800,fontSize:15,color:"#dc2626",marginBottom:4 }}>
                  Total Expense Drag: {fmt(result.expenseDrag)}
                </div>
                <div style={{ fontSize:13,color:"#6b7a9e" }}>
                  This is how much the expense ratio costs you over {parseN(years)} years.
                </div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"12px",marginBottom:22 }}>
                {[
                  ["Net Final Balance",fmt(result.netBal),"#4f46e5"],
                  ["Gross Final Balance",fmt(result.grossBal),"#10b981"],
                  ["Net Gain",fmt(result.netGain),"#1e1b4b"],
                  ["Total Contributions",fmt(result.totalContrib),"#6b7a9e"],
                ].map(([l,v,c])=>(
                  <div key={l} style={{ background:"#f0f0ff",borderRadius:10,padding:"14px 16px" }}>
                    <div style={{ fontSize:11,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:4 }}>{l}</div>
                    <div style={{ fontSize:18,fontWeight:800,color:c }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                  <thead><tr style={{ background:"#f0f0ff" }}>{["Year","Gross Balance","Net Balance","Fee Drag"].map(h=><th key={h} style={{ padding:"8px 10px",textAlign:"right",fontWeight:700,color:"#4f46e5" }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {result.rows.map((r,i)=>(
                      <tr key={i} style={{ borderBottom:"1px solid rgba(99,102,241,0.08)",background:i%2===0?"#fafbff":"#fff" }}>
                        <td style={{ padding:"7px 10px",fontWeight:600,color:"#1e1b4b",textAlign:"right" }}>Year {r.year}</td>
                        <td style={{ padding:"7px 10px",textAlign:"right",color:"#10b981" }}>{fmt(r.grossBal)}</td>
                        <td style={{ padding:"7px 10px",textAlign:"right",fontWeight:700,color:"#4f46e5" }}>{fmt(r.netBal)}</td>
                        <td style={{ padding:"7px 10px",textAlign:"right",color:"#dc2626" }}>{fmt(r.expenseCost)}</td>
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
