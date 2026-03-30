/* global BigInt */
/**
 * FractionCalculator.js — rebuilt
 * Key fix: results are snapshotted on button click (useState),
 * not recomputed live (useMemo). This matches calculator.net behavior.
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

/* ═══════════════════════════════════════════════════════════════
   MATH HELPERS
   ═══════════════════════════════════════════════════════════════ */

function gcd(a, b) {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y !== 0) { const t = x % y; x = y; y = t; }
  return x === 0 ? 1 : x;
}

function lcm(a, b) {
  const g = gcd(a, b);
  return g === 0 ? 0 : Math.abs(Math.trunc(a / g)) * Math.abs(b);
}

/** Reduce to lowest terms. Denominator always positive. */
function reduceFrac(n, d) {
  if (d === 0) return { n, d: 0, ok: false };
  if (n === 0) return { n: 0, d: 1, ok: true };
  const neg = (n < 0) !== (d < 0);
  const an = Math.abs(Math.trunc(n));
  const ad = Math.abs(Math.trunc(d));
  const g = gcd(an, ad);
  return { n: (neg ? -1 : 1) * Math.trunc(an / g), d: Math.trunc(ad / g), ok: true };
}

function fracOp(aN, aD, op, bN, bD) {
  if (aD === 0 || bD === 0) return { ok: false, err: "Denominator cannot be 0." };
  let n, d;
  if      (op === "+") { n = aN * bD + bN * aD; d = aD * bD; }
  else if (op === "-") { n = aN * bD - bN * aD; d = aD * bD; }
  else if (op === "*") { n = aN * bN; d = aD * bD; }
  else if (op === "/") {
    if (bN === 0) return { ok: false, err: "Division by zero — second fraction's numerator is 0." };
    n = aN * bD; d = aD * bN;
  } else return { ok: false, err: "Unknown operator." };
  return { ...reduceFrac(n, d), ok: true };
}

function fracToDecimal(n, d) { return d === 0 ? NaN : n / d; }

function toMixed(n, d) {
  if (d === 0 || d === 1) return null;
  const sign = n < 0 ? -1 : 1;
  const an = Math.abs(n);
  const whole = Math.trunc(an / d);
  const rem = an % d;
  if (whole === 0 || rem === 0) return null;
  return { w: sign * whole, rn: rem, rd: d };
}

function formatDec(x) {
  if (!Number.isFinite(x)) return "—";
  return String(Number(x.toPrecision(10)));
}

const opSymMap = { "+": "+", "-": "−", "*": "×", "/": "÷" };
const opSym = op => opSymMap[op] || op;

