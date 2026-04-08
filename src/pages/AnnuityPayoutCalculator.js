import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmt  = (n) => { if (!isFinite(n)||isNaN(n)) return "—"; return "$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}); };
const parseN = (s) => { const v=parseFloat(String(s??"").replace(/,/g,"")); return isNaN(v)?0:v; };
const ist = { width:"100%",background:"#f8f9ff",color:"#1e1b4b",border:"1.5px solid rgba(99,102,241,0.2)",borderRadius:12,padding:"9px 12px",fontSize:14,fontWeight:600,outline:"none",boxSizing:"border-box" };
const lst = { display:"block",fontSize:11,fontWeight:700,color:"#6b7a9e",marginBottom:5,letterSpacing:"0.4px",textTransform:"uppercase" };
const fst = { marginBottom:14 };
const sym = { color:"#6b7a9e",fontWeight:700,flexShrink:0 };

export default function AnnuityPayoutCalculator() {
  const [startBal,   setStartBal]   = useState("500000");
  const [rate,       setRate]       = useState("5");
  const [years,      setYears]      = useState("20");
  const [freq,       setFreq]       = useState("monthly");
  const [mode,       setMode]       = useState("pmt");  // pmt = find payment, yrs = find years
  const [payment,    setPayment]    = useState("2800"); // used when mode=yrs
  const [result,     setResult]     = useState(null);
  const [err,        setErr]        = useState("");

  const freqMap = { monthly:12, quarterly:4, semiannual:2, annual:1 };
  const freqLabel = { monthly:"Monthly",quarterly:"Quarterly",semiannual:"Semi-Annual",annual:"Annual" };

  function calculate() {
    setErr(""); setResult(null);
    const PV=parseN(startBal), r=parseN(rate), t=parseN(years), pmt=parseN(payment);
    if (!(PV>0)) { setErr("Starting balance must be greater than 0."); return; }
    if (!(r>=0)) { setErr("Interest rate must be 0 or greater."); return; }
    const n = freqMap[freq]||12;

    let periodicPmt, periods;
    if (mode==="pmt") {
      if (!(t>0)) { setErr("Years must be greater than 0."); return; }
      periods = t*n;
      const i = r/100/n;
      periodicPmt = i===0 ? PV/periods : PV*i/(1-Math.pow(1+i,-periods));
    } else {
      if (!(pmt>0)) { setErr("Payment must be greater than 0."); return; }
      periodicPmt = pmt;
      const i = r/100/n;
      if (i===0) { periods = Math.ceil(PV/pmt); }
      else {
        periods = Math.ceil(-Math.log(1 - PV*i/pmt)/Math.log(1+i));
      }
      if (!isFinite(periods)||periods<=0) { setErr("Payment is too small to ever deplete the balance. Increase the payment amount."); return; }
    }

    const i = r/100/n;
    let bal=PV, totalPaid=0;
    const rows=[];
    let yPaid=0, yInt=0;
    for (let p=1; p<=periods && bal>0.005; p++) {
      const intEarned = bal*i;
      const principalPaid = Math.min(periodicPmt-intEarned, bal);
      bal = Math.max(bal + intEarned - periodicPmt, 0);
      totalPaid += periodicPmt;
      yPaid += periodicPmt; yInt += intEarned;
      if (p%n===0||p===periods) {
        rows.push({ year:Math.ceil(p/n), periodPayments:yPaid, interest:yInt, balance:bal });
        yPaid=0; yInt=0;
      }
    }
    const totalInterest = totalPaid - PV;
    setResult({ periodicPmt, periods: Math.ceil(periods/n), totalPaid, totalInterest, rows, freq, n, startBal:PV, actualYears:periods/n });
  }

  function clear() { setStartBal("500000"); setRate("5"); setYears("20"); setFreq("monthly"); setMode("pmt"); setPayment("2800"); setResult(null); setErr(""); }

  const tabStyle = (active) => ({ flex:1,padding:"8px",borderRadius:8,border:"1.5px solid rgba(99,102,241,0.25)",background:active?"#4f46e5":"#f8f9ff",color:active?"#fff":"#4f46e5",fontWeight:700,fontSize:13,cursor:"pointer" });

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Annuity Payout Calculator</h1>
        <p className="muted">Calculate how much you can withdraw from an annuity each period, or how long your balance will last at a given withdrawal amount.</p>
      </header>
      <div style={{ maxWidth:1120,margin:"0 auto" }}>
        <div style={{ display:"flex",gap:20,alignItems:"flex-start",flexWrap:"wrap",marginBottom:20 }}>
          <section className="card" style={{ flex:"0 0 340px",minWidth:268 }}>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11,fontWeight:700,color:"#6b7a9e",textTransform:"uppercase",marginBottom:8,letterSpacing:"0.4px" }}>I Want To Find</div>
              <div style={{ display:"flex",gap:8 }}>
                <button style={tabStyle(mode==="pmt")} onClick={()=>setMode("pmt")}>Payout Amount</button>
                <button style={tabStyle(mode==="yrs")} onClick={()=>setMode("yrs")}>Duration</button>
              </div>
            </div>
            <div style={fst}><label style={lst}>Starting Balance</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><span style={sym}>$</span><input style={ist} value={startBal} onChange={e=>setStartBal(e.target.value)} /></div></div>
            <div style={fst}><label style={lst}>Annual Interest Rate</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><input style={ist} value={rate} onChange={e=>setRate(e.target.value)} /><span style={sym}>%</span></div></div>
            {mode==="pmt"
              ? <div style={fst}><label style={lst}>Payout Duration (Years)</label><input style={ist} value={years} onChange={e=>setYears(e.target.value)} /></div>
              : <div style={fst}><label style={lst}>Desired Payout Amount</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><span style={sym}>$</span><input style={ist} value={payment} onChange={e=>setPayment(e.target.value)} /></div></div>
            }
            <div style={fst}><label style={lst}>Payment Frequency</label>
              <select style={ist} value={freq} onChange={e=>setFreq(e.target.value)}>
                {Object.entries(freqLabel).map(([k,v])=><option key={k} value={k}>{v}</option>)}
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
                  [freqLabel[freq]+" Payout", fmt(result.periodicPmt), "#4f46e5"],
                  ["Annual Payout", fmt(result.periodicPmt*result.n), "#10b981"],
                  ["Payout Duration", result.actualYears.toFixed(1)+" years", "#1e1b4b"],
                  ["Total Paid Out", fmt(result.totalPaid), "#f59e0b"],
                ].map(([l,v,c])=>(
                  <div key={l} style={{ background:"#f0f0ff",borderRadius:10,padding:"14px 16px" }}>
                    <div style={{ fontSize:11,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:4 }}>{l}</div>
                    <div style={{ fontSize:18,fontWeight:800,color:c }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                  <thead><tr style={{ background:"#f0f0ff" }}>{["Year","Payments","Interest Earned","Remaining Balance"].map(h=><th key={h} style={{ padding:"8px 10px",textAlign:"right",fontWeight:700,color:"#4f46e5" }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {result.rows.map((r,i)=>(
                      <tr key={i} style={{ borderBottom:"1px solid rgba(99,102,241,0.08)",background:i%2===0?"#fafbff":"#fff" }}>
                        <td style={{ padding:"7px 10px",fontWeight:600,color:"#1e1b4b",textAlign:"right" }}>Year {r.year}</td>
                        <td style={{ padding:"7px 10px",textAlign:"right",color:"#10b981" }}>{fmt(r.periodPayments)}</td>
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
