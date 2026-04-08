import React, { useState } from "react";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

const fmt  = (n) => { if (!isFinite(n) || isNaN(n)) return "—"; return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
const parseN = (s) => { const v = parseFloat(String(s ?? "").replace(/,/g, "")); return isNaN(v) ? 0 : v; };

const ist = { width: "100%", background: "#f8f9ff", color: "#1e1b4b", border: "1.5px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: "9px 12px", fontSize: 14, fontWeight: 600, outline: "none", boxSizing: "border-box" };
const lst = { display: "block", fontSize: 11, fontWeight: 700, color: "#6b7a9e", marginBottom: 5, letterSpacing: "0.4px", textTransform: "uppercase" };
const fst = { marginBottom: 14 };
const sym = { color: "#6b7a9e", fontWeight: 700, flexShrink: 0 };

// Full Retirement Age by birth year
function getFRA(birthYear) {
  if (birthYear <= 1954) return 66;
  if (birthYear === 1955) return 66 + 2/12;
  if (birthYear === 1956) return 66 + 4/12;
  if (birthYear === 1957) return 66 + 6/12;
  if (birthYear === 1958) return 66 + 8/12;
  if (birthYear === 1959) return 66 + 10/12;
  return 67;
}

function fraLabel(birthYear) {
  if (birthYear <= 1954) return "66";
  if (birthYear === 1955) return "66 years 2 months";
  if (birthYear === 1956) return "66 years 4 months";
  if (birthYear === 1957) return "66 years 6 months";
  if (birthYear === 1958) return "66 years 8 months";
  if (birthYear === 1959) return "66 years 10 months";
  return "67";
}

// Simplified PIA calculation using 2024 bend points
// AIME = estimated Average Indexed Monthly Earnings
function calcPIA(aime) {
  const b1 = 1174, b2 = 7078;
  let pia = 0;
  pia += Math.min(aime, b1) * 0.90;
  if (aime > b1) pia += Math.min(aime - b1, b2 - b1) * 0.32;
  if (aime > b2) pia += (aime - b2) * 0.15;
  return pia;
}

// Benefit adjustment for claiming age vs FRA
function adjustedBenefit(pia, retireAge, fra) {
  const monthsDiff = Math.round((retireAge - fra) * 12);
  if (monthsDiff === 0) return pia;
  if (monthsDiff < 0) {
    // Early claiming reduction
    const earlyMonths = -monthsDiff;
    const first36 = Math.min(earlyMonths, 36);
    const beyond  = Math.max(earlyMonths - 36, 0);
    const reduction = (first36 * 5 / 9 / 100) + (beyond * 5 / 12 / 100);
    return pia * (1 - reduction);
  } else {
    // Delayed retirement credits: +8% per year (up to age 70)
    const cappedMonths = Math.min(monthsDiff, (70 - fra) * 12);
    const increase = cappedMonths * (8 / 12 / 100);
    return pia * (1 + increase);
  }
}

const currentYear = new Date().getFullYear();

export default function SocialSecurityCalculator() {
  const [birthYear, setBirthYear]   = useState("1970");
  const [income, setIncome]         = useState("60000");
  const [retireAge, setRetireAge]   = useState("67");
  const [result, setResult]         = useState(null);
  const [err, setErr]               = useState("");

  function calculate() {
    setErr(""); setResult(null);
    const by = parseInt(birthYear, 10);
    const inc = parseN(income);
    const ra = parseN(retireAge);
    if (isNaN(by) || by < 1924 || by > currentYear - 18) { setErr("Please enter a valid birth year."); return; }
    if (!(inc > 0)) { setErr("Please enter a valid annual income."); return; }
    if (ra < 62 || ra > 70) { setErr("Retirement age must be between 62 and 70."); return; }

    const fra = getFRA(by);
    // Estimate AIME from annual income (simplified: assume career average ≈ current income)
    const aime = inc / 12;
    const pia  = calcPIA(aime);
    const monthlyBenefit = adjustedBenefit(pia, ra, fra);
    const annualBenefit  = monthlyBenefit * 12;
    const retireYear     = by + ra;
    const yearsToCollect = Math.max(88 - ra, 1); // rough life expectancy proxy
    const lifetimeBenefit = monthlyBenefit * 12 * yearsToCollect;

    // Calculate at 62, FRA, and 70 for comparison
    const at62  = adjustedBenefit(pia, 62, fra) * 12;
    const atFRA = pia * 12;
    const at70  = adjustedBenefit(pia, 70, fra) * 12;

    setResult({ monthlyBenefit, annualBenefit, lifetimeBenefit, retireYear, fra, fraLabel: fraLabel(by), aime, pia, ra, at62, atFRA, at70 });
  }

  function clear() { setBirthYear("1970"); setIncome("60000"); setRetireAge("67"); setResult(null); setErr(""); }

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Social Security Calculator</h1>
        <p className="muted">Estimate your Social Security retirement benefit based on your birth year, income, and planned retirement age.</p>
      </header>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 20 }}>
          <section className="card" style={{ flex: "0 0 312px", minWidth: 268 }}>
            <div style={fst}>
              <label style={lst}>Year of Birth</label>
              <input style={ist} value={birthYear} onChange={e => setBirthYear(e.target.value)} placeholder="e.g. 1970" />
            </div>
            <div style={fst}>
              <label style={lst}>Current Annual Income</label>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={sym}>$</span>
                <input style={ist} value={income} onChange={e => setIncome(e.target.value)} />
              </div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 5 }}>Used as an estimate of your career average earnings.</div>
            </div>
            <div style={fst}>
              <label style={lst}>Planned Retirement Age (62–70)</label>
              <input style={ist} value={retireAge} onChange={e => setRetireAge(e.target.value)} />
            </div>
            {err && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 10 }}>{err}</p>}
            <button className="btn" style={{ width: "100%", marginBottom: 8 }} onClick={calculate}>Calculate</button>
            <button className="btn-sec" style={{ width: "100%" }} onClick={clear}>Clear</button>
          </section>

          {result && (
            <section className="card" style={{ flex: 1, minWidth: 260 }}>
              <h3 style={{ margin: "0 0 6px", color: "#1e1b4b", fontWeight: 800, fontSize: 16 }}>Estimated Benefit</h3>
              <p style={{ margin: "0 0 20px", fontSize: 12, color: "#9ca3af" }}>
                Full Retirement Age (FRA): <strong style={{ color: "#4f46e5" }}>{result.fraLabel}</strong> &nbsp;|&nbsp; Retirement year: <strong style={{ color: "#4f46e5" }}>{result.retireYear}</strong>
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px 18px", marginBottom: 24 }}>
                {[
                  ["Monthly Benefit", fmt(result.monthlyBenefit)],
                  ["Annual Benefit", fmt(result.annualBenefit)],
                  ["Est. Lifetime Benefit", fmt(result.lifetimeBenefit)],
                ].map(([l, v]) => (
                  <div key={l} style={{ background: "#f0f0ff", borderRadius: 10, padding: "14px 16px" }}>
                    <div style={{ fontSize: 11, color: "#6b7a9e", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>{l}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#4f46e5" }}>{v}</div>
                  </div>
                ))}
              </div>

              <h4 style={{ margin: "0 0 12px", fontWeight: 700, color: "#1e1b4b", fontSize: 14 }}>Annual Benefit by Claiming Age</h4>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: "#f0f0ff" }}>
                      {["Claiming Age", "Monthly Benefit", "Annual Benefit", "vs. FRA"].map(h => (
                        <th key={h} style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: "#4f46e5", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[62, Math.round(result.fra), 70].map((age, i) => {
                      const annual = [result.at62, result.atFRA, result.at70][i];
                      const diff   = annual - result.atFRA;
                      const isSelected = Math.round(result.ra) === age;
                      return (
                        <tr key={age} style={{ borderBottom: "1px solid rgba(99,102,241,0.08)", background: isSelected ? "#eef2ff" : i % 2 === 0 ? "#fafbff" : "#fff" }}>
                          <td style={{ padding: "9px 12px", textAlign: "right", fontWeight: isSelected ? 800 : 600, color: isSelected ? "#4f46e5" : "#1e1b4b" }}>Age {age}{isSelected ? " ★" : ""}</td>
                          <td style={{ padding: "9px 12px", textAlign: "right" }}>{fmt(annual / 12)}</td>
                          <td style={{ padding: "9px 12px", textAlign: "right", fontWeight: 700 }}>{fmt(annual)}</td>
                          <td style={{ padding: "9px 12px", textAlign: "right", color: diff > 0 ? "#16a34a" : diff < 0 ? "#ef4444" : "#6b7a9e", fontWeight: 700 }}>
                            {diff === 0 ? "—" : (diff > 0 ? "+" : "") + fmt(diff)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 14 }}>
                Estimates use 2024 SSA bend points and are for planning purposes only. Actual benefits depend on your complete earnings history. Visit ssa.gov for your official estimate.
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