function parseIntVal(v) {
  const s = String(v ?? "").trim();
  if (!s) return null;
  if (!/^[+-]?\d+$/.test(s)) return NaN;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

function parseDecVal(v) {
  const s = String(v ?? "").trim();
  if (!s) return null;
  if (!/^[+-]?\d*\.?\d+$/.test(s)) return NaN;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

/**
 * Parse mixed number: "-2 3/4" | "3 5/7" | "5/7" | "-3" | "3"
 * Returns { ok, n, d, orig } or { ok: false, err }
 */
function parseMixed(txt) {
  const s = String(txt ?? "").trim();
  if (!s) return { ok: false, err: "Please enter a value." };
  // "w n/d"
  const mw = s.match(/^([+-]?\d+)\s+(\d+)\s*\/\s*([1-9]\d*)$/);
  if (mw) {
    const w = Number(mw[1]), rn = Number(mw[2]), rd = Number(mw[3]);
    const sign = w < 0 ? -1 : 1;
    return { ok: true, n: sign * (Math.abs(w) * rd + rn), d: rd, orig: s };
  }
  // "n/d"
  const mf = s.match(/^([+-]?\d+)\s*\/\s*([1-9]\d*)$/);
  if (mf) {
    return { ok: true, n: Number(mf[1]), d: Number(mf[2]), orig: s };
  }
  // integer
  if (/^[+-]?\d+$/.test(s)) return { ok: true, n: Number(s), d: 1, orig: s };
  return { ok: false, err: "Format: -2 3/4  ·  3 5/7  ·  5/7  ·  10" };
}

/* ═══════════════════════════════════════════════════════════════
   BIGINT HELPERS
   ═══════════════════════════════════════════════════════════════ */

function bigGcd(a, b) {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b !== 0n) { const t = b; b = a % b; a = t; }
  return a === 0n ? 1n : a;
}

function bigReduce(n, d) {
  if (d === 0n) return { n, d: 0n, ok: false };
  if (n === 0n) return { n: 0n, d: 1n, ok: true };
  const neg = (n < 0n) !== (d < 0n);
  const an = n < 0n ? -n : n;
  const ad = d < 0n ? -d : d;
  const g = bigGcd(an, ad);
  return { n: (neg ? -1n : 1n) * (an / g), d: ad / g, ok: true };
}

function bigFracOp(aN, aD, op, bN, bD) {
  if (aD === 0n || bD === 0n) return { ok: false, err: "Denominator cannot be 0." };
  let n, d;
  if      (op === "+") { n = aN * bD + bN * aD; d = aD * bD; }
  else if (op === "-") { n = aN * bD - bN * aD; d = aD * bD; }
  else if (op === "*") { n = aN * bN; d = aD * bD; }
  else if (op === "/") {
    if (bN === 0n) return { ok: false, err: "Cannot divide by zero." };
    n = aN * bD; d = aD * bN;
  } else return { ok: false, err: "Unknown operator." };
  return { ...bigReduce(n, d), ok: true };
}

function parseBigIntVal(str) {
  const s = String(str ?? "").trim();
  if (!s) return null;
  if (!/^[+-]?\d+$/.test(s)) return "ERR";
  try { return BigInt(s); } catch (_) { return "ERR"; }
}

/* ═══════════════════════════════════════════════════════════════
   COMPUTE FUNCTIONS — called on button click, return snapshot data
   ═══════════════════════════════════════════════════════════════ */

function computeFrac1(a1n, a1d, op, b1n, b1d) {
  const n1 = parseIntVal(a1n), d1 = parseIntVal(a1d);
  const n2 = parseIntVal(b1n), d2 = parseIntVal(b1d);
  if ([n1, d1, n2, d2].some(x => x === null)) return { ok: false, err: "Please fill all four fields." };
  if ([n1, d1, n2, d2].some(x => Number.isNaN(x))) return { ok: false, err: "All fields must be whole numbers." };
  if (d1 === 0 || d2 === 0) return { ok: false, err: "Denominator cannot be 0." };
  // Normalize sign to numerator
  const [nn1, nd1] = d1 < 0 ? [-n1, -d1] : [n1, d1];
  const [nn2, nd2] = d2 < 0 ? [-n2, -d2] : [n2, d2];
  const res = fracOp(nn1, nd1, op, nn2, nd2);
  if (!res.ok) return { ok: false, err: res.err };
  const common = lcm(nd1, nd2);
  const aMul = nd1 === 0 ? 1 : common / nd1;
  const bMul = nd2 === 0 ? 1 : common / nd2;
  return {
    ok: true, nn1, nd1, nn2, nd2, op, res,
    dec: fracToDecimal(res.n, res.d),
    mixed: toMixed(res.n, res.d),
    common, aMul, bMul,
  };
}

function computeMixed2(mx1, mx2, op) {
  const A = parseMixed(mx1);
  if (!A.ok) return { ok: false, err: A.err };
  const B = parseMixed(mx2);
  if (!B.ok) return { ok: false, err: B.err };
  const res = fracOp(A.n, A.d, op, B.n, B.d);
  if (!res.ok) return { ok: false, err: res.err };
  const common = lcm(A.d, B.d);
  const aMul = A.d === 0 ? 1 : common / A.d;
  const bMul = B.d === 0 ? 1 : common / B.d;
  return {
    ok: true, A, B, op, res, mx1, mx2,
    dec: fracToDecimal(res.n, res.d),
    mixed: toMixed(res.n, res.d),
    common, aMul, bMul,
  };
}

function computeSimplify3(s3n, s3d) {
  const n = parseIntVal(s3n), d = parseIntVal(s3d);
  if (n === null || d === null) return { ok: false, err: "Please fill both fields." };
  if (Number.isNaN(n) || Number.isNaN(d)) return { ok: false, err: "Please enter whole numbers." };
  if (d === 0) return { ok: false, err: "Denominator cannot be 0." };
  const res = reduceFrac(n, d);
  const g = gcd(Math.abs(n), Math.abs(d));
  return { ok: true, mode: "fraction", n, d, res, g, dec: fracToDecimal(res.n, res.d) };
}

/**
 * Simplify a mixed number (w + mn/md).
 * Sign is carried by the whole-number field (w).
 * The numerator of the fractional part (mn) must be ≥ 0.
 */
function computeSimplify3Mixed(s3w, s3mn, s3md) {
  const wStr  = String(s3w  ?? "").trim();
  const mnStr = String(s3mn ?? "").trim();
  const mdStr = String(s3md ?? "").trim();

  if (!mnStr || !mdStr) return { ok: false, err: "Please fill the numerator and denominator." };

  const w  = wStr === "" ? 0 : parseIntVal(s3w);
  const mn = parseIntVal(s3mn);
  const md = parseIntVal(s3md);

  if (w  === null || Number.isNaN(w))  return { ok: false, err: "Whole number must be an integer." };
  if (mn === null || Number.isNaN(mn)) return { ok: false, err: "Numerator must be a whole number." };
  if (md === null || Number.isNaN(md)) return { ok: false, err: "Denominator must be a whole number." };
  if (mn < 0)  return { ok: false, err: "The fractional numerator must be 0 or positive." };
  if (md <= 0) return { ok: false, err: "Denominator must be a positive integer." };

  // Convert mixed → improper: sign(w) × (|w|×d + n) / d
  const sign = w < 0 ? -1 : 1;
  const impN = sign * (Math.abs(w) * md + mn);
  const impD = md;

  const res   = reduceFrac(impN, impD);
  const g     = gcd(Math.abs(impN), impD);
  const mixed = toMixed(res.n, res.d);

  return { ok: true, mode: "mixed", w, mn, md, impN, impD, res, g, dec: fracToDecimal(res.n, res.d), mixed };
}

function computeDec4(dec4) {
  const s = String(dec4).trim();
  const x = parseDecVal(s);
  if (x === null) return { ok: false, err: "Please enter a decimal number." };
  if (Number.isNaN(x)) return { ok: false, err: "Please enter a valid decimal, e.g. 1.375 or -0.5." };
  const stripped = s.replace(/^[+-]/, "");
  const dotIdx = stripped.indexOf(".");
  if (dotIdx === -1) {
    const intVal = Math.trunc(x);
    return { ok: true, res: { n: intVal, d: 1 }, isInt: true, intVal, dec: x, mixed: null, rawN: intVal, rawD: 1, g: 1, scale: 1 };
  }
  const fracDigits = stripped.length - dotIdx - 1;
  const scale = Math.pow(10, Math.min(fracDigits, 10));
  const rawN = Math.round(x * scale);
  const rawD = scale;
  const res = reduceFrac(rawN, rawD);
  const g = gcd(Math.abs(rawN), rawD);
  return { ok: true, res, scale, rawN, rawD, g, isInt: false, dec: x, mixed: toMixed(res.n, res.d) };
}

function computeFracDec5(f5n, f5d) {
  const n = parseIntVal(f5n), d = parseIntVal(f5d);
  if (n === null || d === null) return { ok: false, err: "Please fill both fields." };
  if (Number.isNaN(n) || Number.isNaN(d)) return { ok: false, err: "Please enter whole numbers." };
  if (d === 0) return { ok: false, err: "Denominator cannot be 0." };
  const res = reduceFrac(n, d);
  const dec = fracToDecimal(res.n, res.d);
  const decStr = formatDec(dec).replace(/^-/, "").replace(/^\d+\.?/, "");
  const isRepeating = decStr.length > 9;
  return { ok: true, n, d, res, dec, isRepeating };
}

function computeBig6(bn1n, bn1d, op, bn2n, bn2d) {
  const n1 = parseBigIntVal(bn1n), d1 = parseBigIntVal(bn1d);
  const n2 = parseBigIntVal(bn2n), d2 = parseBigIntVal(bn2d);
  if ([n1, d1, n2, d2].some(x => x === null)) return { ok: false, err: "Please fill all four fields." };
  if ([n1, d1, n2, d2].some(x => x === "ERR")) return { ok: false, err: "All fields must be whole integers (no decimals)." };
  if (d1 === 0n || d2 === 0n) return { ok: false, err: "Denominator cannot be 0." };
  const res = bigFracOp(n1, d1, op, n2, d2);
  if (!res.ok) return { ok: false, err: res.err };
  return {
    ok: true, op,
    n1s: n1.toString(), d1s: d1.toString(),
    n2s: n2.toString(), d2s: d2.toString(),
    rn: res.n.toString(), rd: res.d.toString(),
  };
}

/* ═══════════════════════════════════════════════════════════════
   STYLE CONSTANTS
   ═══════════════════════════════════════════════════════════════ */

const fracNumInputSt = {
  width: "100%", textAlign: "center", background: "#fff",
  border: "1.5px solid rgba(99,102,241,0.28)", borderRadius: 8,
  padding: "8px 4px", fontSize: 16, fontWeight: 600, outline: "none",
  color: "#1e1b4b", boxSizing: "border-box", display: "block", fontFamily: "inherit",
};

const blueBarSt = {
  background: "#dbeafe", border: "1px solid #93c5fd", borderRadius: 6,
  padding: "9px 14px", marginBottom: 14, color: "#1d4ed8", fontSize: 13.5,
  fontWeight: 500, display: "flex", alignItems: "center", gap: 8,
};

const grayBoxSt = {
  background: "#f5f5f5", border: "1px solid #ddd", borderRadius: 8, padding: "16px",
};

const explainBoxSt = {
  marginTop: 12, padding: "12px 14px", background: "#f5f3ff",
  borderRadius: 10, border: "1px solid rgba(99,102,241,0.15)",
  fontSize: 13.5, color: "#4b5280", lineHeight: 1.75,
};

const stepsRowSt = {
  display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
  marginBottom: 8, fontSize: 18, lineHeight: 1.6,
};

/* ═══════════════════════════════════════════════════════════════
   UI COMPONENTS — defined at MODULE level (stable component types)
   ═══════════════════════════════════════════════════════════════ */

function FracDisplay({ n, d, size }) {
  const fs = size === "sm" ? 14 : size === "lg" ? 22 : 18;
  const ns = String(n), ds = String(d);
  if (ds === "0") return <span style={{ color: "#dc2626", fontWeight: 800, fontSize: fs }}>undefined</span>;
  if (ds === "1") return <span style={{ fontWeight: 800, fontSize: fs }}>{ns}</span>;
  return (
    <span style={{
      display: "inline-flex", flexDirection: "column",
      alignItems: "center", verticalAlign: "middle", lineHeight: 1.15, margin: "0 2px",
    }}>
      <span style={{ fontWeight: 800, fontSize: fs, padding: "0 4px" }}>{ns}</span>
      <span style={{ display: "block", borderTop: "2px solid currentColor", width: "100%", minWidth: 24 }} />
      <span style={{ fontWeight: 800, fontSize: fs, padding: "0 4px" }}>{ds}</span>
    </span>
  );
}

function FracInput({ topVal, onTopChange, botVal, onBotChange, wide }) {
  const w = wide ? 160 : 88;
  const st = { ...fracNumInputSt, width: w };
  return (
    <div style={{ textAlign: "center", width: w, flexShrink: 0 }}>
      <input type="text" value={topVal} onChange={e => onTopChange(e.target.value)} style={st} aria-label="numerator" />
      <div style={{ borderTop: "2.5px solid #6366f1", margin: "5px 3px", opacity: 0.4 }} />
      <input type="text" value={botVal} onChange={e => onBotChange(e.target.value)} style={st} aria-label="denominator" />
    </div>
  );
}

function OpSelect({ value, onChange }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      padding: "9px 12px", borderRadius: 10, border: "1.5px solid rgba(99,102,241,0.28)",
      background: "#f0eeff", color: "#4f46e5", fontWeight: 800, fontSize: 20,
      cursor: "pointer", outline: "none", flexShrink: 0, alignSelf: "center", fontFamily: "inherit",
    }}>
      <option value="+">+</option>
      <option value="-">−</option>
      <option value="*">×</option>
      <option value="/">÷</option>
    </select>
  );
}

