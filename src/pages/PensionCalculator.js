import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmt  = (n) => { if (!isFinite(n)||isNaN(n)) return "—"; return "$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}); };
const parseN = (s) => { const v=parseFloat(String(s??"").replace(/,/g,"")); return isNaN(v)?0:v; };
const ist = { width:"100%",background:"#f8f9ff",color:"#1e1b4b",border:"1.5px solid rgba(99,102,241,0.2)",borderRadius:12,padding:"9px 12px",fontSize:14,fontWeight:600,outline:"none",boxSizing:"border-box" };
const lst = { display:"block",fontSize:11,fontWeight:700,color:"#6b7a9e",marginBottom:5,letterSpacing:"0.4px",textTransform:"uppercase" };
const fst = { marginBottom:14 };
const sym = { color:"#6b7a9e",fontWeight:700,flexShrink:0 };

export default function PensionCalculator() {
  const [finalSalary,  setFinalSalary]  = useState("80000");
  const [yearsService, setYearsService] = useState("30");
  const [multiplier,   setMultiplier]   = useState("2.0");
  const [cola,         setCola]         = useState("2");
  const [startAge,     setStartAge]     = useState("65");
  const [lifeExp,      setLifeExp]      = useState("85");
  const [survivor,     setSurvivor]     = useState("50");
  const [result,       setResult]       = useState(null);
  const [err,          setErr]          = useState("");

  function calculate() {
    setErr(""); setResult(null);
    const sal=parseN(finalSalary), yrs=parseN(yearsService), mult=parseN(multiplier);
    const colaRate=parseN(cola), sa=parseN(startAge), le=parseN(lifeExp), surv=parseN(survivor);
    if (!(sal>0))  { setErr("Final salary must be greater than 0."); return; }
    if (!(yrs>0))  { setErr("Years of service must be greater than 0."); return; }
    if (!(mult>0)) { setErr("Benefit multiplier must be greater than 0."); return; }
    if (sa>=le)    { setErr("Life expectancy must be greater than start age."); return; }

    const annualPension = sal * (mult/100) * yrs;
    const monthlyPension = annualPension/12;
    const payoutYears = le - sa;

    // COLA-adjusted lifetime
    const rows=[];
    let cumPension=0;
    for (let y=1; y<=payoutYears; y++) {
      const annual = annualPension * Math.pow(1+colaRate/100, y-1);
      const monthly = annual/12;
      cumPension += annual;
      rows.push({ year:y, age:sa+y-1, annual, monthly, cumPension });
    }

    const lifetimePension = rows.reduce((s,r)=>s+r.annual,0);
    const survivorBenefit = monthlyPension * surv/100;

    setResult({ annualPension, monthlyPension, lifetimePension, payoutYears, survivorBenefit, rows });
  }

  function clear() { setFinalSalary("80000"); setYearsService("30"); setMultiplier("2.0"); setCola("2"); setStartAge("65"); setLifeExp("85"); setSurvivor("50"); setResult(null); setErr(""); }

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Pension Calculator</h1>
        <p className="muted">Estimate your defined-benefit pension income based on final salary, years of service, and benefit multiplier. Includes COLA adjustments and survivor benefit.</p>
      </header>
      <div style={{ maxWidth:1120,margin:"0 auto" }}>
        <div style={{ display:"flex",gap:20,alignItems:"flex-start",flexWrap:"wrap",marginBottom:20 }}>
          <section className="card" style={{ flex:"0 0 340px",minWidth:268 }}>
            <div style={fst}><label style={lst}>Final Average Salary</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><span style={sym}>$</span><input style={ist} value={finalSalary} onChange={e=>setFinalSalary(e.target.value)} /></div></div>
            <div style={fst}><label style={lst}>Years of Service</label><input style={ist} value={yearsService} onChange={e=>setYearsService(e.target.value)} /></div>
            <div style={fst}>
              <label style={lst}>Benefit Multiplier (% per year)</label>
              <div style={{ display:"flex",alignItems:"center",gap:6 }}><input style={ist} value={multiplier} onChange={e=>setMultiplier(e.target.value)} /><span style={sym}>%</span></div>
              <div style={{ fontSize:11,color:"#9ca3af",marginTop:4 }}>Common range: 1.5% – 2.5% per year</div>
            </div>
            <div style={fst}><label style={lst}>Annual COLA Adjustment</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><input style={ist} value={cola} onChange={e=>setCola(e.target.value)} /><span style={sym}>%</span></div></div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px" }}>
              <div style={fst}><label style={lst}>Pension Start Age</label><input style={ist} value={startAge} onChange={e=>setStartAge(e.target.value)} /></div>
              <div style={fst}><label style={lst}>Life Expectancy</label><input style={ist} value={lifeExp} onChange={e=>setLifeExp(e.target.value)} /></div>
            </div>
            <div style={fst}><label style={lst}>Survivor Benefit</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><input style={ist} value={survivor} onChange={e=>setSurvivor(e.target.value)} /><span style={sym}>%</span></div></div>
            {err && <p style={{ color:"#ef4444",fontSize:13,marginBottom:10 }}>{err}</p>}
            <button className="btn" style={{ width:"100%",marginBottom:8 }} onClick={calculate}>Calculate</button>
            <button className="btn-sec" style={{ width:"100%" }} onClick={clear}>Clear</button>
          </section>

          {result && (
            <section className="card" style={{ flex:1,minWidth:260 }}>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"14px",marginBottom:22 }}>
                {[
                  ["Annual Pension", fmt(result.annualPension), "#4f46e5"],
                  ["Monthly Pension", fmt(result.monthlyPension), "#10b981"],
                  ["Lifetime Payout (w/ COLA)", fmt(result.lifetimePension), "#f59e0b"],
                  ["Survivor Benefit/Month", fmt(result.survivorBenefit), "#6b7a9e"],
                ].map(([l,v,c])=>(
                  <div key={l} style={{ background:"#f0f0ff",borderRadius:10,padding:"14px 16px" }}>
                    <div style={{ fontSize:11,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:4 }}>{l}</div>
                    <div style={{ fontSize:18,fontWeight:800,color:c }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                  <thead><tr style={{ background:"#f0f0ff" }}>{["Age","Annual (w/ COLA)","Monthly","Cumulative"].map(h=><th key={h} style={{ padding:"8px 10px",textAlign:"right",fontWeight:700,color:"#4f46e5" }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {result.rows.map((r,i)=>(
                      <tr key={i} style={{ borderBottom:"1px solid rgba(99,102,241,0.08)",background:i%2===0?"#fafbff":"#fff" }}>
                        <td style={{ padding:"7px 10px",fontWeight:700,color:"#1e1b4b",textAlign:"right" }}>{r.age}</td>
                        <td style={{ padding:"7px 10px",textAlign:"right",color:"#10b981" }}>{fmt(r.annual)}</td>
                        <td style={{ padding:"7px 10px",textAlign:"right",color:"#6b7a9e" }}>{fmt(r.monthly)}</td>
                        <td style={{ padding:"7px 10px",textAlign:"right",fontWeight:700,color:"#4f46e5" }}>{fmt(r.cumPension)}</td>
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
