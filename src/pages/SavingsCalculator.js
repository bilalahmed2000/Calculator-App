import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmt  = (n) => { if (!isFinite(n)||isNaN(n)) return "—"; return "$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}); };
const parseN = (s) => { const v=parseFloat(String(s??"").replace(/,/g,"")); return isNaN(v)?0:v; };
const ist = { width:"100%",background:"#f8f9ff",color:"#1e1b4b",border:"1.5px solid rgba(99,102,241,0.2)",borderRadius:12,padding:"9px 12px",fontSize:14,fontWeight:600,outline:"none",boxSizing:"border-box" };
const lst = { display:"block",fontSize:11,fontWeight:700,color:"#6b7a9e",marginBottom:5,letterSpacing:"0.4px",textTransform:"uppercase" };
const fst = { marginBottom:14 };
const sym = { color:"#6b7a9e",fontWeight:700,flexShrink:0 };

export default function SavingsCalculator() {
  const [initial,  setInitial]  = useState("5000");
  const [monthly,  setMonthly]  = useState("200");
  const [rate,     setRate]     = useState("6");
  const [years,    setYears]    = useState("20");
  const [result,   setResult]   = useState(null);
  const [err,      setErr]      = useState("");
  const [tab,      setTab]      = useState("year");

  function calculate() {
    setErr(""); setResult(null);
    const P=parseN(initial), c=parseN(monthly), r=parseN(rate), t=parseN(years);
    if (!(P>=0))  { setErr("Initial deposit must be 0 or greater."); return; }
    if (!(r>=0))  { setErr("Interest rate must be 0 or greater."); return; }
    if (!(t>0))   { setErr("Years must be greater than 0."); return; }

    const mr = r/100/12;
    const months = Math.round(t*12);
    let bal=P, totalContrib=0;
    const monthly_rows=[], annual_rows=[];
    let yContrib=0, yInt=0;

    for (let m=1;m<=months;m++) {
      const int = bal*mr;
      bal = bal + int + c;
      totalContrib += c;
      yContrib+=c; yInt+=int;
      monthly_rows.push({ m, year:Math.ceil(m/12), interest:int, contrib:c, balance:bal });
      if (m%12===0||m===months) {
        annual_rows.push({ year:Math.ceil(m/12), balance:bal, contrib:yContrib, interest:yInt });
        yContrib=0; yInt=0;
      }
    }
    setResult({ balance:bal, initial:P, totalContrib, totalInterest:bal-P-totalContrib, annual_rows, monthly_rows });
  }

  function clear() { setInitial("5000"); setMonthly("200"); setRate("6"); setYears("20"); setResult(null); setErr(""); }

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Savings Calculator</h1>
        <p className="muted">Project your savings growth with an initial deposit, regular monthly contributions, and compound interest over time.</p>
      </header>
      <div style={{ maxWidth:1120,margin:"0 auto" }}>
        <div style={{ display:"flex",gap:20,alignItems:"flex-start",flexWrap:"wrap",marginBottom:20 }}>
          <section className="card" style={{ flex:"0 0 312px",minWidth:268 }}>
            <div style={fst}><label style={lst}>Initial Deposit</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><span style={sym}>$</span><input style={ist} value={initial} onChange={e=>setInitial(e.target.value)} /></div></div>
            <div style={fst}><label style={lst}>Monthly Contribution</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><span style={sym}>$</span><input style={ist} value={monthly} onChange={e=>setMonthly(e.target.value)} /></div></div>
            <div style={fst}><label style={lst}>Annual Interest Rate</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><input style={ist} value={rate} onChange={e=>setRate(e.target.value)} /><span style={sym}>%</span></div></div>
            <div style={fst}><label style={lst}>Time Period (Years)</label><input style={ist} value={years} onChange={e=>setYears(e.target.value)} /></div>
            {err && <p style={{ color:"#ef4444",fontSize:13,marginBottom:10 }}>{err}</p>}
            <button className="btn" style={{ width:"100%",marginBottom:8 }} onClick={calculate}>Calculate</button>
            <button className="btn-sec" style={{ width:"100%" }} onClick={clear}>Clear</button>
          </section>

          {result && (
            <section className="card" style={{ flex:1,minWidth:300 }}>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"14px 24px",marginBottom:22 }}>
                {[["Final Balance",fmt(result.balance),"#4f46e5"],["Initial Deposit",fmt(result.initial),"#1e1b4b"],["Total Contributions",fmt(result.totalContrib),"#10b981"],["Total Interest Earned",fmt(result.totalInterest),"#f59e0b"]].map(([l,v,c])=>(
                  <div key={l} style={{ background:"#f0f0ff",borderRadius:10,padding:"14px 16px" }}>
                    <div style={{ fontSize:11,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:4 }}>{l}</div>
                    <div style={{ fontSize:20,fontWeight:800,color:c }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex",gap:8,marginBottom:14 }}>
                {["year","month"].map(t=><button key={t} onClick={()=>setTab(t)} style={{ padding:"6px 16px",borderRadius:8,border:"1.5px solid rgba(99,102,241,0.25)",background:tab===t?"#4f46e5":"#f8f9ff",color:tab===t?"#fff":"#4f46e5",fontWeight:700,fontSize:13,cursor:"pointer" }}>{t==="year"?"Annual":"Monthly"}</button>)}
              </div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                  <thead><tr style={{ background:"#f0f0ff" }}>{["Period","Contributions","Interest","End Balance"].map(h=><th key={h} style={{ padding:"8px 10px",textAlign:"right",fontWeight:700,color:"#4f46e5" }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {(tab==="year"?result.annual_rows:result.monthly_rows).map((r,i)=>(
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
