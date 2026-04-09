import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmt  = (n) => { if (!isFinite(n)||isNaN(n)) return "—"; return "$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}); };
const fmtp = (n) => { if (!isFinite(n)||isNaN(n)) return "—"; return n.toFixed(4)+"%"; };
const p = (s) => { const v=parseFloat(String(s??"").replace(/,/g,"")); return isNaN(v)?null:v; };

const ist = { width:"100%",background:"#f8f9ff",color:"#1e1b4b",border:"1.5px solid rgba(99,102,241,0.2)",borderRadius:12,padding:"9px 12px",fontSize:14,fontWeight:600,outline:"none",boxSizing:"border-box" };
const lst = { display:"block",fontSize:11,fontWeight:700,color:"#6b7a9e",marginBottom:5,letterSpacing:"0.4px",textTransform:"uppercase" };
const fst = { marginBottom:14 };

// Newton-Raphson for rate
function solveRate(n,pmt,pv,fv,type){
  let r=0.1;
  for(let i=0;i<200;i++){
    const t=type?1:0;
    const p1=Math.pow(1+r,n);
    const f=pv*p1+pmt*(1+r*t)*(p1-1)/r+fv;
    const df=pv*n*Math.pow(1+r,n-1)+pmt*(t*(p1-1)/r+((1+r*t)*n*Math.pow(1+r,n-1)/r-(1+r*t)*(p1-1)/(r*r)));
    const rn=r-f/df;
    if(Math.abs(rn-r)<1e-9){return rn;}
    r=rn;
  }
  return r;
}

export default function FinanceCalculator() {
  const [solve, setSolve] = useState("pmt");
  const [n,   setN]   = useState("60");
  const [r,   setR]   = useState("5");
  const [pv,  setPV]  = useState("20000");
  const [pmt, setPMT] = useState("");
  const [fv,  setFV]  = useState("0");
  const [freq, setFreq] = useState("monthly");
  const [type, setType] = useState("end");
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");

  function calculate() {
    setErr(""); setResult(null);
    const perYear = freq==="monthly"?12:freq==="quarterly"?4:freq==="semi-annual"?2:1;
    const nVal=p(n), rVal=p(r), pvVal=p(pv), pmtVal=p(pmt), fvVal=p(fv);
    const beg = type==="beginning";

    if(solve!=="n"  && nVal===null)   { setErr("Number of periods required."); return; }
    if(solve!=="r"  && rVal===null)   { setErr("Interest rate required."); return; }
    if(solve!=="pv" && pvVal===null)  { setErr("Present value required."); return; }
    if(solve!=="pmt"&& pmtVal===null) { setErr("Payment required."); return; }
    if(solve!=="fv" && fvVal===null)  { setErr("Future value required."); return; }

    const rPer = rVal!==null ? rVal/100/perYear : null;

    try {
      let ans;
      if(solve==="pmt"){
        const rp=rPer, nn=nVal, pv0=pvVal, fv0=fvVal;
        const t=beg?1:0;
        ans = (rp===0) ? -(pv0+fv0)/nn : (-pv0*Math.pow(1+rp,nn)-fv0)/(( (Math.pow(1+rp,nn)-1)/rp )*(1+rp*t));
        const totalPay=ans*nVal, totalInt=totalPay+pvVal;
        setResult({ label:"Payment (PMT)", value:fmt(ans), rows:[
          ["Present Value",fmt(pvVal)],["Future Value",fmt(fvVal)],
          ["Number of Payments",nVal.toString()],["Periodic Rate",fmtp(rPer*100)],
          ["Total Payments",fmt(totalPay)],["Total Interest",fmt(totalInt)],
        ]});
      } else if(solve==="pv"){
        const rp=rPer, nn=nVal, pmt0=pmtVal, fv0=fvVal;
        const t=beg?1:0;
        ans = (rp===0) ? -(pmt0*nn+fv0) : (-pmt0*(1+rp*t)*(Math.pow(1+rp,nn)-1)/rp-fv0)/Math.pow(1+rp,nn);
        setResult({ label:"Present Value (PV)", value:fmt(ans), rows:[
          ["Future Value",fmt(fvVal)],["Payment",fmt(pmtVal)],
          ["Number of Periods",nVal.toString()],["Periodic Rate",fmtp(rPer*100)],
        ]});
      } else if(solve==="fv"){
        const rp=rPer, nn=nVal, pmt0=pmtVal, pv0=pvVal;
        const t=beg?1:0;
        ans = (rp===0) ? -(pv0+pmt0*nn) : -(pv0*Math.pow(1+rp,nn)+pmt0*(1+rp*t)*(Math.pow(1+rp,nn)-1)/rp);
        setResult({ label:"Future Value (FV)", value:fmt(ans), rows:[
          ["Present Value",fmt(pvVal)],["Payment",fmt(pmtVal)],
          ["Number of Periods",nVal.toString()],["Periodic Rate",fmtp(rPer*100)],
        ]});
      } else if(solve==="n"){
        const rp=rPer, pmt0=pmtVal, pv0=pvVal, fv0=fvVal;
        const t=beg?1:0;
        if(rp===0){ ans=-(pv0+fv0)/pmt0; }
        else {
          const num=-fv0*rp+pmt0*(1+rp*t);
          const den=pv0*rp+pmt0*(1+rp*t);
          ans=Math.log(num/den)/Math.log(1+rp);
        }
        setResult({ label:"Number of Periods (N)", value:ans.toFixed(4)+" periods", rows:[
          ["Present Value",fmt(pvVal)],["Future Value",fmt(fvVal)],
          ["Payment",fmt(pmtVal)],["Periodic Rate",fmtp(rPer*100)],
        ]});
      } else if(solve==="r"){
        const nn=nVal, pmt0=pmtVal, pv0=pvVal, fv0=fvVal;
        const rr=solveRate(nn,pmt0,pv0,fv0,beg);
        const annual=rr*perYear*100;
        setResult({ label:"Annual Interest Rate", value:annual.toFixed(4)+"%", rows:[
          ["Present Value",fmt(pvVal)],["Future Value",fmt(fvVal)],
          ["Payment",fmt(pmtVal)],["Number of Periods",nVal.toString()],
          ["Periodic Rate",fmtp(rr*100)],
        ]});
      }
    } catch(e){ setErr("Could not solve — check inputs."); }
  }

  const fields = [
    { key:"n",   label:"Number of Periods (N)",      val:n,   set:setN,   show:solve!=="n" },
    { key:"r",   label:"Annual Interest Rate (%)",   val:r,   set:setR,   show:solve!=="r" },
    { key:"pv",  label:"Present Value (PV)",         val:pv,  set:setPV,  show:solve!=="pv" },
    { key:"pmt", label:"Payment (PMT)",              val:pmt, set:setPMT, show:solve!=="pmt" },
    { key:"fv",  label:"Future Value (FV)",          val:fv,  set:setFV,  show:solve!=="fv" },
  ];

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Finance Calculator</h1>
        <p className="muted">Solve for any TVM variable — payment, present value, future value, rate, or number of periods.</p>
      </header>
      <div style={{maxWidth:1100,margin:"0 auto",display:"flex",gap:20,flexWrap:"wrap",alignItems:"flex-start"}}>
        <section className="card" style={{flex:"0 0 340px",minWidth:280}}>
          <div style={fst}>
            <label style={lst}>Solve For</label>
            <select style={ist} value={solve} onChange={e=>{setSolve(e.target.value);setResult(null);setErr("");}}>
              <option value="pmt">Payment (PMT)</option>
              <option value="pv">Present Value (PV)</option>
              <option value="fv">Future Value (FV)</option>
              <option value="n">Number of Periods (N)</option>
              <option value="r">Interest Rate (I/Y)</option>
            </select>
          </div>
          {fields.filter(f=>f.show).map(f=>(
            <div key={f.key} style={fst}><label style={lst}>{f.label}</label><input style={ist} value={f.val} onChange={e=>f.set(e.target.value)}/></div>
          ))}
          <div style={{display:"flex",gap:10,marginBottom:14}}>
            <div style={{flex:1}}>
              <label style={lst}>Frequency</label>
              <select style={ist} value={freq} onChange={e=>setFreq(e.target.value)}>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="semi-annual">Semi-Annual</option>
                <option value="annually">Annually</option>
              </select>
            </div>
            <div style={{flex:1}}>
              <label style={lst}>Payment Timing</label>
              <select style={ist} value={type} onChange={e=>setType(e.target.value)}>
                <option value="end">End of Period</option>
                <option value="beginning">Beginning</option>
              </select>
            </div>
          </div>
          {err && <p style={{color:"#ef4444",fontSize:13,marginBottom:10}}>{err}</p>}
          <button className="btn" style={{width:"100%",marginBottom:8}} onClick={calculate}>Calculate</button>
          <button className="btn-sec" style={{width:"100%"}} onClick={()=>{setResult(null);setErr("");}}>Clear</button>
        </section>

        {result && (
          <section className="card" style={{flex:1,minWidth:260}}>
            <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:12,padding:"16px 20px",marginBottom:20}}>
              <div style={{fontSize:13,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>{result.label}</div>
              <div style={{fontSize:32,fontWeight:900,color:"#16a34a"}}>{result.value}</div>
            </div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <tbody>
                {result.rows.map(([l,v])=>(
                  <tr key={l} style={{borderBottom:"1px solid rgba(99,102,241,0.08)"}}>
                    <td style={{padding:"8px 6px",color:"#6b7a9e",fontWeight:700}}>{l}</td>
                    <td style={{padding:"8px 6px",color:"#1e1b4b",fontWeight:700,textAlign:"right"}}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </div>
  );
}
