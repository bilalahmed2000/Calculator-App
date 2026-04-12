import React from 'react';
import { Link } from 'react-router-dom';
import '../css/CategoryPage.css';

const CS = '/coming-soon';

const sections = [
  {
    title: 'Body Composition',
    items: [
      { label: 'BMI Calculator',                  to: '/bmi' },
      { label: 'Body Fat Calculator',             to: '/body-fat' },
      { label: 'BMR Calculator',                  to: '/bmr' },
      { label: 'Calorie Calculator',              to: '/calories' },
      { label: 'Ideal Weight Calculator',         to: '/ideal-weight' },
      { label: 'Macro Calculator',                to: '/macro' },
      { label: 'TDEE Calculator',                 to: '/tdee' },
      { label: 'Healthy Weight Calculator',       to: '/healthy-weight' },
      { label: 'Lean Body Mass Calculator',       to: '/lean-body-mass' },
      { label: 'Body Surface Area Calculator',    to: '/body-surface-area' },
      { label: 'Army Body Fat Calculator',        to: '/army-body-fat' },
      { label: 'Body Type Calculator',            to: '/body-type' },
    ],
  },
  {
    title: 'Pregnancy & Maternity',
    items: [
      { label: 'Pregnancy Calculator',            to: '/pregnancy' },
      { label: 'Due Date Calculator',             to: '/due-date' },
      { label: 'Pregnancy Conception Calculator', to: '/pregnancy-conception' },
      { label: 'Pregnancy Weight Gain Calculator',to: '/pregnancy-weight-gain' },
      { label: 'Conception Calculator',           to: '/conception' },
      { label: 'Ovulation Calculator',            to: '/ovulation' },
      { label: 'Period Calculator',               to: '/period' },
    ],
  },
  {
    title: 'Performance & Activity',
    items: [
      { label: 'Pace Calculator',                 to: '/pace' },
      { label: 'One Rep Max Calculator',          to: '/one-rep-max' },
      { label: 'Protein Calculator',              to: '/protein' },
      { label: 'Carbohydrate Calculator',         to: '/carbohydrate' },
      { label: 'Calories Burned Calculator',      to: '/calories-burned' },
      { label: 'Target Heart Rate Calculator',    to: '/target-heart-rate' },
      { label: 'Fat Intake Calculator',           to: '/fat-intake' },
    ],
  },
  {
    title: 'Other Health',
    items: [
      { label: 'GFR Calculator',                  to: '/gfr' },
      { label: 'BAC Calculator',                  to: '/bac' },
    ],
  },
];

export default function FitnessHealthCalculators() {
  return (
    <div className="cat-page">
      <nav className="cat-breadcrumb" aria-label="breadcrumb">
        <Link to="/">Home</Link>
        <span className="sep">/</span>
        <span>Fitness &amp; Health Calculators</span>
      </nav>

      <h1 className="cat-title">Fitness &amp; Health Calculators</h1>
      <p className="cat-desc">
        Track and improve your health with tools for body composition, pregnancy,
        calorie needs, and athletic performance — all in one place.
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
