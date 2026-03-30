import React from 'react';
import { Link } from 'react-router-dom';
import '../css/CategoryPage.css';

const CS = '/coming-soon';

const sections = [
  {
    title: 'Loans & Mortgages',
    items: [
      { label: 'Mortgage Calculator',          to: '/mortgage' },
      { label: 'Auto Loan Calculator',         to: '/auto-loan' },
      { label: 'Loan Calculator',              to: '/loan' },
      { label: 'Payment Calculator',           to: '/payment' },
      { label: 'Amortization Calculator',      to: '/amortization' },
      { label: 'Personal Loan Calculator',     to: CS },
      { label: 'Student Loan Calculator',      to: CS },
      { label: 'Business Loan Calculator',     to: CS },
      { label: 'Boat Loan Calculator',         to: CS },
      { label: 'Auto Lease Calculator',        to: CS },
      { label: 'Lease Calculator',             to: CS },
      { label: 'VA Mortgage Calculator',       to: CS },
      { label: 'FHA Loan Calculator',          to: CS },
      { label: 'HELOC Calculator',             to: CS },
      { label: 'Home Equity Loan Calculator',  to: CS },
      { label: 'Refinance Calculator',         to: CS },
      { label: 'Down Payment Calculator',      to: CS },
      { label: 'Mortgage Payoff Calculator',   to: CS },
    ],
  },
  {
    title: 'Tax & Income',
    items: [
      { label: 'Income Tax Calculator',        to: '/income-tax' },
      { label: 'Interest Calculator',          to: '/interest' },
      { label: 'Simple Interest Calculator',   to: '/interest' },
      { label: 'Salary Calculator',            to: CS },
      { label: 'Social Security Calculator',   to: CS },
      { label: 'Estate Tax Calculator',        to: CS },
      { label: 'Sales Tax Calculator',         to: CS },
      { label: 'VAT Calculator',               to: CS },
      { label: 'Marriage Tax Calculator',      to: CS },
      { label: 'Take-Home-Paycheck Calculator',to: CS },
    ],
  },
  {
    title: 'Investments & Savings',
    items: [
      { label: 'Investment Calculator',        to: '/investment' },
      { label: 'Inflation Calculator',         to: '/inflation' },
      { label: 'Retirement Calculator',        to: '/retirement' },
      { label: 'Compound Interest Calculator', to: CS },
      { label: 'Savings Calculator',           to: CS },
      { label: '401K Calculator',              to: CS },
      { label: 'Roth IRA Calculator',          to: CS },
      { label: 'IRA Calculator',               to: CS },
      { label: 'CD Calculator',                to: CS },
      { label: 'Mutual Fund Calculator',       to: CS },
      { label: 'Bond Calculator',              to: CS },
      { label: 'Annuity Calculator',           to: CS },
      { label: 'Annuity Payout Calculator',    to: CS },
      { label: 'Pension Calculator',           to: CS },
      { label: 'RMD Calculator',               to: CS },
      { label: 'Average Return Calculator',    to: CS },
      { label: 'ROI Calculator',               to: CS },
      { label: 'IRR Calculator',               to: CS },
      { label: 'APR Calculator',               to: CS },
    ],
  },
  {
    title: 'Budgeting & Planning',
    items: [
      { label: 'Currency Calculator',              to: CS },
      { label: 'Finance Calculator',               to: CS },
      { label: 'Budget Calculator',                to: CS },
      { label: 'House Affordability Calculator',   to: CS },
      { label: 'Rent Calculator',                  to: CS },
      { label: 'Rent vs. Buy Calculator',          to: CS },
      { label: 'Rental Property Calculator',       to: CS },
      { label: 'Real Estate Calculator',           to: CS },
      { label: 'Present Value Calculator',         to: CS },
      { label: 'Future Value Calculator',          to: CS },
      { label: 'Discount Calculator',              to: CS },
      { label: 'Depreciation Calculator',          to: CS },
      { label: 'Margin Calculator',                to: CS },
      { label: 'Cash Back or Low Interest Calculator', to: CS },
      { label: 'Credit Cards Payoff Calculator',   to: CS },
      { label: 'Credit Card Calculator',           to: CS },
      { label: 'Debt Consolidation Calculator',    to: CS },
      { label: 'Debt Payoff Calculator',           to: CS },
      { label: 'Repayment Calculator',             to: CS },
      { label: 'Debt-to-Income Ratio Calculator',  to: CS },
      { label: 'College Cost Calculator',          to: CS },
      { label: 'Payback Period Calculator',        to: CS },
    ],
  },
];

export default function FinancialCalculators() {
  return (
    <div className="cat-page">
      <nav className="cat-breadcrumb" aria-label="breadcrumb">
        <Link to="/">Home</Link>
        <span className="sep">/</span>
        <span>Financial Calculators</span>
      </nav>

      <h1 className="cat-title">Financial Calculators</h1>
      <p className="cat-desc">
        Plan your finances with confidence. From mortgage and loan calculators to
        retirement and investment tools — everything you need to make smarter money decisions.
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
