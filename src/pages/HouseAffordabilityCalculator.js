import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmt  = (n) => "$"+Math.round(n).toLocaleString("en-US");
const fmtD = (n) => "$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const p    = (s) => { const v=parseFloat(String(s??"").replace(/,/g,"")); return isNaN(v)?0:v; };

const ist = {width:"100%",background:"#f8f9ff",color:"#1e1b4b",border:"1.5px solid rgba(99,102,241,0.2)",borderRadius:12,padding:"9px 12px",fontSize:14,fontWeight:600,outline:"none",boxSizing:"border-box"};
const lst = {display:"block",fontSize:11,fontWeight:700,color:"#6b7a9e",marginBottom:5,letterSpacing:"0.4px",textTransform:"uppercase"};
const fst = {marginBottom:14};

export default function HouseAffordabilityCalculator() {
  const [income,     setIncome]     = useState("80000");
  const [spouse,     setSpouse]     = useState("0");
  const [downPct,    setDownPct]    = useState("20");
  const [rate,       setRate]       = useState("7.0");
  const [term,       setTerm]       = useState("30");
  const [monthlyDebt,setMonthlyDebt]= useState("500");
  const [propTax,    setPropTax]    = useState("1.2");
  const [homeIns,    setHomeIns]    = useState("0.5");
  const [hoa,        setHoa]        = useState("0");
  const [result,     setResult]     = useState(null);

  function calculate() {
    const annualIncome = p(income) + p(spouse);
    const monthlyIncome = annualIncome / 12;
    const r = p(rate)/100/12;
    const n = p(term)*12;
    const dp = p(downPct)/100;
    const existDebt = p(monthlyDebt);
    const hoaM = p(hoa);

    // Conservative (28% front-end, 36% back-end) and Aggressive (31%/43%)
    const scenarios = [
      { label:"Conservative", front:0.28, back:0.36 },
      { label:"Moderate",     front:0.31, back:0.43 },
      { label:"Aggressive",   front:0.36, back:0.45 },
    ].map(sc => {
      const maxByFront = sc.front * monthlyIncome;
      const maxByBack  = sc.back  * monthlyIncome - existDebt;
      const maxPI      = Math.min(maxByFront, maxByBack);

      // Estimate tax+ins as % of home price per month
      // PI = maxPI - tax - ins - hoa
      // tax per month = price * propTaxRate/12
      // ins per month = price * homeInsRate/12
      const taxRate = p(propTax)/100/12;
      const insRate = p(homeIns)/100/12;
      // maxPI = loan_pmt + price*taxRate + price*insRate + hoa
      // loan_pmt = loanAmt * r * (1+r)^n / ((1+r)^n - 1)
      // loanAmt = price*(1-dp)
      // price * (1-dp) * PMTfactor + price*(taxRate+insRate) + hoa = maxPI
      const pmtFactor = r===0 ? 1/n : r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1);
      const price = (maxPI - hoaM) / ((1-dp)*pmtFactor + taxRate + insRate);
      const loanAmt = price * (1-dp);
      const downAmt = price * dp;
      const monthlyPI = r===0 ? loanAmt/n : loanAmt * pmtFactor;
      const monthlyTax = price * taxRate;
      const monthlyIns = price * insRate;
      const totalMonthly = monthlyPI + monthlyTax + monthlyIns + hoaM;

      return { ...sc, price, downAmt, loanAmt, monthlyPI, monthlyTax, monthlyIns, totalMonthly, ratio:(totalMonthly+existDebt)/monthlyIncome*100 };
    });

    setResult({ annualIncome, monthlyIncome, existDebt, scenarios });
  }

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>House Affordability Calculator</h1>
        <p className="muted">Estimate how much home you can afford based on income, debts, down payment, and loan terms.</p>
      </header>
      <div style={{maxWidth:1100,margin:"0 auto",display:"flex",gap:20,flexWrap:"wrap",alignItems:"flex-start"}}>
        <section className="card" style={{flex:"0 0 320px",minWidth:270}}>
          <div style={fst}><label style={lst}>Annual Gross Income</label><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={income} onChange={e=>setIncome(e.target.value)}/></div></div>
          <div style={fst}><label style={lst}>Spouse/Partner Income</label><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={spouse} onChange={e=>setSpouse(e.target.value)}/></div></div>
          <div style={fst}><label style={lst}>Monthly Debt Payments</label><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={monthlyDebt} onChange={e=>setMonthlyDebt(e.target.value)}/></div></div>
          <div style={fst}><label style={lst}>Down Payment (%)</label><div style={{display:"flex",alignItems:"center",gap:6}}><input style={ist} value={downPct} onChange={e=>setDownPct(e.target.value)}/><span style={{color:"#6366f1",fontWeight:700}}>%</span></div></div>
          <div style={fst}><label style={lst}>Interest Rate (%)</label><div style={{display:"flex",alignItems:"center",gap:6}}><input style={ist} value={rate} onChange={e=>setRate(e.target.value)}/><span style={{color:"#6366f1",fontWeight:700}}>%</span></div></div>
          <div style={fst}><label style={lst}>Loan Term (Years)</label><select style={ist} value={term} onChange={e=>setTerm(e.target.value)}><option>30</option><option>20</option><option>15</option><option>10</option></select></div>
          <div style={fst}><label style={lst}>Property Tax Rate (%/yr)</label><input style={ist} value={propTax} onChange={e=>setPropTax(e.target.value)}/></div>
          <div style={fst}><label style={lst}>Home Insurance (%/yr)</label><input style={ist} value={homeIns} onChange={e=>setHomeIns(e.target.value)}/></div>
          <div style={fst}><label style={lst}>HOA ($/month)</label><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={hoa} onChange={e=>setHoa(e.target.value)}/></div></div>
          <button className="btn" style={{width:"100%",marginBottom:8}} onClick={calculate}>Calculate</button>
          <button className="btn-sec" style={{width:"100%"}} onClick={()=>setResult(null)}>Clear</button>
        </section>

        {result && (
          <section className="card" style={{flex:1,minWidth:260}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:20}}>
              {[["Annual Income",fmt(result.annualIncome)],["Monthly Income",fmt(result.monthlyIncome)],["Monthly Debt",fmt(result.existDebt)],["Available for Housing",fmtD(result.scenarios[1].totalMonthly)]].map(([l,v])=>(
                <div key={l} style={{background:"#f0f0ff",borderRadius:10,padding:"12px 14px"}}>
                  <div style={{fontSize:11,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:3}}>{l}</div>
                  <div style={{fontSize:18,fontWeight:800,color:"#312e81"}}>{v}</div>
                </div>
              ))}
            </div>

            {result.scenarios.map((sc,i)=>(
              <div key={sc.label} style={{border:"1px solid rgba(99,102,241,0.15)",borderRadius:14,padding:"16px",marginBottom:12,background:i===1?"#f5f3ff":"#fafbff"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <span style={{fontWeight:800,fontSize:15,color:"#312e81"}}>{sc.label}</span>
                  <span style={{fontWeight:900,fontSize:20,color:"#4f46e5"}}>{fmt(sc.price)}</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6,fontSize:12}}>
                  {[["Down Payment",fmtD(sc.downAmt)],["Loan Amount",fmtD(sc.loanAmt)],["Monthly P&I",fmtD(sc.monthlyPI)],["Tax + Insurance",fmtD(sc.monthlyTax+sc.monthlyIns)],["Total Monthly",fmtD(sc.totalMonthly)],["DTI Ratio",sc.ratio.toFixed(1)+"%"]].map(([l,v])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"3px 4px",color:"#374151"}}>
                      <span style={{color:"#6b7a9e"}}>{l}</span><span style={{fontWeight:700}}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
