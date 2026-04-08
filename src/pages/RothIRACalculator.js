import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmt  = (n) => { if (!isFinite(n)||isNaN(n)) return "—"; return "$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}); };
const parseN = (s) => { const v=parseFloat(String(s??"").replace(/,/g,"")); return isNaN(v)?0:v; };
const ist = { width:"100%",background:"#f8f9ff",color:"#1e1b4b",border:"1.5px solid rgba(99,102,241,0.2)",borderRadius:12,padding:"9px 12px",fontSize:14,fontWeight:600,outline:"none",boxSizing:"border-box" };
const lst = { display:"block",fontSize:11,fontWeight:700,color:"#6b7a9e",marginBottom:5,letterSpacing:"0.4px",textTransform:"uppercase" };
const fst = { marginBottom:14 };
const sym = { color:"#6b7a9e",fontWeight:700,flexShrink:0 };

// 2024 IRA contribution limits
const IRA_LIMIT_2024 = 7000;
const IRA_CATCHUP    = 8000; // age 50+

export default function RothIRACalculator() {
  const [currentAge,  setCurrentAge]  = useState("30");
  const [retireAge,   setRetireAge]   = useState("65");
  const [currentBal,  setCurrentBal]  = useState("10000");
  const [annualContrib, setContrib]   = useState("7000");
  const [returnRate,  setReturnRate]  = useState("7");
  const [curTaxRate,  setCurTax]      = useState("22");
  const [retTaxRate,  setRetTax]      = useState("15");
  const [result,      setResult]      = useState(null);
  const [err,         setErr]         = useState("");

  function growBalance(P, annualContrib, rate, years, isRoth, curTax, retTax) {
    const mr = rate/100/12;
    let bal = isRoth ? P : P * (1 - curTax/100);
    const monthlyContrib = (isRoth ? annualContrib : annualContrib * (1 - curTax/100)) / 12;
    for (let m=0; m<years*12; m++) {
      bal += bal * mr + monthlyContrib;
    }
    // At withdrawal
    if (!isRoth) bal *= (1 - retTax/100);
    return bal;
  }

  function calculate() {
    setErr(""); setResult(null);
    const ca=parseN(currentAge), ra=parseN(retireAge), bal=parseN(currentBal);
    const ac=parseN(annualContrib), rr=parseN(returnRate);
    const ct=parseN(curTaxRate), rt=parseN(retTaxRate);
    if (ca>=ra)  { setErr("Retirement age must be greater than current age."); return; }
    if (!(rr>=0)){ setErr("Return rate must be 0 or greater."); return; }
    const years = ra - ca;
    const limitedContrib = Math.min(ac, ca>=50 ? IRA_CATCHUP : IRA_LIMIT_2024);

    // Year-by-year for Roth (after-tax contributions, tax-free withdrawal)
    const mr = rr/100/12;
    let rothBal = bal, tradBal = bal;
    const rows = [];
    let totalRothContrib=0, totalTradContrib=0;

    for (let y=1; y<=years; y++) {
      const age = ca + y;
      const yContrib = Math.min(limitedContrib, age>=50 ? IRA_CATCHUP : IRA_LIMIT_2024);
      const rothMonthly = yContrib / 12;
      const tradMonthly = yContrib * (1 - ct/100) / 12;
      let rothInt=0, tradInt=0;
      for (let m=0; m<12; m++) {
        const ri = (rothBal + rothMonthly) * mr;
        rothBal += rothMonthly + ri;
        rothInt += ri;
        const ti = (tradBal + tradMonthly) * mr;
        tradBal += tradMonthly + ti;
        tradInt += ti;
      }
      totalRothContrib += yContrib;
      totalTradContrib += yContrib * (1 - ct/100);
      rows.push({ year:y, age, rothBal, tradBal, rothAfterTax:rothBal, tradAfterTax:tradBal*(1-rt/100) });
    }

    const rothFinal = rothBal;
    const tradFinal = tradBal * (1 - rt/100);
    setResult({ rothFinal, tradFinal, advantage:rothFinal-tradFinal, rows, years, totalRothContrib });
  }

  function clear() { setCurrentAge("30"); setRetireAge("65"); setCurrentBal("10000"); setContrib("7000"); setReturnRate("7"); setCurTax("22"); setRetTax("15"); setResult(null); setErr(""); }

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Roth IRA Calculator</h1>
        <p className="muted">Compare Roth IRA (after-tax, tax-free growth) versus Traditional IRA (pre-tax, taxed at withdrawal) to find which is better for your situation.</p>
      </header>
      <div style={{ maxWidth:1120,margin:"0 auto" }}>
        <div style={{ display:"flex",gap:20,alignItems:"flex-start",flexWrap:"wrap",marginBottom:20 }}>
          <section className="card" style={{ flex:"0 0 340px",minWidth:268 }}>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px" }}>
              <div style={fst}><label style={lst}>Current Age</label><input style={ist} value={currentAge} onChange={e=>setCurrentAge(e.target.value)} /></div>
              <div style={fst}><label style={lst}>Retirement Age</label><input style={ist} value={retireAge} onChange={e=>setRetireAge(e.target.value)} /></div>
            </div>
            <div style={fst}><label style={lst}>Current IRA Balance</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><span style={sym}>$</span><input style={ist} value={currentBal} onChange={e=>setCurrentBal(e.target.value)} /></div></div>
            <div style={fst}>
              <label style={lst}>Annual Contribution (max ${IRA_LIMIT_2024.toLocaleString()})</label>
              <div style={{ display:"flex",alignItems:"center",gap:6 }}><span style={sym}>$</span><input style={ist} value={annualContrib} onChange={e=>setContrib(e.target.value)} /></div>
            </div>
            <div style={fst}><label style={lst}>Expected Annual Return</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><input style={ist} value={returnRate} onChange={e=>setReturnRate(e.target.value)} /><span style={sym}>%</span></div></div>
            <div style={fst}><label style={lst}>Current Tax Rate</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><input style={ist} value={curTaxRate} onChange={e=>setCurTax(e.target.value)} /><span style={sym}>%</span></div></div>
            <div style={fst}><label style={lst}>Retirement Tax Rate</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><input style={ist} value={retTaxRate} onChange={e=>setRetTax(e.target.value)} /><span style={sym}>%</span></div></div>
            {err && <p style={{ color:"#ef4444",fontSize:13,marginBottom:10 }}>{err}</p>}
            <button className="btn" style={{ width:"100%",marginBottom:8 }} onClick={calculate}>Calculate</button>
            <button className="btn-sec" style={{ width:"100%" }} onClick={clear}>Clear</button>
          </section>

          {result && (
            <section className="card" style={{ flex:1,minWidth:300 }}>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"12px",marginBottom:22 }}>
                {[
                  ["Roth IRA Balance\n(Tax-Free)", fmt(result.rothFinal), "#4f46e5"],
                  ["Traditional IRA\n(After Tax)", fmt(result.tradFinal), "#6b7a9e"],
                  [result.advantage>0?"Roth Advantage":"Trad. Advantage", fmt(Math.abs(result.advantage)), result.advantage>0?"#16a34a":"#f59e0b"],
                ].map(([l,v,c])=>(
                  <div key={l} style={{ background:"#f0f0ff",borderRadius:10,padding:"14px 16px" }}>
                    <div style={{ fontSize:11,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:4,whiteSpace:"pre-line" }}>{l}</div>
                    <div style={{ fontSize:18,fontWeight:800,color:c }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                  <thead><tr style={{ background:"#f0f0ff" }}>{["Age","Roth Balance","Trad. (Pre-Tax)","Trad. (After-Tax)"].map(h=><th key={h} style={{ padding:"8px 10px",textAlign:"right",fontWeight:700,color:"#4f46e5" }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {result.rows.map((r,i)=>(
                      <tr key={i} style={{ borderBottom:"1px solid rgba(99,102,241,0.08)",background:i%2===0?"#fafbff":"#fff" }}>
                        <td style={{ padding:"7px 10px",fontWeight:700,color:"#1e1b4b",textAlign:"right" }}>{r.age}</td>
                        <td style={{ padding:"7px 10px",textAlign:"right",fontWeight:700,color:"#4f46e5" }}>{fmt(r.rothBal)}</td>
                        <td style={{ padding:"7px 10px",textAlign:"right",color:"#6b7a9e" }}>{fmt(r.tradBal)}</td>
                        <td style={{ padding:"7px 10px",textAlign:"right",color:"#1e1b4b" }}>{fmt(r.tradAfterTax)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize:12,color:"#9ca3af",marginTop:14 }}>2024 contribution limit: $7,000 ($8,000 if age 50+). Income phase-out limits not applied here.</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
