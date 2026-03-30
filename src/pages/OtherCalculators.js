import React from 'react';
import { Link } from 'react-router-dom';
import '../css/CategoryPage.css';

const CS = '/coming-soon';

const sections = [
  {
    title: 'Time & Date',
    items: [
      { label: 'Age Calculator',            to: '/age' },
      { label: 'Time Calculator',           to: '/time' },
      { label: 'Date Calculator',           to: '/date' },
      { label: 'Hours Calculator',          to: '/hours-calculator' },
      { label: 'Day Counter',               to: CS },
      { label: 'Time Zone Calculator',      to: CS },
      { label: 'Time Card Calculator',      to: CS },
      { label: 'Time Duration Calculator',  to: CS },
      { label: 'Day of the Week Calculator',to: CS },
    ],
  },
  {
    title: 'Tech & Conversion',
    items: [
      { label: 'IP Subnet Calculator',      to: '/ip-subnet-calculator' },
      { label: 'Password Generator',        to: '/password' },
      { label: 'Conversion Calculator',     to: '/conversion' },
      { label: 'URL Encode / Decode',       to: CS },
      { label: 'Base64 Encode / Decode',    to: CS },
      { label: 'Bandwidth Calculator',      to: CS },
      { label: 'Roman Numeral Converter',   to: CS },
      { label: 'Shoe Size Conversion',      to: CS },
    ],
  },
  {
    title: 'Education',
    items: [
      { label: 'GPA Calculator',            to: '/gpa-calculator' },
      { label: 'Grade Calculator',          to: '/grade-calculator' },
      { label: 'Height Calculator',         to: CS },
    ],
  },
  {
    title: 'Engineering & Science',
    items: [
      { label: 'Voltage Drop Calculator',   to: CS },
      { label: 'Ohms Law Calculator',       to: CS },
      { label: 'Resistor Calculator',       to: CS },
      { label: 'Electricity Calculator',    to: CS },
      { label: 'Horsepower Calculator',     to: CS },
      { label: 'Engine Horsepower Calculator', to: CS },
      { label: 'Molecular Weight Calculator', to: CS },
      { label: 'Molarity Calculator',       to: CS },
      { label: 'Density Calculator',        to: CS },
      { label: 'Speed Calculator',          to: CS },
      { label: 'Mass Calculator',           to: CS },
      { label: 'Weight Calculator',         to: CS },
      { label: 'GDP Calculator',            to: CS },
    ],
  },
  {
    title: 'Home, Vehicle & Everyday',
    items: [
      { label: 'Concrete Calculator',       to: '/concrete-calculator' },
      { label: 'Stair Calculator',          to: CS },
      { label: 'Roofing Calculator',        to: CS },
      { label: 'Tile Calculator',           to: CS },
      { label: 'Gravel Calculator',         to: CS },
      { label: 'Square Footage Calculator', to: CS },
      { label: 'Mulch Calculator',          to: CS },
      { label: 'BTU Calculator',            to: CS },
      { label: 'Fuel Cost Calculator',      to: CS },
      { label: 'Gas Mileage Calculator',    to: CS },
      { label: 'Mileage Calculator',        to: CS },
      { label: 'Tire Size Calculator',      to: CS },
      { label: 'Tip Calculator',            to: CS },
      { label: 'Sleep Calculator',          to: CS },
      { label: 'Heat Index Calculator',     to: CS },
      { label: 'Wind Chill Calculator',     to: CS },
      { label: 'Dew Point Calculator',      to: CS },
      { label: 'Golf Handicap Calculator',  to: CS },
      { label: 'Love Calculator',           to: CS },
      { label: 'Dice Roller',               to: CS },
      { label: 'Bra Size Calculator',       to: CS },
    ],
  },
];

export default function OtherCalculators() {
  return (
    <div className="cat-page">
      <nav className="cat-breadcrumb" aria-label="breadcrumb">
        <Link to="/">Home</Link>
        <span className="sep">/</span>
        <span>Other Calculators</span>
      </nav>

      <h1 className="cat-title">Other Calculators</h1>
      <p className="cat-desc">
        A versatile collection of everyday tools — from date and time calculators
        to tech utilities, education helpers, and construction estimators.
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
