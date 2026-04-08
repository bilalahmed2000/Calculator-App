import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const parseN = (s) => { const v=parseFloat(String(s??"").replace(/,/g,"")); return isNaN(v)?NaN:v; };
const ist = { width:"100%",background:"#f8f9ff",color:"#1e1b4b",border:"1.5px solid rgba(99,102,241,0.2)",borderRadius:12,padding:"9px 12px",fontSize:14,fontWeight:600,outline:"none",boxSizing:"border-box" };
const lst = { display:"block",fontSize:11,fontWeight:700,color:"#6b7a9e",marginBottom:5,letterSpacing:"0.4px",textTransform:"uppercase" };
const fst = { marginBottom:14 };

const PRESETS = {
  "S&P 500 (Last 10 Years)": "13.6, 21.8, -4.4, 31.5, 18.4, 28.7, -18.1, 26.3, 24.2, 11.0",
  "Balanced Portfolio": "8.2, 12.1, -3.5, 15.7, 9.8, 18.2, -8.4, 14.6, 16.3, 7.1",
  "Conservative": "4.1, 6.2, 1.8, 8.5, 5.3, 9.1, -2.1, 7.4, 8.9, 4.5",
};

export default function AverageReturnCalculator() {
  const [input,  setInput]  = useState("13.6, 21.8, -4.4, 31.5, 18.4, 28.7, -18.1, 26.3, 24.2, 11.0");
  const [result, setResult] = useState(null);
  const [err,    setErr]    = useState("");

  function calculate() {
    setErr(""); setResult(null);
    const vals = input.split(/[\s,;]+/).map(s=>parseN(s)).filter(v=>!isNaN(v));
    if (vals.length<2) { setErr("Please enter at least 2 return values separated by commas."); return; }

    const n = vals.length;
    const arithmetic = vals.reduce((s,v)=>s+v, 0)/n;

    // Geometric mean: product of (1 + r_i/100) ^ (1/n) - 1
    const product = vals.reduce((p,v)=>p*(1+v/100), 1);
    const geometric = (Math.pow(product, 1/n) - 1)*100;

    // Sorted for median
    const sorted = [...vals].sort((a,b)=>a-b);
    const median = n%2===0 ? (sorted[n/2-1]+sorted[n/2])/2 : sorted[Math.floor(n/2)];
    const min    = sorted[0];
    const max    = sorted[n-1];
    const stdDev = Math.sqrt(vals.reduce((s,v)=>s+(v-arithmetic)**2, 0)/(n-1));

    // Simulate $10,000 growth
    let balance=10000;
    const growthRows = vals.map((r,i)=>{ balance*=(1+r/100); return { year:i+1, return:r, balance }; });

    setResult({ arithmetic, geometric, median, min, max, stdDev, n, growthRows, finalBalance:balance });
  }

  function clear() { setInput(""); setResult(null); setErr(""); }

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Average Return Calculator</h1>
        <p className="muted">Enter a series of annual returns to calculate arithmetic mean, geometric mean (CAGR), median, standard deviation, and simulated portfolio growth.</p>
      </header>
      <div style={{ maxWidth:1120,margin:"0 auto" }}>
        <div style={{ display:"flex",gap:20,alignItems:"flex-start",flexWrap:"wrap",marginBottom:20 }}>
          <section className="card" style={{ flex:"0 0 340px",minWidth:268 }}>
            <div style={fst}>
              <label style={lst}>Annual Returns (% — comma separated)</label>
              <textarea
                style={{ ...ist, minHeight:120, resize:"vertical", fontFamily:"monospace" }}
                value={input}
                onChange={e=>setInput(e.target.value)}
                placeholder="e.g. 10.5, -3.2, 15.1, 8.7, ..."
              />
            </div>
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11,fontWeight:700,color:"#6b7a9e",textTransform:"uppercase",marginBottom:8,letterSpacing:"0.4px" }}>Quick Load</div>
              <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                {Object.entries(PRESETS).map(([k,v])=>(
                  <button key={k} onClick={()=>setInput(v)} style={{ padding:"6px 12px",borderRadius:8,border:"1px solid rgba(99,102,241,0.2)",background:"#f8f9ff",color:"#4f46e5",fontSize:12,fontWeight:700,cursor:"pointer",textAlign:"left" }}>{k}</button>
                ))}
              </div>
            </div>
            {err && <p style={{ color:"#ef4444",fontSize:13,marginBottom:10 }}>{err}</p>}
            <button className="btn" style={{ width:"100%",marginBottom:8 }} onClick={calculate}>Calculate</button>
            <button className="btn-sec" style={{ width:"100%" }} onClick={clear}>Clear</button>
          </section>

          {result && (
            <section className="card" style={{ flex:1,minWidth:280 }}>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"12px",marginBottom:22 }}>
                {[
                  ["Arithmetic Mean", result.arithmetic.toFixed(4)+"%", "#4f46e5"],
                  ["Geometric Mean (CAGR)", result.geometric.toFixed(4)+"%", "#10b981"],
                  ["Median Return", result.median.toFixed(4)+"%", "#1e1b4b"],
                  ["Std. Deviation (Risk)", result.stdDev.toFixed(4)+"%", "#f59e0b"],
                  ["Best Year", result.max.toFixed(2)+"%", "#16a34a"],
                  ["Worst Year", result.min.toFixed(2)+"%", "#dc2626"],
                ].map(([l,v,c])=>(
                  <div key={l} style={{ background:"#f0f0ff",borderRadius:10,padding:"12px 14px" }}>
                    <div style={{ fontSize:11,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:3 }}>{l}</div>
                    <div style={{ fontSize:17,fontWeight:800,color:c }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ background:"#eef2ff",borderRadius:10,padding:"14px 16px",marginBottom:20 }}>
                <div style={{ fontSize:13,color:"#4f46e5",fontWeight:700 }}>
                  $10,000 invested → <strong style={{ fontSize:18 }}>${result.finalBalance.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</strong>
                </div>
                <div style={{ fontSize:12,color:"#6b7a9e",marginTop:4 }}>Simulated growth over {result.n} years based on entered returns.</div>
              </div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                  <thead><tr style={{ background:"#f0f0ff" }}>{["Year","Return (%)","$10k Balance"].map(h=><th key={h} style={{ padding:"8px 10px",textAlign:"right",fontWeight:700,color:"#4f46e5" }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {result.growthRows.map((r,i)=>(
                      <tr key={i} style={{ borderBottom:"1px solid rgba(99,102,241,0.08)",background:i%2===0?"#fafbff":"#fff" }}>
                        <td style={{ padding:"7px 10px",fontWeight:600,color:"#1e1b4b",textAlign:"right" }}>Year {r.year}</td>
                        <td style={{ padding:"7px 10px",textAlign:"right",fontWeight:700,color:r.return>=0?"#16a34a":"#dc2626" }}>{r.return>=0?"+":""}{r.return.toFixed(2)}%</td>
                        <td style={{ padding:"7px 10px",textAlign:"right",fontWeight:700,color:"#4f46e5" }}>${r.balance.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
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
