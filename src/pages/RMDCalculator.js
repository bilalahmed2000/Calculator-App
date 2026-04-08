import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmt  = (n) => { if (!isFinite(n)||isNaN(n)) return "—"; return "$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}); };
const parseN = (s) => { const v=parseFloat(String(s??"").replace(/,/g,"")); return isNaN(v)?0:v; };
const ist = { width:"100%",background:"#f8f9ff",color:"#1e1b4b",border:"1.5px solid rgba(99,102,241,0.2)",borderRadius:12,padding:"9px 12px",fontSize:14,fontWeight:600,outline:"none",boxSizing:"border-box" };
const lst = { display:"block",fontSize:11,fontWeight:700,color:"#6b7a9e",marginBottom:5,letterSpacing:"0.4px",textTransform:"uppercase" };
const fst = { marginBottom:14 };
const sym = { color:"#6b7a9e",fontWeight:700,flexShrink:0 };

// IRS Uniform Lifetime Table (2022 updated)
const ULT = {
  72:27.4, 73:26.5, 74:25.5, 75:24.6, 76:23.7, 77:22.9, 78:22.0, 79:21.1, 80:20.2,
  81:19.4, 82:18.5, 83:17.7, 84:16.8, 85:16.0, 86:15.2, 87:14.4, 88:13.7, 89:12.9,
  90:12.2, 91:11.5, 92:10.8, 93:10.1, 94:9.5, 95:8.9, 96:8.4, 97:7.8, 98:7.3,
  99:6.8, 100:6.4, 101:6.0, 102:5.6, 103:5.2, 104:4.9, 105:4.6, 106:4.3, 107:4.1,
  108:3.9, 109:3.7, 110:3.5, 111:3.4, 112:3.3, 113:3.1, 114:3.0, 115:2.9,
};

export default function RMDCalculator() {
  const [balance,   setBalance]  = useState("500000");
  const [age,       setAge]      = useState("73");
  const [returnRate,setReturn]   = useState("6");
  const [years,     setYears]    = useState("15");
  const [result,    setResult]   = useState(null);
  const [err,       setErr]      = useState("");

  function calculate() {
    setErr(""); setResult(null);
    const bal=parseN(balance), a=parseInt(age), rr=parseN(returnRate), yrs=parseN(years);
    if (!(bal>0))  { setErr("Account balance must be greater than 0."); return; }
    if (a<72||a>120) { setErr("Age must be between 72 and 120."); return; }

    const factor = ULT[a];
    if (!factor) { setErr("Age not found in IRS Uniform Lifetime Table."); return; }
    const currentRMD = bal / factor;
    const monthlyRMD = currentRMD/12;

    // Project future RMDs
    const rows=[];
    let projBal = bal;
    const endYear = Math.min(yrs, 115 - a);
    for (let y=0; y<endYear; y++) {
      const curAge = a + y;
      const lef = ULT[curAge] || ULT[115] || 2.9;
      const rmd = projBal / lef;
      const afterRMD = projBal - rmd;
      projBal = afterRMD * (1 + rr/100);
      rows.push({ year:y+1, age:curAge, lef, rmd, balance:projBal });
    }

    setResult({ currentRMD, monthlyRMD, factor, balance:bal, rows, age:a });
  }

  function clear() { setBalance("500000"); setAge("73"); setReturn("6"); setYears("15"); setResult(null); setErr(""); }

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>RMD Calculator</h1>
        <p className="muted">Calculate your Required Minimum Distribution (RMD) from Traditional IRA, 401(k), or other tax-deferred retirement accounts using the IRS Uniform Lifetime Table.</p>
      </header>
      <div style={{ maxWidth:1120,margin:"0 auto" }}>
        <div style={{ display:"flex",gap:20,alignItems:"flex-start",flexWrap:"wrap",marginBottom:20 }}>
          <section className="card" style={{ flex:"0 0 312px",minWidth:268 }}>
            <div style={{ fontSize:12,color:"#6b7a9e",marginBottom:16,background:"#f0f0ff",padding:"10px 14px",borderRadius:8 }}>
              RMDs are required starting at age <strong style={{ color:"#4f46e5" }}>73</strong> (SECURE 2.0 Act, 2023).
            </div>
            <div style={fst}><label style={lst}>Account Balance (Dec 31 Prior Year)</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><span style={sym}>$</span><input style={ist} value={balance} onChange={e=>setBalance(e.target.value)} /></div></div>
            <div style={fst}><label style={lst}>Your Age (Current Year)</label><input style={ist} value={age} onChange={e=>setAge(e.target.value)} /></div>
            <div style={fst}><label style={lst}>Expected Annual Return</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><input style={ist} value={returnRate} onChange={e=>setReturn(e.target.value)} /><span style={sym}>%</span></div></div>
            <div style={fst}><label style={lst}>Project For (Years)</label><input style={ist} value={years} onChange={e=>setYears(e.target.value)} /></div>
            {err && <p style={{ color:"#ef4444",fontSize:13,marginBottom:10 }}>{err}</p>}
            <button className="btn" style={{ width:"100%",marginBottom:8 }} onClick={calculate}>Calculate</button>
            <button className="btn-sec" style={{ width:"100%" }} onClick={clear}>Clear</button>
          </section>

          {result && (
            <section className="card" style={{ flex:1,minWidth:260 }}>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"14px",marginBottom:22 }}>
                {[
                  ["This Year's RMD", fmt(result.currentRMD), "#4f46e5"],
                  ["Monthly Equivalent", fmt(result.monthlyRMD), "#10b981"],
                  ["Life Expectancy Factor", result.factor.toFixed(1)+" years", "#1e1b4b"],
                  ["Starting Balance", fmt(result.balance), "#6b7a9e"],
                ].map(([l,v,c])=>(
                  <div key={l} style={{ background:"#f0f0ff",borderRadius:10,padding:"14px 16px" }}>
                    <div style={{ fontSize:11,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:4 }}>{l}</div>
                    <div style={{ fontSize:18,fontWeight:800,color:c }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                  <thead><tr style={{ background:"#f0f0ff" }}>{["Age","IRS Factor","RMD","Balance After RMD"].map(h=><th key={h} style={{ padding:"8px 10px",textAlign:"right",fontWeight:700,color:"#4f46e5" }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {result.rows.map((r,i)=>(
                      <tr key={i} style={{ borderBottom:"1px solid rgba(99,102,241,0.08)",background:i%2===0?"#fafbff":"#fff" }}>
                        <td style={{ padding:"7px 10px",fontWeight:700,color:"#1e1b4b",textAlign:"right" }}>{r.age}</td>
                        <td style={{ padding:"7px 10px",textAlign:"right",color:"#6b7a9e" }}>{r.lef.toFixed(1)}</td>
                        <td style={{ padding:"7px 10px",textAlign:"right",fontWeight:700,color:"#f59e0b" }}>{fmt(r.rmd)}</td>
                        <td style={{ padding:"7px 10px",textAlign:"right",fontWeight:700,color:"#4f46e5" }}>{fmt(r.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize:12,color:"#9ca3af",marginTop:14 }}>Based on IRS Uniform Lifetime Table (2022). Consult a tax advisor for your specific situation.</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
