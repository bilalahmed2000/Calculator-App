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

export default function RealEstateCalculator() {
  const [mode, setMode] = useState("flip"); // flip, hold, arv
  // Flip
  const [purchase,  setPurchase]  = useState("200000");
  const [rehab,     setRehab]     = useState("30000");
  const [arv,       setArv]       = useState("280000");
  const [holdMonths,setHoldMonths]= useState("6");
  const [holdCosts, setHoldCosts] = useState("1200");
  const [closingBuy,setClosingBuy]= useState("3");
  const [closingSell,setClosingSell]=useState("6");
  // Hold
  const [price,     setPrice]     = useState("300000");
  const [downPct,   setDownPct]   = useState("20");
  const [rate,      setRate]      = useState("7.0");
  const [rentInc,   setRentInc]   = useState("2000");
  const [expPct,    setExpPct]    = useState("40");
  const [appPct,    setAppPct]    = useState("3");
  const [holdYears, setHoldYears] = useState("5");
  // ARV
  const [sqft,    setSqft]    = useState("1500");
  const [pricePerSqft,setPPS] = useState("150");
  const [comp1,   setComp1]   = useState("270000");
  const [comp2,   setComp2]   = useState("285000");
  const [comp3,   setComp3]   = useState("275000");
  const [result, setResult] = useState(null);

  function calculate() {
    if(mode==="flip"){
      const pur=p(purchase), reh=p(rehab), arvV=p(arv), hm=p(holdMonths), hc=p(holdCosts), cbPct=p(closingBuy)/100, csPct=p(closingSell)/100;
      const totalInvest=pur*(1+cbPct)+reh+hc*hm;
      const netProceeds=arvV*(1-csPct);
      const profit=netProceeds-totalInvest;
      const roi=(profit/totalInvest)*100;
      const arvPct=((pur+reh)/(arvV))*100;
      setResult({mode:"flip",pur,reh,arvV,totalInvest,netProceeds,profit,roi,arvPct,holdingCosts:hc*hm,closingCostBuy:pur*cbPct,closingCostSell:arvV*csPct});
    } else if(mode==="hold"){
      const priceV=p(price), dp=p(downPct)/100, r=p(rate)/100/12, n=30*12;
      const rentM=p(rentInc), expR=p(expPct)/100, appR=p(appPct)/100/12, yrs=p(holdYears);
      const loanAmt=priceV*(1-dp), downAmt=priceV*dp;
      const pmt=r===0?loanAmt/n:loanAmt*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1);
      const noi=(rentM*(1-expR)*12);
      const capRate=(noi/priceV)*100;
      const cashFlow=rentM*(1-expR)-pmt;
      const coc=(cashFlow*12)/downAmt*100;
      const futVal=priceV*Math.pow(1+appR,yrs*12);
      let bal=loanAmt;
      for(let i=0;i<yrs*12;i++){ const ip=bal*r; bal=Math.max(0,bal-(pmt-ip)); }
      const equity=futVal-bal;
      const totalRet=(equity-downAmt+cashFlow*12*yrs)/downAmt*100;
      setResult({mode:"hold",priceV,downAmt,loanAmt,pmt,rentM,noi,capRate,cashFlow,coc,futVal,equity,totalRet,yrs});
    } else {
      const sqftV=p(sqft), pps=p(pricePerSqft);
      const c1=p(comp1),c2=p(comp2),c3=p(comp3);
      const avgComp=(c1+c2+c3)/3;
      const priceMethod=sqftV*pps;
      const blended=(avgComp+priceMethod)/2;
      const rule70=blended*0.70;
      setResult({mode:"arv",sqftV,pps,avgComp,priceMethod,blended,rule70});
    }
  }

  const tabSt=(a)=>({flex:1,padding:"8px",borderRadius:8,border:"1.5px solid rgba(99,102,241,0.25)",background:a?"#4f46e5":"#f8f9ff",color:a?"#fff":"#4f46e5",fontWeight:700,fontSize:13,cursor:"pointer"});

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Real Estate Calculator</h1>
        <p className="muted">Analyze fix-and-flip profits, buy-and-hold returns, or estimate after-repair value (ARV).</p>
      </header>
      <div style={{maxWidth:1100,margin:"0 auto",display:"flex",gap:20,flexWrap:"wrap",alignItems:"flex-start"}}>
        <section className="card" style={{flex:"0 0 330px",minWidth:270}}>
          <div style={{display:"flex",gap:6,marginBottom:16}}>
            <button style={tabSt(mode==="flip")}  onClick={()=>{setMode("flip");setResult(null);}}>Fix &amp; Flip</button>
            <button style={tabSt(mode==="hold")}  onClick={()=>{setMode("hold");setResult(null);}}>Buy &amp; Hold</button>
            <button style={tabSt(mode==="arv")}   onClick={()=>{setMode("arv");setResult(null);}}>ARV</button>
          </div>

          {mode==="flip" && (
            <>
              <div style={fst}><label style={lst}>Purchase Price</label><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={purchase} onChange={e=>setPurchase(e.target.value)}/></div></div>
              <div style={fst}><label style={lst}>Rehab Cost</label><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={rehab} onChange={e=>setRehab(e.target.value)}/></div></div>
              <div style={fst}><label style={lst}>After Repair Value (ARV)</label><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={arv} onChange={e=>setArv(e.target.value)}/></div></div>
              <div style={{display:"flex",gap:8,marginBottom:14}}>
                <div style={{flex:1}}><label style={lst}>Hold Months</label><input style={ist} value={holdMonths} onChange={e=>setHoldMonths(e.target.value)}/></div>
                <div style={{flex:1}}><label style={lst}>Monthly Hold Cost</label><input style={ist} value={holdCosts} onChange={e=>setHoldCosts(e.target.value)}/></div>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:14}}>
                <div style={{flex:1}}><label style={lst}>Buying Closing %</label><input style={ist} value={closingBuy} onChange={e=>setClosingBuy(e.target.value)}/></div>
                <div style={{flex:1}}><label style={lst}>Selling Closing %</label><input style={ist} value={closingSell} onChange={e=>setClosingSell(e.target.value)}/></div>
              </div>
            </>
          )}
          {mode==="hold" && (
            <>
              <div style={fst}><label style={lst}>Purchase Price</label><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={price} onChange={e=>setPrice(e.target.value)}/></div></div>
              <div style={{display:"flex",gap:8,marginBottom:14}}>
                <div style={{flex:1}}><label style={lst}>Down Payment %</label><input style={ist} value={downPct} onChange={e=>setDownPct(e.target.value)}/></div>
                <div style={{flex:1}}><label style={lst}>Mortgage Rate %</label><input style={ist} value={rate} onChange={e=>setRate(e.target.value)}/></div>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:14}}>
                <div style={{flex:1}}><label style={lst}>Monthly Rent ($)</label><input style={ist} value={rentInc} onChange={e=>setRentInc(e.target.value)}/></div>
                <div style={{flex:1}}><label style={lst}>Expense Ratio %</label><input style={ist} value={expPct} onChange={e=>setExpPct(e.target.value)}/></div>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:14}}>
                <div style={{flex:1}}><label style={lst}>Appreciation %/yr</label><input style={ist} value={appPct} onChange={e=>setAppPct(e.target.value)}/></div>
                <div style={{flex:1}}><label style={lst}>Hold Years</label><input style={ist} value={holdYears} onChange={e=>setHoldYears(e.target.value)}/></div>
              </div>
            </>
          )}
          {mode==="arv" && (
            <>
              <div style={{display:"flex",gap:8,marginBottom:14}}>
                <div style={{flex:1}}><label style={lst}>Sq Ft</label><input style={ist} value={sqft} onChange={e=>setSqft(e.target.value)}/></div>
                <div style={{flex:1}}><label style={lst}>Price per Sq Ft</label><div style={{display:"flex",alignItems:"center",gap:4}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={pricePerSqft} onChange={e=>setPPS(e.target.value)}/></div></div>
              </div>
              <div style={fst}><label style={lst}>Comparable 1 ($)</label><input style={ist} value={comp1} onChange={e=>setComp1(e.target.value)}/></div>
              <div style={fst}><label style={lst}>Comparable 2 ($)</label><input style={ist} value={comp2} onChange={e=>setComp2(e.target.value)}/></div>
              <div style={fst}><label style={lst}>Comparable 3 ($)</label><input style={ist} value={comp3} onChange={e=>setComp3(e.target.value)}/></div>
            </>
          )}
          <button className="btn" style={{width:"100%",marginBottom:8}} onClick={calculate}>Calculate</button>
          <button className="btn-sec" style={{width:"100%"}} onClick={()=>setResult(null)}>Clear</button>
        </section>

        {result && (
          <section className="card" style={{flex:1,minWidth:260}}>
            {result.mode==="flip" && (
              <>
                <div style={{background:result.profit>=0?"#f0fdf4":"#fef2f2",border:`1px solid ${result.profit>=0?"#86efac":"#fca5a5"}`,borderRadius:12,padding:"16px 20px",marginBottom:20}}>
                  <div style={{fontSize:13,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Net Profit</div>
                  <div style={{fontSize:36,fontWeight:900,color:result.profit>=0?"#16a34a":"#dc2626"}}>{fmtD(result.profit)}</div>
                  <div style={{fontSize:13,color:"#6b7a9e",marginTop:4}}>ROI: <b>{fmtP(result.roi)}</b> · ARV/Cost ratio: <b>{fmtP(result.arvPct)}</b></div>
                </div>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <tbody>
                    {[["Purchase Price",fmt(result.pur)],["Rehab Cost",fmt(result.reh)],["Closing Cost (Buy)",fmt(result.closingCostBuy)],["Holding Costs",fmt(result.holdingCosts)],["Total Investment",fmt(result.totalInvest)],["Net Sale Proceeds",fmt(result.netProceeds)],["Closing Cost (Sell)",fmt(result.closingCostSell)],["Net Profit",fmtD(result.profit)],["ROI",fmtP(result.roi)]].map(([l,v])=>(
                      <tr key={l} style={{borderBottom:"1px solid rgba(99,102,241,0.08)"}}>
                        <td style={{padding:"8px 6px",color:"#6b7a9e",fontWeight:700}}>{l}</td>
                        <td style={{padding:"8px 6px",color:"#1e1b4b",fontWeight:700,textAlign:"right"}}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
            {result.mode==="hold" && (
              <>
                <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:18}}>
                  {[["Monthly Cash Flow",fmtD(result.cashFlow),result.cashFlow>=0?"#16a34a":"#dc2626"],["Cap Rate",fmtP(result.capRate),"#4f46e5"],["Cash-on-Cash",fmtP(result.coc),"#10b981"],[`${result.yrs}-yr Total Return`,fmtP(result.totalRet),"#312e81"]].map(([l,v,c])=>(
                    <div key={l} style={{background:"#f0f0ff",borderRadius:10,padding:"12px"}}>
                      <div style={{fontSize:11,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:3}}>{l}</div>
                      <div style={{fontSize:18,fontWeight:800,color:c}}>{v}</div>
                    </div>
                  ))}
                </div>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <tbody>
                    {[["Down Payment",fmt(result.downAmt)],["Loan Amount",fmt(result.loanAmt)],["Monthly Mortgage",fmtD(result.pmt)],["Net Operating Income",fmt(result.noi)+"/yr"],["Future Home Value",fmt(result.futVal)],["Total Equity",fmt(result.equity)]].map(([l,v])=>(
                      <tr key={l} style={{borderBottom:"1px solid rgba(99,102,241,0.08)"}}>
                        <td style={{padding:"8px 6px",color:"#6b7a9e",fontWeight:700}}>{l}</td>
                        <td style={{padding:"8px 6px",color:"#1e1b4b",fontWeight:700,textAlign:"right"}}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
            {result.mode==="arv" && (
              <>
                <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:12,padding:"16px 20px",marginBottom:20}}>
                  <div style={{fontSize:13,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Estimated ARV</div>
                  <div style={{fontSize:36,fontWeight:900,color:"#16a34a"}}>{fmt(result.blended)}</div>
                  <div style={{fontSize:13,color:"#6b7a9e",marginTop:4}}>70% Rule Max Offer: <b>{fmt(result.rule70)}</b></div>
                </div>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <tbody>
                    {[["Sq Ft Method",fmt(result.priceMethod)],["Comps Average",fmt(result.avgComp)],["Blended ARV",fmt(result.blended)],["70% Rule Max Offer",fmt(result.rule70)]].map(([l,v])=>(
                      <tr key={l} style={{borderBottom:"1px solid rgba(99,102,241,0.08)"}}>
                        <td style={{padding:"8px 6px",color:"#6b7a9e",fontWeight:700}}>{l}</td>
                        <td style={{padding:"8px 6px",color:"#1e1b4b",fontWeight:700,textAlign:"right"}}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
