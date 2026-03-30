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
      { label: 'Macro Calculator',                to: CS },
      { label: 'TDEE Calculator',                 to: CS },
      { label: 'Healthy Weight Calculator',       to: CS },
      { label: 'Lean Body Mass Calculator',       to: CS },
      { label: 'Body Surface Area Calculator',    to: CS },
      { label: 'Army Body Fat Calculator',        to: CS },
      { label: 'Anorexic BMI Calculator',         to: CS },
      { label: 'Overweight Calculator',           to: CS },
      { label: 'Body Type Calculator',            to: CS },
    ],
  },
  {
    title: 'Pregnancy & Maternity',
    items: [
      { label: 'Pregnancy Calculator',            to: '/pregnancy' },
      { label: 'Due Date Calculator',             to: '/due-date' },
      { label: 'Pregnancy Conception Calculator', to: CS },
      { label: 'Pregnancy Weight Gain Calculator',to: CS },
      { label: 'Conception Calculator',           to: CS },
      { label: 'Ovulation Calculator',            to: CS },
      { label: 'Period Calculator',               to: CS },
    ],
  },
  {
    title: 'Performance & Activity',
    items: [
      { label: 'Pace Calculator',                 to: '/pace' },
      { label: 'One Rep Max Calculator',          to: CS },
      { label: 'Protein Calculator',              to: CS },
      { label: 'Carbohydrate Calculator',         to: CS },
      { label: 'Calories Burned Calculator',      to: CS },
      { label: 'Target Heart Rate Calculator',    to: CS },
      { label: 'Fat Intake Calculator',           to: CS },
    ],
  },
  {
    title: 'Other Health',
    items: [
      { label: 'GFR Calculator',                  to: CS },
      { label: 'BAC Calculator',                  to: CS },
      { label: 'Weight Watcher Points Calculator',to: CS },
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
