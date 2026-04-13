import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

function loveScore(name1, name2) {
  const combined = (name1 + name2).toUpperCase().replace(/[^A-Z]/g, "");
  const letters  = "LOVES";
  const counts   = letters.split("").map(l => combined.split("").filter(c => c === l).length);
  let arr = counts;
  while (arr.length > 2) {
    const next = [];
    for (let i = 0; i < arr.length - 1; i++) {
      next.push((arr[i] + arr[i + 1]) % 10);
    }
    arr = next;
  }
  return arr[0] * 10 + (arr[1] || 0);
}

function getMessage(score) {
  if (score >= 90) return { text: "Soulmates! A perfect match made in heaven.", color: "#4f46e5" };
  if (score >= 80) return { text: "Amazing compatibility — you two are great together!", color: "#16a34a" };
  if (score >= 70) return { text: "Strong connection with great potential.", color: "#16a34a" };
  if (score >= 60) return { text: "Good match — with a little effort this could be wonderful.", color: "#d97706" };
  if (score >= 50) return { text: "Average compatibility — keep getting to know each other.", color: "#d97706" };
  if (score >= 40) return { text: "Some differences, but opposites can attract!", color: "#ea580c" };
  if (score >= 30) return { text: "Challenging match — communication is key.", color: "#dc2626" };
  return { text: "Difficult match — but love can overcome anything!", color: "#dc2626" };
}

function heartBar(score) {
  const filled = Math.round(score / 10);
  return Array.from({ length: 10 }, (_, i) => i < filled ? "❤️" : "🤍").join("");
}

export default function LoveCalculator() {
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [calculated, setCalculated] = useState(false);

  const score = useMemo(() => {
    if (!calculated || !name1.trim() || !name2.trim()) return null;
    return loveScore(name1.trim(), name2.trim());
  }, [name1, name2, calculated]);

  const msg = score !== null ? getMessage(score) : null;

  const handleCalculate = () => {
    if (name1.trim() && name2.trim()) setCalculated(true);
  };

  const handleReset = () => { setName1(""); setName2(""); setCalculated(false); };

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Love Calculator</h1>
        <p className="muted">Enter two names to calculate your love compatibility score. Just for fun — no science involved!</p>
      </header>
      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Enter Names</h2>
          <div className="row two">
            <div className="field"><label>Your Name</label>
              <input type="text" placeholder="Enter your name" value={name1} onChange={e => { setName1(e.target.value); setCalculated(false); }} /></div>
            <div className="field"><label>Their Name</label>
              <input type="text" placeholder="Enter their name" value={name2} onChange={e => { setName2(e.target.value); setCalculated(false); }} /></div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button className="btn-primary" onClick={handleCalculate} disabled={!name1.trim() || !name2.trim()}>
              Calculate Love ❤️
            </button>
            <button onClick={handleReset} style={{ padding: "10px 18px", borderRadius: 10, border: "1.5px solid #d1d5db", background: "white", cursor: "pointer", fontWeight: 600 }}>
              Reset
            </button>
          </div>

          {score !== null && (
            <div style={{ marginTop: 18, textAlign: "center" }}>
              <div style={{ fontSize: 13, color: "#6b7a9e", marginBottom: 6 }}>{name1} + {name2}</div>
              <div style={{ fontSize: 20, marginBottom: 10 }}>{heartBar(score)}</div>
              <div style={{ fontSize: 64, fontWeight: 900, color: msg.color, lineHeight: 1 }}>{score}%</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: msg.color, marginTop: 8 }}>{msg.text}</div>
              <div style={{ marginTop: 16, padding: "12px 16px", background: "#fdf2f8", borderRadius: 12 }}>
                <div style={{ fontSize: 12, color: "#9d174d", fontWeight: 600 }}>Fun compatibility breakdown</div>
                {["LOVES"].map(word => {
                  const combined = (name1 + name2).toUpperCase();
                  const counts = word.split("").map(l => (combined.match(new RegExp(l, "g")) || []).length);
                  return (
                    <div key={word} style={{ fontFamily: "monospace", fontSize: 12, color: "#6b7a9e", marginTop: 4 }}>
                      {word.split("").map((l, i) => `${l}:${counts[i]}`).join("  ")}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">Compatibility Scale</h2>
          <table className="table" style={{ marginBottom: 14 }}>
            <thead><tr><th>Score</th><th>Meaning</th></tr></thead>
            <tbody>
              {[["90–100%","Soulmates"],["80–89%","Amazing match"],["70–79%","Great together"],["60–69%","Good potential"],["50–59%","Average match"],["40–49%","Some differences"],["30–39%","Challenging"],["0–29%","Very different"]].map(([s,m]) =>
                <tr key={s}><td style={{ fontFamily: "monospace" }}>{s}</td><td>{m}</td></tr>
              )}
            </tbody>
          </table>
          <div style={{ padding: "14px 16px", background: "#fdf2f8", borderRadius: 12, border: "1px solid #fbcfe8" }}>
            <div style={{ fontWeight: 700, color: "#9d174d", fontSize: 13 }}>🎉 Just for fun!</div>
            <p style={{ fontSize: 12, color: "#6b7a9e", marginTop: 6 }}>
              This calculator uses a letter-counting algorithm — similar to playground "FLAMES" games. Real compatibility comes from shared values, respect, and communication!
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
