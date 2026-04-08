import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmt  = (n) => { if (!isFinite(n)||isNaN(n)) return "—"; return "$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}); };
const fmtp = (n) => { if (!isFinite(n)||isNaN(n)) return "—"; return (n>=0?"+":"")+n.toFixed(2)+"%"; };
const parseN = (s) => { const v=parseFloat(String(s??"").replace(/,/g,"")); return isNaN(v)?0:v; };
const ist = { width:"100%",background:"#f8f9ff",color:"#1e1b4b",border:"1.5px solid rgba(99,102,241,0.2)",borderRadius:12,padding:"9px 12px",fontSize:14,fontWeight:600,outline:"none",boxSizing:"border-box" };
const lst = { display:"block",fontSize:11,fontWeight:700,color:"#6b7a9e",marginBottom:5,letterSpacing:"0.4px",textTransform:"uppercase" };
const fst = { marginBottom:14 };
const sym = { color:"#6b7a9e",fontWeight:700,flexShrink:0 };

export default function ROICalculator() {
  const [mode,     setMode]     = useState("value");  // value or gain
  const [initial,  setInitial]  = useState("10000");
  const [final,    setFinal]    = useState("15000");
  const [gain,     setGain]     = useState("5000");
  const [years,    setYears]    = useState("3");
  const [result,   setResult]   = useState(null);
  const [err,      setErr]      = useState("");

  function calculate() {
    setErr(""); setResult(null);
    const inv=parseN(initial), yrs=parseN(years);
    if (!(inv>0))  { setErr("Initial investment must be greater than 0."); return; }
    if (!(yrs>0))  { setErr("Years must be greater than 0."); return; }

    let netGain, finalVal;
    if (mode==="value") {
      finalVal = parseN(final);
      netGain  = finalVal - inv;
    } else {
      netGain  = parseN(gain);
      finalVal = inv + netGain;
    }

    const roi = (netGain/inv)*100;
    const annualizedROI = (Math.pow(finalVal/inv, 1/yrs) - 1)*100;

    // Year-by-year at annualized rate
    const rows=[];
    for (let y=1; y<=Math.ceil(yrs); y++) {
      const t = Math.min(y, yrs);
      const val = inv * Math.pow(1+annualizedROI/100, t);
      rows.push({ year:y, value:val, gain:val-inv, roiPct:(val-inv)/inv*100 });
    }

    setResult({ inv, finalVal, netGain, roi, annualizedROI, rows, isPositive:netGain>=0 });
  }

  function clear() { setMode("value"); setInitial("10000"); setFinal("15000"); setGain("5000"); setYears("3"); setResult(null); setErr(""); }
  const tabStyle = (active) => ({ flex:1,padding:"8px",borderRadius:8,border:"1.5px solid rgba(99,102,241,0.25)",background:active?"#4f46e5":"#f8f9ff",color:active?"#fff":"#4f46e5",fontWeight:700,fontSize:13,cursor:"pointer" });

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>ROI Calculator</h1>
        <p className="muted">Calculate Return on Investment (ROI), annualized return, and net gain or loss for any investment over any time period.</p>
      </header>
      <div style={{ maxWidth:1120,margin:"0 auto" }}>
        <div style={{ display:"flex",gap:20,alignItems:"flex-start",flexWrap:"wrap",marginBottom:20 }}>
          <section className="card" style={{ flex:"0 0 312px",minWidth:268 }}>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11,fontWeight:700,color:"#6b7a9e",textTransform:"uppercase",marginBottom:8,letterSpacing:"0.4px" }}>Input Type</div>
              <div style={{ display:"flex",gap:8 }}>
                <button style={tabStyle(mode==="value")} onClick={()=>setMode("value")}>Final Value</button>
                <button style={tabStyle(mode==="gain")}  onClick={()=>setMode("gain")}>Gain / Loss</button>
              </div>
            </div>
            <div style={fst}><label style={lst}>Initial Investment</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><span style={sym}>$</span><input style={ist} value={initial} onChange={e=>setInitial(e.target.value)} /></div></div>
            {mode==="value"
              ? <div style={fst}><label style={lst}>Final Value</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><span style={sym}>$</span><input style={ist} value={final} onChange={e=>setFinal(e.target.value)} /></div></div>
              : <div style={fst}><label style={lst}>Net Gain / Loss</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><span style={sym}>$</span><input style={ist} value={gain} onChange={e=>setGain(e.target.value)} /></div></div>
            }
            <div style={fst}><label style={lst}>Investment Period (Years)</label><input style={ist} value={years} onChange={e=>setYears(e.target.value)} /></div>
            {err && <p style={{ color:"#ef4444",fontSize:13,marginBottom:10 }}>{err}</p>}
            <button className="btn" style={{ width:"100%",marginBottom:8 }} onClick={calculate}>Calculate</button>
            <button className="btn-sec" style={{ width:"100%" }} onClick={clear}>Clear</button>
          </section>

          {result && (
            <section className="card" style={{ flex:1,minWidth:260 }}>
              <div style={{
                background: result.isPositive ? "#f0fdf4" : "#fef2f2",
                border: `1px solid ${result.isPositive?"#86efac":"#fca5a5"}`,
                borderRadius:12, padding:"16px 20px", marginBottom:22,
                display:"flex", alignItems:"center", gap:16,
              }}>
                <div style={{ fontSize:40,fontWeight:900,color:result.isPositive?"#16a34a":"#dc2626" }}>
                  {fmtp(result.roi)}
                </div>
                <div>
                  <div style={{ fontWeight:800,fontSize:16,color:result.isPositive?"#16a34a":"#dc2626" }}>
                    Total ROI
                  </div>
                  <div style={{ fontSize:13,color:"#6b7a9e",marginTop:2 }}>
                    Net {result.isPositive?"gain":"loss"}: {fmt(Math.abs(result.netGain))}
                  </div>
                </div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"12px",marginBottom:22 }}>
                {[
                  ["Initial Investment",fmt(result.inv),"#1e1b4b"],
                  ["Final Value",fmt(result.finalVal),"#4f46e5"],
                  ["Net Gain / Loss",fmt(result.netGain),result.isPositive?"#16a34a":"#dc2626"],
                  ["Annualized ROI",fmtp(result.annualizedROI),result.isPositive?"#10b981":"#f59e0b"],
                ].map(([l,v,c])=>(
                  <div key={l} style={{ background:"#f0f0ff",borderRadius:10,padding:"12px 14px" }}>
                    <div style={{ fontSize:11,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:3 }}>{l}</div>
                    <div style={{ fontSize:18,fontWeight:800,color:c }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                  <thead><tr style={{ background:"#f0f0ff" }}>{["Year","Portfolio Value","Net Gain","ROI"].map(h=><th key={h} style={{ padding:"8px 10px",textAlign:"right",fontWeight:700,color:"#4f46e5" }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {result.rows.map((r,i)=>(
                      <tr key={i} style={{ borderBottom:"1px solid rgba(99,102,241,0.08)",background:i%2===0?"#fafbff":"#fff" }}>
                        <td style={{ padding:"7px 10px",fontWeight:600,color:"#1e1b4b",textAlign:"right" }}>Year {r.year}</td>
                        <td style={{ padding:"7px 10px",textAlign:"right",fontWeight:700,color:"#4f46e5" }}>{fmt(r.value)}</td>
                        <td style={{ padding:"7px 10px",textAlign:"right",color:r.gain>=0?"#16a34a":"#dc2626" }}>{fmt(r.gain)}</td>
                        <td style={{ padding:"7px 10px",textAlign:"right",color:r.roiPct>=0?"#10b981":"#f59e0b" }}>{fmtp(r.roiPct)}</td>
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
