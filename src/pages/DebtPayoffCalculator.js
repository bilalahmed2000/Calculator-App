import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmtD = (n) => "$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const p    = (s) => { const v=parseFloat(String(s??"").replace(/,/g,"")); return isNaN(v)?null:v; };

const ist={width:"100%",background:"#f8f9ff",color:"#1e1b4b",border:"1.5px solid rgba(99,102,241,0.2)",borderRadius:12,padding:"9px 12px",fontSize:14,fontWeight:600,outline:"none",boxSizing:"border-box"};
const lst={display:"block",fontSize:11,fontWeight:700,color:"#6b7a9e",marginBottom:5,letterSpacing:"0.4px",textTransform:"uppercase"};

const EMPTY = { name:"", balance:"", rate:"", minPayment:"" };

function simulate(debtsIn, strategy, extra){
  const debts = debtsIn.map((d,i)=>({...d,i,bal:d.balance,paid:0,interest:0}));
  let months=0, totalInterest=0;
  const maxMo=600;

  // Sort for strategy
  const sorted = [...debts].sort((a,b)=> strategy==="avalanche" ? b.rate-a.rate : a.bal-b.bal);

  while(debts.some(d=>d.bal>0.01)&&months<maxMo){
    months++;
    // Apply interest and min payments
    debts.forEach(d=>{
      if(d.bal<=0.01) return;
      const int=d.bal*d.rate; d.bal+=int; d.interest+=int; totalInterest+=int;
      const min=Math.min(d.minPayment, d.bal);
      d.bal=Math.max(0,d.bal-min); d.paid+=min;
    });
    // Apply extra to target
    let rem=extra;
    for(const td of sorted){
      const actual=debts.find(d=>d.i===td.i);
      if(!actual||actual.bal<=0.01) continue;
      const pay=Math.min(rem,actual.bal);
      actual.bal=Math.max(0,actual.bal-pay);
      actual.paid+=pay;
      rem-=pay;
      if(rem<=0) break;
    }
  }
  return {months,totalInterest,totalPaid:debts.reduce((s,d)=>s+d.paid,0)};
}

