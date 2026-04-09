import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmtD = (n) => "$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const p    = (s) => { const v=parseFloat(String(s??"").replace(/,/g,"")); return isNaN(v)?null:v; };

const ist={width:"100%",background:"#f8f9ff",color:"#1e1b4b",border:"1.5px solid rgba(99,102,241,0.2)",borderRadius:12,padding:"9px 12px",fontSize:14,fontWeight:600,outline:"none",boxSizing:"border-box"};
const lst={display:"block",fontSize:11,fontWeight:700,color:"#6b7a9e",marginBottom:5,letterSpacing:"0.4px",textTransform:"uppercase"};
const fst={marginBottom:14};

function buildStraightLine(cost, salvage, life){
  const annual=(cost-salvage)/life;
  const rows=[];
  let bv=cost;
  for(let y=1;y<=life;y++){
    rows.push({year:y,depr:annual,accum:annual*y,bv:bv-annual});
    bv-=annual;
  }
  return {rows,annual};
}

function buildDeclining(cost, salvage, life, factor=2){
  const rate=factor/life;
  const rows=[];
  let bv=cost;
  for(let y=1;y<=life;y++){
    let depr=bv*rate;
    if(bv-depr<salvage) depr=Math.max(0,bv-salvage);
    const accum=cost-bv+depr;
    rows.push({year:y,depr,accum,bv:bv-depr});
    bv-=depr;
    if(bv<=salvage) break;
  }
  while(rows.length<life) rows.push({year:rows.length+1,depr:0,accum:cost-salvage,bv:salvage});
  return rows;
}

function buildSYD(cost, salvage, life){
  const syd=life*(life+1)/2;
  const rows=[];
  let bv=cost, accum=0;
  for(let y=1;y<=life;y++){
    const frac=(life-y+1)/syd;
    const depr=(cost-salvage)*frac;
    accum+=depr;
    bv-=depr;
    rows.push({year:y,depr,accum,bv});
  }
  return rows;
}

export default function DepreciationCalculator() {
  const [method, setMethod] = useState("sl");
  const [cost,    setCost]    = useState("50000");
  const [salvage, setSalvage] = useState("5000");
  const [life,    setLife]    = useState("5");
  const [factor,  setFactor]  = useState("2");
  const [result,  setResult]  = useState(null);
  const [err,     setErr]     = useState("");

  function calculate() {
    setErr(""); setResult(null);
    const c=p(cost), s=p(salvage), l=p(life);
    if(c===null||s===null||l===null){ setErr("Fill in all fields."); return; }
    if(c<=0||l<=0){ setErr("Cost and life must be > 0."); return; }
    if(s>=c){ setErr("Salvage must be less than cost."); return; }

    let rows;
    if(method==="sl"){ const r=buildStraightLine(c,s,l); rows=r.rows; }
    else if(method==="ddb"){ rows=buildDeclining(c,s,l,p(factor)||2); }
    else { rows=buildSYD(c,s,l); }

    setResult({c,s,l,rows,method});
  }

  const tabSt=(a)=>({flex:1,padding:"8px",borderRadius:8,border:"1.5px solid rgba(99,102,241,0.25)",background:a?"#4f46e5":"#f8f9ff",color:a?"#fff":"#4f46e5",fontWeight:700,fontSize:12,cursor:"pointer"});

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Depreciation Calculator</h1>
        <p className="muted">Calculate asset depreciation using Straight-Line, Double Declining Balance, or Sum-of-Years-Digits methods.</p>
      </header>
      <div style={{maxWidth:1100,margin:"0 auto",display:"flex",gap:20,flexWrap:"wrap",alignItems:"flex-start"}}>
        <section className="card" style={{flex:"0 0 310px",minWidth:260}}>
          <div style={{display:"flex",gap:6,marginBottom:16}}>
            <button style={tabSt(method==="sl")}  onClick={()=>{setMethod("sl");setResult(null);}}>Straight-Line</button>
            <button style={tabSt(method==="ddb")} onClick={()=>{setMethod("ddb");setResult(null);}}>Declining Bal.</button>
            <button style={tabSt(method==="syd")} onClick={()=>{setMethod("syd");setResult(null);}}>SYD</button>
          </div>
          <div style={fst}><label style={lst}>Asset Cost</label><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={cost} onChange={e=>setCost(e.target.value)}/></div></div>
          <div style={fst}><label style={lst}>Salvage Value</label><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={salvage} onChange={e=>setSalvage(e.target.value)}/></div></div>
          <div style={fst}><label style={lst}>Useful Life (Years)</label><input style={ist} value={life} onChange={e=>setLife(e.target.value)}/></div>
          {method==="ddb" && (
            <div style={fst}><label style={lst}>Declining Factor (2=DDB)</label><input style={ist} value={factor} onChange={e=>setFactor(e.target.value)}/></div>
          )}
          {err && <p style={{color:"#ef4444",fontSize:13,marginBottom:10}}>{err}</p>}
          <button className="btn" style={{width:"100%",marginBottom:8}} onClick={calculate}>Calculate</button>
          <button className="btn-sec" style={{width:"100%"}} onClick={()=>{setResult(null);setErr("");}}>Clear</button>
        </section>

        {result && (
          <section className="card" style={{flex:1,minWidth:260}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
              {[["Asset Cost",fmtD(result.c)],["Salvage Value",fmtD(result.s)],["Total Depreciation",fmtD(result.c-result.s)]].map(([l,v])=>(
                <div key={l} style={{background:"#f0f0ff",borderRadius:10,padding:"12px"}}>
                  <div style={{fontSize:11,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:3}}>{l}</div>
                  <div style={{fontSize:16,fontWeight:800,color:"#312e81"}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead><tr style={{background:"#f0f0ff"}}>{["Year","Depreciation","Accumulated Depr.","Book Value"].map(h=><th key={h} style={{padding:"8px 10px",textAlign:"right",fontWeight:700,color:"#4f46e5",fontSize:11}}>{h}</th>)}</tr></thead>
                <tbody>
                  {result.rows.map((r,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid rgba(99,102,241,0.08)",background:i%2===0?"#fafbff":"#fff"}}>
                      <td style={{padding:"7px 10px",fontWeight:600,color:"#1e1b4b",textAlign:"right"}}>Year {r.year}</td>
                      <td style={{padding:"7px 10px",textAlign:"right",fontWeight:700,color:"#dc2626"}}>{fmtD(r.depr)}</td>
                      <td style={{padding:"7px 10px",textAlign:"right",color:"#6b7a9e"}}>{fmtD(r.accum)}</td>
                      <td style={{padding:"7px 10px",textAlign:"right",fontWeight:700,color:"#4f46e5"}}>{fmtD(r.bv)}</td>
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
