import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmt = (n) => "$"+Math.abs(n).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const p   = (s) => { const v=parseFloat(String(s??"").replace(/,/g,"")); return isNaN(v)?0:Math.max(0,v); };

const INCOME_CATS = ["Monthly Salary (After Tax)","Spouse/Partner Income","Freelance/Side Income","Rental Income","Investment Income","Other Income"];
const EXPENSE_CATS = [
  {cat:"Housing",items:["Rent/Mortgage","Property Tax","HOA/Condo Fees","Home Insurance","Home Repairs","Other Housing"]},
  {cat:"Transportation",items:["Car Payment","Car Insurance","Gas","Parking/Tolls","Public Transit","Car Repairs","Other Transport"]},
  {cat:"Food",items:["Groceries","Dining Out","Coffee/Drinks","Other Food"]},
  {cat:"Utilities",items:["Electricity","Gas/Heating","Water","Internet","Phone","Cable/Streaming","Other Utilities"]},
  {cat:"Healthcare",items:["Health Insurance","Doctor/Dental/Vision","Medications","Gym/Fitness","Other Health"]},
  {cat:"Personal",items:["Clothing","Haircuts/Beauty","Subscriptions","Entertainment","Vacation","Gifts","Other Personal"]},
  {cat:"Debt",items:["Credit Card","Student Loan","Personal Loan","Other Debt"]},
  {cat:"Savings",items:["Emergency Fund","Retirement (401k/IRA)","Other Savings"]},
];

function makeState(keys){ return Object.fromEntries(keys.map(k=>[k,""])); }

export default function BudgetCalculator() {
  const [income,   setIncome]   = useState(makeState(INCOME_CATS));
  const [expenses, setExpenses] = useState(
    Object.fromEntries(EXPENSE_CATS.flatMap(g=>g.items).map(k=>[k,""]))
  );
  const [result, setResult] = useState(null);

  function calculate() {
    const totalIncome = INCOME_CATS.reduce((s,k)=>s+p(income[k]),0);
    const grouped = EXPENSE_CATS.map(g=>({
      cat:g.cat,
      total:g.items.reduce((s,k)=>s+p(expenses[k]),0),
      items:g.items.map(k=>({label:k,val:p(expenses[k])})).filter(x=>x.val>0),
    }));
    const totalExpenses = grouped.reduce((s,g)=>s+g.total,0);
    const surplus = totalIncome - totalExpenses;
    setResult({totalIncome,grouped,totalExpenses,surplus});
  }

  function clear() {
    setIncome(makeState(INCOME_CATS));
    setExpenses(Object.fromEntries(EXPENSE_CATS.flatMap(g=>g.items).map(k=>[k,""])));
    setResult(null);
  }

  const ist={width:"100%",background:"#f8f9ff",color:"#1e1b4b",border:"1.5px solid rgba(99,102,241,0.2)",borderRadius:10,padding:"8px 10px",fontSize:14,fontWeight:600,outline:"none",boxSizing:"border-box"};

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Budget Calculator</h1>
        <p className="muted">Enter your monthly income and expenses to see your budget breakdown and monthly surplus or deficit.</p>
      </header>
      <div style={{maxWidth:1100,margin:"0 auto",display:"flex",gap:20,flexWrap:"wrap",alignItems:"flex-start"}}>
        <section className="card" style={{flex:"0 0 360px",minWidth:300}}>
          <div style={{fontWeight:800,fontSize:14,color:"#312e81",marginBottom:12}}>Monthly Income</div>
          {INCOME_CATS.map(k=>(
            <div key={k} style={{marginBottom:8,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:12,color:"#6b7a9e",fontWeight:700,flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{k}</span>
              <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
                <span style={{color:"#6366f1",fontWeight:700,fontSize:13}}>$</span>
                <input style={{...ist,width:100}} value={income[k]} onChange={e=>setIncome(v=>({...v,[k]:e.target.value}))} placeholder="0" />
              </div>
            </div>
          ))}
          <div style={{borderTop:"1px solid rgba(99,102,241,0.1)",marginTop:10,paddingTop:10,marginBottom:16}}>
            <div style={{fontWeight:800,fontSize:14,color:"#312e81",marginBottom:12}}>Monthly Expenses</div>
            {EXPENSE_CATS.map(g=>(
              <div key={g.cat} style={{marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:800,color:"#6366f1",textTransform:"uppercase",letterSpacing:"0.4px",marginBottom:6}}>{g.cat}</div>
                {g.items.map(k=>(
                  <div key={k} style={{marginBottom:6,display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:12,color:"#6b7a9e",fontWeight:700,flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{k}</span>
                    <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
                      <span style={{color:"#6366f1",fontWeight:700,fontSize:13}}>$</span>
                      <input style={{...ist,width:100}} value={expenses[k]} onChange={e=>setExpenses(v=>({...v,[k]:e.target.value}))} placeholder="0" />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <button className="btn" style={{width:"100%",marginBottom:8}} onClick={calculate}>Calculate Budget</button>
          <button className="btn-sec" style={{width:"100%"}} onClick={clear}>Clear</button>
        </section>

        {result && (
          <section className="card" style={{flex:1,minWidth:260}}>
            <div style={{background:result.surplus>=0?"#f0fdf4":"#fef2f2",border:`1px solid ${result.surplus>=0?"#86efac":"#fca5a5"}`,borderRadius:12,padding:"16px 20px",marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:13,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Monthly {result.surplus>=0?"Surplus":"Deficit"}</div>
                <div style={{fontSize:34,fontWeight:900,color:result.surplus>=0?"#16a34a":"#dc2626"}}>{fmt(result.surplus)}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:12,color:"#6b7a9e",marginBottom:4}}>Income: <b>{fmt(result.totalIncome)}</b></div>
                <div style={{fontSize:12,color:"#6b7a9e"}}>Expenses: <b>{fmt(result.totalExpenses)}</b></div>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:18}}>
              {[["Total Income",fmt(result.totalIncome),"#16a34a"],["Total Expenses",fmt(result.totalExpenses),"#dc2626"],["Savings Rate",result.totalIncome>0?(((result.totalIncome-result.totalExpenses)/result.totalIncome)*100).toFixed(1)+"%":"—","#6366f1"]].map(([l,v,c])=>(
                <div key={l} style={{background:"#f0f0ff",borderRadius:10,padding:"12px 14px"}}>
                  <div style={{fontSize:11,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:3}}>{l}</div>
                  <div style={{fontSize:18,fontWeight:800,color:c}}>{v}</div>
                </div>
              ))}
            </div>

            {result.grouped.filter(g=>g.total>0).map(g=>(
              <div key={g.cat} style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontWeight:800,fontSize:13,color:"#312e81"}}>{g.cat}</span>
                  <span style={{fontWeight:800,fontSize:13,color:"#dc2626"}}>{fmt(g.total)}</span>
                </div>
                {result.totalExpenses>0 && (
                  <div style={{height:6,background:"#f0f0ff",borderRadius:999,marginBottom:6,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${Math.min((g.total/result.totalExpenses)*100,100)}%`,background:"linear-gradient(90deg,#6366f1,#8b5cf6)",borderRadius:999}}/>
                  </div>
                )}
                {g.items.map(it=>(
                  <div key={it.label} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#6b7a9e",padding:"2px 6px"}}>
                    <span>{it.label}</span><span style={{fontWeight:700,color:"#1e1b4b"}}>{fmt(it.val)}</span>
                  </div>
                ))}
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
