import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const fmt = v => {
  if (!isFinite(v)) return "—";
  const r = Math.round(v * 1e8) / 1e8;
  return r.toString();
};

// Matrix helpers
const zero = (r, c) => Array.from({ length: r }, () => Array(c).fill(0));
const transpose = m => m[0].map((_, c) => m.map(r => r[c]));

const det2 = m => m[0][0] * m[1][1] - m[0][1] * m[1][0];
function det3(m) {
  const [a, b, c] = m[0], [d, e, f] = m[1], [g, h, i] = m[2];
  return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
}

function inv2(m) {
  const d = det2(m);
  if (Math.abs(d) < 1e-12) return null;
  return [[m[1][1] / d, -m[0][1] / d], [-m[1][0] / d, m[0][0] / d]];
}

function cofactorMatrix3(m) {
  const cof = zero(3, 3);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const minor = m.filter((_, ri) => ri !== r).map(row => row.filter((_, ci) => ci !== c));
      cof[r][c] = ((r + c) % 2 === 0 ? 1 : -1) * det2(minor);
    }
  }
  return cof;
}

function inv3(m) {
  const d = det3(m);
  if (Math.abs(d) < 1e-12) return null;
  const adj = transpose(cofactorMatrix3(m));
  return adj.map(row => row.map(v => v / d));
}

function matMul(A, B) {
  const rows = A.length, cols = B[0].length, inner = B.length;
  if (A[0].length !== inner) return null;
  return Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) =>
      A[i].reduce((sum, _, k) => sum + A[i][k] * B[k][j], 0)));
}

function matAdd(A, B, sign = 1) {
  if (A.length !== B.length || A[0].length !== B[0].length) return null;
  return A.map((row, i) => row.map((v, j) => v + sign * B[i][j]));
}

const OPS = [
  { key: "add",     label: "A + B (Add)",         twoMatrix: true  },
  { key: "sub",     label: "A − B (Subtract)",    twoMatrix: true  },
  { key: "mul",     label: "A × B (Multiply)",    twoMatrix: true  },
  { key: "scalar",  label: "k × A (Scalar)",      twoMatrix: false },
  { key: "trans",   label: "Aᵀ (Transpose)",      twoMatrix: false },
  { key: "det",     label: "det(A) (Determinant)", twoMatrix: false },
  { key: "inv",     label: "A⁻¹ (Inverse)",        twoMatrix: false },
];

function makeMatrix(rows, cols) { return Array.from({ length: rows }, () => Array(cols).fill("")); }

function parseMatrix(m) {
  return m.map(row => row.map(v => {
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
  }));
}

