import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmt  = (n) => "$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const p    = (s) => { const v=parseFloat(String(s??"").replace(/,/g,"")); return isNaN(v)?null:v; };

const ist={width:"100%",background:"#f8f9ff",color:"#1e1b4b",border:"1.5px solid rgba(99,102,241,0.2)",borderRadius:12,padding:"9px 12px",fontSize:14,fontWeight:600,outline:"none",boxSizing:"border-box"};
const lst={display:"block",fontSize:11,fontWeight:700,color:"#6b7a9e",marginBottom:5,letterSpacing:"0.4px",textTransform:"uppercase"};
const fst={marginBottom:14};

export default function FutureValueCalculator() {
  const [pv,    setPV]    = useState("10000");
  const [rate,  setRate]  = useState("7");
  const [n,     setN]     = useState("10");
  const [pmt,   setPmt]   = useState("0");
  const [freq,  setFreq]  = useState("annually");
  const [type,  setType]  = useState("end");
  const [result,setResult]= useState(null);
  const [err,   setErr]   = useState("");

  function calculate() {
    setErr(""); setResult(null);
    const pvV=p(pv), rV=p(rate), nV=p(n), pmtV=p(pmt);
    if(pvV===null||rV===null||nV===null||pmtV===null){ setErr("Please fill in all fields."); return; }
    if(nV<=0){ setErr("Periods must be > 0."); return; }
    const perYear = freq==="monthly"?12:freq==="quarterly"?4:freq==="semi-annual"?2:1;
    const rPer = rV/100/perYear;
    const beg  = type==="beginning";
    const t    = beg?1:0;

    let fv;
    if(rPer===0){ fv = pvV + pmtV*nV; }
    else { fv = pvV*Math.pow(1+rPer,nV) + pmtV*(1+rPer*t)*(Math.pow(1+rPer,nV)-1)/rPer; }

    const totalContrib = pvV + pmtV*nV;
    const totalInterest = fv - totalContrib;

    // Year-by-year table (use perYear periods per row if monthly/quarterly)
    const stepSize = perYear; // group by year
    const rows=[];
    for(let yr=1;yr<=Math.ceil(nV/perYear);yr++){
      const i=yr*perYear;
      const fvAtI = rPer===0 ? pvV+pmtV*Math.min(i,nV) : pvV*Math.pow(1+rPer,Math.min(i,nV))+pmtV*(1+rPer*t)*(Math.pow(1+rPer,Math.min(i,nV))-1)/rPer;
      const contrib = pvV + pmtV*Math.min(i,nV);
      rows.push({ year:yr, fv:fvAtI, contrib, interest:fvAtI-contrib });
    }

    setResult({ fv, pvV, rPer, nV, pmtV, totalContrib, totalInterest, rows, perYear });
  }

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Future Value Calculator</h1>
        <p className="muted">Calculate the future value (FV) of an investment or savings account with optional recurring contributions.</p>
      </header>
      <div style={{maxWidth:1100,margin:"0 auto",display:"flex",gap:20,flexWrap:"wrap",alignItems:"flex-start"}}>
        <section className="card" style={{flex:"0 0 320px",minWidth:270}}>
          <div style={fst}><label style={lst}>Present Value / Initial Investment</label><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={pv} onChange={e=>setPV(e.target.value)}/></div></div>
          <div style={fst}><label style={lst}>Annual Interest Rate (%)</label><div style={{display:"flex",alignItems:"center",gap:6}}><input style={ist} value={rate} onChange={e=>setRate(e.target.value)}/><span style={{color:"#6366f1",fontWeight:700}}>%</span></div></div>
          <div style={fst}><label style={lst}>Number of Years</label><input style={ist} value={n} onChange={e=>setN(e.target.value)}/></div>
          <div style={fst}><label style={lst}>Periodic Contribution</label><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={pmt} onChange={e=>setPmt(e.target.value)}/></div></div>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            <div style={{flex:1}}><label style={lst}>Frequency</label>
              <select style={ist} value={freq} onChange={e=>setFreq(e.target.value)}>
                <option value="annually">Annually</option>
                <option value="semi-annual">Semi-Annual</option>
                <option value="quarterly">Quarterly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div style={{flex:1}}><label style={lst}>Contribution Timing</label>
              <select style={ist} value={type} onChange={e=>setType(e.target.value)}>
                <option value="end">End of Period</option>
                <option value="beginning">Beginning</option>
              </select>
            </div>
          </div>
          {err && <p style={{color:"#ef4444",fontSize:13,marginBottom:10}}>{err}</p>}
          <button className="btn" style={{width:"100%",marginBottom:8}} onClick={calculate}>Calculate FV</button>
          <button className="btn-sec" style={{width:"100%"}} onClick={()=>{setResult(null);setErr("");}}>Clear</button>
        </section>

        {result && (
          <section className="card" style={{flex:1,minWidth:260}}>
            <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:12,padding:"16px 20px",marginBottom:20}}>
              <div style={{fontSize:13,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Future Value (FV)</div>
              <div style={{fontSize:36,fontWeight:900,color:"#16a34a"}}>{fmt(result.fv)}</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
              {[["Initial Investment",fmt(result.pvV)],["Total Contributions",fmt(result.totalContrib)],["Total Interest",fmt(result.totalInterest)]].map(([l,v])=>(
                <div key={l} style={{background:"#f0f0ff",borderRadius:10,padding:"12px"}}>
                  <div style={{fontSize:11,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:3}}>{l}</div>
                  <div style={{fontSize:15,fontWeight:800,color:"#312e81"}}>{v}</div>
                </div>
              ))}
            </div>
            {/* Visual bar */}
            {result.fv>0 && (
              <div style={{marginBottom:20}}>
                <div style={{height:20,background:"#e8e5ff",borderRadius:999,overflow:"hidden",display:"flex"}}>
                  <div style={{width:`${(result.pvV/result.fv)*100}%`,background:"#6366f1",height:"100%",transition:"width 0.5s"}}/>
                  <div style={{width:`${(result.totalInterest/result.fv)*100}%`,background:"#10b981",height:"100%"}}/>
                </div>
                <div style={{display:"flex",gap:16,marginTop:6,fontSize:11,color:"#6b7a9e"}}>
                  <span><span style={{display:"inline-block",width:10,height:10,borderRadius:2,background:"#6366f1",marginRight:4}}/>Initial + Contributions</span>
                  <span><span style={{display:"inline-block",width:10,height:10,borderRadius:2,background:"#10b981",marginRight:4}}/>Interest Earned</span>
                </div>
              </div>
            )}
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead><tr style={{background:"#f0f0ff"}}>{["Year","Future Value","Total Contributed","Interest Earned"].map(h=><th key={h} style={{padding:"8px 10px",textAlign:"right",fontWeight:700,color:"#4f46e5",fontSize:11}}>{h}</th>)}</tr></thead>
                <tbody>
                  {result.rows.map((r,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid rgba(99,102,241,0.08)",background:i%2===0?"#fafbff":"#fff"}}>
                      <td style={{padding:"7px 10px",fontWeight:600,color:"#1e1b4b",textAlign:"right"}}>Year {r.year}</td>
                      <td style={{padding:"7px 10px",textAlign:"right",fontWeight:700,color:"#16a34a"}}>{fmt(r.fv)}</td>
                      <td style={{padding:"7px 10px",textAlign:"right",color:"#6366f1",fontWeight:600}}>{fmt(r.contrib)}</td>
                      <td style={{padding:"7px 10px",textAlign:"right",color:"#10b981",fontWeight:600}}>{fmt(r.interest)}</td>
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
