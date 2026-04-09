import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

// Static approximate rates relative to USD (as of mid-2025)
const RATES = {
  USD:1, EUR:0.92, GBP:0.79, JPY:149.5, CAD:1.36, AUD:1.53, CHF:0.89,
  CNY:7.24, INR:83.2, MXN:17.1, BRL:4.97, KRW:1320, SGD:1.34, HKD:7.82,
  NOK:10.6, SEK:10.4, DKK:6.88, NZD:1.64, ZAR:18.4, AED:3.67, SAR:3.75,
  TRY:32.5, THB:35.1, IDR:15700, MYR:4.67, PHP:56.2, PKR:278, EGP:30.9,
  NGN:1310, KES:127, GHS:12.3, IQD:1310, VND:24300, UAH:38.9, PLN:3.97,
  CZK:23.1, HUF:358, RON:4.59, BGN:1.80, HRK:7.53, RSD:108, RUB:87.5,
  QAR:3.64, KWD:0.31, BHD:0.377, OMR:0.385, JOD:0.71, LBP:89500, ILS:3.71,
};

const CURRENCY_NAMES = {
  USD:"US Dollar",EUR:"Euro",GBP:"British Pound",JPY:"Japanese Yen",
  CAD:"Canadian Dollar",AUD:"Australian Dollar",CHF:"Swiss Franc",
  CNY:"Chinese Yuan",INR:"Indian Rupee",MXN:"Mexican Peso",
  BRL:"Brazilian Real",KRW:"South Korean Won",SGD:"Singapore Dollar",
  HKD:"Hong Kong Dollar",NOK:"Norwegian Krone",SEK:"Swedish Krona",
  DKK:"Danish Krone",NZD:"New Zealand Dollar",ZAR:"South African Rand",
  AED:"UAE Dirham",SAR:"Saudi Riyal",TRY:"Turkish Lira",
  THB:"Thai Baht",IDR:"Indonesian Rupiah",MYR:"Malaysian Ringgit",
  PHP:"Philippine Peso",PKR:"Pakistani Rupee",EGP:"Egyptian Pound",
  NGN:"Nigerian Naira",KES:"Kenyan Shilling",GHS:"Ghanaian Cedi",
  VND:"Vietnamese Dong",UAH:"Ukrainian Hryvnia",PLN:"Polish Zloty",
  CZK:"Czech Koruna",HUF:"Hungarian Forint",RON:"Romanian Leu",
  BGN:"Bulgarian Lev",RUB:"Russian Ruble",QAR:"Qatari Riyal",
  KWD:"Kuwaiti Dinar",BHD:"Bahraini Dinar",OMR:"Omani Rial",
  JOD:"Jordanian Dinar",ILS:"Israeli Shekel",IQD:"Iraqi Dinar",
};

const fmtN = (n,dec=4)=>n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:dec});

const ist = {width:"100%",background:"#f8f9ff",color:"#1e1b4b",border:"1.5px solid rgba(99,102,241,0.2)",borderRadius:12,padding:"9px 12px",fontSize:14,fontWeight:600,outline:"none",boxSizing:"border-box"};
const lst = {display:"block",fontSize:11,fontWeight:700,color:"#6b7a9e",marginBottom:5,letterSpacing:"0.4px",textTransform:"uppercase"};

