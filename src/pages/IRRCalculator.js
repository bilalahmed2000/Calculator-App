import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmt  = (n) => { if (!isFinite(n)||isNaN(n)) return "—"; return "$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}); };
const parseN = (s) => { const v=parseFloat(String(s??"").replace(/,/g,"")); return isNaN(v)?NaN:v; };
const ist = { width:"100%",background:"#f8f9ff",color:"#1e1b4b",border:"1.5px solid rgba(99,102,241,0.2)",borderRadius:12,padding:"9px 12px",fontSize:14,fontWeight:600,outline:"none",boxSizing:"border-box" };
const lst = { display:"block",fontSize:11,fontWeight:700,color:"#6b7a9e",marginBottom:5,letterSpacing:"0.4px",textTransform:"uppercase" };
const fst = { marginBottom:14 };
const sym = { color:"#6b7a9e",fontWeight:700,flexShrink:0 };

// NPV calculation
function npv(rate, cashflows) {
  return cashflows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + rate, t), 0);
}

// IRR via bisection
function calcIRR(cashflows) {
  const hasPositive = cashflows.some(cf => cf > 0);
  const hasNegative = cashflows.some(cf => cf < 0);
  if (!hasPositive || !hasNegative) return NaN;

  let lo = -0.999, hi = 10.0;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (Math.abs(hi - lo) < 1e-10) return mid * 100;
    if (npv(mid, cashflows) > 0) lo = mid; else hi = mid;
  }
  return ((lo + hi) / 2) * 100;
}

const DEFAULT_FLOWS = [
  { label: "Year 0 (Initial Investment)", value: "-50000" },
  { label: "Year 1", value: "12000" },
  { label: "Year 2", value: "15000" },
  { label: "Year 3", value: "18000" },
  { label: "Year 4", value: "20000" },
  { label: "Year 5", value: "25000" },
];

