import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmt = (n) => "$"+Math.round(n).toLocaleString("en-US");
const fmtD= (n) => "$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const p   = (s) => { const v=parseFloat(String(s??"").replace(/,/g,"")); return isNaN(v)?0:v; };

const ist={width:"100%",background:"#f8f9ff",color:"#1e1b4b",border:"1.5px solid rgba(99,102,241,0.2)",borderRadius:12,padding:"9px 12px",fontSize:14,fontWeight:600,outline:"none",boxSizing:"border-box"};
const lst={display:"block",fontSize:11,fontWeight:700,color:"#6b7a9e",marginBottom:5,letterSpacing:"0.4px",textTransform:"uppercase"};
const fst={marginBottom:14};

export default function RentCalculator() {
  const [mode, setMode]       = useState("income"); // income or rent
  const [income, setIncome]   = useState("60000");
  const [rent,   setRent]     = useState("1500");
  const [freq,   setFreq]     = useState("annual"); // annual or monthly
  const [utilities, setUtil]  = useState("150");
  const [renterIns, setRIns]  = useState("20");
  const [parking,   setPark]  = useState("0");
  const [result, setResult]   = useState(null);

  function calculate() {
    const incomeVal = freq==="annual" ? p(income) : p(income)*12;
    const monthlyIncome = incomeVal / 12;
    const extras = p(utilities)+p(renterIns)+p(parking);

    if(mode==="income") {
      // Recommend rent based on income rules
      const rule30 = monthlyIncome * 0.30;
      const rule28 = monthlyIncome * 0.28;
      const rule25 = monthlyIncome * 0.25;
      setResult({
        mode:"income", monthlyIncome, incomeVal,
        scenarios:[
          {label:"25% Rule (Very Conservative)", maxRent:rule25, totalHousing:rule25+extras, pct:25},
          {label:"28% Rule (Conservative)",      maxRent:rule28, totalHousing:rule28+extras, pct:28},
          {label:"30% Rule (Standard)",          maxRent:rule30, totalHousing:rule30+extras, pct:30},
        ],
        extras,
      });
    } else {
      const rentVal = p(rent);
      const totalHousing = rentVal + extras;
      const pctIncome = (totalHousing / monthlyIncome) * 100;
      const requiredIncome = (totalHousing / 0.30) * 12;
      setResult({
        mode:"rent", monthlyIncome, incomeVal, rentVal, totalHousing, pctIncome, requiredIncome, extras,
      });
    }
  }

  const tabSt = (active)=>({flex:1,padding:"8px",borderRadius:8,border:"1.5px solid rgba(99,102,241,0.25)",background:active?"#4f46e5":"#f8f9ff",color:active?"#fff":"#4f46e5",fontWeight:700,fontSize:13,cursor:"pointer"});

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Rent Calculator</h1>
        <p className="muted">Find out how much rent you can afford based on your income, or check if a specific rent fits your budget.</p>
      </header>
      <div style={{maxWidth:960,margin:"0 auto",display:"flex",gap:20,flexWrap:"wrap",alignItems:"flex-start"}}>
        <section className="card" style={{flex:"0 0 320px",minWidth:270}}>
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            <button style={tabSt(mode==="income")} onClick={()=>{setMode("income");setResult(null);}}>By Income</button>
            <button style={tabSt(mode==="rent")}   onClick={()=>{setMode("rent");setResult(null);}}>By Rent</button>
          </div>

          {mode==="income" ? (
            <>
              <div style={fst}>
                <label style={lst}>Your Income</label>
                <div style={{display:"flex",gap:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:4,flex:1}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={income} onChange={e=>setIncome(e.target.value)}/></div>
                  <select style={{...ist,flex:"0 0 auto",width:110}} value={freq} onChange={e=>setFreq(e.target.value)}>
                    <option value="annual">Annual</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={fst}>
                <label style={lst}>Monthly Rent</label>
                <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={rent} onChange={e=>setRent(e.target.value)}/></div>
              </div>
              <div style={fst}>
                <label style={lst}>Your Annual Income</label>
                <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={income} onChange={e=>setIncome(e.target.value)}/></div>
              </div>
            </>
          )}

          <div style={{borderTop:"1px solid rgba(99,102,241,0.1)",paddingTop:12,marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:800,color:"#6366f1",textTransform:"uppercase",letterSpacing:"0.4px",marginBottom:8}}>Additional Monthly Costs</div>
            <div style={fst}><label style={lst}>Utilities (avg.)</label><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={utilities} onChange={e=>setUtil(e.target.value)}/></div></div>
            <div style={fst}><label style={lst}>Renter's Insurance</label><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={renterIns} onChange={e=>setRIns(e.target.value)}/></div></div>
            <div style={{marginBottom:14}}><label style={lst}>Parking</label><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={parking} onChange={e=>setPark(e.target.value)}/></div></div>
          </div>

          <button className="btn" style={{width:"100%",marginBottom:8}} onClick={calculate}>Calculate</button>
          <button className="btn-sec" style={{width:"100%"}} onClick={()=>setResult(null)}>Clear</button>
        </section>

        {result && (
          <section className="card" style={{flex:1,minWidth:260}}>
            {result.mode==="income" ? (
              <>
                <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:20}}>
                  {[["Annual Income",fmt(result.incomeVal)],["Monthly Income",fmt(result.monthlyIncome)],["Extra Costs/mo",fmtD(result.extras)],["",""]].map(([l,v],i)=>l&&(
                    <div key={i} style={{background:"#f0f0ff",borderRadius:10,padding:"12px 14px"}}>
                      <div style={{fontSize:11,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:3}}>{l}</div>
                      <div style={{fontSize:18,fontWeight:800,color:"#312e81"}}>{v}</div>
                    </div>
                  ))}
                </div>
                {result.scenarios.map((sc,i)=>(
                  <div key={sc.label} style={{border:"1px solid rgba(99,102,241,0.15)",borderRadius:14,padding:"16px",marginBottom:12,background:i===2?"#f5f3ff":"#fafbff"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <span style={{fontWeight:700,fontSize:14,color:"#312e81"}}>{sc.label}</span>
                      <span style={{fontWeight:900,fontSize:22,color:"#4f46e5"}}>{fmt(sc.maxRent)}<span style={{fontSize:13}}>/mo</span></span>
                    </div>
                    <div style={{fontSize:12,color:"#6b7a9e"}}>Max rent (pure): <b style={{color:"#1e1b4b"}}>{fmt(sc.maxRent)}</b> · Total housing: <b style={{color:"#dc2626"}}>{fmtD(sc.totalHousing)}</b></div>
                    <div style={{marginTop:8,height:6,background:"#e8e5ff",borderRadius:999,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${sc.pct}%`,background:"linear-gradient(90deg,#6366f1,#8b5cf6)",borderRadius:999}}/>
                    </div>
                    <div style={{fontSize:11,color:"#6b7a9e",marginTop:3,textAlign:"right"}}>{sc.pct}% of income</div>
                  </div>
                ))}
              </>
            ) : (
              <>
                <div style={{background:result.pctIncome<=30?"#f0fdf4":"#fef2f2",border:`1px solid ${result.pctIncome<=30?"#86efac":"#fca5a5"}`,borderRadius:12,padding:"16px 20px",marginBottom:20}}>
                  <div style={{fontSize:13,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>
                    {result.pctIncome<=30 ? "✓ Affordable" : "⚠ May Be Too High"}
                  </div>
                  <div style={{fontSize:32,fontWeight:900,color:result.pctIncome<=30?"#16a34a":"#dc2626"}}>
                    {result.pctIncome.toFixed(1)}% of income
                  </div>
                  <div style={{fontSize:13,color:"#6b7a9e",marginTop:4}}>Total housing cost: {fmtD(result.totalHousing)}/mo</div>
                </div>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <tbody>
                    {[["Monthly Rent",fmtD(result.rentVal)],["Additional Costs",fmtD(result.extras)],["Total Housing",fmtD(result.totalHousing)],["Monthly Income",fmt(result.monthlyIncome)],["% of Income",result.pctIncome.toFixed(1)+"%"],["Income Needed (30% rule)",fmt(result.requiredIncome)+"/yr"]].map(([l,v])=>(
                      <tr key={l} style={{borderBottom:"1px solid rgba(99,102,241,0.08)"}}>
                        <td style={{padding:"9px 6px",color:"#6b7a9e",fontWeight:700}}>{l}</td>
                        <td style={{padding:"9px 6px",color:"#1e1b4b",fontWeight:700,textAlign:"right"}}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
