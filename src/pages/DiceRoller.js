import React, { useState, useCallback } from "react";
import "../css/CalcBase.css";

const DIE_TYPES = [4, 6, 8, 10, 12, 20, 100];
const FACES = { 4: "▲", 6: "⬡", 8: "◆", 10: "⬟", 12: "⬠", 20: "△", 100: "⬡" };

function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

function dieFaceColor(sides) {
  const colors = { 4: "#ef4444", 6: "#3b82f6", 8: "#8b5cf6", 10: "#06b6d4", 12: "#22c55e", 20: "#f59e0b", 100: "#ec4899" };
  return colors[sides] || "#6b7a9e";
}

export default function DiceRoller() {
  const [numDice, setNumDice] = useState(2);
  const [dieType, setDieType] = useState(6);
  const [modifier,setModifier]= useState("0");
  const [results,  setResults] = useState([]);
  const [history,  setHistory] = useState([]);

  const roll = useCallback(() => {
    const rolls = Array.from({ length: numDice }, () => rollDie(dieType));
    const mod   = parseInt(modifier) || 0;
    const sum   = rolls.reduce((a, b) => a + b, 0) + mod;
    setResults(rolls);
    setHistory(prev => [{ numDice, dieType, rolls, mod, sum, id: Date.now() }, ...prev.slice(0, 9)]);
  }, [numDice, dieType, modifier]);

  const sum = results.length > 0 ? results.reduce((a, b) => a + b, 0) + (parseInt(modifier) || 0) : null;
  const min = numDice * 1 + (parseInt(modifier) || 0);
  const max = numDice * dieType + (parseInt(modifier) || 0);
  const avg = numDice * (dieType + 1) / 2 + (parseInt(modifier) || 0);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Dice Roller</h1>
        <p className="muted">Roll any number of dice with any number of sides. Supports modifiers and keeps a roll history.</p>
      </header>
      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Roll Settings</h2>
          <div className="row two">
            <div className="field"><label>Number of Dice</label>
              <input type="number" min="1" max="20" value={numDice} onChange={e => setNumDice(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))} /></div>
            <div className="field"><label>Modifier (+/−)</label>
              <input type="number" value={modifier} onChange={e => setModifier(e.target.value)} /></div>
          </div>

          <div className="field">
            <label>Die Type</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
              {DIE_TYPES.map(d => (
                <button key={d} onClick={() => setDieType(d)} style={{
                  padding: "10px 14px", borderRadius: 10, border: "2px solid",
                  borderColor: dieType === d ? dieFaceColor(d) : "#d1d5db",
                  background: dieType === d ? dieFaceColor(d) : "white",
                  color: dieType === d ? "white" : "#374151",
                  fontWeight: 800, cursor: "pointer", fontSize: 14, minWidth: 56
                }}>d{d}</button>
              ))}
            </div>
          </div>

          <button className="btn-primary" onClick={roll} style={{ marginTop: 14, fontSize: 16, padding: "12px 28px" }}>
            🎲 Roll {numDice}d{dieType}{parseInt(modifier) !== 0 ? (parseInt(modifier) > 0 ? `+${modifier}` : modifier) : ""}
          </button>

          {results.length > 0 && (
            <>
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", marginBottom: 10 }}>Individual Rolls</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {results.map((r, i) => (
                    <div key={i} style={{
                      width: 56, height: 56, borderRadius: 10,
                      background: dieFaceColor(dieType), color: "white",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 20, fontWeight: 900,
                      boxShadow: r === dieType ? "0 0 0 3px #fbbf24" : undefined
                    }}>{r}</div>
                  ))}
                </div>
                {parseInt(modifier) !== 0 && (
                  <div style={{ marginTop: 8, fontSize: 13, color: "#6b7a9e" }}>
                    Modifier: <strong>{parseInt(modifier) > 0 ? "+" : ""}{modifier}</strong>
                  </div>
                )}
              </div>
              <div style={{ marginTop: 14, padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", marginBottom: 4 }}>Total</div>
                <div style={{ fontSize: 44, fontWeight: 900, color: "#4f46e5" }}>{sum}</div>
                {results.length > 1 && <div style={{ fontSize: 12, color: "#6b7a9e" }}>Individual: {results.join(" + ")}{parseInt(modifier) !== 0 ? ` ${parseInt(modifier) > 0 ? "+" : ""}${modifier}` : ""} = {sum}</div>}
              </div>
            </>
          )}

          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, color: "#6b7a9e" }}>
              Range: <strong>{min}</strong> – <strong>{max}</strong> &nbsp;|&nbsp; Average: <strong>{avg.toFixed(1)}</strong>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="card-title">Roll History</h2>
          {history.length === 0
            ? <p className="small">No rolls yet. Roll the dice!</p>
            : <table className="table" style={{ marginBottom: 14 }}>
                <thead><tr><th>Roll</th><th>Dice</th><th>Results</th><th>Total</th></tr></thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={h.id} style={i === 0 ? { background: "#f0eeff" } : {}}>
                      <td style={{ fontFamily: "monospace", color: "#6b7a9e" }}>#{history.length - i}</td>
                      <td style={{ fontFamily: "monospace" }}>{h.numDice}d{h.dieType}{h.mod !== 0 ? (h.mod > 0 ? `+${h.mod}` : h.mod) : ""}</td>
                      <td style={{ fontFamily: "monospace", fontSize: 12 }}>{h.rolls.join(", ")}</td>
                      <td style={{ fontWeight: 800, color: i === 0 ? "#4f46e5" : undefined }}>{h.sum}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
          {history.length > 0 && (
            <button onClick={() => setHistory([])} style={{ background: "none", border: "1px solid #d1d5db", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13, color: "#6b7a9e" }}>
              Clear History
            </button>
          )}

          <h3 className="card-title" style={{ marginTop: 16 }}>Common Dice in RPGs</h3>
          <table className="table">
            <thead><tr><th>Die</th><th>Range</th><th>Common Use</th></tr></thead>
            <tbody>
              {[["d4","1–4","Dagger damage, magic missile"],["d6","1–6","Most weapons, attributes"],["d8","1–8","Longsword, hit dice"],["d10","1–10","Heavy weapons, percentile"],["d12","1–12","Greataxe, Barbarian HD"],["d20","1–20","Attack rolls, saving throws"],["d100","1–100","Percentile, random tables"]].map(([d,r,u]) =>
                <tr key={d}><td style={{ fontFamily: "monospace", color: dieFaceColor(parseInt(d.slice(1))), fontWeight: 700 }}>{d}</td><td style={{ fontFamily: "monospace" }}>{r}</td><td style={{ fontSize: 12 }}>{u}</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
