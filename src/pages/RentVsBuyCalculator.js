import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmt = (n) => "$"+Math.round(n).toLocaleString("en-US");
const fmtD= (n) => "$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const p   = (s) => { const v=parseFloat(String(s??"").replace(/,/g,"")); return isNaN(v)?0:v; };

const ist={width:"100%",background:"#f8f9ff",color:"#1e1b4b",border:"1.5px solid rgba(99,102,241,0.2)",borderRadius:12,padding:"9px 12px",fontSize:14,fontWeight:600,outline:"none",boxSizing:"border-box"};
const lst={display:"block",fontSize:11,fontWeight:700,color:"#6b7a9e",marginBottom:5,letterSpacing:"0.4px",textTransform:"uppercase"};
const fst={marginBottom:14};

export default function RentVsBuyCalculator() {
  const [homePrice,   setHomePrice]   = useState("350000");
  const [downPct,     setDownPct]     = useState("20");
  const [mortRate,    setMortRate]    = useState("7.0");
  const [mortTerm,    setMortTerm]    = useState("30");
  const [propTax,     setPropTax]     = useState("1.2");
  const [homeIns,     setHomeIns]     = useState("0.5");
  const [hoa,         setHoa]         = useState("0");
  const [maintPct,    setMaintPct]    = useState("1.0");
  const [appPct,      setAppPct]      = useState("3.0");
  const [sellCostPct, setSellCostPct] = useState("6.0");
  const [monthRent,   setMonthRent]   = useState("2000");
  const [rentInc,     setRentInc]     = useState("3.0");
  const [rentersIns,  setRentersIns]  = useState("20");
  const [invReturn,   setInvReturn]   = useState("7.0");
  const [years,       setYears]       = useState("7");
  const [taxBracket,  setTaxBracket]  = useState("22");
  const [result,      setResult]      = useState(null);

  function calculate() {
    const price = p(homePrice);
    const dp    = p(downPct)/100;
    const r     = p(mortRate)/100/12;
    const n     = p(mortTerm)*12;
    const taxR  = p(propTax)/100;
    const insR  = p(homeIns)/100;
    const hoaM  = p(hoa);
    const maintR= p(maintPct)/100;
    const appR  = p(appPct)/100;
    const sellR = p(sellCostPct)/100;
    const rentM = p(monthRent);
    const rentIncR = p(rentInc)/100/12;
    const rInsM = p(rentersIns);
    const invR  = p(invReturn)/100/12;
    const yrs   = p(years);
    const bracket = p(taxBracket)/100;
    const mos   = yrs*12;

    // --- BUY ---
    const loanAmt = price*(1-dp);
    const downAmt = price*dp;
    const pmt = r===0 ? loanAmt/n : loanAmt*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1);

    let balance=loanAmt, totalInterest=0, totalPrincipal=0;
    for(let i=0;i<mos;i++){
      const intPmt=balance*r;
      const prinPmt=pmt-intPmt;
      totalInterest+=intPmt;
      totalPrincipal+=prinPmt;
      balance-=prinPmt;
    }
    const equity=loanAmt-balance;
    const homeValue=price*Math.pow(1+appR/12,mos);
    const sellProceeds=homeValue*(1-sellR)-balance;
    const taxDeductionSavings=totalInterest*bracket;

    const totalBuyCost=downAmt+pmt*mos+price*taxR/12*mos+price*insR/12*mos+hoaM*mos+price*maintR/12*mos-taxDeductionSavings;
    const netBuyCost=totalBuyCost-sellProceeds;

    // opportunity cost of down payment
    const oppCost=downAmt*(Math.pow(1+invR,mos)-1);

    // --- RENT ---
    let totalRentCost=0;
    let monthRentCur=rentM;
    for(let i=0;i<mos;i++){
      totalRentCost+=monthRentCur+rInsM;
      monthRentCur*=(1+rentIncR);
    }
    // Invested down payment return
    const downInvested=downAmt*Math.pow(1+invR,mos);
    const downProfit=downInvested-downAmt;

    const netRentCost=totalRentCost-downProfit;

    setResult({
      buy:{ monthly:pmt+price*taxR/12+price*insR/12+hoaM+price*maintR/12, total:totalBuyCost, homeValue, equity:homeValue-balance, sellProceeds, netCost:netBuyCost, oppCost },
      rent:{ monthly:rentM+rInsM, total:totalRentCost, downProfit, netCost:netRentCost },
      winner: netBuyCost < netRentCost ? "Buy" : "Rent",
      savings: Math.abs(netBuyCost-netRentCost),
      yrs,
    });
  }

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Rent vs. Buy Calculator</h1>
        <p className="muted">Compare the long-term financial costs of renting versus buying a home over your planned time horizon.</p>
      </header>
      <div style={{maxWidth:1100,margin:"0 auto",display:"flex",gap:20,flexWrap:"wrap",alignItems:"flex-start"}}>
        <section className="card" style={{flex:"0 0 340px",minWidth:280}}>
          <div style={{fontSize:11,fontWeight:800,color:"#6366f1",textTransform:"uppercase",letterSpacing:"0.4px",marginBottom:10}}>Home Purchase</div>
          <div style={fst}><label style={lst}>Home Price</label><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={homePrice} onChange={e=>setHomePrice(e.target.value)}/></div></div>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            <div style={{flex:1}}><label style={lst}>Down Payment %</label><div style={{display:"flex",alignItems:"center",gap:4}}><input style={ist} value={downPct} onChange={e=>setDownPct(e.target.value)}/><span style={{color:"#6366f1",fontWeight:700}}>%</span></div></div>
            <div style={{flex:1}}><label style={lst}>Mortgage Rate %</label><div style={{display:"flex",alignItems:"center",gap:4}}><input style={ist} value={mortRate} onChange={e=>setMortRate(e.target.value)}/><span style={{color:"#6366f1",fontWeight:700}}>%</span></div></div>
          </div>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            <div style={{flex:1}}><label style={lst}>Property Tax %/yr</label><input style={ist} value={propTax} onChange={e=>setPropTax(e.target.value)}/></div>
            <div style={{flex:1}}><label style={lst}>Home Insurance %</label><input style={ist} value={homeIns} onChange={e=>setHomeIns(e.target.value)}/></div>
          </div>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            <div style={{flex:1}}><label style={lst}>Maintenance %/yr</label><input style={ist} value={maintPct} onChange={e=>setMaintPct(e.target.value)}/></div>
            <div style={{flex:1}}><label style={lst}>Home Appreciation %</label><input style={ist} value={appPct} onChange={e=>setAppPct(e.target.value)}/></div>
          </div>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            <div style={{flex:1}}><label style={lst}>HOA ($/mo)</label><input style={ist} value={hoa} onChange={e=>setHoa(e.target.value)}/></div>
            <div style={{flex:1}}><label style={lst}>Selling Cost %</label><input style={ist} value={sellCostPct} onChange={e=>setSellCostPct(e.target.value)}/></div>
          </div>
          <div style={{borderTop:"1px solid rgba(99,102,241,0.1)",paddingTop:12,marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:800,color:"#6366f1",textTransform:"uppercase",letterSpacing:"0.4px",marginBottom:10}}>Renting</div>
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              <div style={{flex:1}}><label style={lst}>Monthly Rent ($)</label><input style={ist} value={monthRent} onChange={e=>setMonthRent(e.target.value)}/></div>
              <div style={{flex:1}}><label style={lst}>Annual Rent Increase %</label><input style={ist} value={rentInc} onChange={e=>setRentInc(e.target.value)}/></div>
            </div>
          </div>
          <div style={{borderTop:"1px solid rgba(99,102,241,0.1)",paddingTop:12,marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:800,color:"#6366f1",textTransform:"uppercase",letterSpacing:"0.4px",marginBottom:10}}>Assumptions</div>
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              <div style={{flex:1}}><label style={lst}>Investment Return %</label><input style={ist} value={invReturn} onChange={e=>setInvReturn(e.target.value)}/></div>
              <div style={{flex:1}}><label style={lst}>Time Horizon (yrs)</label><input style={ist} value={years} onChange={e=>setYears(e.target.value)}/></div>
            </div>
            <div style={fst}><label style={lst}>Tax Bracket %</label><input style={ist} value={taxBracket} onChange={e=>setTaxBracket(e.target.value)}/></div>
          </div>
          <button className="btn" style={{width:"100%",marginBottom:8}} onClick={calculate}>Compare</button>
          <button className="btn-sec" style={{width:"100%"}} onClick={()=>setResult(null)}>Clear</button>
        </section>

        {result && (
          <section className="card" style={{flex:1,minWidth:260}}>
            <div style={{background:result.winner==="Buy"?"#eff6ff":"#f0fdf4",border:`1px solid ${result.winner==="Buy"?"#93c5fd":"#86efac"}`,borderRadius:12,padding:"16px 20px",marginBottom:20,textAlign:"center"}}>
              <div style={{fontSize:13,color:"#6b7a9e",fontWeight:700,marginBottom:4}}>Better over {result.yrs} years</div>
              <div style={{fontSize:36,fontWeight:900,color:result.winner==="Buy"?"#1d4ed8":"#16a34a"}}>{result.winner}</div>
              <div style={{fontSize:14,color:"#6b7a9e",marginTop:4}}>Saves approximately <b style={{color:"#1e1b4b"}}>{fmt(result.savings)}</b> vs the other option</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
              {[
                {title:"Buying",color:"#1d4ed8",data:[["Monthly Cost",fmt(result.buy.monthly)],["Total Cost",fmt(result.buy.total)],["Home Value",fmt(result.buy.homeValue)],["Net Equity",fmt(result.buy.equity)],["Sale Proceeds",fmt(result.buy.sellProceeds)],["Net Buying Cost",fmt(result.buy.netCost)]]},
                {title:"Renting",color:"#16a34a",data:[["Monthly Cost",fmt(result.rent.monthly)],["Total Rent Paid",fmt(result.rent.total)],["Down Pmt Profit",fmt(result.rent.downProfit)],["Net Renting Cost",fmt(result.rent.netCost)]]}
              ].map(side=>(
                <div key={side.title} style={{border:"1px solid rgba(99,102,241,0.15)",borderRadius:12,padding:"14px"}}>
                  <div style={{fontWeight:800,fontSize:15,color:side.color,marginBottom:10}}>{side.title}</div>
                  {side.data.map(([l,v])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"3px 0",borderBottom:"1px solid rgba(99,102,241,0.06)"}}>
                      <span style={{color:"#6b7a9e"}}>{l}</span><span style={{fontWeight:700,color:"#1e1b4b"}}>{v}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <p style={{fontSize:12,color:"#9ca3c8",marginTop:8}}>* This is an estimate. Actual results vary based on market conditions, taxes, and individual circumstances.</p>
          </section>
        )}
      </div>
    </div>
  );
}
