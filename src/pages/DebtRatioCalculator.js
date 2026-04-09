import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmtD = (n) => "$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const fmtP = (n) => n.toFixed(1)+"%";
const p    = (s) => { const v=parseFloat(String(s??"").replace(/,/g,"")); return isNaN(v)?null:v; };

const ist={width:"100%",background:"#f8f9ff",color:"#1e1b4b",border:"1.5px solid rgba(99,102,241,0.2)",borderRadius:12,padding:"9px 12px",fontSize:14,fontWeight:600,outline:"none",boxSizing:"border-box"};
const lst={display:"block",fontSize:11,fontWeight:700,color:"#6b7a9e",marginBottom:5,letterSpacing:"0.4px",textTransform:"uppercase"};
const fst={marginBottom:14};

const INCOME_ITEMS = ["Monthly Salary / Wages","Spouse / Partner Income","Rental Income","Other Regular Income"];
const DEBT_ITEMS   = ["Mortgage / Rent Payment","Car Payment(s)","Minimum Credit Card Payments","Student Loan Payment","Personal Loan Payment","Alimony / Child Support","Other Monthly Debt"];

export default function DebtRatioCalculator() {
  const [incomes,  setIncomes]  = useState(Object.fromEntries(INCOME_ITEMS.map(k=>[k,""])));
  const [debts,    setDebts]    = useState(Object.fromEntries(DEBT_ITEMS.map(k=>[k,""])));
  const [result,   setResult]   = useState(null);

  function calculate(){
    const totalIncome=INCOME_ITEMS.reduce((s,k)=>s+(p(incomes[k])||0),0);
    const totalDebt  =DEBT_ITEMS.reduce((s,k)=>s+(p(debts[k])||0),0);
    if(totalIncome===0){ return; }
    const dti=(totalDebt/totalIncome)*100;
    const status = dti<20?"Excellent":dti<36?"Good":dti<43?"Fair":dti<50?"Poor":"Very High";
    const color  = dti<20?"#16a34a":dti<36?"#10b981":dti<43?"#f59e0b":dti<50?"#ef4444":"#dc2626";
    setResult({totalIncome,totalDebt,dti,status,color,maxDebt43:totalIncome*0.43,maxDebt36:totalIncome*0.36,maxDebt28:totalIncome*0.28});
  }

  function clear(){
    setIncomes(Object.fromEntries(INCOME_ITEMS.map(k=>[k,""])));
    setDebts(Object.fromEntries(DEBT_ITEMS.map(k=>[k,""])));
    setResult(null);
  }

  const field=(label,value,onChange)=>(
    <div key={label} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
      <span style={{fontSize:12,color:"#6b7a9e",fontWeight:700,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{label}</span>
      <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}><span style={{color:"#6366f1",fontWeight:700,fontSize:13}}>$</span><input style={{...ist,width:100}} value={value} onChange={onChange} placeholder="0"/></div>
    </div>
  );

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Debt-to-Income Ratio Calculator</h1>
        <p className="muted">Calculate your DTI ratio — the percentage of gross monthly income that goes toward debt payments. Lenders use this to assess creditworthiness.</p>
      </header>
      <div style={{maxWidth:1100,margin:"0 auto",display:"flex",gap:20,flexWrap:"wrap",alignItems:"flex-start"}}>
        <section className="card" style={{flex:"0 0 360px",minWidth:300}}>
          <div style={{fontWeight:800,fontSize:14,color:"#312e81",marginBottom:10}}>Monthly Income (Gross)</div>
          {INCOME_ITEMS.map(k=>field(k,incomes[k],e=>setIncomes(v=>({...v,[k]:e.target.value}))))}
          <div style={{borderTop:"1px solid rgba(99,102,241,0.1)",marginTop:12,paddingTop:12}}>
            <div style={{fontWeight:800,fontSize:14,color:"#312e81",marginBottom:10}}>Monthly Debt Payments</div>
            {DEBT_ITEMS.map(k=>field(k,debts[k],e=>setDebts(v=>({...v,[k]:e.target.value}))))}
          </div>
          <div style={{marginTop:14}}>
            <button className="btn" style={{width:"100%",marginBottom:8}} onClick={calculate}>Calculate DTI</button>
            <button className="btn-sec" style={{width:"100%"}} onClick={clear}>Clear</button>
          </div>
        </section>

        {result && (
          <section className="card" style={{flex:1,minWidth:260}}>
            <div style={{background:"#f0f0ff",borderRadius:16,padding:"20px",marginBottom:20,textAlign:"center"}}>
              <div style={{fontSize:13,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:8}}>Debt-to-Income Ratio</div>
              <div style={{fontSize:56,fontWeight:900,color:result.color,lineHeight:1}}>{fmtP(result.dti)}</div>
              <div style={{fontSize:18,fontWeight:800,color:result.color,marginTop:8}}>{result.status}</div>
            </div>

            {/* DTI bar */}
            <div style={{marginBottom:20}}>
              <div style={{height:14,background:"#e8e5ff",borderRadius:999,overflow:"hidden",marginBottom:4}}>
                <div style={{height:"100%",width:`${Math.min(result.dti,100)}%`,background:result.color,borderRadius:999,transition:"width 0.5s"}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#9ca3c8"}}>
                <span>0%</span><span>20%</span><span>36%</span><span>43%</span><span>50%+</span>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:18}}>
              {[["Gross Monthly Income",fmtD(result.totalIncome)],["Monthly Debt Payments",fmtD(result.totalDebt)],["DTI Ratio",fmtP(result.dti)],["Disposable Income",fmtD(result.totalIncome-result.totalDebt)]].map(([l,v])=>(
                <div key={l} style={{background:"#fafbff",border:"1px solid rgba(99,102,241,0.1)",borderRadius:10,padding:"12px"}}>
                  <div style={{fontSize:11,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:3}}>{l}</div>
                  <div style={{fontSize:16,fontWeight:800,color:"#312e81"}}>{v}</div>
                </div>
              ))}
            </div>

            <div style={{fontWeight:800,fontSize:13,color:"#312e81",marginBottom:10}}>Maximum Debt for Common Thresholds</div>
            {[["28% (Ideal for mortgage)",result.maxDebt28,"#16a34a"],["36% (Conventional standard)",result.maxDebt36,"#10b981"],["43% (FHA maximum)",result.maxDebt43,"#f59e0b"]].map(([l,v,c])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid rgba(99,102,241,0.08)"}}>
                <span style={{fontSize:13,color:"#6b7a9e",fontWeight:700}}>{l}</span>
                <span style={{fontWeight:800,fontSize:14,color:c}}>{fmtD(v)}/mo</span>
              </div>
            ))}
            <div style={{background:"#f5f3ff",borderRadius:10,padding:"12px",marginTop:14,fontSize:12,color:"#6b7a9e"}}>
              <b>Below 36%</b> is generally recommended. <b>Above 43%</b> may make it difficult to qualify for a mortgage. Lenders often use front-end DTI (housing costs only) and back-end DTI (all debts).
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
