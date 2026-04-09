import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmtD = (n) => "$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const p    = (s) => { const v=parseFloat(String(s??"").replace(/,/g,"")); return isNaN(v)?null:v; };

const ist={width:"100%",background:"#f8f9ff",color:"#1e1b4b",border:"1.5px solid rgba(99,102,241,0.2)",borderRadius:12,padding:"9px 12px",fontSize:14,fontWeight:600,outline:"none",boxSizing:"border-box"};
const lst={display:"block",fontSize:11,fontWeight:700,color:"#6b7a9e",marginBottom:5,letterSpacing:"0.4px",textTransform:"uppercase"};
const fst={marginBottom:14};

export default function RepaymentCalculator() {
  const [balance,  setBalance]  = useState("20000");
  const [rate,     setRate]     = useState("8.5");
  const [term,     setTerm]     = useState("60");
  const [extra,    setExtra]    = useState("0");
  const [result,   setResult]   = useState(null);
  const [err,      setErr]      = useState("");

  function calculate(){
    setErr(""); setResult(null);
    const bal=p(balance), rV=p(rate), termV=p(term), extraV=p(extra)||0;
    if(bal===null||rV===null||termV===null){ setErr("Fill in all fields."); return; }
    if(bal<=0||termV<=0){ setErr("Balance and term must be > 0."); return; }
    const r=rV/100/12;
    const pmt=r===0?bal/termV:bal*r*Math.pow(1+r,termV)/(Math.pow(1+r,termV)-1);

    // Standard schedule
    const rows=[];
    let bStd=bal, totalIntStd=0, totalPaidStd=0;
    for(let mo=1;mo<=termV&&bStd>0.01;mo++){
      const int=bStd*r; const prin=Math.min(pmt-int,bStd); bStd=Math.max(0,bStd-prin);
      totalIntStd+=int; totalPaidStd+=pmt;
      if(mo<=24||mo%12===0||bStd<=0.01) rows.push({mo,pmt,int,prin,bal:bStd});
    }

    // With extra payments
    let bExtra=bal, totalIntExtra=0, totalPaidExtra=0, moExtra=0;
    while(bExtra>0.01&&moExtra<termV*2){
      moExtra++;
      const int=bExtra*r; const pmtFull=pmt+extraV;
      const prin=Math.min(pmtFull-int,bExtra); bExtra=Math.max(0,bExtra-prin);
      totalIntExtra+=int; totalPaidExtra+=pmtFull;
    }
    const savedMonths=termV-moExtra;
    const savedInterest=totalIntStd-totalIntExtra;
    const payoffDate=new Date(); payoffDate.setMonth(payoffDate.getMonth()+moExtra);

    setResult({pmt,totalIntStd,totalPaidStd,rows,moExtra,totalIntExtra,totalPaidExtra,savedMonths,savedInterest,payoffDate:payoffDate.toLocaleDateString("en-US",{month:"long",year:"numeric"}),hasExtra:extraV>0,extraV});
  }

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Repayment Calculator</h1>
        <p className="muted">Calculate loan repayment schedule, total interest, and savings from making extra payments.</p>
      </header>
      <div style={{maxWidth:1100,margin:"0 auto",display:"flex",gap:20,flexWrap:"wrap",alignItems:"flex-start"}}>
        <section className="card" style={{flex:"0 0 300px",minWidth:260}}>
          <div style={fst}><label style={lst}>Loan Balance</label><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={balance} onChange={e=>setBalance(e.target.value)}/></div></div>
          <div style={fst}><label style={lst}>Annual Interest Rate (%)</label><div style={{display:"flex",alignItems:"center",gap:6}}><input style={ist} value={rate} onChange={e=>setRate(e.target.value)}/><span style={{color:"#6366f1",fontWeight:700}}>%</span></div></div>
          <div style={fst}><label style={lst}>Loan Term (Months)</label><input style={ist} value={term} onChange={e=>setTerm(e.target.value)}/></div>
          <div style={fst}><label style={lst}>Extra Monthly Payment</label><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={extra} onChange={e=>setExtra(e.target.value)}/></div></div>
          {err && <p style={{color:"#ef4444",fontSize:13,marginBottom:10}}>{err}</p>}
          <button className="btn" style={{width:"100%",marginBottom:8}} onClick={calculate}>Calculate</button>
          <button className="btn-sec" style={{width:"100%"}} onClick={()=>{setResult(null);setErr("");}}>Clear</button>
        </section>

        {result && (
          <section className="card" style={{flex:1,minWidth:260}}>
            <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:12,padding:"16px 20px",marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:13,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Monthly Payment</div>
                <div style={{fontSize:34,fontWeight:900,color:"#16a34a"}}>{fmtD(result.pmt)}</div>
              </div>
              <div style={{textAlign:"right"}}>
                {result.hasExtra && <div style={{fontSize:13,color:"#6b7a9e"}}>With extra: <b style={{color:"#4f46e5"}}>{fmtD(result.pmt+result.extraV)}</b></div>}
                <div style={{fontSize:13,color:"#6b7a9e"}}>Payoff: <b>{result.payoffDate}</b></div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:18}}>
              {[["Total Interest (Standard)",fmtD(result.totalIntStd)],["Total Paid (Standard)",fmtD(result.totalPaidStd)],result.hasExtra&&["Total Interest (With Extra)",fmtD(result.totalIntExtra)],result.hasExtra&&["Interest Saved",fmtD(result.savedInterest)]].filter(Boolean).map(([l,v])=>(
                <div key={l} style={{background:"#f0f0ff",borderRadius:10,padding:"12px"}}>
                  <div style={{fontSize:11,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:3}}>{l}</div>
                  <div style={{fontSize:16,fontWeight:800,color:"#312e81"}}>{v}</div>
                </div>
              ))}
            </div>
            {result.hasExtra && result.savedMonths>0 && (
              <div style={{background:"#f5f3ff",borderRadius:10,padding:"12px",marginBottom:16,fontSize:13,color:"#4f46e5",fontWeight:700}}>
                Extra payments save {result.savedMonths} months and {fmtD(result.savedInterest)} in interest!
              </div>
            )}
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead><tr style={{background:"#f0f0ff"}}>{["Month","Payment","Interest","Principal","Balance"].map(h=><th key={h} style={{padding:"7px 8px",textAlign:"right",fontWeight:700,color:"#4f46e5",fontSize:11}}>{h}</th>)}</tr></thead>
                <tbody>
                  {result.rows.map((r,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid rgba(99,102,241,0.08)",background:i%2===0?"#fafbff":"#fff"}}>
                      <td style={{padding:"6px 8px",fontWeight:600,color:"#1e1b4b",textAlign:"right"}}>{r.mo}</td>
                      <td style={{padding:"6px 8px",textAlign:"right",fontWeight:700,color:"#4f46e5"}}>{fmtD(r.pmt)}</td>
                      <td style={{padding:"6px 8px",textAlign:"right",color:"#dc2626"}}>{fmtD(r.int)}</td>
                      <td style={{padding:"6px 8px",textAlign:"right",color:"#16a34a"}}>{fmtD(r.prin)}</td>
                      <td style={{padding:"6px 8px",textAlign:"right",fontWeight:600}}>{fmtD(r.bal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
