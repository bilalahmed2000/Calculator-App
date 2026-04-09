import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmtD = (n) => "$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const p    = (s) => { const v=parseFloat(String(s??"").replace(/,/g,"")); return isNaN(v)?null:v; };

const ist={width:"100%",background:"#f8f9ff",color:"#1e1b4b",border:"1.5px solid rgba(99,102,241,0.2)",borderRadius:12,padding:"9px 12px",fontSize:14,fontWeight:600,outline:"none",boxSizing:"border-box"};
const lst={display:"block",fontSize:11,fontWeight:700,color:"#6b7a9e",marginBottom:5,letterSpacing:"0.4px",textTransform:"uppercase"};
const fst={marginBottom:14};

export default function CreditCardCalculator() {
  const [mode,      setMode]      = useState("payoff"); // payoff, balance, payment
  const [balance,   setBalance]   = useState("5000");
  const [apr,       setApr]       = useState("22.99");
  const [payment,   setPayment]   = useState("150");
  const [months,    setMonths]    = useState("36");
  const [targetPay, setTargetPay] = useState("0");
  const [result,    setResult]    = useState(null);
  const [err,       setErr]       = useState("");

  function simulate(bal, rate, pmt){
    let b=bal, mo=0, totalInt=0;
    const maxMo=600;
    while(b>0.01&&mo<maxMo){
      mo++;
      const int=b*rate;
      b+=int; totalInt+=int;
      b=Math.max(0,b-pmt);
    }
    return {months:mo,totalInterest:totalInt,totalPaid:pmt*mo};
  }

  function calculate() {
    setErr(""); setResult(null);
    const bal=p(balance), aprV=p(apr), pmtV=p(payment), mosV=p(months);
    if(bal===null||aprV===null){ setErr("Balance and APR are required."); return; }
    const r=aprV/100/12;
    const minPmt=Math.max(25,bal*0.02);

    if(mode==="payoff"){
      if(pmtV===null){ setErr("Enter your monthly payment."); return; }
      if(pmtV<=bal*r){ setErr("Payment is too low — interest exceeds payment."); return; }
      const sim=simulate(bal,r,pmtV);
      const payoffDate=new Date(); payoffDate.setMonth(payoffDate.getMonth()+sim.months);
      setResult({mode:"payoff",...sim,payoffDate:payoffDate.toLocaleDateString("en-US",{month:"long",year:"numeric"}),minPmt,bal,pmtV});
    } else if(mode==="balance"){
      if(pmtV===null||mosV===null){ setErr("Enter payment and months."); return; }
      // Max balance that can be paid off in N months
      const maxBal = r===0 ? pmtV*mosV : pmtV*(1-Math.pow(1+r,-mosV))/r;
      setResult({mode:"balance",maxBal,pmtV,mosV,apr:aprV});
    } else {
      if(mosV===null){ setErr("Enter target months."); return; }
      const pmt = r===0 ? bal/mosV : bal*r*Math.pow(1+r,mosV)/(Math.pow(1+r,mosV)-1);
      const totalInt=pmt*mosV-bal;
      setResult({mode:"payment",pmt,totalInt,totalPaid:pmt*mosV,mosV,bal});
    }
  }

  const tabSt=(a)=>({flex:1,padding:"7px",borderRadius:8,border:"1.5px solid rgba(99,102,241,0.25)",background:a?"#4f46e5":"#f8f9ff",color:a?"#fff":"#4f46e5",fontWeight:700,fontSize:12,cursor:"pointer"});

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Credit Card Calculator</h1>
        <p className="muted">Calculate payoff time, required payments, or maximum balance for your credit card.</p>
      </header>
      <div style={{maxWidth:1000,margin:"0 auto",display:"flex",gap:20,flexWrap:"wrap",alignItems:"flex-start"}}>
        <section className="card" style={{flex:"0 0 310px",minWidth:260}}>
          <div style={{display:"flex",gap:6,marginBottom:16}}>
            <button style={tabSt(mode==="payoff")}  onClick={()=>{setMode("payoff");setResult(null);}}>Payoff Time</button>
            <button style={tabSt(mode==="payment")} onClick={()=>{setMode("payment");setResult(null);}}>Payment Needed</button>
            <button style={tabSt(mode==="balance")} onClick={()=>{setMode("balance");setResult(null);}}>Max Balance</button>
          </div>
          <div style={fst}><label style={lst}>Current Balance</label><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={balance} onChange={e=>setBalance(e.target.value)}/></div></div>
          <div style={fst}><label style={lst}>Annual Percentage Rate (APR)</label><div style={{display:"flex",alignItems:"center",gap:6}}><input style={ist} value={apr} onChange={e=>setApr(e.target.value)}/><span style={{color:"#6366f1",fontWeight:700}}>%</span></div></div>
          {(mode==="payoff"||mode==="balance") && (
            <div style={fst}><label style={lst}>Monthly Payment</label><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={payment} onChange={e=>setPayment(e.target.value)}/></div></div>
          )}
          {(mode==="payment"||mode==="balance") && (
            <div style={fst}><label style={lst}>Target Months to Pay Off</label><input style={ist} value={months} onChange={e=>setMonths(e.target.value)}/></div>
          )}
          {err && <p style={{color:"#ef4444",fontSize:13,marginBottom:10}}>{err}</p>}
          <button className="btn" style={{width:"100%",marginBottom:8}} onClick={calculate}>Calculate</button>
          <button className="btn-sec" style={{width:"100%"}} onClick={()=>{setResult(null);setErr("");}}>Clear</button>
        </section>

        {result && (
          <section className="card" style={{flex:1,minWidth:260}}>
            {result.mode==="payoff" && (
              <>
                <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:12,padding:"16px 20px",marginBottom:20}}>
                  <div style={{fontSize:13,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Debt-Free Date</div>
                  <div style={{fontSize:28,fontWeight:900,color:"#16a34a"}}>{result.payoffDate}</div>
                  <div style={{fontSize:14,color:"#6b7a9e",marginTop:4}}>{result.months} months to pay off</div>
                </div>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <tbody>
                    {[["Balance",fmtD(result.bal)],["Monthly Payment",fmtD(result.pmtV)],["Minimum Payment",fmtD(result.minPmt)],["Total Interest",fmtD(result.totalInterest)],["Total Paid",fmtD(result.totalPaid)],["Time to Pay Off",result.months+" months"]].map(([l,v])=>(
                      <tr key={l} style={{borderBottom:"1px solid rgba(99,102,241,0.08)"}}>
                        <td style={{padding:"9px 6px",color:"#6b7a9e",fontWeight:700}}>{l}</td>
                        <td style={{padding:"9px 6px",color:"#1e1b4b",fontWeight:800,textAlign:"right"}}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
            {result.mode==="payment" && (
              <>
                <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:12,padding:"16px 20px",marginBottom:20}}>
                  <div style={{fontSize:13,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Required Monthly Payment</div>
                  <div style={{fontSize:36,fontWeight:900,color:"#16a34a"}}>{fmtD(result.pmt)}</div>
                  <div style={{fontSize:14,color:"#6b7a9e",marginTop:4}}>to pay off in {result.mosV} months</div>
                </div>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <tbody>
                    {[["Balance",fmtD(result.bal)],["Monthly Payment",fmtD(result.pmt)],["Total Interest",fmtD(result.totalInt)],["Total Paid",fmtD(result.totalPaid)]].map(([l,v])=>(
                      <tr key={l} style={{borderBottom:"1px solid rgba(99,102,241,0.08)"}}>
                        <td style={{padding:"9px 6px",color:"#6b7a9e",fontWeight:700}}>{l}</td>
                        <td style={{padding:"9px 6px",color:"#1e1b4b",fontWeight:800,textAlign:"right"}}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
            {result.mode==="balance" && (
              <>
                <div style={{background:"#eff6ff",border:"1px solid #93c5fd",borderRadius:12,padding:"16px 20px",marginBottom:20}}>
                  <div style={{fontSize:13,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Max Balance You Can Pay Off</div>
                  <div style={{fontSize:36,fontWeight:900,color:"#1d4ed8"}}>{fmtD(result.maxBal)}</div>
                  <div style={{fontSize:14,color:"#6b7a9e",marginTop:4}}>in {result.mosV} months at {fmtD(result.pmtV)}/mo</div>
                </div>
              </>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
