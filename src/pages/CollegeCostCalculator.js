import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmtD = (n) => "$"+Math.round(n).toLocaleString("en-US");
const p    = (s) => { const v=parseFloat(String(s??"").replace(/,/g,"")); return isNaN(v)?null:v; };

const ist={width:"100%",background:"#f8f9ff",color:"#1e1b4b",border:"1.5px solid rgba(99,102,241,0.2)",borderRadius:12,padding:"9px 12px",fontSize:14,fontWeight:600,outline:"none",boxSizing:"border-box"};
const lst={display:"block",fontSize:11,fontWeight:700,color:"#6b7a9e",marginBottom:5,letterSpacing:"0.4px",textTransform:"uppercase"};
const fst={marginBottom:14};

export default function CollegeCostCalculator() {
  const [currentCost,   setCurrentCost]   = useState("35000");
  const [years,         setYears]         = useState("4");
  const [yearsUntil,    setYearsUntil]    = useState("10");
  const [inflation,     setInflation]     = useState("5");
  const [savings,       setSavings]       = useState("20000");
  const [monthly,       setMonthly]       = useState("300");
  const [returnRate,    setReturnRate]    = useState("6");
  const [scholarships,  setScholarships]  = useState("0");
  const [result,        setResult]        = useState(null);

  function calculate(){
    const costV=p(currentCost), yrs=p(years), yrsUntil=p(yearsUntil), inflV=p(inflation)/100, savV=p(savings)||0, moV=p(monthly)||0, retV=p(returnRate)/100, scholV=p(scholarships)||0;
    if([costV,yrs,yrsUntil,inflV,retV].some(x=>x===null)) return;

    // Future cost when enrollment starts
    const costAtEnrollment=costV*Math.pow(1+inflV,yrsUntil);

    // Total 4-year cost (each year inflated further)
    let totalFutureCost=0;
    const annualCosts=[];
    for(let i=0;i<yrs;i++){
      const c=costV*Math.pow(1+inflV,yrsUntil+i);
      annualCosts.push(c);
      totalFutureCost+=c;
    }

    // Savings growth by enrollment
    const r=retV/12;
    const mosSavings=yrsUntil*12;
    const futureSavings=savV*Math.pow(1+r,mosSavings)+moV*(Math.pow(1+r,mosSavings)-1)/r;

    // Shortfall
    const gap=Math.max(0,totalFutureCost-futureSavings-scholV*yrs);

    // Required monthly savings to cover gap
    const rMo=retV/12;
    const reqMonthly=gap>0&&mosSavings>0 ? gap*rMo/(Math.pow(1+rMo,mosSavings)-1) : 0;

    setResult({costAtEnrollment,totalFutureCost,futureSavings,gap,reqMonthly,annualCosts,yrs,yrsUntil,scholV});
  }

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>College Cost Calculator</h1>
        <p className="muted">Estimate the future cost of college and how much you need to save monthly to meet your goal.</p>
      </header>
      <div style={{maxWidth:1100,margin:"0 auto",display:"flex",gap:20,flexWrap:"wrap",alignItems:"flex-start"}}>
        <section className="card" style={{flex:"0 0 310px",minWidth:260}}>
          <div style={{fontSize:11,fontWeight:800,color:"#6366f1",textTransform:"uppercase",letterSpacing:"0.4px",marginBottom:10}}>College Costs</div>
          <div style={fst}><label style={lst}>Current Annual College Cost</label><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={currentCost} onChange={e=>setCurrentCost(e.target.value)}/></div></div>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            <div style={{flex:1}}><label style={lst}>Years in College</label><input style={ist} value={years} onChange={e=>setYears(e.target.value)}/></div>
            <div style={{flex:1}}><label style={lst}>Years Until College</label><input style={ist} value={yearsUntil} onChange={e=>setYearsUntil(e.target.value)}/></div>
          </div>
          <div style={fst}><label style={lst}>Annual College Inflation (%)</label><div style={{display:"flex",alignItems:"center",gap:6}}><input style={ist} value={inflation} onChange={e=>setInflation(e.target.value)}/><span style={{color:"#6366f1",fontWeight:700}}>%</span></div></div>
          <div style={fst}><label style={lst}>Annual Scholarships/Aid</label><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={scholarships} onChange={e=>setScholarships(e.target.value)}/></div></div>
          <div style={{borderTop:"1px solid rgba(99,102,241,0.1)",paddingTop:12}}>
            <div style={{fontSize:11,fontWeight:800,color:"#6366f1",textTransform:"uppercase",letterSpacing:"0.4px",marginBottom:10}}>Current Savings Plan</div>
            <div style={fst}><label style={lst}>Current Savings (529/other)</label><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={savings} onChange={e=>setSavings(e.target.value)}/></div></div>
            <div style={fst}><label style={lst}>Monthly Contribution</label><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={monthly} onChange={e=>setMonthly(e.target.value)}/></div></div>
            <div style={fst}><label style={lst}>Expected Annual Return (%)</label><div style={{display:"flex",alignItems:"center",gap:6}}><input style={ist} value={returnRate} onChange={e=>setReturnRate(e.target.value)}/><span style={{color:"#6366f1",fontWeight:700}}>%</span></div></div>
          </div>
          <button className="btn" style={{width:"100%",marginBottom:8}} onClick={calculate}>Calculate</button>
          <button className="btn-sec" style={{width:"100%"}} onClick={()=>setResult(null)}>Clear</button>
        </section>

        {result && (
          <section className="card" style={{flex:1,minWidth:260}}>
            <div style={{background:result.gap>0?"#fef2f2":"#f0fdf4",border:`1px solid ${result.gap>0?"#fca5a5":"#86efac"}`,borderRadius:12,padding:"16px 20px",marginBottom:20}}>
              <div style={{fontSize:13,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>{result.gap>0?"Savings Shortfall":"Fully Funded!"}</div>
              <div style={{fontSize:36,fontWeight:900,color:result.gap>0?"#dc2626":"#16a34a"}}>{fmtD(Math.abs(result.gap))}</div>
              {result.gap>0 && <div style={{fontSize:13,color:"#6b7a9e",marginTop:4}}>Need <b>{fmtD(result.reqMonthly)}/mo</b> to cover the gap</div>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:18}}>
              {[["Total Future Cost",fmtD(result.totalFutureCost)],["Projected Savings",fmtD(result.futureSavings)],["Cost at Enrollment",fmtD(result.costAtEnrollment)+"/yr"],["Savings Needed/mo",result.gap>0?fmtD(result.reqMonthly):"On Track!"]].map(([l,v])=>(
                <div key={l} style={{background:"#f0f0ff",borderRadius:10,padding:"12px"}}>
                  <div style={{fontSize:11,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:3}}>{l}</div>
                  <div style={{fontSize:16,fontWeight:800,color:"#312e81"}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead><tr style={{background:"#f0f0ff"}}>{["Year of College","Annual Cost","Annual Aid/Scholarship","Net Annual Cost"].map(h=><th key={h} style={{padding:"8px 10px",textAlign:"right",fontWeight:700,color:"#4f46e5",fontSize:11}}>{h}</th>)}</tr></thead>
                <tbody>
                  {result.annualCosts.map((cost,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid rgba(99,102,241,0.08)",background:i%2===0?"#fafbff":"#fff"}}>
                      <td style={{padding:"7px 10px",fontWeight:600,color:"#1e1b4b",textAlign:"right"}}>Year {i+1}</td>
                      <td style={{padding:"7px 10px",textAlign:"right",color:"#dc2626",fontWeight:700}}>{fmtD(cost)}</td>
                      <td style={{padding:"7px 10px",textAlign:"right",color:"#16a34a"}}>{fmtD(result.scholV)}</td>
                      <td style={{padding:"7px 10px",textAlign:"right",fontWeight:700,color:"#4f46e5"}}>{fmtD(cost-result.scholV)}</td>
                    </tr>
                  ))}
                  <tr style={{background:"#f0f0ff",fontWeight:800}}>
                    <td style={{padding:"8px 10px",textAlign:"right",color:"#312e81"}}>Total</td>
                    <td style={{padding:"8px 10px",textAlign:"right",color:"#dc2626"}}>{fmtD(result.totalFutureCost)}</td>
                    <td style={{padding:"8px 10px",textAlign:"right",color:"#16a34a"}}>{fmtD(result.scholV*result.yrs)}</td>
                    <td style={{padding:"8px 10px",textAlign:"right",color:"#4f46e5"}}>{fmtD(result.totalFutureCost-result.scholV*result.yrs)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