export default function CurrencyCalculator() {
  const [amount, setAmount] = useState("1");
  const [from,   setFrom]   = useState("USD");
  const [to,     setTo]     = useState("EUR");
  const [result, setResult] = useState(null);

  function convert() {
    const amt = parseFloat(amount.replace(/,/g,""));
    if(!isFinite(amt)||isNaN(amt)) return;
    const inUSD  = amt / RATES[from];
    const out    = inUSD * RATES[to];
    const rate   = RATES[to] / RATES[from];
    const invRate= RATES[from] / RATES[to];
    // Popular conversions
    const popular = ["USD","EUR","GBP","JPY","CAD","AUD","CHF","CNY","INR","MXN"]
      .filter(c=>c!==from)
      .map(c=>({ code:c, name:CURRENCY_NAMES[c]||c, val: inUSD * RATES[c] }));
    setResult({ amt, from, to, out, rate, invRate, popular });
  }

  function swap() {
    const tmp=from; setFrom(to); setTo(tmp); setResult(null);
  }

  const currencies = Object.keys(RATES).sort();

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Currency Calculator</h1>
        <p className="muted">Convert between 50+ world currencies using indicative exchange rates. Rates are approximate — for precise conversions use a live-rate service.</p>
      </header>
      <div style={{maxWidth:960,margin:"0 auto",display:"flex",gap:20,flexWrap:"wrap",alignItems:"flex-start"}}>
        <section className="card" style={{flex:"0 0 340px",minWidth:280}}>
          <div style={{marginBottom:14}}>
            <label style={lst}>Amount</label>
            <input style={ist} value={amount} onChange={e=>setAmount(e.target.value)} />
          </div>
          <div style={{display:"flex",gap:10,marginBottom:6,alignItems:"flex-end"}}>
            <div style={{flex:1}}>
              <label style={lst}>From</label>
              <select style={ist} value={from} onChange={e=>{setFrom(e.target.value);setResult(null);}}>
                {currencies.map(c=><option key={c} value={c}>{c} — {CURRENCY_NAMES[c]||c}</option>)}
              </select>
            </div>
            <button onClick={swap} style={{background:"#f0eeff",border:"1.5px solid rgba(99,102,241,0.25)",borderRadius:10,padding:"10px 12px",cursor:"pointer",fontSize:18,marginBottom:0,height:42,color:"#6366f1",fontWeight:700}}>⇄</button>
            <div style={{flex:1}}>
              <label style={lst}>To</label>
              <select style={ist} value={to} onChange={e=>{setTo(e.target.value);setResult(null);}}>
                {currencies.map(c=><option key={c} value={c}>{c} — {CURRENCY_NAMES[c]||c}</option>)}
              </select>
            </div>
          </div>
          <div style={{marginBottom:14,fontSize:12,color:"#9ca3c8"}}>
            * Rates are static approximations, not live market data.
          </div>
          <button className="btn" style={{width:"100%",marginBottom:8}} onClick={convert}>Convert</button>
        </section>

        {result && (
          <section className="card" style={{flex:1,minWidth:260}}>
            <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:12,padding:"16px 20px",marginBottom:20}}>
              <div style={{fontSize:13,color:"#6b7a9e",fontWeight:700,marginBottom:4}}>{fmtN(result.amt,2)} {result.from} =</div>
              <div style={{fontSize:34,fontWeight:900,color:"#16a34a"}}>{fmtN(result.out,2)} <span style={{fontSize:20}}>{result.to}</span></div>
              <div style={{fontSize:13,color:"#6b7a9e",marginTop:6}}>
                1 {result.from} = {fmtN(result.rate,6)} {result.to}<br/>
                1 {result.to} = {fmtN(result.invRate,6)} {result.from}
              </div>
            </div>
            <div style={{fontWeight:800,fontSize:13,color:"#6b7a9e",textTransform:"uppercase",letterSpacing:"0.4px",marginBottom:10}}>
              {fmtN(result.amt,2)} {result.from} in Popular Currencies
            </div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:"#f0f0ff"}}>
                {["Currency","Code","Value"].map(h=><th key={h} style={{padding:"7px 10px",textAlign:"left",fontWeight:700,color:"#4f46e5",fontSize:11}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {result.popular.map((r,i)=>(
                  <tr key={r.code} style={{borderBottom:"1px solid rgba(99,102,241,0.08)",background:i%2===0?"#fafbff":"#fff"}}>
                    <td style={{padding:"7px 10px",color:"#374151",fontWeight:600}}>{r.name}</td>
                    <td style={{padding:"7px 10px",color:"#6366f1",fontWeight:700}}>{r.code}</td>
                    <td style={{padding:"7px 10px",color:"#1e1b4b",fontWeight:700,textAlign:"right"}}>{fmtN(r.val,2)}</td>
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
