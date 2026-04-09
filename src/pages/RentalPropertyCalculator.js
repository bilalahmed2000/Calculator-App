import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmt = (n) => "$"+Math.round(n).toLocaleString("en-US");
const fmtD= (n) => "$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const fmtP= (n) => n.toFixed(2)+"%";
const p   = (s) => { const v=parseFloat(String(s??"").replace(/,/g,"")); return isNaN(v)?0:v; };

const ist={width:"100%",background:"#f8f9ff",color:"#1e1b4b",border:"1.5px solid rgba(99,102,241,0.2)",borderRadius:12,padding:"9px 12px",fontSize:14,fontWeight:600,outline:"none",boxSizing:"border-box"};
const lst={display:"block",fontSize:11,fontWeight:700,color:"#6b7a9e",marginBottom:5,letterSpacing:"0.4px",textTransform:"uppercase"};
const fst={marginBottom:14};

export default function RentalPropertyCalculator() {
  const [price,     setPrice]     = useState("300000");
  const [downPct,   setDownPct]   = useState("25");
  const [rate,      setRate]      = useState("7.0");
  const [term,      setTerm]      = useState("30");
  const [rent,      setRent]      = useState("2200");
  const [vacancy,   setVacancy]   = useState("5");
  const [propTax,   setPropTax]   = useState("1.2");
  const [insurance, setInsurance] = useState("100");
  const [repairs,   setRepairs]   = useState("150");
  const [mgmt,      setMgmt]      = useState("8");
  const [utilities, setUtil]      = useState("0");
  const [other,     setOther]     = useState("50");
  const [appPct,    setAppPct]    = useState("3.0");
  const [years,     setYears]     = useState("10");
  const [result,    setResult]    = useState(null);

  function calculate() {
    const priceV = p(price);
    const dp = p(downPct)/100;
    const r  = p(rate)/100/12;
    const n  = p(term)*12;
    const rentV  = p(rent);
    const vacR   = p(vacancy)/100;
    const taxR   = p(propTax)/100;
    const insM   = p(insurance);
    const repM   = p(repairs);
    const mgmtR  = p(mgmt)/100;
    const utilM  = p(utilities);
    const otherM = p(other);
    const appR   = p(appPct)/100/12;
    const yrs    = p(years);

    const downAmt  = priceV*dp;
    const loanAmt  = priceV*(1-dp);
    const pmt      = r===0 ? loanAmt/n : loanAmt*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1);

    const effectiveRent = rentV*(1-vacR);
    const taxM    = priceV*taxR/12;
    const mgmtM   = effectiveRent*mgmtR;
    const totalExp= pmt+taxM+insM+repM+mgmtM+utilM+otherM;
    const noi     = effectiveRent - (taxM+insM+repM+mgmtM+utilM+otherM);
    const cashFlow= effectiveRent - totalExp;
    const capRate = (noi*12)/priceV*100;
    const coc     = (cashFlow*12)/downAmt*100;

    // After yrs projection
    const futureValue = priceV*Math.pow(1+appR,yrs*12);
    let balance=loanAmt;
    for(let i=0;i<yrs*12;i++){
      const intP=balance*r;
      const prinP=(r===0?loanAmt/n:pmt)-intP;
      balance=Math.max(0,balance-prinP);
    }
    const equity=futureValue-balance;
    const totalCashFlow=cashFlow*12*yrs;
    const totalReturn=(equity-downAmt+totalCashFlow)/downAmt*100;

    setResult({downAmt,loanAmt,pmt,effectiveRent,taxM,insM,repM,mgmtM,utilM,otherM,totalExp,noi,cashFlow,capRate,coc,futureValue,equity,totalCashFlow,totalReturn,yrs});
  }

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Rental Property Calculator</h1>
        <p className="muted">Analyze cash flow, cap rate, cash-on-cash return, and long-term equity for rental property investments.</p>
      </header>
      <div style={{maxWidth:1100,margin:"0 auto",display:"flex",gap:20,flexWrap:"wrap",alignItems:"flex-start"}}>
        <section className="card" style={{flex:"0 0 330px",minWidth:270}}>
          <div style={{fontSize:11,fontWeight:800,color:"#6366f1",textTransform:"uppercase",letterSpacing:"0.4px",marginBottom:10}}>Property & Financing</div>
          <div style={fst}><label style={lst}>Purchase Price</label><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={price} onChange={e=>setPrice(e.target.value)}/></div></div>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            <div style={{flex:1}}><label style={lst}>Down Payment %</label><input style={ist} value={downPct} onChange={e=>setDownPct(e.target.value)}/></div>
            <div style={{flex:1}}><label style={lst}>Interest Rate %</label><input style={ist} value={rate} onChange={e=>setRate(e.target.value)}/></div>
          </div>
          <div style={fst}><label style={lst}>Loan Term (Years)</label><select style={ist} value={term} onChange={e=>setTerm(e.target.value)}><option>30</option><option>20</option><option>15</option><option>10</option></select></div>
          <div style={{borderTop:"1px solid rgba(99,102,241,0.1)",paddingTop:12}}>
            <div style={{fontSize:11,fontWeight:800,color:"#6366f1",textTransform:"uppercase",letterSpacing:"0.4px",marginBottom:10}}>Income</div>
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              <div style={{flex:1}}><label style={lst}>Monthly Rent ($)</label><input style={ist} value={rent} onChange={e=>setRent(e.target.value)}/></div>
              <div style={{flex:1}}><label style={lst}>Vacancy Rate %</label><input style={ist} value={vacancy} onChange={e=>setVacancy(e.target.value)}/></div>
            </div>
          </div>
          <div style={{borderTop:"1px solid rgba(99,102,241,0.1)",paddingTop:12}}>
            <div style={{fontSize:11,fontWeight:800,color:"#6366f1",textTransform:"uppercase",letterSpacing:"0.4px",marginBottom:10}}>Monthly Expenses</div>
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              <div style={{flex:1}}><label style={lst}>Property Tax %/yr</label><input style={ist} value={propTax} onChange={e=>setPropTax(e.target.value)}/></div>
              <div style={{flex:1}}><label style={lst}>Insurance ($/mo)</label><input style={ist} value={insurance} onChange={e=>setInsurance(e.target.value)}/></div>
            </div>
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              <div style={{flex:1}}><label style={lst}>Repairs ($/mo)</label><input style={ist} value={repairs} onChange={e=>setRepairs(e.target.value)}/></div>
              <div style={{flex:1}}><label style={lst}>Mgmt Fee %</label><input style={ist} value={mgmt} onChange={e=>setMgmt(e.target.value)}/></div>
            </div>
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              <div style={{flex:1}}><label style={lst}>Utilities ($/mo)</label><input style={ist} value={utilities} onChange={e=>setUtil(e.target.value)}/></div>
              <div style={{flex:1}}><label style={lst}>Other ($/mo)</label><input style={ist} value={other} onChange={e=>setOther(e.target.value)}/></div>
            </div>
          </div>
          <div style={{borderTop:"1px solid rgba(99,102,241,0.1)",paddingTop:12,marginBottom:14}}>
            <div style={{display:"flex",gap:8}}>
              <div style={{flex:1}}><label style={lst}>Appreciation %/yr</label><input style={ist} value={appPct} onChange={e=>setAppPct(e.target.value)}/></div>
              <div style={{flex:1}}><label style={lst}>Hold Period (yrs)</label><input style={ist} value={years} onChange={e=>setYears(e.target.value)}/></div>
            </div>
          </div>
          <button className="btn" style={{width:"100%",marginBottom:8}} onClick={calculate}>Analyze</button>
          <button className="btn-sec" style={{width:"100%"}} onClick={()=>setResult(null)}>Clear</button>
        </section>

        {result && (
          <section className="card" style={{flex:1,minWidth:260}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:18}}>
              {[["Monthly Cash Flow",fmtD(result.cashFlow),result.cashFlow>=0?"#16a34a":"#dc2626"],["Cap Rate",fmtP(result.capRate),"#4f46e5"],["Cash-on-Cash Return",fmtP(result.coc),result.coc>=0?"#10b981":"#f59e0b"],["Net Operating Income",fmt(result.noi*12)+"/yr","#312e81"]].map(([l,v,c])=>(
                <div key={l} style={{background:"#f0f0ff",borderRadius:12,padding:"14px"}}>
                  <div style={{fontSize:11,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:3}}>{l}</div>
                  <div style={{fontSize:20,fontWeight:800,color:c}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{marginBottom:16}}>
              <div style={{fontWeight:800,fontSize:13,color:"#312e81",marginBottom:8}}>Monthly Breakdown</div>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <tbody>
                  {[["Effective Rent Income",fmtD(result.effectiveRent),"#16a34a"],["Mortgage Payment",fmtD(result.pmt),"#dc2626"],["Property Tax",fmtD(result.taxM),"#dc2626"],["Insurance",fmtD(result.insM),"#dc2626"],["Repairs & Maintenance",fmtD(result.repM),"#dc2626"],["Management Fee",fmtD(result.mgmtM),"#dc2626"],["Utilities + Other",fmtD(result.utilM+result.otherM),"#dc2626"],["Total Expenses",fmtD(result.totalExp),"#ef4444"],["Net Cash Flow",fmtD(result.cashFlow),result.cashFlow>=0?"#16a34a":"#dc2626"]].map(([l,v,c])=>(
                    <tr key={l} style={{borderBottom:"1px solid rgba(99,102,241,0.08)"}}>
                      <td style={{padding:"7px 6px",color:"#6b7a9e",fontWeight:700}}>{l}</td>
                      <td style={{padding:"7px 6px",fontWeight:700,color:c,textAlign:"right"}}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{background:"#f5f3ff",borderRadius:12,padding:"14px"}}>
              <div style={{fontWeight:800,fontSize:13,color:"#312e81",marginBottom:8}}>{result.yrs}-Year Projection</div>
              {[["Future Property Value",fmt(result.futureValue)],["Remaining Loan Balance",fmt(result.futureValue-result.equity)],["Total Equity",fmt(result.equity)],["Total Cash Flow",fmt(result.totalCashFlow)],["Total Return",fmtP(result.totalReturn)]].map(([l,v])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"4px 0"}}>
                  <span style={{color:"#6b7a9e",fontWeight:700}}>{l}</span>
                  <span style={{fontWeight:800,color:"#1e1b4b"}}>{v}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
