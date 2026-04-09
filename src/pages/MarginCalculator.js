import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmtD = (n) => "$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const fmtP = (n) => n.toFixed(2)+"%";
const p    = (s) => { const v=parseFloat(String(s??"").replace(/,/g,"")); return isNaN(v)?null:v; };

const ist={width:"100%",background:"#f8f9ff",color:"#1e1b4b",border:"1.5px solid rgba(99,102,241,0.2)",borderRadius:12,padding:"9px 12px",fontSize:14,fontWeight:600,outline:"none",boxSizing:"border-box"};
const lst={display:"block",fontSize:11,fontWeight:700,color:"#6b7a9e",marginBottom:5,letterSpacing:"0.4px",textTransform:"uppercase"};
const fst={marginBottom:14};

export default function MarginCalculator() {
  const [mode, setMode] = useState("revenue"); // revenue, cost, margin, markup
  const [revenue, setRevenue] = useState("1000");
  const [cost,    setCost]    = useState("700");
  const [margin,  setMargin]  = useState("30");
  const [markup,  setMarkup]  = useState("42.86");
  const [result,  setResult]  = useState(null);
  const [err, setErr] = useState("");

  function calculate() {
    setErr(""); setResult(null);
    let rev, cst, mar, mup, profit;

    if(mode==="revenue"){
      const r=p(revenue), c=p(cost);
      if(r===null||c===null){ setErr("Fill in all fields."); return; }
      rev=r; cst=c; profit=r-c; mar=(profit/r)*100; mup=(profit/c)*100;
    } else if(mode==="cost"){
      const r=p(revenue), m=p(margin);
      if(r===null||m===null){ setErr("Fill in all fields."); return; }
      rev=r; mar=m; profit=r*m/100; cst=r-profit; mup=(profit/cst)*100;
    } else if(mode==="margin"){
      const c=p(cost), m=p(margin);
      if(c===null||m===null){ setErr("Fill in all fields."); return; }
      cst=c; mar=m; rev=c/(1-m/100); profit=rev-c; mup=(profit/c)*100;
    } else {
      const c=p(cost), mu=p(markup);
      if(c===null||mu===null){ setErr("Fill in all fields."); return; }
      cst=c; mup=mu; profit=c*mu/100; rev=c+profit; mar=(profit/rev)*100;
    }

    setResult({rev,cst,profit,mar,mup});
  }

  const tabSt=(a)=>({flex:1,padding:"7px",borderRadius:8,border:"1.5px solid rgba(99,102,241,0.25)",background:a?"#4f46e5":"#f8f9ff",color:a?"#fff":"#4f46e5",fontWeight:700,fontSize:12,cursor:"pointer"});

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Margin Calculator</h1>
        <p className="muted">Calculate gross profit margin, markup, revenue, or cost. Solve for any variable given the others.</p>
      </header>
      <div style={{maxWidth:900,margin:"0 auto",display:"flex",gap:20,flexWrap:"wrap",alignItems:"flex-start"}}>
        <section className="card" style={{flex:"0 0 300px",minWidth:260}}>
          <div style={{marginBottom:12,fontSize:12,color:"#6b7a9e",fontWeight:700}}>Solve for:</div>
          <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
            <button style={tabSt(mode==="revenue")} onClick={()=>{setMode("revenue");setResult(null);}}>Margin + Markup</button>
            <button style={tabSt(mode==="cost")}    onClick={()=>{setMode("cost");setResult(null);}}>Cost</button>
            <button style={tabSt(mode==="margin")}  onClick={()=>{setMode("margin");setResult(null);}}>Revenue</button>
            <button style={tabSt(mode==="markup")}  onClick={()=>{setMode("markup");setResult(null);}}>From Markup</button>
          </div>

          {(mode==="revenue"||mode==="cost"||mode==="margin") && (
            <div style={fst}><label style={lst}>Revenue / Selling Price</label><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={revenue} onChange={e=>setRevenue(e.target.value)}/></div></div>
          )}
          {(mode==="revenue"||mode==="markup") && (
            <div style={fst}><label style={lst}>Cost</label><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={cost} onChange={e=>setCost(e.target.value)}/></div></div>
          )}
          {(mode==="cost"||mode==="margin") && (
            <div style={fst}><label style={lst}>Gross Margin (%)</label><div style={{display:"flex",alignItems:"center",gap:6}}><input style={ist} value={margin} onChange={e=>setMargin(e.target.value)}/><span style={{color:"#6366f1",fontWeight:700}}>%</span></div></div>
          )}
          {mode==="markup" && (
            <>
              <div style={fst}><label style={lst}>Cost</label><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={cost} onChange={e=>setCost(e.target.value)}/></div></div>
              <div style={fst}><label style={lst}>Markup (%)</label><div style={{display:"flex",alignItems:"center",gap:6}}><input style={ist} value={markup} onChange={e=>setMarkup(e.target.value)}/><span style={{color:"#6366f1",fontWeight:700}}>%</span></div></div>
            </>
          )}
          {err && <p style={{color:"#ef4444",fontSize:13,marginBottom:10}}>{err}</p>}
          <button className="btn" style={{width:"100%",marginBottom:8}} onClick={calculate}>Calculate</button>
          <button className="btn-sec" style={{width:"100%"}} onClick={()=>{setResult(null);setErr("");}}>Clear</button>
        </section>

        {result && (
          <section className="card" style={{flex:1,minWidth:240}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,marginBottom:20}}>
              {[["Revenue",fmtD(result.rev),"#4f46e5"],["Cost",fmtD(result.cst),"#dc2626"],["Gross Profit",fmtD(result.profit),"#16a34a"],["Gross Margin",fmtP(result.mar),"#16a34a"]].map(([l,v,c])=>(
                <div key={l} style={{background:"#f0f0ff",borderRadius:12,padding:"16px"}}>
                  <div style={{fontSize:11,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>{l}</div>
                  <div style={{fontSize:24,fontWeight:900,color:c}}>{v}</div>
                </div>
              ))}
            </div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <tbody>
                {[["Revenue / Selling Price",fmtD(result.rev)],["Cost",fmtD(result.cst)],["Gross Profit",fmtD(result.profit)],["Gross Margin",fmtP(result.mar)],["Markup",fmtP(result.mup)],["Cost Ratio",fmtP((result.cst/result.rev)*100)]].map(([l,v])=>(
                  <tr key={l} style={{borderBottom:"1px solid rgba(99,102,241,0.08)"}}>
                    <td style={{padding:"9px 6px",color:"#6b7a9e",fontWeight:700}}>{l}</td>
                    <td style={{padding:"9px 6px",color:"#1e1b4b",fontWeight:800,textAlign:"right"}}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{background:"#f5f3ff",borderRadius:12,padding:"14px",marginTop:16}}>
              <div style={{fontSize:12,color:"#6b7a9e",lineHeight:1.7}}>
                <b>Margin</b> = (Revenue − Cost) / Revenue = profit as % of revenue.<br/>
                <b>Markup</b> = (Revenue − Cost) / Cost = profit as % of cost.
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