export default function IRRCalculator() {
  const [flows,     setFlows]     = useState(DEFAULT_FLOWS.map(f=>({...f})));
  const [discount,  setDiscount]  = useState("10");
  const [result,    setResult]    = useState(null);
  const [err,       setErr]       = useState("");

  function addRow() { setFlows(prev=>[...prev, { label:`Year ${prev.length}`, value:"0" }]); }
  function removeRow(idx) { setFlows(prev=>prev.filter((_,i)=>i!==idx)); }
  function updateFlow(idx, val) { setFlows(prev=>prev.map((f,i)=>i===idx?{...f,value:val}:f)); }
  function updateLabel(idx, lbl) { setFlows(prev=>prev.map((f,i)=>i===idx?{...f,label:lbl}:f)); }

  function calculate() {
    setErr(""); setResult(null);
    const cfs = flows.map(f=>parseN(f.value));
    if (cfs.some(isNaN)) { setErr("All cash flows must be valid numbers."); return; }
    if (cfs.length<2)    { setErr("Please enter at least 2 cash flows."); return; }

    const irr = calcIRR(cfs);
    const dr  = parseN(discount)/100;
    const npvVal = npv(dr, cfs);
    const totalIn  = cfs.filter(v=>v>0).reduce((s,v)=>s+v,0);
    const totalOut = Math.abs(cfs.filter(v=>v<0).reduce((s,v)=>s+v,0));
    const roi      = totalOut>0 ? ((totalIn-totalOut)/totalOut)*100 : NaN;

    // NPV profile at various rates
    const npvProfile = [-50,-25,0,5,10,15,20,25,50,75,100].map(r=>({ rate:r, npv:npv(r/100,cfs) }));

    setResult({ irr, npvVal, totalIn, totalOut, roi, cfs, npvProfile, dr });
  }

  function clear() { setFlows(DEFAULT_FLOWS.map(f=>({...f}))); setDiscount("10"); setResult(null); setErr(""); }

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>IRR Calculator</h1>
        <p className="muted">Calculate the Internal Rate of Return (IRR) and Net Present Value (NPV) for an investment with irregular cash flows over multiple periods.</p>
      </header>
      <div style={{ maxWidth:1120,margin:"0 auto" }}>
        <div style={{ display:"flex",gap:20,alignItems:"flex-start",flexWrap:"wrap",marginBottom:20 }}>
          <section className="card" style={{ flex:"0 0 360px",minWidth:280 }}>
            <div style={{ fontSize:12,color:"#6b7a9e",marginBottom:14,background:"#f0f0ff",padding:"10px 14px",borderRadius:8 }}>
              Enter Year 0 as a <strong style={{ color:"#dc2626" }}>negative</strong> number (investment outflow). Future cash inflows are positive.
            </div>
            <div style={{ marginBottom:14 }}>
              {flows.map((f,i)=>(
                <div key={i} style={{ display:"flex",alignItems:"center",gap:6,marginBottom:8 }}>
                  <input
                    style={{ ...ist, flex:"0 0 100px", fontSize:12 }}
                    value={f.label}
                    onChange={e=>updateLabel(i, e.target.value)}
                  />
                  <span style={sym}>$</span>
                  <input
                    style={{ ...ist, flex:1 }}
                    value={f.value}
                    onChange={e=>updateFlow(i, e.target.value)}
                  />
                  {flows.length>2 && (
                    <button onClick={()=>removeRow(i)} style={{ padding:"6px 10px",borderRadius:8,border:"1px solid rgba(239,68,68,0.3)",background:"#fff",color:"#ef4444",fontWeight:700,cursor:"pointer",fontSize:13 }}>×</button>
                  )}
                </div>
              ))}
              <button onClick={addRow} style={{ width:"100%",padding:"8px",borderRadius:8,border:"1.5px dashed rgba(99,102,241,0.3)",background:"#f8f9ff",color:"#4f46e5",fontWeight:700,fontSize:13,cursor:"pointer",marginTop:4 }}>+ Add Year</button>
            </div>
            <div style={fst}><label style={lst}>Discount Rate (for NPV)</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><input style={ist} value={discount} onChange={e=>setDiscount(e.target.value)} /><span style={sym}>%</span></div></div>
            {err && <p style={{ color:"#ef4444",fontSize:13,marginBottom:10 }}>{err}</p>}
            <button className="btn" style={{ width:"100%",marginBottom:8 }} onClick={calculate}>Calculate</button>
            <button className="btn-sec" style={{ width:"100%" }} onClick={clear}>Reset</button>
          </section>

          {result && (
            <section className="card" style={{ flex:1,minWidth:260 }}>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"14px",marginBottom:22 }}>
                {[
                  ["IRR", isNaN(result.irr)?"N/A":result.irr.toFixed(2)+"%", isNaN(result.irr)?"#9ca3af":result.irr>=0?"#4f46e5":"#dc2626"],
                  ["NPV at "+discount+"%", fmt(result.npvVal), result.npvVal>=0?"#10b981":"#dc2626"],
                  ["Total Inflows",  fmt(result.totalIn),  "#16a34a"],
                  ["Total Outflows", fmt(result.totalOut), "#dc2626"],
                ].map(([l,v,c])=>(
                  <div key={l} style={{ background:"#f0f0ff",borderRadius:10,padding:"14px 16px" }}>
                    <div style={{ fontSize:11,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:4 }}>{l}</div>
                    <div style={{ fontSize:22,fontWeight:800,color:c }}>{v}</div>
                  </div>
                ))}
              </div>

              <h4 style={{ margin:"0 0 10px",fontWeight:700,color:"#1e1b4b",fontSize:14 }}>NPV at Various Discount Rates</h4>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                  <thead><tr style={{ background:"#f0f0ff" }}>{["Discount Rate","NPV","Decision"].map(h=><th key={h} style={{ padding:"8px 10px",textAlign:"right",fontWeight:700,color:"#4f46e5" }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {result.npvProfile.map((r,i)=>(
                      <tr key={i} style={{ borderBottom:"1px solid rgba(99,102,241,0.08)",background:i%2===0?"#fafbff":"#fff" }}>
                        <td style={{ padding:"7px 10px",fontWeight:600,color:"#1e1b4b",textAlign:"right" }}>{r.rate}%</td>
                        <td style={{ padding:"7px 10px",textAlign:"right",fontWeight:700,color:r.npv>=0?"#16a34a":"#dc2626" }}>{fmt(r.npv)}</td>
                        <td style={{ padding:"7px 10px",textAlign:"right",fontSize:12,fontWeight:700,color:r.npv>=0?"#16a34a":"#dc2626" }}>{r.npv>=0?"✓ Accept":"✗ Reject"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize:12,color:"#9ca3af",marginTop:14 }}>Accept the investment when NPV &gt; 0 (discount rate &lt; IRR). Reject when NPV &lt; 0.</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
