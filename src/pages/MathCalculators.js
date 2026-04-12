import React from 'react';
import { Link } from 'react-router-dom';
import '../css/CategoryPage.css';

const CS = '/coming-soon';

const sections = [
  {
    title: 'Core Math',
    items: [
      { label: 'Scientific Calculator',          to: '/scientific' },
      { label: 'Percentage Calculator',          to: '/percentage' },
      { label: 'Fraction Calculator',            to: '/fraction' },
      { label: 'Rounding Calculator',            to: '/rounding' },
      { label: 'Root Calculator',                to: '/root' },
      { label: 'Exponent Calculator',            to: '/exponent' },
      { label: 'Log Calculator',                 to: '/log' },
      { label: 'Hex Calculator',                 to: '/hex' },
      { label: 'Binary Calculator',              to: '/binary' },
      { label: 'Big Number Calculator',          to: '/big-number' },
      { label: 'Scientific Notation Calculator', to: '/scientific-notation' },
      { label: 'Number Sequence Calculator',     to: '/number-sequence' },
    ],
  },
  {
    title: 'Geometry',
    items: [
      { label: 'Triangle Calculator',              to: '/triangle-calculator' },
      { label: 'Volume Calculator',                to: '/volume' },
      { label: 'Area Calculator',                  to: '/area' },
      { label: 'Circle Calculator',                to: '/circle' },
      { label: 'Surface Area Calculator',          to: '/surface-area' },
      { label: 'Right Triangle Calculator',        to: '/right-triangle' },
      { label: 'Pythagorean Theorem Calculator',   to: '/pythagorean-theorem' },
      { label: 'Slope Calculator',                 to: '/slope' },
      { label: 'Distance Calculator',              to: '/distance' },
      { label: 'Ratio Calculator',                 to: '/ratio' },
    ],
  },
  {
    title: 'Algebra & Advanced',
    items: [
      { label: 'Quadratic Formula Calculator', to: CS },
      { label: 'Prime Factorization Calculator', to: CS },
      { label: 'Greatest Common Factor Calculator', to: CS },
      { label: 'Least Common Multiple Calculator', to: CS },
      { label: 'Factor Calculator',            to: CS },
      { label: 'Common Factor Calculator',     to: CS },
      { label: 'Half-Life Calculator',         to: CS },
      { label: 'Matrix Calculator',            to: CS },
    ],
  },
  {
    title: 'Statistics & Probability',
    items: [
      { label: 'Standard Deviation Calculator', to: '/std-dev' },
      { label: 'Random Number Generator',      to: '/random-number-generator' },
      { label: 'Probability Calculator',       to: CS },
      { label: 'Mean Median Mode Range Calculator', to: CS },
      { label: 'Z-score Calculator',           to: CS },
      { label: 'Statistics Calculator',        to: CS },
      { label: 'Permutation and Combination Calculator', to: CS },
      { label: 'Confidence Interval Calculator', to: CS },
      { label: 'Sample Size Calculator',       to: CS },
      { label: 'P-value Calculator',           to: CS },
      { label: 'Percent Error Calculator',     to: CS },
    ],
  },
];

export default function MathCalculators() {
  return (
    <div className="cat-page">
      <nav className="cat-breadcrumb" aria-label="breadcrumb">
        <Link to="/">Home</Link>
        <span className="sep">/</span>
        <span>Math Calculators</span>
      </nav>

      <h1 className="cat-title">Math Calculators</h1>
      <p className="cat-desc">
        From basic arithmetic to advanced statistics and geometry — solve any math problem
        quickly and accurately with these calculators.
      </p>

      {sections.map(sec => (
        <section key={sec.title} className="cat-section">
          <h2 className="cat-section-title">{sec.title}</h2>
          <div className="cat-grid">
            {sec.items.map(item => (
              <Link
                key={item.label}
                to={item.to}
                className={`cat-card${item.to === CS ? ' cat-muted' : ''}`}
              >
                {item.label}
                {item.to !== CS && <span className="cat-card-arrow">→</span>}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
