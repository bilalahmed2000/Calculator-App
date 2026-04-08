import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmt  = (n) => { if (!isFinite(n)||isNaN(n)) return "—"; return "$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}); };
const parseN = (s) => { const v=parseFloat(String(s??"").replace(/,/g,"")); return isNaN(v)?0:v; };
const ist = { width:"100%",background:"#f8f9ff",color:"#1e1b4b",border:"1.5px solid rgba(99,102,241,0.2)",borderRadius:12,padding:"9px 12px",fontSize:14,fontWeight:600,outline:"none",boxSizing:"border-box" };
const lst = { display:"block",fontSize:11,fontWeight:700,color:"#6b7a9e",marginBottom:5,letterSpacing:"0.4px",textTransform:"uppercase" };
const fst = { marginBottom:14 };
const sym = { color:"#6b7a9e",fontWeight:700,flexShrink:0 };

// 2024 401(k) contribution limits
const LIMIT_2024      = 23000;
const CATCHUP_2024    = 30500; // age 50+

export default function Calculator401K() {
  const [currentAge,  setCurrentAge]  = useState("30");
  const [retireAge,   setRetireAge]   = useState("65");
  const [currentBal,  setCurrentBal]  = useState("25000");
  const [salary,      setSalary]      = useState("75000");
  const [contribPct,  setContribPct]  = useState("10");
  const [matchPct,    setMatchPct]    = useState("3");
  const [matchLimit,  setMatchLimit]  = useState("6");
  const [returnRate,  setReturnRate]  = useState("7");
  const [inflation,   setInflation]   = useState("2.5");
  const [result,      setResult]      = useState(null);
  const [err,         setErr]         = useState("");

  function calculate() {
    setErr(""); setResult(null);
    const ca=parseN(currentAge), ra=parseN(retireAge), bal=parseN(currentBal);
    const sal=parseN(salary), cp=parseN(contribPct), mp=parseN(matchPct);
    const ml=parseN(matchLimit), rr=parseN(returnRate), inf=parseN(inflation);
    if (ca>=ra)          { setErr("Retirement age must be greater than current age."); return; }
    if (!(sal>0))        { setErr("Salary must be greater than 0."); return; }
    if (cp<0||cp>100)    { setErr("Contribution % must be between 0 and 100."); return; }

    const years = ra - ca;
    const mr = rr/100/12;
    let balance = bal;
    const rows = [];

    for (let y=1; y<=years; y++) {
      const age = ca + y;
      const annualContrib = Math.min(sal * cp/100, age>=50 ? CATCHUP_2024 : LIMIT_2024);
      const employerContrib = sal * Math.min(cp/100, ml/100) * mp/100;
      const totalAnnualContrib = annualContrib + employerContrib;
      const monthlyContrib = totalAnnualContrib / 12;
      let yInt = 0;
      for (let m=0; m<12; m++) {
        const int = (balance + monthlyContrib) * mr;
        balance += monthlyContrib + int;
        yInt += int;
      }
      rows.push({ year:y, age, balance, contrib:totalAnnualContrib, interest:yInt, employeeContrib:annualContrib, employerContrib });
    }

    const totalContrib = rows.reduce((s,r)=>s+r.contrib, 0);
    const totalInterest = balance - parseN(currentBal) - totalContrib;
    const inflAdj = balance / Math.pow(1+inf/100, years);
    setResult({ balance, inflationAdjusted:inflAdj, totalContrib, totalInterest, rows, years, initialBal:bal });
  }

  function clear() { setCurrentAge("30"); setRetireAge("65"); setCurrentBal("25000"); setSalary("75000"); setContribPct("10"); setMatchPct("3"); setMatchLimit("6"); setReturnRate("7"); setInflation("2.5"); setResult(null); setErr(""); }

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>401(k) Calculator</h1>
        <p className="muted">Project your 401(k) retirement balance based on your salary, contribution rate, employer match, and expected return. Based on 2024 IRS contribution limits.</p>
      </header>
      <div style={{ maxWidth:1120,margin:"0 auto" }}>
        <div style={{ display:"flex",gap:20,alignItems:"flex-start",flexWrap:"wrap",marginBottom:20 }}>
          <section className="card" style={{ flex:"0 0 340px",minWidth:268 }}>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px" }}>
              <div style={fst}><label style={lst}>Current Age</label><input style={ist} value={currentAge} onChange={e=>setCurrentAge(e.target.value)} /></div>
              <div style={fst}><label style={lst}>Retirement Age</label><input style={ist} value={retireAge} onChange={e=>setRetireAge(e.target.value)} /></div>
            </div>
            <div style={fst}><label style={lst}>Current 401(k) Balance</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><span style={sym}>$</span><input style={ist} value={currentBal} onChange={e=>setCurrentBal(e.target.value)} /></div></div>
            <div style={fst}><label style={lst}>Annual Salary</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><span style={sym}>$</span><input style={ist} value={salary} onChange={e=>setSalary(e.target.value)} /></div></div>
            <div style={fst}><label style={lst}>Your Contribution Rate</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><input style={ist} value={contribPct} onChange={e=>setContribPct(e.target.value)} /><span style={sym}>%</span></div></div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px" }}>
              <div style={fst}><label style={lst}>Employer Match</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><input style={ist} value={matchPct} onChange={e=>setMatchPct(e.target.value)} /><span style={sym}>%</span></div></div>
              <div style={fst}><label style={lst}>Match Up To</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><input style={ist} value={matchLimit} onChange={e=>setMatchLimit(e.target.value)} /><span style={sym}>%</span></div></div>
            </div>
            <div style={fst}><label style={lst}>Expected Annual Return</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><input style={ist} value={returnRate} onChange={e=>setReturnRate(e.target.value)} /><span style={sym}>%</span></div></div>
            <div style={fst}><label style={lst}>Expected Inflation Rate</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><input style={ist} value={inflation} onChange={e=>setInflation(e.target.value)} /><span style={sym}>%</span></div></div>
            <div style={{ fontSize:12,color:"#9ca3af",marginBottom:14 }}>2024 IRS limit: <strong>${LIMIT_2024.toLocaleString()}</strong> ($30,500 if age 50+)</div>
            {err && <p style={{ color:"#ef4444",fontSize:13,marginBottom:10 }}>{err}</p>}
            <button className="btn" style={{ width:"100%",marginBottom:8 }} onClick={calculate}>Calculate</button>
            <button className="btn-sec" style={{ width:"100%" }} onClick={clear}>Clear</button>
          </section>

          {result && (
            <section className="card" style={{ flex:1,minWidth:300 }}>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"12px 20px",marginBottom:22 }}>
                {[
                  ["Projected Balance",fmt(result.balance),"#4f46e5"],
                  ["Inflation-Adjusted",fmt(result.inflationAdjusted),"#6b7a9e"],
                  ["Total Contributions",fmt(result.totalContrib),"#10b981"],
                  ["Total Investment Growth",fmt(result.totalInterest),"#f59e0b"],
                ].map(([l,v,c])=>(
                  <div key={l} style={{ background:"#f0f0ff",borderRadius:10,padding:"14px 16px" }}>
                    <div style={{ fontSize:11,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:4 }}>{l}</div>
                    <div style={{ fontSize:18,fontWeight:800,color:c }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                  <thead><tr style={{ background:"#f0f0ff" }}>{["Age","Your Contrib.","Employer","Growth","Balance"].map(h=><th key={h} style={{ padding:"8px 10px",textAlign:"right",fontWeight:700,color:"#4f46e5",whiteSpace:"nowrap" }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {result.rows.map((r,i)=>(
                      <tr key={i} style={{ borderBottom:"1px solid rgba(99,102,241,0.08)",background:i%2===0?"#fafbff":"#fff" }}>
                        <td style={{ padding:"7px 10px",fontWeight:700,color:"#1e1b4b",textAlign:"right" }}>{r.age}</td>
                        <td style={{ padding:"7px 10px",textAlign:"right",color:"#10b981" }}>{fmt(r.employeeContrib)}</td>
                        <td style={{ padding:"7px 10px",textAlign:"right",color:"#16a34a" }}>{fmt(r.employerContrib)}</td>
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
