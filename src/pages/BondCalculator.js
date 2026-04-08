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

// Calculate bond price: PV = C/r * [1 - (1+r)^-n] + F*(1+r)^-n
function calcBondPrice(faceValue, couponRate, marketRate, periodsPerYear, totalPeriods) {
  const C = faceValue * (couponRate/100) / periodsPerYear;
  const r = marketRate/100/periodsPerYear;
  if (r===0) return C*totalPeriods + faceValue;
  const pv = (C/r)*(1 - Math.pow(1+r,-totalPeriods)) + faceValue*Math.pow(1+r,-totalPeriods);
  return pv;
}

// Newton-Raphson YTM
function calcYTM(price, faceValue, couponRate, periodsPerYear, totalPeriods) {
  const C = faceValue*(couponRate/100)/periodsPerYear;
  let r = couponRate/100/periodsPerYear;
  for (let i=0; i<100; i++) {
    const pv = (C/r)*(1-Math.pow(1+r,-totalPeriods)) + faceValue*Math.pow(1+r,-totalPeriods);
    const dpv = -(C/(r*r))*(1-Math.pow(1+r,-totalPeriods)) + (C/r)*totalPeriods*Math.pow(1+r,-totalPeriods-1) - faceValue*totalPeriods*Math.pow(1+r,-totalPeriods-1);
    const nr = r - (pv-price)/dpv;
    if (Math.abs(nr-r)<1e-10) break;
    r = Math.max(nr, 0.0001);
  }
  return r*periodsPerYear*100;
}