function MatrixGrid({ rows, cols, values, onChange, label }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ display: "inline-block" }}>
        {values.map((row, r) => (
          <div key={r} style={{ display: "flex", gap: 4, marginBottom: 4 }}>
            {row.map((val, c) => (
              <input key={c} type="number" value={val}
                onChange={e => onChange(r, c, e.target.value)}
                style={{ width: 56, height: 36, textAlign: "center", fontFamily: "monospace", fontWeight: 700, borderRadius: 6, border: "1px solid #d1d5db", background: "#f8f9ff", fontSize: 14 }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultGrid({ matrix, label }) {
  if (!matrix) return null;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ display: "inline-block" }}>
        {matrix.map((row, r) => (
          <div key={r} style={{ display: "flex", gap: 4, marginBottom: 4 }}>
            {row.map((val, c) => (
              <div key={c} style={{ width: 70, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontWeight: 800, fontSize: 14, background: "#f0eeff", borderRadius: 6, color: "#4f46e5", border: "1px solid rgba(99,102,241,0.2)" }}>
                {fmt(val)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MatrixCalculator() {
  const [size, setSize] = useState("2"); // "2" or "3"
  const [op, setOp]     = useState("add");
  const [scalar, setScalar] = useState("2");
  const [mA, setMA] = useState(makeMatrix(2, 2));
  const [mB, setMB] = useState(makeMatrix(2, 2));

  const n = parseInt(size);
  const twoMat = OPS.find(o => o.key === op)?.twoMatrix;

  const setSize2 = (s) => {
    const ns = parseInt(s);
    setSize(s);
    setMA(makeMatrix(ns, ns));
    setMB(makeMatrix(ns, ns));
  };

  const updateA = (r, c, v) => setMA(prev => { const m = prev.map(row => [...row]); m[r][c] = v; return m; });
  const updateB = (r, c, v) => setMB(prev => { const m = prev.map(row => [...row]); m[r][c] = v; return m; });

  const result = useMemo(() => {
    const A = parseMatrix(mA);
    const B = parseMatrix(mB);
    const hasNull = (m) => m.some(row => row.some(v => v === null));

    if (hasNull(A)) return null;
    const numA = A;

    if (op === "trans") return { matrix: transpose(numA) };
    if (op === "det") {
      const d = n === 2 ? det2(numA) : det3(numA);
      return { scalar: d, det: d };
    }
    if (op === "inv") {
      const inv = n === 2 ? inv2(numA) : inv3(numA);
      if (!inv) return { error: "Matrix is singular (determinant = 0). Inverse does not exist." };
      return { matrix: inv };
    }
    if (op === "scalar") {
      const k = parseFloat(scalar);
      if (isNaN(k)) return null;
      return { matrix: numA.map(row => row.map(v => v * k)) };
    }

    if (hasNull(B)) return null;
    const numB = B;

    if (op === "add") {
      const r = matAdd(numA, numB, 1);
      return r ? { matrix: r } : { error: "Matrices must have the same dimensions." };
    }
    if (op === "sub") {
      const r = matAdd(numA, numB, -1);
      return r ? { matrix: r } : { error: "Matrices must have the same dimensions." };
    }
    if (op === "mul") {
      const r = matMul(numA, numB);
      return r ? { matrix: r } : { error: "Column count of A must equal row count of B." };
    }
    return null;
  }, [mA, mB, op, scalar, n]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Matrix Calculator</h1>
        <p className="muted">
          Perform matrix operations: addition, subtraction, multiplication, transpose, determinant,
          inverse, and scalar multiplication for 2×2 and 3×3 matrices.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Setup</h2>

          <div className="row two">
            <div className="field">
              <label>Matrix Size</label>
              <select value={size} onChange={e => setSize2(e.target.value)}>
                <option value="2">2 × 2</option>
                <option value="3">3 × 3</option>
              </select>
            </div>
            <div className="field">
              <label>Operation</label>
              <select value={op} onChange={e => setOp(e.target.value)}>
                {OPS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {op === "scalar" && (
            <div className="row">
              <div className="field">
                <label>Scalar (k)</label>
                <input type="number" value={scalar} onChange={e => setScalar(e.target.value)} />
              </div>
            </div>
          )}

          <MatrixGrid rows={n} cols={n} values={mA} onChange={updateA} label="Matrix A" />
          {twoMat && <MatrixGrid rows={n} cols={n} values={mB} onChange={updateB} label="Matrix B" />}
        </section>

        <section className="card">
          <h2 className="card-title">Result</h2>

          {result?.error ? (
            <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, color: "#b91c1c", fontSize: 13.5 }}>
              {result.error}
            </div>
          ) : result?.matrix ? (
            <ResultGrid matrix={result.matrix} label="Result Matrix" />
          ) : result?.scalar !== undefined ? (
            <div style={{ padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>
                {op === "det" ? "Determinant" : "Result"}
              </div>
              <div style={{ fontSize: 36, fontWeight: 900, color: "#4f46e5", fontFamily: "monospace" }}>
                {fmt(result.scalar)}
              </div>
              {op === "det" && (
                <div style={{ fontSize: 13, color: "#6b7a9e", marginTop: 4 }}>
                  {Math.abs(result.det) < 1e-12 ? "Singular — no inverse exists" : "Non-singular — inverse exists"}
                </div>
              )}
            </div>
          ) : (
            <p className="small">Enter matrix values to see results.</p>
          )}

          <h3 className="card-title" style={{ marginTop: 20 }}>Formulas Reference</h3>
          <table className="table">
            <thead><tr><th>Operation</th><th>Formula / Notes</th></tr></thead>
            <tbody>
              <tr><td>Addition</td><td style={{ fontFamily: "monospace", fontSize: 12 }}>C[i,j] = A[i,j] + B[i,j]</td></tr>
              <tr><td>Multiply</td><td style={{ fontFamily: "monospace", fontSize: 12 }}>C[i,j] = Σ A[i,k]·B[k,j]</td></tr>
              <tr><td>Transpose</td><td style={{ fontFamily: "monospace", fontSize: 12 }}>Aᵀ[i,j] = A[j,i]</td></tr>
              <tr><td>det(2×2)</td><td style={{ fontFamily: "monospace", fontSize: 12 }}>ad − bc</td></tr>
              <tr><td>det(3×3)</td><td style={{ fontFamily: "monospace", fontSize: 12 }}>Cofactor expansion along row 1</td></tr>
              <tr><td>Inverse 2×2</td><td style={{ fontFamily: "monospace", fontSize: 12 }}>(1/det)·[[d,−b],[−c,a]]</td></tr>
              <tr><td>Inverse 3×3</td><td style={{ fontFamily: "monospace", fontSize: 12 }}>(1/det)·adjugate(A)</td></tr>
              <tr><td>Scalar</td><td style={{ fontFamily: "monospace", fontSize: 12 }}>(kA)[i,j] = k·A[i,j]</td></tr>
            </tbody>
          </table>

          <h3 className="card-title" style={{ marginTop: 16 }}>Matrix Properties</h3>
          <table className="table">
            <thead><tr><th>Property</th><th>Formula</th></tr></thead>
            <tbody>
              <tr><td>(AB)ᵀ</td><td style={{ fontFamily: "monospace" }}>= BᵀAᵀ</td></tr>
              <tr><td>(AB)⁻¹</td><td style={{ fontFamily: "monospace" }}>= B⁻¹A⁻¹</td></tr>
              <tr><td>det(AB)</td><td style={{ fontFamily: "monospace" }}>= det(A)·det(B)</td></tr>
              <tr><td>det(Aᵀ)</td><td style={{ fontFamily: "monospace" }}>= det(A)</td></tr>
              <tr><td>A·A⁻¹</td><td style={{ fontFamily: "monospace" }}>= I (identity matrix)</td></tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
