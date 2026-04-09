import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmtD = (n) => "$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const fmtY = (n) => { const y=Math.floor(n); const m=Math.round((n-y)*12); return y>0?`${y} yr${y>1?"s":""}${m>0?` ${m} mo`:""}`:m>0?`${m} mo`:"< 1 mo"; };
const p    = (s) => { const v=parseFloat(String(s??"").replace(/,/g,"")); return isNaN(v)?null:v; };

const ist={width:"100%",background:"#f8f9ff",color:"#1e1b4b",border:"1.5px solid rgba(99,102,241,0.2)",borderRadius:12,padding:"9px 12px",fontSize:14,fontWeight:600,outline:"none",boxSizing:"border-box"};
const lst={display:"block",fontSize:11,fontWeight:700,color:"#6b7a9e",marginBottom:5,letterSpacing:"0.4px",textTransform:"uppercase"};
const fst={marginBottom:14};

export default function PaybackPeriodCalculator() {
  const [mode, setMode] = useState("even"); // even, uneven
  const [initial,  setInitial]  = useState("100000");
  const [annual,   setAnnual]   = useState("25000");
  const [discRate, setDiscRate] = useState("10");
  const [cashFlows,setCashFlows]= useState("30000,30000,25000,20000,20000,15000");
  const [result,   setResult]   = useState(null);
  const [err,      setErr]      = useState("");

  function calculate(){
    setErr(""); setResult(null);
    const inv=p(initial), r=(p(discRate)||0)/100;
    if(inv===null||inv<=0){ setErr("Enter a valid initial investment."); return; }

    if(mode==="even"){
      const ann=p(annual);
      if(ann===null||ann<=0){ setErr("Enter annual cash flow."); return; }
      const simple=inv/ann;

      // Discounted payback
      let cumDiscounted=0, discPeriods=null;
      const rows=[];
      for(let yr=1;yr<=20;yr++){
        const discCF=ann/Math.pow(1+r,yr);
        cumDiscounted+=discCF;
        rows.push({yr,cf:ann,dcf:discCF,cum:ann*yr,cumDisc:cumDiscounted});
        if(discPeriods===null&&cumDiscounted>=inv){
          discPeriods=yr-1+(inv-(cumDiscounted-discCF))/discCF;
        }
        if(yr>=simple*2&&yr>10) break;
      }
      const npv=-inv+rows.reduce((s,r)=>s+r.dcf,0);
      setResult({mode:"even",simple,discPeriods,inv,ann,rows,r,npv});
    } else {
      const cfs=cashFlows.split(/[,\n\s]+/).map(s=>parseFloat(s.trim())).filter(v=>!isNaN(v));
      if(!cfs.length){ setErr("Enter at least one cash flow."); return; }

      let cumulative=0, simplePeriod=null;
      let cumulativeDisc=0, discPeriod=null;
      const rows=[];

      cfs.forEach((cf,i)=>{
        const yr=i+1;
        cumulative+=cf;
        const dcf=cf/Math.pow(1+r,yr);
        cumulativeDisc+=dcf;
        if(simplePeriod===null&&cumulative>=inv){
          simplePeriod=yr-1+(inv-(cumulative-cf))/cf;
        }
        if(discPeriod===null&&cumulativeDisc>=inv){
          discPeriod=yr-1+(inv-(cumulativeDisc-dcf))/dcf;
        }
        rows.push({yr,cf,dcf,cum:cumulative,cumDisc:cumulativeDisc});
      });
      const npv=-inv+cumulativeDisc;
      setResult({mode:"uneven",simple:simplePeriod,discPeriods:discPeriod,inv,rows,r,npv});
    }
  }

  const tabSt=(a)=>({flex:1,padding:"8px",borderRadius:8,border:"1.5px solid rgba(99,102,241,0.25)",background:a?"#4f46e5":"#f8f9ff",color:a?"#fff":"#4f46e5",fontWeight:700,fontSize:13,cursor:"pointer"});

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Payback Period Calculator</h1>
        <p className="muted">Calculate the simple and discounted payback period for an investment, plus Net Present Value (NPV).</p>
      </header>
      <div style={{maxWidth:1100,margin:"0 auto",display:"flex",gap:20,flexWrap:"wrap",alignItems:"flex-start"}}>
        <section className="card" style={{flex:"0 0 310px",minWidth:260}}>
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            <button style={tabSt(mode==="even")}   onClick={()=>{setMode("even");setResult(null);}}>Even Cash Flows</button>
            <button style={tabSt(mode==="uneven")} onClick={()=>{setMode("uneven");setResult(null);}}>Uneven Cash Flows</button>
          </div>
          <div style={fst}><label style={lst}>Initial Investment</label><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={initial} onChange={e=>setInitial(e.target.value)}/></div></div>
          {mode==="even" ? (
            <div style={fst}><label style={lst}>Annual Cash Flow</label><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={annual} onChange={e=>setAnnual(e.target.value)}/></div></div>
          ) : (
            <div style={fst}>
              <label style={lst}>Cash Flows per Year (comma or line separated)</label>
              <textarea style={{...ist,minHeight:100,resize:"vertical",fontSize:13}} value={cashFlows} onChange={e=>setCashFlows(e.target.value)} placeholder="30000, 25000, 20000..."/>
            </div>
          )}
          <div style={fst}><label style={lst}>Discount Rate (%) for DPBP</label><div style={{display:"flex",alignItems:"center",gap:6}}><input style={ist} value={discRate} onChange={e=>setDiscRate(e.target.value)}/><span style={{color:"#6366f1",fontWeight:700}}>%</span></div></div>
          {err && <p style={{color:"#ef4444",fontSize:13,marginBottom:10}}>{err}</p>}
          <button className="btn" style={{width:"100%",marginBottom:8}} onClick={calculate}>Calculate</button>
          <button className="btn-sec" style={{width:"100%"}} onClick={()=>{setResult(null);setErr("");}}>Clear</button>
        </section>

        {result && (
          <section className="card" style={{flex:1,minWidth:260}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
              {[["Simple Payback",result.simple!==null?fmtY(result.simple):"Never"],["Discounted Payback",result.discPeriods!==null?fmtY(result.discPeriods):"Never"],["NPV",fmtD(result.npv)]].map(([l,v])=>(
                <div key={l} style={{background:"#f0f0ff",borderRadius:12,padding:"16px"}}>
                  <div style={{fontSize:11,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>{l}</div>
                  <div style={{fontSize:20,fontWeight:900,color:l==="NPV"?(result.npv>=0?"#16a34a":"#dc2626"):"#312e81"}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead><tr style={{background:"#f0f0ff"}}>{["Year","Cash Flow","Discounted CF","Cumulative","Cum. Discounted"].map(h=><th key={h} style={{padding:"8px 10px",textAlign:"right",fontWeight:700,color:"#4f46e5",fontSize:11}}>{h}</th>)}</tr></thead>
                <tbody>
                  <tr style={{background:"#fff7ed"}}>
                    <td style={{padding:"7px 10px",fontWeight:600,textAlign:"right",color:"#92400e"}}>0</td>
                    <td colSpan={4} style={{padding:"7px 10px",textAlign:"right",color:"#dc2626",fontWeight:700}}>Initial Investment: -{fmtD(result.inv)}</td>
                  </tr>
                  {result.rows.map((r,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid rgba(99,102,241,0.08)",background:i%2===0?"#fafbff":"#fff"}}>
                      <td style={{padding:"7px 10px",fontWeight:600,color:"#1e1b4b",textAlign:"right"}}>{r.yr}</td>
                      <td style={{padding:"7px 10px",textAlign:"right",color:"#16a34a",fontWeight:600}}>{fmtD(r.cf)}</td>
                      <td style={{padding:"7px 10px",textAlign:"right",color:"#10b981"}}>{fmtD(r.dcf)}</td>
                      <td style={{padding:"7px 10px",textAlign:"right",fontWeight:r.cum>=result.inv?700:400,color:r.cum>=result.inv?"#4f46e5":"#6b7a9e"}}>{fmtD(r.cum)}</td>
                      <td style={{padding:"7px 10px",textAlign:"right",fontWeight:r.cumDisc>=result.inv?700:400,color:r.cumDisc>=result.inv?"#4f46e5":"#6b7a9e"}}>{fmtD(r.cumDisc)}</td>
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
