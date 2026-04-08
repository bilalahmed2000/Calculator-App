import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmt  = (n) => { if (!isFinite(n)||isNaN(n)) return "—"; return "$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}); };
const parseN = (s) => { const v=parseFloat(String(s??"").replace(/,/g,"")); return isNaN(v)?0:v; };
const ist = { width:"100%",background:"#f8f9ff",color:"#1e1b4b",border:"1.5px solid rgba(99,102,241,0.2)",borderRadius:12,padding:"9px 12px",fontSize:14,fontWeight:600,outline:"none",boxSizing:"border-box" };
const lst = { display:"block",fontSize:11,fontWeight:700,color:"#6b7a9e",marginBottom:5,letterSpacing:"0.4px",textTransform:"uppercase" };
const fst = { marginBottom:14 };
const sym = { color:"#6b7a9e",fontWeight:700,flexShrink:0 };

export default function AnnuityCalculator() {
  const [mode,     setMode]     = useState("fv");    // fv or pv
  const [payment,  setPayment]  = useState("500");
  const [rate,     setRate]     = useState("6");
  const [years,    setYears]    = useState("20");
  const [annType,  setAnnType]  = useState("ordinary"); // ordinary or due
  const [freq,     setFreq]     = useState("monthly");
  const [result,   setResult]   = useState(null);
  const [err,      setErr]      = useState("");

  const freqMap = { monthly:12, quarterly:4, semiannual:2, annual:1 };

  function calculate() {
    setErr(""); setResult(null);
    const pmt=parseN(payment), r=parseN(rate), t=parseN(years);
    if (!(pmt>0)) { setErr("Payment must be greater than 0."); return; }
    if (!(r>=0))  { setErr("Rate must be 0 or greater."); return; }
    if (!(t>0))   { setErr("Years must be greater than 0."); return; }
    const n = freqMap[freq] || 12;
    const periods = t * n;
    const i = r/100/n;
    const due = annType === "due";

    let fv, pv, totalPmt = pmt * periods;
    if (i===0) {
      fv = pmt * periods;
      pv = pmt * periods;
    } else {
      fv = pmt * (Math.pow(1+i, periods)-1)/i * (due?1+i:1);
      pv = pmt * (1-Math.pow(1+i,-periods))/i * (due?1+i:1);
    }
    const totalInt_fv = fv - totalPmt;
    const totalInt_pv = totalPmt - pv;

    // Annual schedule
    const rows=[];
    let runningFV=0, runningPV=pv;
    for (let y=1; y<=Math.round(t); y++) {
      const pds=n;
      let yFV=0, yPmt=0;
      for (let p=0; p<pds; p++) {
        runningFV = (runningFV + (due?pmt:0)) * (1+i) + (due?0:pmt);
        yFV=runningFV; yPmt+=pmt;
      }
      runningPV -= yPmt;
      rows.push({ year:y, payments:yPmt, balance:yFV, pvRemaining:Math.max(runningPV,0) });
    }
    setResult({ fv, pv, totalPmt, totalInt_fv, totalInt_pv, rows, mode });
  }

  function clear() { setMode("fv"); setPayment("500"); setRate("6"); setYears("20"); setAnnType("ordinary"); setFreq("monthly"); setResult(null); setErr(""); }

  const tabStyle = (active) => ({ flex:1,padding:"8px",borderRadius:8,border:"1.5px solid rgba(99,102,241,0.25)",background:active?"#4f46e5":"#f8f9ff",color:active?"#fff":"#4f46e5",fontWeight:700,fontSize:13,cursor:"pointer" });

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Annuity Calculator</h1>
        <p className="muted">Calculate the future value (accumulation) or present value of an annuity based on regular payments, interest rate, and term.</p>
      </header>
      <div style={{ maxWidth:1120,margin:"0 auto" }}>
        <div style={{ display:"flex",gap:20,alignItems:"flex-start",flexWrap:"wrap",marginBottom:20 }}>
          <section className="card" style={{ flex:"0 0 340px",minWidth:268 }}>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11,fontWeight:700,color:"#6b7a9e",textTransform:"uppercase",marginBottom:8,letterSpacing:"0.4px" }}>Calculate</div>
              <div style={{ display:"flex",gap:8 }}>
                <button style={tabStyle(mode==="fv")} onClick={()=>setMode("fv")}>Future Value</button>
                <button style={tabStyle(mode==="pv")} onClick={()=>setMode("pv")}>Present Value</button>
              </div>
            </div>
            <div style={fst}><label style={lst}>Payment Amount</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><span style={sym}>$</span><input style={ist} value={payment} onChange={e=>setPayment(e.target.value)} /></div></div>
            <div style={fst}><label style={lst}>Annual Interest Rate</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><input style={ist} value={rate} onChange={e=>setRate(e.target.value)} /><span style={sym}>%</span></div></div>
            <div style={fst}><label style={lst}>Term (Years)</label><input style={ist} value={years} onChange={e=>setYears(e.target.value)} /></div>
            <div style={fst}><label style={lst}>Payment Frequency</label>
              <select style={ist} value={freq} onChange={e=>setFreq(e.target.value)}>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="semiannual">Semi-Annual</option>
                <option value="annual">Annual</option>
              </select>
            </div>
            <div style={fst}><label style={lst}>Annuity Type</label>
              <select style={ist} value={annType} onChange={e=>setAnnType(e.target.value)}>
                <option value="ordinary">Ordinary (End of Period)</option>
                <option value="due">Annuity Due (Beginning of Period)</option>
              </select>
            </div>
            {err && <p style={{ color:"#ef4444",fontSize:13,marginBottom:10 }}>{err}</p>}
            <button className="btn" style={{ width:"100%",marginBottom:8 }} onClick={calculate}>Calculate</button>
            <button className="btn-sec" style={{ width:"100%" }} onClick={clear}>Clear</button>
          </section>

          {result && (
            <section className="card" style={{ flex:1,minWidth:260 }}>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"14px",marginBottom:22 }}>
                {[
                  ["Future Value (Accumulated)", fmt(result.fv), "#4f46e5"],
                  ["Present Value", fmt(result.pv), "#10b981"],
                  ["Total Payments", fmt(result.totalPmt), "#1e1b4b"],
                  ["Total Interest (FV)", fmt(result.totalInt_fv), "#f59e0b"],
                ].map(([l,v,c])=>(
                  <div key={l} style={{ background:"#f0f0ff",borderRadius:10,padding:"14px 16px" }}>
                    <div style={{ fontSize:11,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:4 }}>{l}</div>
                    <div style={{ fontSize:18,fontWeight:800,color:c }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                  <thead><tr style={{ background:"#f0f0ff" }}>{["Year","Annual Payments","Accumulated Value"].map(h=><th key={h} style={{ padding:"8px 10px",textAlign:"right",fontWeight:700,color:"#4f46e5" }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {result.rows.map((r,i)=>(
                      <tr key={i} style={{ borderBottom:"1px solid rgba(99,102,241,0.08)",background:i%2===0?"#fafbff":"#fff" }}>
                        <td style={{ padding:"7px 10px",fontWeight:600,color:"#1e1b4b",textAlign:"right" }}>Year {r.year}</td>
                        <td style={{ padding:"7px 10px",textAlign:"right",color:"#10b981" }}>{fmt(r.payments)}</td>
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
