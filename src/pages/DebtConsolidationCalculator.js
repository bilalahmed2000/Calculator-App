import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmtD = (n) => "$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const fmtP = (n) => n.toFixed(2)+"%";
const p    = (s) => { const v=parseFloat(String(s??"").replace(/,/g,"")); return isNaN(v)?null:v; };

const ist={width:"100%",background:"#f8f9ff",color:"#1e1b4b",border:"1.5px solid rgba(99,102,241,0.2)",borderRadius:12,padding:"9px 12px",fontSize:14,fontWeight:600,outline:"none",boxSizing:"border-box"};
const lst={display:"block",fontSize:11,fontWeight:700,color:"#6b7a9e",marginBottom:5,letterSpacing:"0.4px",textTransform:"uppercase"};

const EMPTY = { name:"", balance:"", rate:"", payment:"" };

function loanPayoff(bal, r, pmt){
  let b=bal,mo=0,ti=0;
  while(b>0.01&&mo<600){ mo++; const i=b*r; b+=i; ti+=i; b=Math.max(0,b-pmt); }
  return {months:mo,totalInterest:ti};
}

export default function DebtConsolidationCalculator() {
  const [debts,    setDebts]    = useState([{...EMPTY,name:"Credit Card 1",balance:"3000",rate:"22.99",payment:"100"},{...EMPTY,name:"Credit Card 2",balance:"2000",rate:"19.99",payment:"60"}]);
  const [consRate, setConsRate] = useState("10");
  const [consTerm, setConsTerm] = useState("36");
  const [result,   setResult]   = useState(null);

  function addDebt(){ setDebts(d=>[...d,{...EMPTY,name:`Debt ${d.length+1}`}]); }
  function removeDebt(i){ setDebts(d=>d.filter((_,idx)=>idx!==i)); }
  function updateDebt(i,f,v){ setDebts(d=>d.map((dt,idx)=>idx===i?{...dt,[f]:v}:dt)); }

  function calculate(){
    const debtsData = debts.map(d=>({ name:d.name||"Debt", balance:p(d.balance)||0, rate:(p(d.rate)||0)/100/12, payment:p(d.payment)||0 })).filter(d=>d.balance>0);
    if(!debtsData.length) return;

    const totalBal=debtsData.reduce((s,d)=>s+d.balance,0);
    const totalPmt=debtsData.reduce((s,d)=>s+d.payment,0);

    // Current payoff: simulate each debt individually with its payment
    let maxMonths=0, totalCurrentInterest=0;
    debtsData.forEach(d=>{
      const res=loanPayoff(d.balance,d.rate,d.payment);
      totalCurrentInterest+=res.totalInterest;
      maxMonths=Math.max(maxMonths,res.months);
    });

    // Consolidated loan
    const r=p(consRate)/100/12;
    const n=p(consTerm);
    const consPmt=r===0?totalBal/n:totalBal*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1);
    const consInterest=consPmt*n-totalBal;
    const consMonths=n;

    const savedInterest=totalCurrentInterest-consInterest;
    const monthlySavings=totalPmt-consPmt;
    const betterOption=savedInterest>0?"Consolidation":"Current Separate Payments";

    setResult({totalBal,totalPmt,maxMonths,totalCurrentInterest,consPmt,consInterest,consMonths,savedInterest,monthlySavings,betterOption,debtsData});
  }

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Debt Consolidation Calculator</h1>
        <p className="muted">Compare combining multiple debts into a single consolidation loan versus paying them separately.</p>
      </header>
      <div style={{maxWidth:1100,margin:"0 auto",display:"flex",gap:20,flexWrap:"wrap",alignItems:"flex-start"}}>
        <section className="card" style={{flex:"0 0 360px",minWidth:300}}>
          <div style={{fontSize:11,fontWeight:800,color:"#6366f1",textTransform:"uppercase",letterSpacing:"0.4px",marginBottom:10}}>Your Current Debts</div>
          {debts.map((d,i)=>(
            <div key={i} style={{border:"1px solid rgba(99,102,241,0.15)",borderRadius:12,padding:"10px",marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <input style={{...ist,width:"60%",padding:"6px 8px",fontSize:13}} value={d.name} onChange={e=>updateDebt(i,"name",e.target.value)} placeholder="Debt name"/>
                {debts.length>1 && <button onClick={()=>removeDebt(i)} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:18,fontWeight:700}}>×</button>}
              </div>
              <div style={{display:"flex",gap:6}}>
                <div style={{flex:1}}><label style={lst}>Balance</label><div style={{display:"flex",alignItems:"center",gap:4}}><span style={{color:"#6366f1",fontWeight:700,fontSize:12}}>$</span><input style={ist} value={d.balance} onChange={e=>updateDebt(i,"balance",e.target.value)}/></div></div>
                <div style={{flex:1}}><label style={lst}>APR %</label><input style={ist} value={d.rate} onChange={e=>updateDebt(i,"rate",e.target.value)}/></div>
                <div style={{flex:1}}><label style={lst}>Payment $</label><input style={ist} value={d.payment} onChange={e=>updateDebt(i,"payment",e.target.value)}/></div>
              </div>
            </div>
          ))}
          <button onClick={addDebt} style={{width:"100%",background:"none",border:"1.5px dashed rgba(99,102,241,0.4)",borderRadius:10,padding:"10px",color:"#6366f1",fontWeight:700,cursor:"pointer",fontSize:13,marginBottom:14}}>+ Add Debt</button>

          <div style={{borderTop:"1px solid rgba(99,102,241,0.1)",paddingTop:12}}>
            <div style={{fontSize:11,fontWeight:800,color:"#6366f1",textTransform:"uppercase",letterSpacing:"0.4px",marginBottom:10}}>Consolidation Loan Terms</div>
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              <div style={{flex:1}}><label style={lst}>Interest Rate %</label><input style={ist} value={consRate} onChange={e=>setConsRate(e.target.value)}/></div>
              <div style={{flex:1}}><label style={lst}>Term (Months)</label><select style={ist} value={consTerm} onChange={e=>setConsTerm(e.target.value)}><option>12</option><option>24</option><option>36</option><option>48</option><option>60</option><option>72</option><option>84</option></select></div>
            </div>
          </div>
          <button className="btn" style={{width:"100%",marginBottom:8}} onClick={calculate}>Compare</button>
          <button className="btn-sec" style={{width:"100%"}} onClick={()=>setResult(null)}>Clear</button>
        </section>

        {result && (
          <section className="card" style={{flex:1,minWidth:260}}>
            <div style={{background:result.savedInterest>0?"#f0fdf4":"#fef2f2",border:`1px solid ${result.savedInterest>0?"#86efac":"#fca5a5"}`,borderRadius:12,padding:"16px 20px",marginBottom:20,textAlign:"center"}}>
              <div style={{fontSize:13,color:"#6b7a9e",fontWeight:700,marginBottom:4}}>Recommended</div>
              <div style={{fontSize:28,fontWeight:900,color:result.savedInterest>0?"#16a34a":"#dc2626"}}>{result.betterOption}</div>
              {result.savedInterest>0 && <div style={{fontSize:13,color:"#6b7a9e",marginTop:4}}>Saves <b>{fmtD(result.savedInterest)}</b> in interest</div>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16}}>
              {[
                {title:"Current Debts",color:"#dc2626",rows:[["Total Balance",fmtD(result.totalBal)],["Total Monthly Pmt",fmtD(result.totalPmt)],["Total Interest",fmtD(result.totalCurrentInterest)],["Payoff Time",result.maxMonths+" months"]]},
                {title:"Consolidation Loan",color:"#16a34a",rows:[["Loan Amount",fmtD(result.totalBal)],["Monthly Payment",fmtD(result.consPmt)],["Total Interest",fmtD(result.consInterest)],["Payoff Time",result.consMonths+" months"]]}
              ].map(side=>(
                <div key={side.title} style={{border:"1px solid rgba(99,102,241,0.15)",borderRadius:12,padding:"14px"}}>
                  <div style={{fontWeight:800,fontSize:14,color:side.color,marginBottom:10}}>{side.title}</div>
                  {side.rows.map(([l,v])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"4px 0",borderBottom:"1px solid rgba(99,102,241,0.06)"}}>
                      <span style={{color:"#6b7a9e"}}>{l}</span><span style={{fontWeight:700,color:"#1e1b4b"}}>{v}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:10}}>
              <div style={{flex:1,background:"#f0f0ff",borderRadius:10,padding:"12px",textAlign:"center"}}>
                <div style={{fontSize:11,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Monthly Savings</div>
                <div style={{fontSize:22,fontWeight:900,color:result.monthlySavings>0?"#16a34a":"#dc2626"}}>{fmtD(Math.abs(result.monthlySavings))}</div>
              </div>
              <div style={{flex:1,background:"#f0f0ff",borderRadius:10,padding:"12px",textAlign:"center"}}>
                <div style={{fontSize:11,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Interest Saved</div>
                <div style={{fontSize:22,fontWeight:900,color:result.savedInterest>0?"#16a34a":"#dc2626"}}>{fmtD(Math.abs(result.savedInterest))}</div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
