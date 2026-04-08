import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmt  = (n) => { if (!isFinite(n)||isNaN(n)) return "—"; return "$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}); };
const fmtp = (n) => { if (!isFinite(n)||isNaN(n)) return "—"; return n.toFixed(4)+"%"; };
const parseN = (s) => { const v=parseFloat(String(s??"").replace(/,/g,"")); return isNaN(v)?0:v; };
const ist = { width:"100%",background:"#f8f9ff",color:"#1e1b4b",border:"1.5px solid rgba(99,102,241,0.2)",borderRadius:12,padding:"9px 12px",fontSize:14,fontWeight:600,outline:"none",boxSizing:"border-box" };
const lst = { display:"block",fontSize:11,fontWeight:700,color:"#6b7a9e",marginBottom:5,letterSpacing:"0.4px",textTransform:"uppercase" };
const fst = { marginBottom:14 };
const sym = { color:"#6b7a9e",fontWeight:700,flexShrink:0 };

// APR via Newton-Raphson: find r such that PV of all cash flows = 0
// monthly payment: M = P*i*(1+i)^n / ((1+i)^n-1)
// APR: solve for r where loan amount net of fees = sum of monthly pmts discounted at r/12
function calcAPR(loanAmount, fees, nominalRate, termMonths) {
  const netLoan = loanAmount - fees;  // what borrower actually receives
  const mr      = nominalRate/100/12;
  const monthlyPmt = mr===0
    ? loanAmount/termMonths
    : loanAmount * mr * Math.pow(1+mr, termMonths) / (Math.pow(1+mr, termMonths)-1);

  // Solve for APR: netLoan = sum[ monthlyPmt / (1+r)^t ]
  let r = mr;
  for (let i=0; i<200; i++) {
    const pv  = monthlyPmt * (1-Math.pow(1+r,-termMonths))/r;
    const dpv = monthlyPmt * (-Math.pow(1+r,-termMonths-1)*termMonths*r - (1-Math.pow(1+r,-termMonths))) / (r*r);
    const nr = r - (pv - netLoan)/dpv;
    if (Math.abs(nr-r)<1e-12||nr<0) break;
    r = nr;
  }
  return { apr: r*12*100, monthlyPmt, totalPaid: monthlyPmt*termMonths, totalInterest: monthlyPmt*termMonths - loanAmount };
}

const FEE_TYPES = [
  { key:"origination",  label:"Origination Fee",      value:"1000" },
  { key:"application",  label:"Application Fee",       value:"200" },
  { key:"processing",   label:"Processing Fee",        value:"300" },
  { key:"underwriting", label:"Underwriting Fee",      value:"0" },
  { key:"points",       label:"Discount Points",       value:"0" },
  { key:"other",        label:"Other Fees",            value:"0" },
];

export default function APRCalculator() {
  const [loanAmt,  setLoanAmt]  = useState("200000");
  const [rate,     setRate]     = useState("6.5");
  const [termY,    setTermY]    = useState("30");
  const [fees,     setFees]     = useState(FEE_TYPES.map(f=>({...f})));
  const [result,   setResult]   = useState(null);
  const [err,      setErr]      = useState("");

  function updateFee(idx, val) { setFees(prev=>prev.map((f,i)=>i===idx?{...f,value:val}:f)); }

  function calculate() {
    setErr(""); setResult(null);
    const L=parseN(loanAmt), r=parseN(rate), t=parseN(termY);
    if (!(L>0)) { setErr("Loan amount must be greater than 0."); return; }
    if (!(r>=0)){ setErr("Interest rate must be 0 or greater."); return; }
    if (!(t>0)) { setErr("Loan term must be greater than 0."); return; }
    const totalFees = fees.reduce((s,f)=>s+parseN(f.value), 0);
    const termMonths = t*12;
    const { apr, monthlyPmt, totalPaid, totalInterest } = calcAPR(L, totalFees, r, termMonths);
    const totalCost = totalPaid + totalFees;

    setResult({ apr, nominalRate:r, monthlyPmt, totalPaid, totalInterest, totalFees, totalCost, L,
      feesBreakdown: fees.filter(f=>parseN(f.value)>0).map(f=>({...f,amount:parseN(f.value)})) });
  }

  function clear() { setLoanAmt("200000"); setRate("6.5"); setTermY("30"); setFees(FEE_TYPES.map(f=>({...f}))); setResult(null); setErr(""); }

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>APR Calculator</h1>
        <p className="muted">Calculate the Annual Percentage Rate (APR) — the true cost of a loan including all fees, which is always higher than the nominal interest rate.</p>
      </header>
      <div style={{ maxWidth:1120,margin:"0 auto" }}>
        <div style={{ display:"flex",gap:20,alignItems:"flex-start",flexWrap:"wrap",marginBottom:20 }}>
          <section className="card" style={{ flex:"0 0 360px",minWidth:268 }}>
            <div style={fst}><label style={lst}>Loan Amount</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><span style={sym}>$</span><input style={ist} value={loanAmt} onChange={e=>setLoanAmt(e.target.value)} /></div></div>
            <div style={fst}><label style={lst}>Annual Interest Rate (Nominal)</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><input style={ist} value={rate} onChange={e=>setRate(e.target.value)} /><span style={sym}>%</span></div></div>
            <div style={fst}><label style={lst}>Loan Term (Years)</label><input style={ist} value={termY} onChange={e=>setTermY(e.target.value)} /></div>
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11,fontWeight:700,color:"#6b7a9e",textTransform:"uppercase",marginBottom:10,letterSpacing:"0.4px" }}>Fees & Closing Costs</div>
              {fees.map((f,i)=>(
                <div key={f.key} style={{ display:"flex",alignItems:"center",gap:6,marginBottom:8 }}>
                  <span style={{ fontSize:12,color:"#6b7a9e",flex:"0 0 150px",fontWeight:600 }}>{f.label}</span>
                  <span style={sym}>$</span>
                  <input style={ist} value={f.value} onChange={e=>updateFee(i, e.target.value)} />
                </div>
              ))}
            </div>
            {err && <p style={{ color:"#ef4444",fontSize:13,marginBottom:10 }}>{err}</p>}
            <button className="btn" style={{ width:"100%",marginBottom:8 }} onClick={calculate}>Calculate APR</button>
            <button className="btn-sec" style={{ width:"100%" }} onClick={clear}>Clear</button>
          </section>

          {result && (
            <section className="card" style={{ flex:1,minWidth:260 }}>
              <div style={{
                background:"#eef2ff", border:"1px solid rgba(99,102,241,0.3)",
                borderRadius:12, padding:"16px 20px", marginBottom:22,
              }}>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px" }}>
                  <div>
                    <div style={{ fontSize:11,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:4 }}>Nominal Rate</div>
                    <div style={{ fontSize:28,fontWeight:800,color:"#6b7a9e" }}>{fmtp(result.nominalRate)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize:11,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:4 }}>APR (True Cost)</div>
                    <div style={{ fontSize:28,fontWeight:800,color:"#4f46e5" }}>{fmtp(result.apr)}</div>
                  </div>
                </div>
                <div style={{ fontSize:13,color:"#6b7a9e",marginTop:12 }}>
                  The APR is <strong style={{ color:"#4f46e5" }}>{(result.apr-result.nominalRate).toFixed(4)}%</strong> higher than the nominal rate due to fees.
                </div>
              </div>

              <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"12px",marginBottom:22 }}>
                {[
                  ["Monthly Payment",fmt(result.monthlyPmt),"#4f46e5"],
                  ["Total Fees",fmt(result.totalFees),"#dc2626"],
                  ["Total Interest",fmt(result.totalInterest),"#f59e0b"],
                  ["Total Cost",fmt(result.totalCost),"#1e1b4b"],
                ].map(([l,v,c])=>(
                  <div key={l} style={{ background:"#f0f0ff",borderRadius:10,padding:"12px 14px" }}>
                    <div style={{ fontSize:11,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:3 }}>{l}</div>
                    <div style={{ fontSize:18,fontWeight:800,color:c }}>{v}</div>
                  </div>
                ))}
              </div>

              {result.feesBreakdown.length>0 && (
                <>
                  <h4 style={{ margin:"0 0 10px",fontWeight:700,color:"#1e1b4b",fontSize:14 }}>Fee Breakdown</h4>
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                      <thead><tr style={{ background:"#f0f0ff" }}>{["Fee Type","Amount","% of Loan"].map(h=><th key={h} style={{ padding:"8px 10px",textAlign:"right",fontWeight:700,color:"#4f46e5" }}>{h}</th>)}</tr></thead>
                      <tbody>
                        {result.feesBreakdown.map((f,i)=>(
                          <tr key={i} style={{ borderBottom:"1px solid rgba(99,102,241,0.08)",background:i%2===0?"#fafbff":"#fff" }}>
                            <td style={{ padding:"7px 10px",fontWeight:600,color:"#1e1b4b",textAlign:"right" }}>{f.label}</td>
                            <td style={{ padding:"7px 10px",textAlign:"right",color:"#dc2626",fontWeight:700 }}>{fmt(f.amount)}</td>
                            <td style={{ padding:"7px 10px",textAlign:"right",color:"#6b7a9e" }}>{(f.amount/result.L*100).toFixed(3)}%</td>
                          </tr>
                        ))}
                        <tr style={{ background:"#f0f0ff" }}>
                          <td style={{ padding:"7px 10px",fontWeight:800,color:"#1e1b4b",textAlign:"right" }}>Total Fees</td>
                          <td style={{ padding:"7px 10px",textAlign:"right",fontWeight:800,color:"#dc2626" }}>{fmt(result.totalFees)}</td>
                          <td style={{ padding:"7px 10px",textAlign:"right",fontWeight:700,color:"#6b7a9e" }}>{(result.totalFees/result.L*100).toFixed(3)}%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