function ResultHeader() {
  return (
    <div className="result-header" style={{ marginBottom: 16 }}>
      <span>Result</span>
      <button type="button" onClick={() => window.print()} style={{
        background: "none", border: "none", cursor: "pointer",
        color: "#065f46", fontWeight: 700, fontSize: 13, textDecoration: "underline", padding: 0,
      }}>Print</button>
    </div>
  );
}

function ExplainToggle({ open, onToggle }) {
  return (
    <button type="button" onClick={onToggle} style={{
      background: "none", border: "none", cursor: "pointer",
      color: "#6366f1", fontSize: 13, fontWeight: 700,
      textDecoration: "underline", padding: "8px 0 0", display: "inline-block",
    }}>
      {open ? "▾ Hide further explanation" : "▸ Show further explanation"}
    </button>
  );
}

function CalcBtns({ onCalc, onClear }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
      <button type="button" className="btn-primary" onClick={onCalc}>Calculate</button>
      <button type="button" className="btn-secondary" onClick={onClear}>Clear</button>
    </div>
  );
}

function ErrMsg({ msg }) {
  return <div className="rng-error" style={{ marginBottom: 12 }}>{msg}</div>;
}

/* ── Steps for Section 1: Fraction Calculator ── */
function Steps1({ data }) {
  const { nn1, nd1, nn2, nd2, op, res, common, aMul, bMul } = data;
  const eq = <span style={{ fontWeight: 800, color: "#4b5280" }}>=</span>;

  if (op === "+" || op === "-") {
    const aN2 = nn1 * aMul;
    const bN2 = nn2 * bMul;
    const sumN = op === "+" ? aN2 + bN2 : aN2 - bN2;
    const isReduced = !(res.n === sumN && res.d === common);
    return (
      <div>
        <div style={stepsRowSt}>
          <FracDisplay n={nn1} d={nd1} />
          <span>{opSym(op)}</span>
          <FracDisplay n={nn2} d={nd2} />
          <span style={{ fontWeight: 800 }}>=</span>
          <span style={{ color: "#9ca3af" }}>?</span>
        </div>
        {(aMul !== 1 || bMul !== 1) && (
          <>
            <div style={{ fontSize: 13, color: "#6b7a9e", marginBottom: 6 }}>
              Find LCD of {nd1} and {nd2}: LCD = {common}
            </div>
            <div style={stepsRowSt}>
              {eq}
              <FracDisplay n={`${nn1}×${aMul}`} d={`${nd1}×${aMul}`} />
              <span>{opSym(op)}</span>
              <FracDisplay n={`${nn2}×${bMul}`} d={`${nd2}×${bMul}`} />
            </div>
          </>
        )}
        <div style={stepsRowSt}>
          {eq}<FracDisplay n={aN2} d={common} /><span>{opSym(op)}</span><FracDisplay n={bN2} d={common} />
        </div>
        <div style={stepsRowSt}>{eq}<FracDisplay n={sumN} d={common} /></div>
        {isReduced && (
          <div style={stepsRowSt}>
            {eq}<FracDisplay n={res.n} d={res.d} />
            <span style={{ fontSize: 13, color: "#6b7a9e" }}>(simplified)</span>
          </div>
        )}
      </div>
    );
  }

  if (op === "*") {
    const rawN = nn1 * nn2, rawD = nd1 * nd2;
    const isReduced = !(res.n === rawN && res.d === rawD);
    return (
      <div>
        <div style={stepsRowSt}>
          <FracDisplay n={nn1} d={nd1} /><span>×</span><FracDisplay n={nn2} d={nd2} />
          <span style={{ fontWeight: 800 }}>=</span><span style={{ color: "#9ca3af" }}>?</span>
        </div>
        <div style={stepsRowSt}>
          {eq}<FracDisplay n={`${nn1}×${nn2}`} d={`${nd1}×${nd2}`} />
        </div>
        <div style={stepsRowSt}>{eq}<FracDisplay n={rawN} d={rawD} /></div>
        {isReduced && (
          <div style={stepsRowSt}>
            {eq}<FracDisplay n={res.n} d={res.d} />
            <span style={{ fontSize: 13, color: "#6b7a9e" }}>(simplified)</span>
          </div>
        )}
      </div>
    );
  }

  if (op === "/") {
    const rawN = nn1 * nd2, rawD = nd1 * nn2;
    // Normalize sign for display
    const dRawN = rawD < 0 ? -rawN : rawN;
    const dRawD = Math.abs(rawD);
    const isReduced = !(res.n === dRawN && res.d === dRawD);
    return (
      <div>
        <div style={stepsRowSt}>
          <FracDisplay n={nn1} d={nd1} /><span>÷</span><FracDisplay n={nn2} d={nd2} />
          <span style={{ fontWeight: 800 }}>=</span><span style={{ color: "#9ca3af" }}>?</span>
        </div>
        <div style={stepsRowSt}>
          {eq}<FracDisplay n={nn1} d={nd1} /><span>×</span><FracDisplay n={nd2} d={nn2} />
          <span style={{ fontSize: 13, color: "#6b7a9e" }}>(multiply by reciprocal)</span>
        </div>
        <div style={stepsRowSt}>
          {eq}<FracDisplay n={`${nn1}×${nd2}`} d={`${nd1}×${nn2}`} />
        </div>
        <div style={stepsRowSt}>{eq}<FracDisplay n={dRawN} d={dRawD} /></div>
        {isReduced && (
          <div style={stepsRowSt}>
            {eq}<FracDisplay n={res.n} d={res.d} />
            <span style={{ fontSize: 13, color: "#6b7a9e" }}>(simplified)</span>
          </div>
        )}
      </div>
    );
  }
  return null;
}

