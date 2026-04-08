import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmt  = (n) => { if (!isFinite(n)||isNaN(n)) return "—"; return "$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}); };
const parseN = (s) => { const v=parseFloat(String(s??"").replace(/,/g,"")); return isNaN(v)?0:v; };
const ist = { width:"100%",background:"#f8f9ff",color:"#1e1b4b",border:"1.5px solid rgba(99,102,241,0.2)",borderRadius:12,padding:"9px 12px",fontSize:14,fontWeight:600,outline:"none",boxSizing:"border-box" };
const lst = { display:"block",fontSize:11,fontWeight:700,color:"#6b7a9e",marginBottom:5,letterSpacing:"0.4px",textTransform:"uppercase" };
const fst = { marginBottom:14 };
const sym = { color:"#6b7a9e",fontWeight:700,flexShrink:0 };

const COMPOUND = [
  { key:"daily", label:"Daily (365/yr)", n:365 },
  { key:"monthly", label:"Monthly", n:12 },
  { key:"quarterly", label:"Quarterly", n:4 },
  { key:"semiannual", label:"Semi-Annually", n:2 },
  { key:"annually", label:"Annually", n:1 },
];

export default function CDCalculator() {
  const [principal, setPrincipal] = useState("10000");
  const [apy,       setApy]       = useState("5.0");
  const [termY,     setTermY]     = useState("1");
  const [termM,     setTermM]     = useState("0");
  const [compFreq,  setCompFreq]  = useState("daily");
  const [result,    setResult]    = useState(null);
  const [err,       setErr]       = useState("");

  function calculate() {
    setErr(""); setResult(null);
    const P=parseN(principal), r=parseN(apy), ty=parseN(termY), tm=parseN(termM);
    if (!(P>0))   { setErr("Principal must be greater than 0."); return; }
    if (!(r>=0))  { setErr("APY must be 0 or greater."); return; }
    const totalMonths = ty*12 + tm;
    if (!(totalMonths>0)) { setErr("Term must be greater than 0."); return; }

    const n = COMPOUND.find(c=>c.key===compFreq)?.n ?? 365;
    const years = totalMonths/12;
    const maturity = P * Math.pow(1 + r/100/n, n*years);
    const interest = maturity - P;
    const effectiveApy = (Math.pow(1 + r/100/n, n) - 1) * 100;

    // Monthly schedule
    const rows=[];
    for (let m=1; m<=totalMonths; m++) {
      const mVal = P * Math.pow(1+r/100/n, n*(m/12));
      rows.push({ m, balance:mVal, interest:mVal-P });
    }
    setResult({ maturity, interest, principal:P, effectiveApy, rows, years });
  }

  function clear() { setPrincipal("10000"); setApy("5.0"); setTermY("1"); setTermM("0"); setCompFreq("daily"); setResult(null); setErr(""); }

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>CD Calculator</h1>
        <p className="muted">Calculate the maturity value and interest earned on a Certificate of Deposit (CD) based on your deposit, APY, term, and compounding frequency.</p>
      </header>
      <div style={{ maxWidth:1120,margin:"0 auto" }}>
        <div style={{ display:"flex",gap:20,alignItems:"flex-start",flexWrap:"wrap",marginBottom:20 }}>
          <section className="card" style={{ flex:"0 0 312px",minWidth:268 }}>
            <div style={fst}><label style={lst}>Initial Deposit (Principal)</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><span style={sym}>$</span><input style={ist} value={principal} onChange={e=>setPrincipal(e.target.value)} /></div></div>
            <div style={fst}><label style={lst}>Annual Percentage Yield (APY)</label><div style={{ display:"flex",alignItems:"center",gap:6 }}><input style={ist} value={apy} onChange={e=>setApy(e.target.value)} /><span style={sym}>%</span></div></div>
            <div style={fst}>
              <label style={lst}>CD Term</label>
              <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                <input style={{ ...ist,flex:1 }} value={termY} onChange={e=>setTermY(e.target.value)} />
                <span style={sym}>yr</span>
                <input style={{ ...ist,flex:1 }} value={termM} onChange={e=>setTermM(e.target.value)} />
                <span style={sym}>mo</span>
              </div>
            </div>
            <div style={fst}><label style={lst}>Compounding Frequency</label><select style={ist} value={compFreq} onChange={e=>setCompFreq(e.target.value)}>{COMPOUND.map(c=><option key={c.key} value={c.key}>{c.label}</option>)}</select></div>
            {err && <p style={{ color:"#ef4444",fontSize:13,marginBottom:10 }}>{err}</p>}
            <button className="btn" style={{ width:"100%",marginBottom:8 }} onClick={calculate}>Calculate</button>
            <button className="btn-sec" style={{ width:"100%" }} onClick={clear}>Clear</button>
          </section>

          {result && (
            <section className="card" style={{ flex:1,minWidth:260 }}>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"14px",marginBottom:22 }}>
                {[
                  ["Maturity Value",fmt(result.maturity),"#4f46e5"],
                  ["Interest Earned",fmt(result.interest),"#10b981"],
                  ["Initial Deposit",fmt(result.principal),"#1e1b4b"],
                  ["Effective APY",result.effectiveApy.toFixed(4)+"%","#f59e0b"],
                ].map(([l,v,c])=>(
                  <div key={l} style={{ background:"#f0f0ff",borderRadius:10,padding:"14px 16px" }}>
                    <div style={{ fontSize:11,color:"#6b7a9e",fontWeight:700,textTransform:"uppercase",marginBottom:4 }}>{l}</div>
                    <div style={{ fontSize:20,fontWeight:800,color:c }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                  <thead><tr style={{ background:"#f0f0ff" }}>{["Month","Interest Earned","Balance"].map(h=><th key={h} style={{ padding:"8px 12px",textAlign:"right",fontWeight:700,color:"#4f46e5" }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {result.rows.map((r,i)=>(
                      <tr key={i} style={{ borderBottom:"1px solid rgba(99,102,241,0.08)",background:i%2===0?"#fafbff":"#fff" }}>
                        <td style={{ padding:"7px 12px",fontWeight:600,color:"#1e1b4b",textAlign:"right" }}>Month {r.m}</td>
                        <td style={{ padding:"7px 12px",textAlign:"right",color:"#10b981" }}>{fmt(r.interest)}</td>
                        <td style={{ padding:"7px 12px",textAlign:"right",fontWeight:700,color:"#4f46e5" }}>{fmt(r.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
