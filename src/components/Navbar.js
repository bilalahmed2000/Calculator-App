import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../css/Navbar.css';
import logoImg from '../themeD_sigma_badge.png';

const navData = [
  {
    label: 'FINANCIAL',
    to: '/financial',
    links: [
      { label: 'Mortgage Calculator',    to: '/mortgage' },
      { label: 'Auto Loan Calculator',   to: '/auto-loan' },
      { label: 'Loan Calculator',        to: '/loan' },
      { label: 'Payment Calculator',     to: '/payment' },
      { label: 'Amortization Calculator',to: '/amortization' },
      { label: 'Interest Calculator',    to: '/interest' },
      { label: 'Income Tax Calculator',  to: '/income-tax' },
      { label: 'Investment Calculator',  to: '/investment' },
      { label: 'Inflation Calculator',   to: '/inflation' },
      { label: 'Retirement Calculator',  to: '/retirement' },
    ],
  },
  {
    label: 'FITNESS & HEALTH',
    to: '/fitness',
    links: [
      { label: 'BMI Calculator',         to: '/bmi' },
      { label: 'Calorie Calculator',     to: '/calories' },
      { label: 'Body Fat Calculator',    to: '/body-fat' },
      { label: 'BMR Calculator',         to: '/bmr' },
      { label: 'Ideal Weight Calculator',to: '/ideal-weight' },
      { label: 'Pace Calculator',        to: '/pace' },
      { label: 'Pregnancy Calculator',   to: '/pregnancy' },
      { label: 'Due Date Calculator',    to: '/due-date' },
    ],
  },
  {
    label: 'MATH',
    to: '/math',
    links: [
      { label: 'Scientific Calculator',      to: '/scientific' },
      { label: 'Percentage Calculator',      to: '/percentage' },
      { label: 'Fraction Calculator',        to: '/fraction' },
      { label: 'Triangle Calculator',        to: '/triangle-calculator' },
      { label: 'Standard Deviation',         to: '/std-dev' },
      { label: 'Random Number Generator',    to: '/random-number-generator' },
    ],
  },
  {
    label: 'OTHER',
    to: '/other',
    links: [
      { label: 'Age Calculator',         to: '/age' },
      { label: 'Time Calculator',        to: '/time' },
      { label: 'Date Calculator',        to: '/date' },
      { label: 'Hours Calculator',       to: '/hours-calculator' },
      { label: 'GPA Calculator',         to: '/gpa-calculator' },
      { label: 'Grade Calculator',       to: '/grade-calculator' },
      { label: 'IP Subnet Calculator',   to: '/ip-subnet-calculator' },
      { label: 'Password Generator',     to: '/password' },
      { label: 'Conversion Calculator',  to: '/conversion' },
      { label: 'Concrete Calculator',    to: '/concrete-calculator' },
    ],
  },
];

const Chevron = ({ className }) => (
  <svg className={className} width="11" height="11" viewBox="0 0 12 12" aria-hidden="true" fill="none">
    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Navbar() {
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [hovered, setHovered]             = useState(null);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const location = useLocation();

  // Close everything on navigation
  useEffect(() => {
    setMobileOpen(false);
    setMobileExpanded(null);
  }, [location.pathname]);

  const toggleMobileAccordion = (label) =>
    setMobileExpanded(prev => (prev === label ? null : label));

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="navbar-logo">
        <Link to="/">
          <img src={logoImg} alt="Smart Calculators" className="navbar-logo-img" />
        </Link>
      </div>

      {/* ── Desktop nav ── */}
      <ul className="navbar-links desktop-nav">
        {navData.map(item => (
          <li
            key={item.label}
            className="nav-item"
            onMouseEnter={() => setHovered(item.label)}
            onMouseLeave={() => setHovered(null)}
          >
            <Link to={item.to} className="nav-link">
              {item.label}
              <Chevron className={`nav-chevron${hovered === item.label ? ' rotated' : ''}`} />
            </Link>

            {/* Desktop dropdown panel */}
            <div className={`nav-dropdown${hovered === item.label ? ' open' : ''}`}>
              <div className="nav-dropdown-grid">
                {item.links.map(l => (
                  <Link key={l.label} to={l.to} className="nav-dropdown-link">
                    {l.label}
                  </Link>
                ))}
              </div>
              <div className="nav-dropdown-footer">
                <Link to={item.to} className="nav-dropdown-all">
                  View all {item.label.charAt(0) + item.label.slice(1).toLowerCase()} →
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* ── Mobile nav panel ── */}
      <div className={`mobile-nav-panel${mobileOpen ? ' open' : ''}`}>
        {navData.map(item => (
          <div key={item.label} className="mobile-nav-item">
            <div className="mobile-nav-row">
              <Link to={item.to} className="mobile-nav-label">
                {item.label}
              </Link>
              <button
                className="mobile-nav-toggle"
                onClick={() => toggleMobileAccordion(item.label)}
                aria-expanded={mobileExpanded === item.label}
                aria-label={`Toggle ${item.label} submenu`}
              >
                <Chevron className={`nav-chevron${mobileExpanded === item.label ? ' rotated' : ''}`} />
              </button>
            </div>

            {mobileExpanded === item.label && (
              <div className="mobile-nav-links">
                {item.links.map(l => (
                  <Link key={l.label} to={l.to} className="mobile-nav-sublink">
                    {l.label}
                  </Link>
                ))}
                <Link to={item.to} className="mobile-nav-sublink mobile-view-all">
                  View all →
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Hamburger */}
      <button
        className="navbar-toggle"
        onClick={() => setMobileOpen(prev => !prev)}
        aria-label="Toggle menu"
        aria-expanded={mobileOpen}
      >
        <span className={`bar${mobileOpen ? ' open' : ''}`} />
        <span className={`bar${mobileOpen ? ' open' : ''}`} />
        <span className={`bar${mobileOpen ? ' open' : ''}`} />
      </button>
    </nav>
  );
}