export default function BondCalculator() {
  const [faceValue,  setFaceValue]  = useState("1000");
  const [couponRate, setCouponRate] = useState("5");
  const [marketRate, setMarketRate] = useState("4");
  const [years,      setYears]      = useState("10");
  const [frequency,  setFrequency]  = useState("2");
  const [result,     setResult]     = useState(null);
  const [err,        setErr]        = useState("");

  function calculate() {
    setErr(""); setResult(null);
    const F=parseN(faceValue), cr=parseN(couponRate), mr=parseN(marketRate), t=parseN(years), freq=parseInt(frequency);
    if (!(F>0))  { setErr("Face value must be greater than 0."); return; }
    if (!(t>0))  { setErr("Years to maturity must be greater than 0."); return; }
    const totalPeriods = t * freq;
    const price = calcBondPrice(F, cr, mr, freq, totalPeriods);
    const couponPayment = F*(cr/100)/freq;
    const totalCoupons  = couponPayment * totalPeriods;
    const ytm = calcYTM(price, F, cr, freq, totalPeriods);
    const currentYield  = (couponPayment*freq) / price * 100;
    const premium       = price - F; // positive = premium, negative = discount

    // Cash flow schedule
    const rows=[];
    let cumCoupon=0, balance=price;
    for (let p=1; p<=totalPeriods; p++) {
      cumCoupon+=couponPayment;
      const fv = p===totalPeriods ? F : 0;
      rows.push({ period:p, coupon:couponPayment, faceReturn:fv, cumCoupon });
    }
    setResult({ price, F, couponPayment, totalCoupons, ytm, currentYield, premium, rows, freq, t });
  }

  function clear() { setFaceValue("1000"); setCouponRate("5"); setMarketRate("4"); setYears("10"); setFrequency("2"); setResult(null); setErr(""); }

  const freqLabel = { "1":"Annual","2":"Semi-Annual","4":"Quarterly","12":"Monthly" };

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Bond Calculator</h1>
        <p className="muted">Calculate bond price, yield to maturity (YTM), current yield, and coupon payments based on face value, coupon rate, and market interest rate.</p>
      </header>
      <div style={{ maxWidth:1120,margin:"0 auto" }}>
        <div style={{ display:"flex",gap:20,alignItems:"flex-start",flexWrap:"wrap",marginBottom:20 }}>
          <section className="card" style={{ flex:"0 0 312px",minWidth:268 }}>
            <div style={fst}><label style={lst}>Face Value (Par Value)</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><span style={sym}>$</span><input style={ist} value={faceValue} onChange={e=>setFaceValue(e.target.value)} /></div></div>
            <div style={fst}><label style={lst}>Annual Coupon Rate</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><input style={ist} value={couponRate} onChange={e=>setCouponRate(e.target.value)} /><span style={sym}>%</span></div></div>
            <div style={fst}><label style={lst}>Market Interest Rate (Required Yield)</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><input style={ist} value={marketRate} onChange={e=>setMarketRate(e.target.value)} /><span style={sym}>%</span></div></div>
            <div style={fst}><label style={lst}>Years to Maturity</label><input style={ist} value={years} onChange={e=>setYears(e.target.value)} /></div>
            <div style={fst}><label style={lst}>Coupon Payment Frequency</label>
              <select style={ist} value={frequency} onChange={e=>setFrequency(e.target.value)}>
                {Object.entries(freqLabel).map(([k,v])=><option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            {err && <p style={{ color:"#ef4444",fontSize:13,marginBottom:10 }}>{err}</p>}
            <button className="btn" style={{ width:"100%",marginBottom:8 }} onClick={calculate}>Calculate</button>
            <button className="btn-sec" style={{ width:"100%" }} onClick={clear}>Clear</button>
          </section>

          {result && (
            <section className="card" style={{ flex:1,minWidth:260 }}>
              <div style={{
                background: result.premium>0 ? "#fef3c7" : result.premium<0 ? "#dbeafe" : "#f0fdf4",
                borderRadius:12, padding:"12px 16px", marginBottom:18, fontSize:13, fontWeight:700,
                color: result.premium>0 ? "#92400e" : result.premium<0 ? "#1e40af" : "#065f46",
              }}>
                Bond trading at a {result.premium>0?"PREMIUM":result.premium<0?"DISCOUNT":"PAR"} —
                Market price {fmt(result.price)} vs. face value {fmt(result.F)}
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"12px",marginBottom:22 }}>
                {[
                  ["Bond Price",fmt(result.price),"#4f46e5"],
                  ["Yield to Maturity",fmtp(result.ytm),"#10b981"],
                  ["Current Yield",fmtp(result.currentYield),"#f59e0b"],
                  ["Coupon / Period",fmt(result.couponPayment),"#1e1b4b"],
                  ["Total Coupon Income",fmt(result.totalCoupons),"#6b7a9e"],
                  ["Premium / Discount",fmt(result.premium),"#dc2626"],
                ].map(([l,v,c])=>(
                  <div key={l} style={{ background:"#f0f0ff",borderRadius:10,padding:"12px 14px" }}>
                    <div style={{ fontSize:11,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:3 }}>{l}</div>
                    <div style={{ fontSize:17,fontWeight:800,color:c }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                  <thead><tr style={{ background:"#f0f0ff" }}>{["Period","Coupon Payment","Face Return","Cum. Coupon"].map(h=><th key={h} style={{ padding:"8px 10px",textAlign:"right",fontWeight:700,color:"#4f46e5" }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {result.rows.map((r,i)=>(
                      <tr key={i} style={{ borderBottom:"1px solid rgba(99,102,241,0.08)",background:i%2===0?"#fafbff":"#fff" }}>
                        <td style={{ padding:"7px 10px",fontWeight:600,color:"#1e1b4b",textAlign:"right" }}>Period {r.period}</td>
                        <td style={{ padding:"7px 10px",textAlign:"right",color:"#10b981" }}>{fmt(r.coupon)}</td>
                        <td style={{ padding:"7px 10px",textAlign:"right",color:r.faceReturn>0?"#4f46e5":"#9ca3af" }}>{r.faceReturn>0?fmt(r.faceReturn):"—"}</td>
                        <td style={{ padding:"7px 10px",textAlign:"right",color:"#6b7a9e" }}>{fmt(r.cumCoupon)}</td>
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
