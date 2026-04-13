import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const fmt = (v, d = 2) => isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

export default function TileCalculator() {
  const [roomL,   setRoomL]   = useState("12");
  const [roomW,   setRoomW]   = useState("10");
  const [tileL,   setTileL]   = useState("12");
  const [tileW,   setTileW]   = useState("12");
  const [grout,   setGrout]   = useState("0.125"); // inches
  const [waste,   setWaste]   = useState("10");
  const [unit,    setUnit]    = useState("ft");

  const toFt = v => unit === "ft" ? v : v / 12;

  const result = useMemo(() => {
    const rl = toFt(parseFloat(roomL) || 0);
    const rw = toFt(parseFloat(roomW) || 0);
    const tl = (parseFloat(tileL) || 0) / 12; // always inches → feet
    const tw = (parseFloat(tileW) || 0) / 12;
    const g  = (parseFloat(grout) || 0) / 12;
    const wst = parseFloat(waste) || 0;
    if (rl <= 0 || rw <= 0 || tl <= 0 || tw <= 0) return null;
    const roomArea = rl * rw;
    const tileArea = (tl + g) * (tw + g);
    const tilesNeeded = roomArea / tileArea;
    const withWaste   = tilesNeeded * (1 + wst / 100);
    const boxesOf10   = Math.ceil(withWaste / 10);
    const boxesOf12   = Math.ceil(withWaste / 12);
    return { roomArea, tileArea: tileArea * 144, tilesNeeded, withWaste, boxesOf10, boxesOf12 };
  }, [roomL, roomW, tileL, tileW, grout, waste, unit]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Tile Calculator</h1>
        <p className="muted">Calculate the number of tiles needed for any floor or wall project, including waste and grout spacing.</p>
      </header>
      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Dimensions</h2>
          <div className="row two">
            <div className="field"><label>Room/Area Units</label>
              <select value={unit} onChange={e => setUnit(e.target.value)}>
                <option value="ft">Feet</option>
                <option value="in">Inches</option>
              </select>
            </div>
          </div>
          <div className="row two">
            <div className="field"><label>Room Length ({unit})</label>
              <input type="number" min="0" step="0.5" value={roomL} onChange={e => setRoomL(e.target.value)} /></div>
            <div className="field"><label>Room Width ({unit})</label>
              <input type="number" min="0" step="0.5" value={roomW} onChange={e => setRoomW(e.target.value)} /></div>
          </div>
          <div className="row two">
            <div className="field"><label>Tile Length (inches)</label>
              <input type="number" min="0" step="0.25" value={tileL} onChange={e => setTileL(e.target.value)} /></div>
            <div className="field"><label>Tile Width (inches)</label>
              <input type="number" min="0" step="0.25" value={tileW} onChange={e => setTileW(e.target.value)} /></div>
          </div>
          <div className="row two">
            <div className="field"><label>Grout Line Width (inches)</label>
              <input type="number" min="0" step="0.0625" value={grout} onChange={e => setGrout(e.target.value)} /></div>
            <div className="field"><label>Waste Factor (%)</label>
              <input type="number" min="0" max="50" value={waste} onChange={e => setWaste(e.target.value)} /></div>
          </div>

          {result && (
            <>
              <div className="kpi-grid" style={{ marginTop: 14 }}>
                <div className="kpi"><div className="kpi-label">Room Area</div><div className="kpi-value">{fmt(result.roomArea, 2)} ft²</div></div>
                <div className="kpi"><div className="kpi-label">Tile Area</div><div className="kpi-value">{fmt(result.tileArea, 2)} in²</div></div>
                <div className="kpi"><div className="kpi-label">Tiles Needed</div><div className="kpi-value">{Math.ceil(result.tilesNeeded)}</div></div>
                <div className="kpi"><div className="kpi-label">With Waste</div><div className="kpi-value" style={{ color: "#4f46e5" }}>{Math.ceil(result.withWaste)}</div></div>
              </div>
              <div style={{ marginTop: 10, padding: "12px 16px", background: "#f0eeff", borderRadius: 12, border: "1px solid rgba(99,102,241,0.2)" }}>
                <div style={{ fontSize: 13, color: "#6b7a9e" }}>Boxes needed: ~<strong>{result.boxesOf10}</strong> (10-tile box) &nbsp;|&nbsp; ~<strong>{result.boxesOf12}</strong> (12-tile box)</div>
              </div>
            </>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">Common Tile Sizes</h2>
          <table className="table" style={{ marginBottom: 14 }}>
            <thead><tr><th>Size</th><th>Best For</th></tr></thead>
            <tbody>
              {[["4×4\"","Bathroom walls, backsplash"],["6×6\"","Shower walls"],["12×12\"","Floors, most rooms"],["13×13\"","Larger floor areas"],["16×16\"","Large rooms"],["18×18\"","Open spaces"],["12×24\"","Modern look, large rooms"],["24×24\"","Commercial / large spaces"],["3×6\" subway","Backsplash, walls"],["2×2\" mosaic","Shower floors, accents"]].map(([s,b]) =>
                <tr key={s}><td style={{ fontFamily: "monospace" }}>{s}</td><td style={{ fontSize: 12 }}>{b}</td></tr>
              )}
            </tbody>
          </table>
          <h3 className="card-title">Grout Line Guide</h3>
          <table className="table">
            <thead><tr><th>Joint Width</th><th>Use Case</th></tr></thead>
            <tbody>
              {[["1/16\"","Rectified tiles, tight fit"],["1/8\"","Most floor & wall tiles"],["3/16\"","Natural stone, handmade"],["1/4\"","Exterior, large tiles"],["1/2\"\"","Masonry, brick-look"]].map(([j,u]) =>
                <tr key={j}><td style={{ fontFamily: "monospace" }}>{j}</td><td style={{ fontSize: 12 }}>{u}</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
