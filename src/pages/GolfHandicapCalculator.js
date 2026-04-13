import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const fmt = (v, d = 1) => isFinite(v) ? v.toFixed(d) : "—";

function calcDiff(score, rating, slope) {
  return ((score - rating) * 113) / slope;
}

const EMPTY_ROUND = { score: "", rating: "72.0", slope: "113", holes: "18" };

export default function GolfHandicapCalculator() {
  const [rounds, setRounds] = useState(
    Array.from({ length: 5 }, (_, i) => ({ ...EMPTY_ROUND, id: i }))
  );

  const updateRound = (id, field, val) =>
    setRounds(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));
  const addRound = () =>
    setRounds(prev => [...prev, { ...EMPTY_ROUND, id: Date.now() }]);
  const removeRound = id =>
    setRounds(prev => prev.filter(r => r.id !== id));

  const result = useMemo(() => {
    const diffs = rounds.flatMap(r => {
      const sc = parseFloat(r.score), cr = parseFloat(r.rating), sl = parseFloat(r.slope);
      const h  = parseInt(r.holes) || 18;
      if (isNaN(sc) || isNaN(cr) || isNaN(sl) || sl <= 0) return [];
      let d = calcDiff(sc, cr, sl);
      if (h === 9) d = d * 2; // 9-hole adjustment
      return [{ diff: d, score: sc, rating: cr, slope: sl }];
    });
    if (diffs.length === 0) return null;
    const sorted = [...diffs].sort((a, b) => a.diff - b.diff);
    // WHS: use best N of 20 differentials
    const useCount = diffs.length <= 3 ? 1 :
                     diffs.length <= 6 ? 2 :
                     diffs.length <= 8 ? (diffs.length - 4) :
                     diffs.length <= 11 ? (diffs.length - 5) :
                     diffs.length <= 14 ? (diffs.length - 6) :
                     diffs.length <= 16 ? (diffs.length - 7) :
                     diffs.length <= 18 ? (diffs.length - 8) :
                     diffs.length <= 19 ? 10 : Math.round(diffs.length * 0.5);
    const best     = sorted.slice(0, Math.min(useCount, sorted.length));
    const avg      = best.reduce((s, d) => s + d.diff, 0) / best.length;
    const handicap = avg * 0.96;
    return { diffs, sorted, best, handicap };
  }, [rounds]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Golf Handicap Calculator</h1>
        <p className="muted">Calculate your World Handicap System (WHS) Handicap Index from recent scores, course rating, and slope rating.</p>
      </header>
      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Score Entry</h2>
          <p className="small">Enter your recent rounds. Handicap uses the best differentials from your entries.</p>
          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ minWidth: 480 }}>
              <thead>
                <tr><th>#</th><th>Score</th><th>Course Rating</th><th>Slope Rating</th><th>Holes</th><th>Differential</th><th></th></tr>
              </thead>
              <tbody>
                {rounds.map((r, i) => {
                  const sc = parseFloat(r.score), cr = parseFloat(r.rating), sl = parseFloat(r.slope);
                  const diff = (!isNaN(sc) && !isNaN(cr) && !isNaN(sl) && sl > 0) ? calcDiff(sc, cr, sl) : null;
                  return (
                    <tr key={r.id}>
                      <td style={{ fontFamily: "monospace", color: "#6b7a9e" }}>{i + 1}</td>
                      <td><input type="number" min="50" max="150" value={r.score} onChange={e => updateRound(r.id, "score", e.target.value)} style={{ width: 60, border: "1px solid #d1d5db", borderRadius: 6, padding: "4px 6px" }} /></td>
                      <td><input type="number" min="60" max="80" step="0.1" value={r.rating} onChange={e => updateRound(r.id, "rating", e.target.value)} style={{ width: 70, border: "1px solid #d1d5db", borderRadius: 6, padding: "4px 6px" }} /></td>
                      <td><input type="number" min="55" max="155" value={r.slope} onChange={e => updateRound(r.id, "slope", e.target.value)} style={{ width: 70, border: "1px solid #d1d5db", borderRadius: 6, padding: "4px 6px" }} /></td>
                      <td><select value={r.holes} onChange={e => updateRound(r.id, "holes", e.target.value)} style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: "4px 6px" }}>
                        <option value="18">18</option><option value="9">9</option>
                      </select></td>
                      <td style={{ fontFamily: "monospace", color: diff !== null ? (diff < 0 ? "#16a34a" : "#6b7a9e") : "#d1d5db" }}>{diff !== null ? fmt(diff) : "—"}</td>
                      <td><button onClick={() => removeRound(r.id)} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer" }}>✕</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button className="btn-primary" onClick={addRound} style={{ marginTop: 8 }}>+ Add Round</button>

          {result && (
            <div style={{ marginTop: 14, padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", marginBottom: 6 }}>Handicap Index (WHS)</div>
              <div style={{ fontSize: 40, fontWeight: 900, color: "#4f46e5" }}>{fmt(result.handicap)}</div>
              <div style={{ fontSize: 13, color: "#6b7a9e", marginTop: 4 }}>
                Using best {result.best.length} of {result.diffs.length} differentials × 0.96
              </div>
            </div>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">How Handicap Works</h2>
          <table className="table" style={{ marginBottom: 14 }}>
            <thead><tr><th>Rounds Available</th><th>Differentials Used</th></tr></thead>
            <tbody>
              {[[1,"Lowest 1 – 1.0"],["2–3","Lowest 1 – 1.0"],["4–5","Lowest 2 – 1.0"],["6","Lowest 2 – 1.0"],["7–8","Lowest 3 – 1.0"],["9","Lowest 4 – 1.0"],["10","Lowest 5 – 1.0"],["11–12","Lowest 6"],["13–14","Lowest 7"],["15–16","Lowest 8"],["17","Lowest 9"],["18","Lowest 9"],["19","Lowest 10"],["20","Lowest 10"]].map(([r,d]) =>
                <tr key={r}><td style={{ fontFamily: "monospace" }}>{r}</td><td style={{ fontSize: 13 }}>{d}</td></tr>
              )}
            </tbody>
          </table>
          <h3 className="card-title">Differential Formula</h3>
          <div style={{ padding: "10px 14px", background: "#f0eeff", borderRadius: 8, fontFamily: "monospace", fontSize: 14, color: "#4f46e5" }}>
            Differential = (Score − Course Rating) × 113 ÷ Slope Rating
          </div>
          <p className="small" style={{ marginTop: 8 }}>Course Rating: difficulty for scratch golfer. Slope: 55 (easiest) to 155 (hardest). Standard is 113.</p>
        </section>
      </div>
    </div>
  );
}