/* ── Steps for Section 2: Mixed Numbers ── */
function Steps2({ data }) {
  const { A, B, op, res, mx1, mx2, common, aMul, bMul } = data;
  const eq = <span style={{ fontWeight: 800, color: "#4b5280" }}>=</span>;

  // Raw (pre-reduction) result for showing simplification step
  let rawN, rawD;
  if (op === "+" || op === "-") {
    rawN = op === "+" ? A.n * aMul + B.n * bMul : A.n * aMul - B.n * bMul;
    rawD = common;
  } else if (op === "*") {
    rawN = A.n * B.n; rawD = A.d * B.d;
  } else {
    // division: A.n/A.d ÷ B.n/B.d = A.n*B.d / A.d*B.n
    rawN = A.n * B.d; rawD = A.d * B.n;
    if (rawD < 0) { rawN = -rawN; rawD = -rawD; }
  }
  const isReduced = !(res.n === rawN && res.d === rawD);

  return (
    <div>
      {/* Step 1: convert to improper fractions */}
      <div style={{ fontSize: 13.5, color: "#6b7a9e", marginBottom: 8, fontWeight: 600 }}>
        Step 1 — Convert to improper fractions:
      </div>
      <div style={{ ...stepsRowSt, marginBottom: 4, fontSize: 16 }}>
        <span style={{ fontWeight: 700, color: "#1e1b4b" }}>{mx1}</span>
        {eq}
        <FracDisplay n={A.n} d={A.d} />
      </div>
      <div style={{ ...stepsRowSt, marginBottom: 14, fontSize: 16 }}>
        <span style={{ fontWeight: 700, color: "#1e1b4b" }}>{mx2}</span>
        {eq}
        <FracDisplay n={B.n} d={B.d} />
      </div>

      {/* Step 2: perform operation */}
      <div style={{ fontSize: 13.5, color: "#6b7a9e", marginBottom: 8, fontWeight: 600 }}>
        Step 2 — Perform the operation:
      </div>

      {(op === "+" || op === "-") && (
        <>
          <div style={stepsRowSt}>
            <FracDisplay n={A.n} d={A.d} />
            <span>{opSym(op)}</span>
            <FracDisplay n={B.n} d={B.d} />
            <span style={{ fontWeight: 800 }}>=</span>
            <span style={{ color: "#9ca3af" }}>?</span>
          </div>
          {(aMul !== 1 || bMul !== 1) && (
            <>
              <div style={{ fontSize: 13, color: "#6b7a9e", marginBottom: 4 }}>
                LCD of {A.d} and {B.d} = {common}
              </div>
              <div style={stepsRowSt}>
                {eq}
                <FracDisplay n={`${A.n}×${aMul}`} d={`${A.d}×${aMul}`} />
                <span>{opSym(op)}</span>
                <FracDisplay n={`${B.n}×${bMul}`} d={`${B.d}×${bMul}`} />
              </div>
            </>
          )}
          <div style={stepsRowSt}>
            {eq}
            <FracDisplay n={A.n * aMul} d={common} />
            <span>{opSym(op)}</span>
            <FracDisplay n={B.n * bMul} d={common} />
          </div>
          <div style={stepsRowSt}>{eq}<FracDisplay n={rawN} d={rawD} /></div>
        </>
      )}

      {op === "*" && (
        <div style={stepsRowSt}>
          <FracDisplay n={A.n} d={A.d} /><span>×</span><FracDisplay n={B.n} d={B.d} />
          <span style={{ fontWeight: 800 }}>=</span>
          <FracDisplay n={`${A.n}×${B.n}`} d={`${A.d}×${B.d}`} />
          <span style={{ fontWeight: 800 }}>=</span>
          <FracDisplay n={rawN} d={rawD} />
        </div>
      )}

      {op === "/" && (
        <>
          <div style={stepsRowSt}>
            <FracDisplay n={A.n} d={A.d} /><span>÷</span><FracDisplay n={B.n} d={B.d} />
            <span style={{ fontWeight: 800 }}>=</span>
            <FracDisplay n={A.n} d={A.d} /><span>×</span><FracDisplay n={B.d} d={B.n} />
            <span style={{ fontSize: 13, color: "#6b7a9e" }}>(reciprocal)</span>
          </div>
          <div style={stepsRowSt}>
            {eq}<FracDisplay n={`${A.n}×${B.d}`} d={`${A.d}×${B.n}`} />
            <span style={{ fontWeight: 800 }}>=</span>
            <FracDisplay n={rawN} d={rawD} />
          </div>
        </>
      )}

      {isReduced && (
        <div style={stepsRowSt}>
          <span style={{ fontWeight: 800, color: "#4b5280" }}>=</span>
          <FracDisplay n={res.n} d={res.d} />
          <span style={{ fontSize: 13, color: "#6b7a9e" }}>(simplified)</span>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR DATA
   ═══════════════════════════════════════════════════════════════ */

const SIDEBAR_LINKS = [
  { label: "Fraction Calculator",   to: "/fraction-calculator" },
  { label: "GPA Calculator",        to: "/gpa-calculator" },
  { label: "Grade Calculator",      to: "/grade-calculator" },
  { label: "Percentage Calculator", to: "/percentage-calculator" },
  { label: "Scientific Calculator", to: "/scientific" },
  { label: "Standard Deviation",    to: "/std-dev" },
  { label: "BMI Calculator",        to: "/bmi" },
  { label: "Age Calculator",        to: "/age" },
  { label: "Loan Calculator",       to: "/loan" },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function FractionCalculator() {

  /* ── Section 1: Fraction Calculator ── */
  const [a1n, setA1n] = useState("2");
  const [a1d, setA1d] = useState("7");
  const [op1, setOp1] = useState("+");
  const [b1n, setB1n] = useState("3");
  const [b1d, setB1d] = useState("8");
  const [res1, setRes1] = useState(null);
  const [exp1, setExp1] = useState(false);

  /* ── Section 2: Mixed Numbers ── */
  const [mx1, setMx1] = useState("-2 3/4");
  const [op2, setOp2] = useState("+");
  const [mx2, setMx2] = useState("3 5/7");
  const [res2, setRes2] = useState(null);
  const [exp2, setExp2] = useState(false);

  /* ── Section 3: Simplify ── */
  const [s3tab, setS3tab] = useState("fraction");   // "fraction" | "mixed"
  // Fraction tab inputs
  const [s3n, setS3n] = useState("2");
  const [s3d, setS3d] = useState("98");
  // Mixed-number tab inputs
  const [s3w,  setS3w]  = useState("2");
  const [s3mn, setS3mn] = useState("21");
  const [s3md, setS3md] = useState("98");
  const [res3, setRes3] = useState(null);
  const [exp3, setExp3] = useState(false);

  /* ── Section 4: Decimal → Fraction ── */
  const [dec4, setDec4] = useState("1.375");
  const [res4, setRes4] = useState(null);
  const [exp4, setExp4] = useState(false);

  /* ── Section 5: Fraction → Decimal ── */
  const [f5n, setF5n] = useState("2");
  const [f5d, setF5d] = useState("7");
  const [res5, setRes5] = useState(null);

  /* ── Section 6: Big Number Fraction ── */
  const [bn1n, setBn1n] = useState("1234");
  const [bn1d, setBn1d] = useState("748892928829");
  const [op6, setOp6]   = useState("+");
  const [bn2n, setBn2n] = useState("33434421132232234333");
  const [bn2d, setBn2d] = useState("8877277388288288288");
  const [res6, setRes6] = useState(null);

  /* ── Sidebar ── */
  const [search, setSearch] = useState("");

  /* ── Calculate handlers ── */
  const calc1 = () => { setRes1(computeFrac1(a1n, a1d, op1, b1n, b1d)); setExp1(false); };
  const calc2 = () => { setRes2(computeMixed2(mx1, mx2, op2)); setExp2(false); };
  const calc3 = () => {
    setRes3(s3tab === "fraction"
      ? computeSimplify3(s3n, s3d)
      : computeSimplify3Mixed(s3w, s3mn, s3md));
    setExp3(false);
  };
  const calc4 = () => { setRes4(computeDec4(dec4)); setExp4(false); };
  const calc5 = () => setRes5(computeFracDec5(f5n, f5d));
  const calc6 = () => setRes6(computeBig6(bn1n, bn1d, op6, bn2n, bn2d));

  /* ── Clear handlers ── */
  const clear1 = () => { setA1n(""); setA1d(""); setB1n(""); setB1d(""); setOp1("+"); setRes1(null); setExp1(false); };
  const clear2 = () => { setMx1(""); setMx2(""); setOp2("+"); setRes2(null); setExp2(false); };
  const clear3 = () => {
    if (s3tab === "fraction") { setS3n(""); setS3d(""); }
    else { setS3w(""); setS3mn(""); setS3md(""); }
    setRes3(null); setExp3(false);
  };
  const clear4 = () => { setDec4(""); setRes4(null); setExp4(false); };
  const clear5 = () => { setF5n(""); setF5d(""); setRes5(null); };
  const clear6 = () => { setBn1n(""); setBn1d(""); setBn2n(""); setBn2d(""); setOp6("+"); setRes6(null); };

  const filteredLinks = SIDEBAR_LINKS.filter(l =>
    l.label.toLowerCase().includes(search.toLowerCase())
  );

  /* ── Shared text input style ── */
  const txtInputSt = {
    background: "#fff", border: "1.5px solid rgba(99,102,241,0.28)",
    borderRadius: 8, padding: "10px 12px", fontSize: 15, fontWeight: 600,
    outline: "none", color: "#1e1b4b", width: "100%", boxSizing: "border-box",
    fontFamily: "inherit",
  };

  return (
    <div className="calc-wrap">

      {/* Breadcrumb */}
      <div style={{ maxWidth: 1100, margin: "0 auto 14px", fontSize: 12.5, color: "#888" }}>
        <Link to="/" style={{ color: "#6366f1", textDecoration: "none" }}>home</Link>
        <span style={{ margin: "0 5px" }}>/</span>
        <span>math</span>
        <span style={{ margin: "0 5px" }}>/</span>
        <span style={{ color: "#444" }}>fraction calculator</span>
      </div>

      {/* Page title */}
      <div style={{ maxWidth: 1100, margin: "0 auto 22px" }}>
        <h1 style={{
          fontSize: "clamp(22px, 3.5vw, 30px)", fontWeight: 800, margin: "0 0 8px",
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>
          Fraction Calculator
        </h1>
        <p style={{ maxWidth: 720, color: "#6b7a9e", fontSize: 15, lineHeight: 1.65, margin: 0 }}>
          Six fraction calculators: add, subtract, multiply, and divide fractions; work with
          mixed numbers; simplify fractions; convert between decimals and fractions; and perform
          exact big-number fraction arithmetic using BigInt.
        </p>
      </div>

      <div className="rng-layout">
        <div className="rng-main">

          {/* ════════════════════════════════════════════
              SECTION 1 — Fraction Calculator
              ════════════════════════════════════════════ */}
          <section className="card" style={{ marginBottom: 18 }}>
            <h2 className="card-title">Fraction Calculator</h2>
            <p className="rng-desc">
              Enter numerators in the top boxes and denominators in the bottom boxes.
              Choose an operator and click Calculate.
            </p>

            {res1 && (
              <div style={{ marginBottom: 20 }}>
                <ResultHeader />
                {res1.ok ? (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 10 }}>
                      <FracDisplay n={res1.nn1} d={res1.nd1} size="lg" />
                      <span style={{ fontWeight: 800, fontSize: 22 }}>{opSym(res1.op)}</span>
                      <FracDisplay n={res1.nn2} d={res1.nd2} size="lg" />
                      <span style={{ fontWeight: 800, fontSize: 22 }}>=</span>
                      <FracDisplay n={res1.res.n} d={res1.res.d} size="lg" />
                    </div>

                    {res1.mixed && (
                      <div style={{ fontSize: 14, color: "#6b7a9e", marginBottom: 6 }}>
                        Mixed number:{" "}
                        <strong style={{ color: "#312e81" }}>
                          {res1.mixed.w}&nbsp;<FracDisplay n={res1.mixed.rn} d={res1.mixed.rd} size="sm" />
                        </strong>
                      </div>
                    )}

                    <div style={{ fontSize: 14, marginBottom: 18 }}>
                      Result in decimals: <strong>{formatDec(res1.dec)}</strong>
                    </div>

                    <div style={{ fontWeight: 700, fontSize: 13.5, color: "#312e81", marginBottom: 10 }}>
                      Calculation steps:
                    </div>
                    <Steps1 data={res1} />

                    <ExplainToggle open={exp1} onToggle={() => setExp1(v => !v)} />
                    {exp1 && (
                      <div style={explainBoxSt}>
                        {(res1.op === "+" || res1.op === "-") && (
                          <>
                            <p style={{ margin: "0 0 8px" }}>
                              <strong>Adding or subtracting fractions</strong> requires a common denominator (LCD).
                            </p>
                            <p style={{ margin: 0 }}>
                              The LCD of <strong>{res1.nd1}</strong> and <strong>{res1.nd2}</strong> is{" "}
                              <strong>{res1.common}</strong>. Scale each fraction so both denominators equal{" "}
                              {res1.common}, then {res1.op === "+" ? "add" : "subtract"} the numerators.
                              Finally, simplify using GCD.
                            </p>
                          </>
                        )}
                        {res1.op === "*" && (
                          <p style={{ margin: 0 }}>
                            <strong>Multiplying fractions:</strong> multiply the numerators together and the
                            denominators together, then simplify using the GCD.
                          </p>
                        )}
                        {res1.op === "/" && (
                          <p style={{ margin: 0 }}>
                            <strong>Dividing by a fraction</strong> is the same as multiplying by its reciprocal
                            (flip numerator and denominator of the second fraction). Then multiply and simplify.
                          </p>
                        )}
                      </div>
                    )}
                  </>
                ) : <ErrMsg msg={res1.err} />}
              </div>
            )}

            <div style={blueBarSt}>
              <span style={{ fontSize: 16 }}>&#9660;</span>
              Enter values and click <strong style={{ marginLeft: 3 }}>Calculate</strong>
            </div>
            <div style={grayBoxSt}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 14 }}>
                <FracInput topVal={a1n} onTopChange={setA1n} botVal={a1d} onBotChange={setA1d} />
                <OpSelect value={op1} onChange={setOp1} />
                <FracInput topVal={b1n} onTopChange={setB1n} botVal={b1d} onBotChange={setB1d} />
                <span style={{ fontSize: 24, fontWeight: 800, color: "#4b5280" }}>=</span>
                <span style={{ fontSize: 24, fontWeight: 800, color: "#c4b5fd" }}>?</span>
              </div>
              <CalcBtns onCalc={calc1} onClear={clear1} />
            </div>
          </section>

          {/* ════════════════════════════════════════════
              SECTION 2 — Mixed Numbers Calculator
              ════════════════════════════════════════════ */}
          <section className="card" style={{ marginBottom: 18 }}>
            <h2 className="card-title">Mixed Numbers Calculator</h2>
            <p className="rng-desc">
              Enter mixed numbers as <strong>whole&nbsp;numerator/denominator</strong> (e.g.{" "}
              <code style={{ background: "#f0eeff", padding: "1px 5px", borderRadius: 4 }}>-2 3/4</code>,{" "}
              <code style={{ background: "#f0eeff", padding: "1px 5px", borderRadius: 4 }}>3 5/7</code>),
              plain fractions (<code style={{ background: "#f0eeff", padding: "1px 5px", borderRadius: 4 }}>5/7</code>),
              or integers (<code style={{ background: "#f0eeff", padding: "1px 5px", borderRadius: 4 }}>10</code>).
            </p>

            {res2 && (
              <div style={{ marginBottom: 20 }}>
                <ResultHeader />
                {res2.ok ? (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", fontSize: 19, marginBottom: 10 }}>
                      <span style={{ fontWeight: 700, color: "#312e81" }}>{res2.mx1}</span>
                      <span style={{ fontWeight: 800 }}>{opSym(res2.op)}</span>
                      <span style={{ fontWeight: 700, color: "#312e81" }}>{res2.mx2}</span>
                      <span style={{ fontWeight: 800 }}>=</span>
                      <FracDisplay n={res2.res.n} d={res2.res.d} size="lg" />
                    </div>

                    {res2.mixed && (
                      <div style={{ fontSize: 14, color: "#6b7a9e", marginBottom: 6 }}>
                        Mixed number:{" "}
                        <strong style={{ color: "#312e81" }}>
                          {res2.mixed.w}&nbsp;<FracDisplay n={res2.mixed.rn} d={res2.mixed.rd} size="sm" />
                        </strong>
                      </div>
                    )}

                    <div style={{ fontSize: 14, marginBottom: 16 }}>
                      Result in decimals: <strong>{formatDec(res2.dec)}</strong>
                    </div>

                    <div style={{ fontWeight: 700, fontSize: 13.5, color: "#312e81", marginBottom: 8 }}>
                      Calculation steps:
                    </div>
                    <Steps2 data={res2} />

                    <ExplainToggle open={exp2} onToggle={() => setExp2(v => !v)} />
                    {exp2 && (
                      <div style={explainBoxSt}>
                        <p style={{ margin: "0 0 8px" }}>
                          <strong>Mixed numbers</strong> are converted to improper fractions first.
                          For <em>w n/d</em>, the improper fraction is <em>(|w|×d + n) / d</em>, with the sign of <em>w</em>.
                        </p>
                        <p style={{ margin: 0 }}>
                          Arithmetic is then performed on the improper fractions and the result is simplified using GCD.
                        </p>
                      </div>
                    )}
                  </>
                ) : <ErrMsg msg={res2.err} />}
              </div>
            )}

            <div style={blueBarSt}>
              <span style={{ fontSize: 16 }}>&#9660;</span>
              Enter mixed numbers and click <strong style={{ marginLeft: 3 }}>Calculate</strong>
            </div>
            <div style={grayBoxSt}>
              <div style={{
                display: "grid", gridTemplateColumns: "1fr auto 1fr auto auto",
                gap: 10, alignItems: "center", marginBottom: 14,
              }}>
                <input type="text" value={mx1} onChange={e => setMx1(e.target.value)}
                  placeholder="-2 3/4" style={txtInputSt} />
                <OpSelect value={op2} onChange={setOp2} />
                <input type="text" value={mx2} onChange={e => setMx2(e.target.value)}
                  placeholder="3 5/7" style={txtInputSt} />
                <span style={{ fontSize: 24, fontWeight: 800, color: "#4b5280" }}>=</span>
                <span style={{ fontSize: 24, fontWeight: 800, color: "#c4b5fd" }}>?</span>
              </div>
              <CalcBtns onCalc={calc2} onClear={clear2} />
            </div>
          </section>

          {/* ════════════════════════════════════════════
              SECTION 3 — Simplify Fractions
              ════════════════════════════════════════════ */}
          <section className="card" style={{ marginBottom: 18 }}>
            <h2 className="card-title">Simplify Fractions Calculator</h2>
            <p className="rng-desc">
              Reduce a fraction or mixed number to its simplest form using the Greatest Common
              Divisor (GCD). Choose the input type below.
            </p>

            {/* ── Result panel ── */}
            {res3 && (
              <div style={{ marginBottom: 20 }}>
                <ResultHeader />
                {res3.ok ? (
                  <>
                    {/* ── Fraction mode result ── */}
                    {res3.mode === "fraction" && (
                      <>
                        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 10 }}>
                          <FracDisplay n={res3.n} d={res3.d} size="lg" />
                          <span style={{ fontWeight: 800, fontSize: 22 }}>=</span>
                          <FracDisplay n={res3.res.n} d={res3.res.d} size="lg" />
                          {/* show mixed form when result is improper */}
                          {toMixed(res3.res.n, res3.res.d) && (() => {
                            const m = toMixed(res3.res.n, res3.res.d);
                            return (
                              <>
                                <span style={{ fontWeight: 800, fontSize: 22 }}>=</span>
                                <span style={{ fontWeight: 800, fontSize: 22, color: "#312e81" }}>
                                  {m.w}&nbsp;<FracDisplay n={m.rn} d={m.rd} size="lg" />
                                </span>
                              </>
                            );
                          })()}
                        </div>
                        <div style={{ fontSize: 14, marginBottom: 16 }}>
                          Result in decimals: <strong>{formatDec(res3.dec)}</strong>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 13.5, color: "#312e81", marginBottom: 8 }}>
                          Calculation steps:
                        </div>
                        <div style={{ lineHeight: 2, fontSize: 15 }}>
                          <div style={{ marginBottom: 4, color: "#374151" }}>
                            Find GCD({Math.abs(res3.n)}, {Math.abs(res3.d)}) = <strong>{res3.g}</strong>
                          </div>
                          <div style={stepsRowSt}>
                            <FracDisplay n={res3.n} d={res3.d} />
                            <span style={{ fontWeight: 700 }}>÷</span>
                            <FracDisplay n={res3.g} d={res3.g} />
                            <span style={{ fontWeight: 800 }}>=</span>
                            <FracDisplay n={res3.res.n} d={res3.res.d} />
                            {res3.g === 1 && (
                              <span style={{ fontSize: 13, color: "#6b7a9e" }}>(already in simplest form)</span>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {/* ── Mixed-number mode result ── */}
                    {res3.mode === "mixed" && (
                      <>
                        {/* Original → simplified improper fraction */}
                        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 8 }}>
                          {/* original mixed form */}
                          <span style={{ fontWeight: 800, fontSize: 22, color: "#312e81" }}>
                            {res3.w !== 0
                              ? <>{res3.w}&nbsp;<FracDisplay n={res3.mn} d={res3.md} size="lg" /></>
                              : <FracDisplay n={res3.mn} d={res3.md} size="lg" />
                            }
                          </span>
                          <span style={{ fontWeight: 800, fontSize: 22 }}>=</span>
                          {/* improper */}
                          <FracDisplay n={res3.impN} d={res3.impD} size="lg" />
                          <span style={{ fontWeight: 800, fontSize: 22 }}>=</span>
                          {/* simplified improper */}
                          <FracDisplay n={res3.res.n} d={res3.res.d} size="lg" />
                        </div>

                        {/* As mixed number (when result has a fractional part) */}
                        {res3.mixed ? (
                          <div style={{ fontSize: 15, color: "#6b7a9e", marginBottom: 8 }}>
                            As mixed number:{" "}
                            <strong style={{ color: "#312e81", fontSize: 17 }}>
                              {res3.mixed.w}&nbsp;<FracDisplay n={res3.mixed.rn} d={res3.mixed.rd} size="sm" />
                            </strong>
                          </div>
                        ) : (
                          /* Result is a whole number or proper fraction — note it */
                          res3.res.d === 1 && (
                            <div style={{ fontSize: 14, color: "#6b7a9e", marginBottom: 8 }}>
                              Simplifies to whole number: <strong style={{ color: "#312e81" }}>{res3.res.n}</strong>
                            </div>
                          )
                        )}

                        <div style={{ fontSize: 14, marginBottom: 16 }}>
                          Result in decimals: <strong>{formatDec(res3.dec)}</strong>
                        </div>

                        <div style={{ fontWeight: 700, fontSize: 13.5, color: "#312e81", marginBottom: 8 }}>
                          Calculation steps:
                        </div>
                        <div style={{ lineHeight: 2, fontSize: 15 }}>
                          {/* Step 1: convert mixed → improper */}
                          <div style={{ fontSize: 13, color: "#6b7a9e", marginBottom: 4 }}>
                            Convert to improper fraction:
                          </div>
                          <div style={{ marginBottom: 6, color: "#374151" }}>
                            {res3.w < 0 ? "−" : ""}{Math.abs(res3.w)} × {res3.md} + {res3.mn} ={" "}
                            <strong>{Math.abs(res3.impN)}</strong>
                            {res3.w < 0 ? " → −" : " → "}
                            <FracDisplay n={res3.impN} d={res3.impD} size="sm" />
                          </div>
                          {/* Step 2: simplify */}
                          <div style={{ fontSize: 13, color: "#6b7a9e", marginBottom: 4 }}>
                            Simplify:
                          </div>
                          <div style={{ marginBottom: 4, color: "#374151" }}>
                            GCD({Math.abs(res3.impN)}, {res3.impD}) = <strong>{res3.g}</strong>
                          </div>
                          <div style={stepsRowSt}>
                            <FracDisplay n={res3.impN} d={res3.impD} />
                            <span style={{ fontWeight: 700 }}>÷</span>
                            <FracDisplay n={res3.g} d={res3.g} />
                            <span style={{ fontWeight: 800 }}>=</span>
                            <FracDisplay n={res3.res.n} d={res3.res.d} />
                            {res3.g === 1 && (
                              <span style={{ fontSize: 13, color: "#6b7a9e" }}>(already in simplest form)</span>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    <ExplainToggle open={exp3} onToggle={() => setExp3(v => !v)} />
                    {exp3 && (
                      <div style={explainBoxSt}>
                        {res3.mode === "mixed" && (
                          <p style={{ margin: "0 0 8px" }}>
                            <strong>Mixed number → improper fraction:</strong> multiply the whole number by the
                            denominator and add the numerator. The sign of the whole number carries through.
                          </p>
                        )}
                        <p style={{ margin: 0 }}>
                          <strong>Simplify</strong> by dividing both numerator and denominator by their
                          Greatest Common Divisor (GCD). When GCD = 1 the fraction is already in lowest terms.
                        </p>
                      </div>
                    )}
                  </>
                ) : <ErrMsg msg={res3.err} />}
              </div>
            )}

            {/* ── Tabs ── */}
            <div className="tab-row" style={{ marginBottom: 0 }}>
              <button
                type="button"
                className={`tab-btn${s3tab === "fraction" ? " active" : ""}`}
                onClick={() => { setS3tab("fraction"); setRes3(null); setExp3(false); }}
              >
                Fraction
              </button>
              <button
                type="button"
                className={`tab-btn${s3tab === "mixed" ? " active" : ""}`}
                onClick={() => { setS3tab("mixed"); setRes3(null); setExp3(false); }}
              >
                Mixed Number
              </button>
            </div>

            <div style={blueBarSt}>
              <span style={{ fontSize: 16 }}>&#9660;</span>
              Enter values and click <strong style={{ marginLeft: 3 }}>Calculate</strong>
            </div>
            <div style={grayBoxSt}>
              {s3tab === "fraction" ? (
                /* ── Fraction inputs ── */
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
                  <FracInput topVal={s3n} onTopChange={setS3n} botVal={s3d} onBotChange={setS3d} />
                  <span style={{ fontSize: 22, fontWeight: 800, color: "#4b5280" }}>=</span>
                  <span style={{ fontSize: 15, color: "#9ca3af", fontStyle: "italic" }}>simplified</span>
                </div>
              ) : (
                /* ── Mixed-number inputs: [Whole] [Num/Den] ── */
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
                  {/* Whole number */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 4 }}>Whole</span>
                    <input
                      type="text"
                      value={s3w}
                      onChange={e => setS3w(e.target.value)}
                      placeholder="0"
                      aria-label="whole number"
                      style={{ ...fracNumInputSt, width: 72 }}
                    />
                  </div>
                  {/* Fraction part */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 4 }}>Fraction</span>
                    <FracInput topVal={s3mn} onTopChange={setS3mn} botVal={s3md} onBotChange={setS3md} />
                  </div>
                  <span style={{ fontSize: 22, fontWeight: 800, color: "#4b5280" }}>=</span>
                  <span style={{ fontSize: 15, color: "#9ca3af", fontStyle: "italic" }}>simplified</span>
                </div>
              )}
              <CalcBtns onCalc={calc3} onClear={clear3} />
            </div>
          </section>

          {/* ════════════════════════════════════════════
              SECTION 4 — Decimal → Fraction
              ════════════════════════════════════════════ */}
          <section className="card" style={{ marginBottom: 18 }}>
            <h2 className="card-title">Decimal to Fraction Calculator</h2>
            <p className="rng-desc">
              Enter a decimal number (e.g.{" "}
              <code style={{ background: "#f0eeff", padding: "1px 5px", borderRadius: 4 }}>1.375</code>)
              to convert it to its exact simplified fraction.
            </p>

            {res4 && (
              <div style={{ marginBottom: 20 }}>
                <ResultHeader />
                {res4.ok ? (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 10 }}>
                      <span style={{ fontWeight: 800, fontSize: 22, color: "#312e81" }}>{dec4 || "0"}</span>
                      <span style={{ fontWeight: 800, fontSize: 22 }}>=</span>
                      <FracDisplay n={res4.res.n} d={res4.res.d} size="lg" />
                    </div>

                    {res4.mixed && (
                      <div style={{ fontSize: 14, color: "#6b7a9e", marginBottom: 6 }}>
                        Mixed number:{" "}
                        <strong style={{ color: "#312e81" }}>
                          {res4.mixed.w}&nbsp;<FracDisplay n={res4.mixed.rn} d={res4.mixed.rd} size="sm" />
                        </strong>
                      </div>
                    )}

                    <div style={{ fontWeight: 700, fontSize: 13.5, color: "#312e81", marginBottom: 8 }}>
                      Calculation steps:
                    </div>
                    <div style={{ lineHeight: 2.2, fontSize: 14, color: "#374151" }}>
                      {res4.isInt ? (
                        <div>{dec4} is already a whole number = <strong>{res4.intVal}</strong></div>
                      ) : (
                        <>
                          <div>
                            {dec4} ={" "}
                            <span style={{ fontFamily: "monospace" }}>{res4.rawN} / {res4.rawD}</span>
                            <span style={{ color: "#6b7a9e", marginLeft: 8 }}>
                              (multiply by {res4.scale} to remove decimal point)
                            </span>
                          </div>
                          <div>
                            GCD({Math.abs(res4.rawN)}, {res4.rawD}) = <strong>{res4.g}</strong>
                          </div>
                          <div style={stepsRowSt}>
                            <FracDisplay n={res4.rawN} d={res4.rawD} />
                            <span>÷</span>
                            <FracDisplay n={res4.g} d={res4.g} />
                            <span style={{ fontWeight: 800 }}>=</span>
                            <FracDisplay n={res4.res.n} d={res4.res.d} />
                            {res4.g === 1 && (
                              <span style={{ fontSize: 13, color: "#6b7a9e" }}>(already simplified)</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    <ExplainToggle open={exp4} onToggle={() => setExp4(v => !v)} />
                    {exp4 && (
                      <div style={explainBoxSt}>
                        <p style={{ margin: "0 0 8px" }}>
                          Multiply the decimal by 10<sup>n</sup> (where <em>n</em> is the number of decimal
                          places) to turn it into an integer, then put it over 10<sup>n</sup>.
                        </p>
                        <p style={{ margin: 0 }}>
                          Divide both numerator and denominator by their GCD to simplify to lowest terms.
                        </p>
                      </div>
                    )}
                  </>
                ) : <ErrMsg msg={res4.err} />}
              </div>
            )}

            <div style={blueBarSt}>
              <span style={{ fontSize: 16 }}>&#9660;</span>
              Enter a decimal and click <strong style={{ marginLeft: 3 }}>Calculate</strong>
            </div>
            <div style={grayBoxSt}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 14 }}>
                <input
                  type="text" value={dec4} onChange={e => setDec4(e.target.value)}
                  placeholder="1.375"
                  style={{
                    background: "#fff", border: "1.5px solid rgba(99,102,241,0.28)",
                    borderRadius: 8, padding: "10px 12px", fontSize: 16, fontWeight: 600,
                    outline: "none", color: "#1e1b4b", width: 180, boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
                <span style={{ fontSize: 22, fontWeight: 800, color: "#4b5280" }}>=</span>
                <div style={{ color: "#9ca3af", fontSize: 20, lineHeight: 1 }}>
                  <div style={{ textAlign: "center", fontWeight: 700 }}>?</div>
                  <div style={{ borderTop: "2px solid #c4b5fd", margin: "4px 0" }} />
                  <div style={{ textAlign: "center", fontWeight: 700 }}>?</div>
                </div>
              </div>
              <CalcBtns onCalc={calc4} onClear={clear4} />
            </div>
          </section>

          {/* ════════════════════════════════════════════
              SECTION 5 — Fraction → Decimal
              ════════════════════════════════════════════ */}
          <section className="card" style={{ marginBottom: 18 }}>
            <h2 className="card-title">Fraction to Decimal Calculator</h2>
            <p className="rng-desc">
              Enter a fraction to convert it to its decimal equivalent (up to 10 significant digits).
            </p>

            {res5 && (
              <div style={{ marginBottom: 20 }}>
                <ResultHeader />
                {res5.ok ? (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 10 }}>
                      <FracDisplay n={res5.res.n} d={res5.res.d} size="lg" />
                      <span style={{ fontWeight: 800, fontSize: 22 }}>=</span>
                      <span style={{ fontWeight: 800, fontSize: 22, color: "#312e81" }}>{formatDec(res5.dec)}</span>
                    </div>
                    <div style={{ fontSize: 14, color: "#6b7a9e" }}>
                      {res5.res.n} ÷ {res5.res.d} ={" "}
                      <strong style={{ color: "#1e1b4b" }}>{formatDec(res5.dec)}</strong>
                      {res5.isRepeating && (
                        <span style={{ marginLeft: 8, color: "#6366f1", fontSize: 13 }}>
                          (repeating decimal — shown to 10 sig. fig.)
                        </span>
                      )}
                    </div>
                  </>
                ) : <ErrMsg msg={res5.err} />}
              </div>
            )}

            <div style={blueBarSt}>
              <span style={{ fontSize: 16 }}>&#9660;</span>
              Enter a fraction and click <strong style={{ marginLeft: 3 }}>Calculate</strong>
            </div>
            <div style={grayBoxSt}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
                <FracInput topVal={f5n} onTopChange={setF5n} botVal={f5d} onBotChange={setF5d} />
                <span style={{ fontSize: 22, fontWeight: 800, color: "#4b5280" }}>=</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: "#c4b5fd" }}>?</span>
              </div>
              <CalcBtns onCalc={calc5} onClear={clear5} />
            </div>
          </section>

          {/* ════════════════════════════════════════════
              SECTION 6 — Big Number Fraction (BigInt)
              ════════════════════════════════════════════ */}
          <section className="card" style={{ marginBottom: 18 }}>
            <h2 className="card-title">Big Number Fraction Calculator</h2>
            <p className="rng-desc">
              Perform exact fraction arithmetic on very large integers. Uses JavaScript{" "}
              <strong>BigInt</strong> — results are mathematically exact regardless of number size.
            </p>

            {res6 && (
              <div style={{ marginBottom: 20 }}>
                <ResultHeader />
                {res6.ok ? (
                  <>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 12,
                      flexWrap: "wrap", fontSize: 15, marginBottom: 12,
                    }}>
                      <FracDisplay n={res6.n1s} d={res6.d1s} />
                      <span style={{ fontWeight: 800 }}>{opSym(res6.op)}</span>
                      <FracDisplay n={res6.n2s} d={res6.d2s} />
                      <span style={{ fontWeight: 800 }}>=</span>
                      <FracDisplay n={res6.rn} d={res6.rd} />
                    </div>
                    <div style={{
                      background: "#f5f3ff", borderRadius: 8, padding: "10px 14px",
                      border: "1px solid rgba(99,102,241,0.15)", fontSize: 13,
                    }}>
                      <div style={{ marginBottom: 4 }}>
                        <span style={{ color: "#6b7a9e" }}>Numerator: </span>
                        <code style={{ wordBreak: "break-all", color: "#312e81" }}>{res6.rn}</code>
                      </div>
                      <div>
                        <span style={{ color: "#6b7a9e" }}>Denominator: </span>
                        <code style={{ wordBreak: "break-all", color: "#312e81" }}>{res6.rd}</code>
                      </div>
                    </div>
                  </>
                ) : <ErrMsg msg={res6.err} />}
              </div>
            )}

            <div style={blueBarSt}>
              <span style={{ fontSize: 16 }}>&#9660;</span>
              Enter large integers (no decimals) and click <strong style={{ marginLeft: 3 }}>Calculate</strong>
            </div>
            <div style={grayBoxSt}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 14 }}>
                <FracInput topVal={bn1n} onTopChange={setBn1n} botVal={bn1d} onBotChange={setBn1d} wide />
                <OpSelect value={op6} onChange={setOp6} />
                <FracInput topVal={bn2n} onTopChange={setBn2n} botVal={bn2d} onBotChange={setBn2d} wide />
                <span style={{ fontSize: 24, fontWeight: 800, color: "#4b5280" }}>=</span>
                <span style={{ fontSize: 24, fontWeight: 800, color: "#c4b5fd" }}>?</span>
              </div>
              <CalcBtns onCalc={calc6} onClear={clear6} />
            </div>
          </section>

        </div>

        {/* ════════════════════════════════════════════
            SIDEBAR
            ════════════════════════════════════════════ */}
        <aside className="rng-sidebar">
          <div className="card rng-sidebar-card" style={{ marginBottom: 16 }}>
            <h3 className="rng-sidebar-title">Search</h3>
            <input
              type="text"
              placeholder="Search calculators..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", boxSizing: "border-box",
                border: "1.5px solid rgba(99,102,241,0.2)", borderRadius: 8,
                padding: "8px 10px", fontSize: 13, color: "#1e1b4b",
                background: "#f8f9ff", outline: "none", fontFamily: "inherit",
              }}
            />
          </div>

          <div className="card rng-sidebar-card">
            <h3 className="rng-sidebar-title">Math Calculators</h3>
            <ul className="rng-sidebar-list">
              {filteredLinks.map(lnk => (
                <li key={lnk.to}>
                  <Link
                    to={lnk.to}
                    className={
                      lnk.to === "/fraction-calculator"
                        ? "rng-sidebar-link rng-sidebar-link--active"
                        : "rng-sidebar-link"
                    }
                  >
                    {lnk.label}
                  </Link>
                </li>
              ))}
              {filteredLinks.length === 0 && (
                <li style={{ fontSize: 12, color: "#aaa", padding: "8px 10px" }}>No results</li>
              )}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