export default function DebtPayoffCalculator() {
  const [debts,    setDebts]    = useState([{...EMPTY,name:"Credit Card",balance:"5000",rate:"22",minPayment:"100"},{...EMPTY,name:"Car Loan",balance:"8000",rate:"7",minPayment:"200"}]);
  const [extra,    setExtra]    = useState("200");
  const [result,   setResult]   = useState(null);

  function addDebt(){ setDebts(d=>[...d,{...EMPTY,name:`Debt ${d.length+1}`}]); }
  function removeDebt(i){ setDebts(d=>d.filter((_,idx)=>idx!==i)); setResult(null); }
  function updateDebt(i,f,v){ setDebts(d=>d.map((dt,idx)=>idx===i?{...dt,[f]:v}:dt)); setResult(null); }

  function calculate(){
    const debtsData=debts.map(d=>({name:d.name||"Debt",balance:p(d.balance)||0,rate:(p(d.rate)||0)/100/12,minPayment:p(d.minPayment)||25})).filter(d=>d.balance>0);
    if(!debtsData.length) return;
    const extraV=p(extra)||0;
    const av=simulate(debtsData,"avalanche",extraV);
    const sn=simulate(debtsData,"snowball",extraV);
    const payoffAv=new Date(); payoffAv.setMonth(payoffAv.getMonth()+av.months);
    const payoffSn=new Date(); payoffSn.setMonth(payoffSn.getMonth()+sn.months);
    setResult({av,sn,payoffAv:payoffAv.toLocaleDateString("en-US",{month:"long",year:"numeric"}),payoffSn:payoffSn.toLocaleDateString("en-US",{month:"long",year:"numeric"})});
  }

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Debt Payoff Calculator</h1>
        <p className="muted">Compare the Debt Avalanche (highest interest first) and Debt Snowball (lowest balance first) payoff strategies.</p>
      </header>
      <div style={{maxWidth:1100,margin:"0 auto",display:"flex",gap:20,flexWrap:"wrap",alignItems:"flex-start"}}>
        <section className="card" style={{flex:"0 0 360px",minWidth:300}}>
          <div style={{fontSize:11,fontWeight:800,color:"#6366f1",textTransform:"uppercase",letterSpacing:"0.4px",marginBottom:10}}>Your Debts</div>
          {debts.map((d,i)=>(
            <div key={i} style={{border:"1px solid rgba(99,102,241,0.15)",borderRadius:12,padding:"10px",marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <input style={{...ist,width:"60%",padding:"6px 8px",fontSize:13}} value={d.name} onChange={e=>updateDebt(i,"name",e.target.value)} placeholder="Debt name"/>
                {debts.length>1 && <button onClick={()=>removeDebt(i)} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:18,fontWeight:700}}>×</button>}
              </div>
              <div style={{display:"flex",gap:6}}>
                <div style={{flex:1}}><label style={lst}>Balance</label><div style={{display:"flex",alignItems:"center",gap:4}}><span style={{color:"#6366f1",fontWeight:700,fontSize:12}}>$</span><input style={ist} value={d.balance} onChange={e=>updateDebt(i,"balance",e.target.value)}/></div></div>
                <div style={{flex:1}}><label style={lst}>APR %</label><input style={ist} value={d.rate} onChange={e=>updateDebt(i,"rate",e.target.value)}/></div>
                <div style={{flex:1}}><label style={lst}>Min Payment $</label><input style={ist} value={d.minPayment} onChange={e=>updateDebt(i,"minPayment",e.target.value)}/></div>
              </div>
            </div>
          ))}
          <button onClick={addDebt} style={{width:"100%",background:"none",border:"1.5px dashed rgba(99,102,241,0.4)",borderRadius:10,padding:"10px",color:"#6366f1",fontWeight:700,cursor:"pointer",fontSize:13,marginBottom:14}}>+ Add Debt</button>
          <div style={{marginBottom:14}}>
            <label style={lst}>Extra Monthly Payment</label>
            <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={extra} onChange={e=>setExtra(e.target.value)}/></div>
          </div>
          <button className="btn" style={{width:"100%",marginBottom:8}} onClick={calculate}>Compare Strategies</button>
          <button className="btn-sec" style={{width:"100%"}} onClick={()=>setResult(null)}>Clear</button>
        </section>

        {result && (
          <section className="card" style={{flex:1,minWidth:260}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16}}>
              {[
                {title:"Avalanche Strategy",subtitle:"Highest interest first",color:"#1d4ed8",res:result.av,payoff:result.payoffAv},
                {title:"Snowball Strategy",subtitle:"Lowest balance first",color:"#16a34a",res:result.sn,payoff:result.payoffSn}
              ].map(s=>(
                <div key={s.title} style={{border:"1px solid rgba(99,102,241,0.15)",borderRadius:12,padding:"16px"}}>
                  <div style={{fontWeight:800,fontSize:14,color:s.color,marginBottom:4}}>{s.title}</div>
                  <div style={{fontSize:11,color:"#6b7a9e",marginBottom:10}}>{s.subtitle}</div>
                  {[["Payoff Date",s.payoff],["Months",s.res.months+" months"],["Total Interest",fmtD(s.res.totalInterest)],["Total Paid",fmtD(s.res.totalPaid)]].map(([l,v])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"4px 0",borderBottom:"1px solid rgba(99,102,241,0.06)"}}>
                      <span style={{color:"#6b7a9e"}}>{l}</span><span style={{fontWeight:700,color:"#1e1b4b"}}>{v}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[["Interest Saved (Avalanche vs Snowball)",fmtD(Math.abs(result.sn.totalInterest-result.av.totalInterest))],["Time Difference",Math.abs(result.av.months-result.sn.months)+" months"]].map(([l,v])=>(
                <div key={l} style={{background:"#f0f0ff",borderRadius:10,padding:"12px"}}>
                  <div style={{fontSize:11,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:3}}>{l}</div>
                  <div style={{fontSize:16,fontWeight:800,color:"#312e81"}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{background:"#f5f3ff",borderRadius:10,padding:"12px",marginTop:14,fontSize:12,color:"#6b7a9e"}}>
              <b>Avalanche</b> minimizes total interest paid. <b>Snowball</b> provides motivation by eliminating smaller debts first. The best strategy depends on your financial situation and psychology.
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
