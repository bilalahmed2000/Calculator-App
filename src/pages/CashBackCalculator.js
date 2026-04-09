import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmtD = (n) => "$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const fmtP = (n) => n.toFixed(2)+"%";
const p    = (s) => { const v=parseFloat(String(s??"").replace(/,/g,"")); return isNaN(v)?null:v; };

const ist={width:"100%",background:"#f8f9ff",color:"#1e1b4b",border:"1.5px solid rgba(99,102,241,0.2)",borderRadius:12,padding:"9px 12px",fontSize:14,fontWeight:600,outline:"none",boxSizing:"border-box"};
const lst={display:"block",fontSize:11,fontWeight:700,color:"#6b7a9e",marginBottom:5,letterSpacing:"0.4px",textTransform:"uppercase"};
const fst={marginBottom:14};

export default function CashBackCalculator() {
  const [price,       setPrice]       = useState("30000");
  const [cashBack,    setCashBack]    = useState("3000");
  const [lowRate,     setLowRate]     = useState("1.9");
  const [regRate,     setRegRate]     = useState("6.5");
  const [term,        setTerm]        = useState("60");
  const [down,        setDown]        = useState("0");
  const [result,      setResult]      = useState(null);
  const [err,         setErr]         = useState("");

  function calculate() {
    setErr(""); setResult(null);
    const priceV=p(price), cbV=p(cashBack), lrV=p(lowRate), rrV=p(regRate), termV=p(term), downV=p(down);
    if([priceV,cbV,lrV,rrV,termV].some(x=>x===null)){ setErr("Fill in all fields."); return; }

    const loan = priceV - downV;

    // Option A: Cash back — borrow at regular rate, use cash back as rebate
    const principalA = loan - cbV;
    const rA = rrV/100/12;
    const pmtA = rA===0 ? principalA/termV : principalA*rA*Math.pow(1+rA,termV)/(Math.pow(1+rA,termV)-1);
    const totalA = pmtA*termV;
    const interestA = totalA - principalA;

    // Option B: Low interest — borrow full loan at low rate
    const rB = lrV/100/12;
    const pmtB = rB===0 ? loan/termV : loan*rB*Math.pow(1+rB,termV)/(Math.pow(1+rB,termV)-1);
    const totalB = pmtB*termV;
    const interestB = totalB - loan;

    const winner = totalA < totalB ? "Cash Back" : "Low Interest";
    const savings = Math.abs(totalA - totalB);

    setResult({pmtA,totalA,interestA,pmtB,totalB,interestB,winner,savings,principalA,loan,cbV});
  }

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Cash Back or Low Interest Calculator</h1>
        <p className="muted">Compare taking a dealer cash-back rebate (and financing at the regular rate) versus a low-interest financing offer.</p>
      </header>
      <div style={{maxWidth:1100,margin:"0 auto",display:"flex",gap:20,flexWrap:"wrap",alignItems:"flex-start"}}>
        <section className="card" style={{flex:"0 0 310px",minWidth:260}}>
          <div style={fst}><label style={lst}>Vehicle / Purchase Price</label><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={price} onChange={e=>setPrice(e.target.value)}/></div></div>
          <div style={fst}><label style={lst}>Down Payment</label><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={down} onChange={e=>setDown(e.target.value)}/></div></div>
          <div style={fst}><label style={lst}>Cash Back Amount</label><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={cashBack} onChange={e=>setCashBack(e.target.value)}/></div></div>
          <div style={fst}><label style={lst}>Regular Financing Rate (%)</label><div style={{display:"flex",alignItems:"center",gap:6}}><input style={ist} value={regRate} onChange={e=>setRegRate(e.target.value)}/><span style={{color:"#6366f1",fontWeight:700}}>%</span></div></div>
          <div style={fst}><label style={lst}>Low Interest Rate (%)</label><div style={{display:"flex",alignItems:"center",gap:6}}><input style={ist} value={lowRate} onChange={e=>setLowRate(e.target.value)}/><span style={{color:"#6366f1",fontWeight:700}}>%</span></div></div>
          <div style={fst}><label style={lst}>Loan Term (Months)</label><select style={ist} value={term} onChange={e=>setTerm(e.target.value)}><option>24</option><option>36</option><option>48</option><option>60</option><option>72</option><option>84</option></select></div>
          {err && <p style={{color:"#ef4444",fontSize:13,marginBottom:10}}>{err}</p>}
          <button className="btn" style={{width:"100%",marginBottom:8}} onClick={calculate}>Compare</button>
          <button className="btn-sec" style={{width:"100%"}} onClick={()=>{setResult(null);setErr("");}}>Clear</button>
        </section>

        {result && (
          <section className="card" style={{flex:1,minWidth:260}}>
            <div style={{background:result.winner==="Cash Back"?"#eff6ff":"#f0fdf4",border:`1px solid ${result.winner==="Cash Back"?"#93c5fd":"#86efac"}`,borderRadius:12,padding:"16px 20px",marginBottom:20,textAlign:"center"}}>
              <div style={{fontSize:13,color:"#6b7a9e",fontWeight:700,marginBottom:4}}>Better Deal</div>
              <div style={{fontSize:32,fontWeight:900,color:result.winner==="Cash Back"?"#1d4ed8":"#16a34a"}}>{result.winner}</div>
              <div style={{fontSize:14,color:"#6b7a9e",marginTop:4}}>Saves <b style={{color:"#1e1b4b"}}>{fmtD(result.savings)}</b> in total cost</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              {[
                {title:"Cash Back Option",color:"#1d4ed8",rows:[["Loan Amount",fmtD(result.principalA)],["Monthly Payment",fmtD(result.pmtA)],["Total Interest",fmtD(result.interestA)],["Total Cost",fmtD(result.totalA)]]},
                {title:"Low Interest Option",color:"#16a34a",rows:[["Loan Amount",fmtD(result.loan)],["Monthly Payment",fmtD(result.pmtB)],["Total Interest",fmtD(result.interestB)],["Total Cost",fmtD(result.totalB)]]}
              ].map(side=>(
                <div key={side.title} style={{border:"1px solid rgba(99,102,241,0.15)",borderRadius:12,padding:"14px"}}>
                  <div style={{fontWeight:800,fontSize:14,color:side.color,marginBottom:10}}>{side.title}</div>
                  {side.rows.map(([l,v])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"4px 0",borderBottom:"1px solid rgba(99,102,241,0.06)"}}>
                      <span style={{color:"#6b7a9e"}}>{l}</span><span style={{fontWeight:700,color:"#1e1b4b"}}>{v}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
