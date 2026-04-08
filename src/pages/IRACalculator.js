import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmt  = (n) => { if (!isFinite(n)||isNaN(n)) return "—"; return "$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}); };
const parseN = (s) => { const v=parseFloat(String(s??"").replace(/,/g,"")); return isNaN(v)?0:v; };
const ist = { width:"100%",background:"#f8f9ff",color:"#1e1b4b",border:"1.5px solid rgba(99,102,241,0.2)",borderRadius:12,padding:"9px 12px",fontSize:14,fontWeight:600,outline:"none",boxSizing:"border-box" };
const lst = { display:"block",fontSize:11,fontWeight:700,color:"#6b7a9e",marginBottom:5,letterSpacing:"0.4px",textTransform:"uppercase" };
const fst = { marginBottom:14 };
const sym = { color:"#6b7a9e",fontWeight:700,flexShrink:0 };

export default function IRACalculator() {
  const [type,        setType]       = useState("traditional");
  const [currentAge,  setCurrentAge] = useState("35");
  const [retireAge,   setRetireAge]  = useState("65");
  const [currentBal,  setCurrentBal] = useState("15000");
  const [annualContrib, setContrib]  = useState("7000");
  const [returnRate,  setReturnRate] = useState("7");
  const [taxRate,     setTaxRate]    = useState("22");
  const [retTaxRate,  setRetTaxRate] = useState("15");
  const [result,      setResult]     = useState(null);
  const [err,         setErr]        = useState("");

  function calculate() {
    setErr(""); setResult(null);
    const ca=parseN(currentAge), ra=parseN(retireAge), bal=parseN(currentBal);
    const ac=parseN(annualContrib), rr=parseN(returnRate);
    const ct=parseN(taxRate), rt=parseN(retTaxRate);
    if (ca>=ra) { setErr("Retirement age must be greater than current age."); return; }
    const years = ra - ca;
    const mr = rr/100/12;
    const limit = ca>=50 ? 8000 : 7000;
    const contrib = Math.min(ac, limit);
    const monthlyContrib = contrib/12;

    let bal2 = bal, totalContrib=0, totalInt=0;
    const rows=[];
    for (let y=1; y<=years; y++) {
      let yInt=0;
      for (let m=0; m<12; m++) {
        const int = (bal2+monthlyContrib)*mr;
        bal2 += monthlyContrib + int;
        yInt+=int;
      }
      totalContrib+=contrib; totalInt+=yInt;
      rows.push({ year:y, age:ca+y, balance:bal2, contrib, interest:yInt });
    }
    const afterTax = type==="traditional" ? bal2*(1-rt/100) : bal2;
    const taxSaved = type==="traditional" ? totalContrib*ct/100 : 0;
    setResult({ balance:bal2, afterTax, totalContrib, totalInt, taxSaved, rows });
  }

  function clear() { setCurrentAge("35"); setRetireAge("65"); setCurrentBal("15000"); setContrib("7000"); setReturnRate("7"); setTaxRate("22"); setRetTaxRate("15"); setResult(null); setErr(""); }

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>IRA Calculator</h1>
        <p className="muted">Calculate your Individual Retirement Account (IRA) growth for Traditional or Roth IRA based on your contributions and expected returns.</p>
      </header>
      <div style={{ maxWidth:1120,margin:"0 auto" }}>
        <div style={{ display:"flex",gap:20,alignItems:"flex-start",flexWrap:"wrap",marginBottom:20 }}>
          <section className="card" style={{ flex:"0 0 340px",minWidth:268 }}>
            <div style={{ display:"flex",gap:8,marginBottom:18 }}>
              {[["traditional","Traditional IRA"],["roth","Roth IRA"]].map(([k,l])=>(
                <button key={k} onClick={()=>setType(k)} style={{ flex:1,padding:"8px",borderRadius:8,border:"1.5px solid rgba(99,102,241,0.25)",background:type===k?"#4f46e5":"#f8f9ff",color:type===k?"#fff":"#4f46e5",fontWeight:700,fontSize:13,cursor:"pointer" }}>{l}</button>
              ))}
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px" }}>
              <div style={fst}><label style={lst}>Current Age</label><input style={ist} value={currentAge} onChange={e=>setCurrentAge(e.target.value)} /></div>
              <div style={fst}><label style={lst}>Retirement Age</label><input style={ist} value={retireAge} onChange={e=>setRetireAge(e.target.value)} /></div>
            </div>
            <div style={fst}><label style={lst}>Current IRA Balance</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><span style={sym}>$</span><input style={ist} value={currentBal} onChange={e=>setCurrentBal(e.target.value)} /></div></div>
            <div style={fst}><label style={lst}>Annual Contribution (2024 max: $7,000)</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><span style={sym}>$</span><input style={ist} value={annualContrib} onChange={e=>setContrib(e.target.value)} /></div></div>
            <div style={fst}><label style={lst}>Expected Annual Return</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><input style={ist} value={returnRate} onChange={e=>setReturnRate(e.target.value)} /><span style={sym}>%</span></div></div>
            <div style={fst}><label style={lst}>Current Tax Rate</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><input style={ist} value={taxRate} onChange={e=>setTaxRate(e.target.value)} /><span style={sym}>%</span></div></div>
            {type==="traditional" && <div style={fst}><label style={lst}>Retirement Tax Rate</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><input style={ist} value={retTaxRate} onChange={e=>setRetTaxRate(e.target.value)} /><span style={sym}>%</span></div></div>}
            {err && <p style={{ color:"#ef4444",fontSize:13,marginBottom:10 }}>{err}</p>}
            <button className="btn" style={{ width:"100%",marginBottom:8 }} onClick={calculate}>Calculate</button>
            <button className="btn-sec" style={{ width:"100%" }} onClick={clear}>Clear</button>
          </section>

          {result && (
            <section className="card" style={{ flex:1,minWidth:300 }}>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"12px",marginBottom:22 }}>
                {[
                  ["Balance at Retirement", fmt(result.balance), "#4f46e5"],
                  [type==="traditional"?"After-Tax Withdrawal":"Tax-Free Balance", fmt(result.afterTax), "#10b981"],
                  ["Total Contributions", fmt(result.totalContrib), "#1e1b4b"],
                  [type==="traditional"?"Est. Tax Savings Now":"Total Interest", fmt(type==="traditional"?result.taxSaved:result.totalInt), "#f59e0b"],
                ].map(([l,v,c])=>(
                  <div key={l} style={{ background:"#f0f0ff",borderRadius:10,padding:"14px 16px" }}>
                    <div style={{ fontSize:11,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:4 }}>{l}</div>
                    <div style={{ fontSize:18,fontWeight:800,color:c }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                  <thead><tr style={{ background:"#f0f0ff" }}>{["Age","Annual Contrib.","Interest Earned","Balance"].map(h=><th key={h} style={{ padding:"8px 10px",textAlign:"right",fontWeight:700,color:"#4f46e5" }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {result.rows.map((r,i)=>(
                      <tr key={i} style={{ borderBottom:"1px solid rgba(99,102,241,0.08)",background:i%2===0?"#fafbff":"#fff" }}>
                        <td style={{ padding:"7px 10px",fontWeight:700,color:"#1e1b4b",textAlign:"right" }}>{r.age}</td>
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
