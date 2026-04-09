import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmtD = (n) => "$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const p    = (s) => { const v=parseFloat(String(s??"").replace(/,/g,"")); return isNaN(v)?null:v; };

const ist={width:"100%",background:"#f8f9ff",color:"#1e1b4b",border:"1.5px solid rgba(99,102,241,0.2)",borderRadius:12,padding:"9px 12px",fontSize:14,fontWeight:600,outline:"none",boxSizing:"border-box"};
const lst={display:"block",fontSize:11,fontWeight:700,color:"#6b7a9e",marginBottom:5,letterSpacing:"0.4px",textTransform:"uppercase"};
const fst={marginBottom:14};

const EMPTY_CARD = { name:"", balance:"", rate:"", minPct:"2", minAmt:"25" };

export default function CreditCardPayoffCalculator() {
  const [cards,    setCards]    = useState([{...EMPTY_CARD,name:"Card 1",balance:"5000",rate:"22.99"}]);
  const [strategy, setStrategy] = useState("avalanche");
  const [extra,    setExtra]    = useState("0");
  const [result,   setResult]   = useState(null);

  function addCard() { setCards(c=>[...c,{...EMPTY_CARD,name:`Card ${c.length+1}`}]); }
  function removeCard(i){ setCards(c=>c.filter((_,idx)=>idx!==i)); setResult(null); }
  function updateCard(i,field,val){ setCards(c=>c.map((cd,idx)=>idx===i?{...cd,[field]:val}:cd)); setResult(null); }

  function calculate() {
    const cardsData = cards.map(c=>({
      name:c.name||"Card",
      balance:p(c.balance)||0,
      rate:(p(c.rate)||0)/100/12,
      minPct:(p(c.minPct)||2)/100,
      minAmt:p(c.minAmt)||25,
    })).filter(c=>c.balance>0);

    if(!cardsData.length){ return; }
    const extraV = p(extra)||0;

    // Simulate payoff
    let balances = cardsData.map(c=>c.balance);
    let months=0, totalInterest=0, totalPaid=0;
    const maxMos=600;

    while(balances.some(b=>b>0.01) && months<maxMos){
      months++;
      // Calculate minimums + interest
      let payments = cardsData.map((c,i)=>{
        if(balances[i]<=0) return 0;
        const intCharge = balances[i]*c.rate;
        balances[i]+=intCharge;
        totalInterest+=intCharge;
        const min=Math.max(c.minAmt, balances[i]*c.minPct);
        return Math.min(min, balances[i]);
      });

      let totalMin = payments.reduce((a,b)=>a+b,0);
      let remaining = extraV;

      // Apply minimum payments
      balances = balances.map((b,i)=>{
        const pay=payments[i];
        totalPaid+=pay;
        return Math.max(0,b-pay);
      });

      // Apply extra to target card
      if(remaining>0){
        // Sort by strategy
        const indices = cardsData.map((_,i)=>i).filter(i=>balances[i]>0);
        if(strategy==="avalanche") indices.sort((a,b)=>cardsData[b].rate-cardsData[a].rate);
        else indices.sort((a,b)=>balances[a]-balances[b]);

        for(const idx of indices){
          if(remaining<=0) break;
          const pay=Math.min(remaining,balances[idx]);
          balances[idx]-=pay;
          totalPaid+=pay;
          remaining-=pay;
        }
      }
    }

    const years=Math.floor(months/12), mos=months%12;
    const payoffDate=new Date(); payoffDate.setMonth(payoffDate.getMonth()+months);

    setResult({ months, years, mos, totalInterest, totalPaid, payoffDate:payoffDate.toLocaleDateString("en-US",{month:"long",year:"numeric"}) });
  }

  const tabSt=(a)=>({flex:1,padding:"8px",borderRadius:8,border:"1.5px solid rgba(99,102,241,0.25)",background:a?"#4f46e5":"#f8f9ff",color:a?"#fff":"#4f46e5",fontWeight:700,fontSize:13,cursor:"pointer"});

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Credit Cards Payoff Calculator</h1>
        <p className="muted">Find out how long it will take to pay off your credit cards using avalanche (highest rate first) or snowball (lowest balance first) strategies.</p>
      </header>
      <div style={{maxWidth:1100,margin:"0 auto",display:"flex",gap:20,flexWrap:"wrap",alignItems:"flex-start"}}>
        <section className="card" style={{flex:"0 0 360px",minWidth:300}}>
          {cards.map((c,i)=>(
            <div key={i} style={{border:"1px solid rgba(99,102,241,0.15)",borderRadius:12,padding:"12px",marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <input style={{...ist,width:"60%",padding:"6px 8px",fontSize:13}} value={c.name} onChange={e=>updateCard(i,"name",e.target.value)} placeholder="Card name"/>
                {cards.length>1 && <button onClick={()=>removeCard(i)} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:18,fontWeight:700}}>×</button>}
              </div>
              <div style={{display:"flex",gap:8}}>
                <div style={{flex:1}}><label style={lst}>Balance</label><div style={{display:"flex",alignItems:"center",gap:4}}><span style={{color:"#6366f1",fontWeight:700,fontSize:12}}>$</span><input style={ist} value={c.balance} onChange={e=>updateCard(i,"balance",e.target.value)}/></div></div>
                <div style={{flex:1}}><label style={lst}>APR %</label><input style={ist} value={c.rate} onChange={e=>updateCard(i,"rate",e.target.value)}/></div>
              </div>
              <div style={{display:"flex",gap:8,marginTop:8}}>
                <div style={{flex:1}}><label style={lst}>Min % of Bal</label><input style={ist} value={c.minPct} onChange={e=>updateCard(i,"minPct",e.target.value)}/></div>
                <div style={{flex:1}}><label style={lst}>Min Amount $</label><input style={ist} value={c.minAmt} onChange={e=>updateCard(i,"minAmt",e.target.value)}/></div>
              </div>
            </div>
          ))}
          <button onClick={addCard} style={{width:"100%",background:"none",border:"1.5px dashed rgba(99,102,241,0.4)",borderRadius:10,padding:"10px",color:"#6366f1",fontWeight:700,cursor:"pointer",fontSize:13,marginBottom:14}}>+ Add Card</button>
          <div style={fst}><label style={lst}>Extra Monthly Payment</label><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={extra} onChange={e=>setExtra(e.target.value)}/></div></div>
          <div style={{marginBottom:14}}>
            <div style={lst}>Payoff Strategy</div>
            <div style={{display:"flex",gap:8}}>
              <button style={tabSt(strategy==="avalanche")} onClick={()=>setStrategy("avalanche")}>Avalanche</button>
              <button style={tabSt(strategy==="snowball")}  onClick={()=>setStrategy("snowball")}>Snowball</button>
            </div>
          </div>
          <button className="btn" style={{width:"100%",marginBottom:8}} onClick={calculate}>Calculate Payoff</button>
          <button className="btn-sec" style={{width:"100%"}} onClick={()=>setResult(null)}>Clear</button>
        </section>

        {result && (
          <section className="card" style={{flex:1,minWidth:260}}>
            <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:12,padding:"16px 20px",marginBottom:20}}>
              <div style={{fontSize:13,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Debt-Free Date</div>
              <div style={{fontSize:28,fontWeight:900,color:"#16a34a"}}>{result.payoffDate}</div>
              <div style={{fontSize:14,color:"#6b7a9e",marginTop:4}}>
                {result.years>0?`${result.years} yr `:""}
                {result.mos>0?`${result.mos} mo`:""}
                {result.years===0&&result.mos===0?"Less than 1 month":"to pay off"}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:20}}>
              {[["Total Months",result.months+" months"],["Total Interest Paid",fmtD(result.totalInterest)],["Total Amount Paid",fmtD(result.totalPaid)],["Strategy",result.months<600?strategy.charAt(0).toUpperCase()+strategy.slice(1):"Review inputs"]].map(([l,v])=>(
                <div key={l} style={{background:"#f0f0ff",borderRadius:10,padding:"12px"}}>
                  <div style={{fontSize:11,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:3}}>{l}</div>
                  <div style={{fontSize:16,fontWeight:800,color:"#312e81"}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{background:"#fff7ed",border:"1px solid #fed7aa",borderRadius:10,padding:"12px",fontSize:12,color:"#92400e"}}>
              <b>Avalanche</b> saves the most interest (highest rate first). <b>Snowball</b> gives quicker wins (lowest balance first). Results assume minimum payments only — extra amount applied to target card.
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
