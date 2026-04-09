import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmtD = (n) => "$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const fmtP = (n) => n.toFixed(2)+"%";
const p    = (s) => { const v=parseFloat(String(s??"").replace(/,/g,"")); return isNaN(v)?null:v; };

const ist={width:"100%",background:"#f8f9ff",color:"#1e1b4b",border:"1.5px solid rgba(99,102,241,0.2)",borderRadius:12,padding:"9px 12px",fontSize:14,fontWeight:600,outline:"none",boxSizing:"border-box"};
const lst={display:"block",fontSize:11,fontWeight:700,color:"#6b7a9e",marginBottom:5,letterSpacing:"0.4px",textTransform:"uppercase"};
const fst={marginBottom:14};

export default function DiscountCalculator() {
  const [mode, setMode] = useState("pct"); // pct, final, original
  const [original,  setOriginal]  = useState("100");
  const [discount,  setDiscount]  = useState("20");
  const [finalPrice,setFinalPrice]= useState("80");
  const [qty,       setQty]       = useState("1");
  const [tax,       setTax]       = useState("0");
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");

  function calculate() {
    setErr(""); setResult(null);
    const q=p(qty)||1, taxPct=(p(tax)||0)/100;

    if(mode==="pct"){
      const orig=p(original), disc=p(discount);
      if(orig===null||disc===null){ setErr("Fill in all fields."); return; }
      const savings=orig*disc/100;
      const sale=orig-savings;
      const taxAmt=sale*taxPct;
      setResult({orig,disc,savings,sale,taxAmt,total:(sale+taxAmt)*q,perItem:sale+taxAmt,q});
    } else if(mode==="final"){
      const orig=p(original), fin=p(finalPrice);
      if(orig===null||fin===null){ setErr("Fill in all fields."); return; }
      const savings=orig-fin;
      const disc=(savings/orig)*100;
      const taxAmt=fin*taxPct;
      setResult({orig,disc,savings,sale:fin,taxAmt,total:(fin+taxAmt)*q,perItem:fin+taxAmt,q});
    } else {
      const fin=p(finalPrice), disc=p(discount);
      if(fin===null||disc===null){ setErr("Fill in all fields."); return; }
      const orig=fin/(1-disc/100);
      const savings=orig-fin;
      const taxAmt=fin*taxPct;
      setResult({orig,disc,savings,sale:fin,taxAmt,total:(fin+taxAmt)*q,perItem:fin+taxAmt,q});
    }
  }

  const tabSt=(a)=>({flex:1,padding:"7px",borderRadius:8,border:"1.5px solid rgba(99,102,241,0.25)",background:a?"#4f46e5":"#f8f9ff",color:a?"#fff":"#4f46e5",fontWeight:700,fontSize:12,cursor:"pointer"});

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Discount Calculator</h1>
        <p className="muted">Calculate sale prices, savings, and total costs with discounts and optional sales tax.</p>
      </header>
      <div style={{maxWidth:900,margin:"0 auto",display:"flex",gap:20,flexWrap:"wrap",alignItems:"flex-start"}}>
        <section className="card" style={{flex:"0 0 300px",minWidth:260}}>
          <div style={{display:"flex",gap:6,marginBottom:16}}>
            <button style={tabSt(mode==="pct")}      onClick={()=>{setMode("pct");setResult(null);}}>% Off</button>
            <button style={tabSt(mode==="final")}    onClick={()=>{setMode("final");setResult(null);}}>Final Price</button>
            <button style={tabSt(mode==="original")} onClick={()=>{setMode("original");setResult(null);}}>Original Price</button>
          </div>

          {(mode==="pct"||mode==="final") && (
            <div style={fst}><label style={lst}>Original Price</label><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={original} onChange={e=>setOriginal(e.target.value)}/></div></div>
          )}
          {(mode==="pct"||mode==="original") && (
            <div style={fst}><label style={lst}>Discount (%)</label><div style={{display:"flex",alignItems:"center",gap:6}}><input style={ist} value={discount} onChange={e=>setDiscount(e.target.value)}/><span style={{color:"#6366f1",fontWeight:700}}>%</span></div></div>
          )}
          {(mode==="final"||mode==="original") && (
            <div style={fst}><label style={lst}>Final (Sale) Price</label><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:"#6366f1",fontWeight:700}}>$</span><input style={ist} value={finalPrice} onChange={e=>setFinalPrice(e.target.value)}/></div></div>
          )}
          <div style={fst}><label style={lst}>Quantity</label><input style={ist} value={qty} onChange={e=>setQty(e.target.value)}/></div>
          <div style={fst}><label style={lst}>Sales Tax (%)</label><div style={{display:"flex",alignItems:"center",gap:6}}><input style={ist} value={tax} onChange={e=>setTax(e.target.value)}/><span style={{color:"#6366f1",fontWeight:700}}>%</span></div></div>
          {err && <p style={{color:"#ef4444",fontSize:13,marginBottom:10}}>{err}</p>}
          <button className="btn" style={{width:"100%",marginBottom:8}} onClick={calculate}>Calculate</button>
          <button className="btn-sec" style={{width:"100%"}} onClick={()=>{setResult(null);setErr("");}}>Clear</button>
        </section>

        {result && (
          <section className="card" style={{flex:1,minWidth:240}}>
            <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:12,padding:"16px 20px",marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:13,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>You Save</div>
                <div style={{fontSize:36,fontWeight:900,color:"#16a34a"}}>{fmtD(result.savings)}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:28,fontWeight:900,color:"#4f46e5"}}>{fmtP(result.disc)} off</div>
              </div>
            </div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:14}}>
              <tbody>
                {[["Original Price",fmtD(result.orig)],["Discount",fmtP(result.disc)+" ("+fmtD(result.savings)+")"],["Sale Price",fmtD(result.sale)],["Sales Tax",fmtD(result.taxAmt)],["Price per Item",fmtD(result.perItem)],["Quantity","×"+result.q],["Total Cost",fmtD(result.total)]].map(([l,v])=>(
                  <tr key={l} style={{borderBottom:"1px solid rgba(99,102,241,0.08)"}}>
                    <td style={{padding:"10px 6px",color:"#6b7a9e",fontWeight:700}}>{l}</td>
                    <td style={{padding:"10px 6px",color:"#1e1b4b",fontWeight:800,textAlign:"right",fontSize:15}}>{v}</td>
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
