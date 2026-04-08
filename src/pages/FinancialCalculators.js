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
      { label: 'Personal Loan Calculator',     to: '/personal-loan' },
      { label: 'Student Loan Calculator',      to: '/student-loan' },
      { label: 'Business Loan Calculator',     to: '/business-loan' },
      { label: 'Boat Loan Calculator',         to: '/boat-loan' },
      { label: 'Auto Lease Calculator',        to: '/auto-lease' },
      { label: 'Lease Calculator',             to: '/lease' },
      { label: 'VA Mortgage Calculator',       to: '/va-mortgage' },
      { label: 'FHA Loan Calculator',          to: '/fha-loan' },
      { label: 'HELOC Calculator',             to: '/heloc' },
      { label: 'Home Equity Loan Calculator',  to: '/home-equity-loan' },
      { label: 'Refinance Calculator',         to: '/refinance' },
      { label: 'Down Payment Calculator',      to: '/down-payment' },
      { label: 'Mortgage Payoff Calculator',   to: '/mortgage-payoff' },
    ],
  },
  {
    title: 'Tax & Income',
    items: [
      { label: 'Income Tax Calculator',        to: '/income-tax' },
      { label: 'Interest Calculator',          to: '/interest' },
      { label: 'Simple Interest Calculator',   to: '/interest' },
      { label: 'Salary Calculator',            to: '/salary' },
      { label: 'Social Security Calculator',   to: '/social-security' },
      { label: 'Estate Tax Calculator',        to: '/estate-tax' },
      { label: 'Sales Tax Calculator',         to: '/sales-tax' },
      { label: 'VAT Calculator',               to: '/vat' },
      { label: 'Marriage Tax Calculator',      to: '/marriage-tax' },
      { label: 'Take-Home-Paycheck Calculator',to: '/take-home-pay' },
    ],
  },
  {
    title: 'Investments & Savings',
    items: [
      { label: 'Investment Calculator',        to: '/investment' },
      { label: 'Inflation Calculator',         to: '/inflation' },
      { label: 'Retirement Calculator',        to: '/retirement' },
      { label: 'Compound Interest Calculator', to: '/compound-interest' },
      { label: 'Savings Calculator',           to: '/savings' },
      { label: '401K Calculator',              to: '/401k' },
      { label: 'Roth IRA Calculator',          to: '/roth-ira' },
      { label: 'IRA Calculator',               to: '/ira' },
      { label: 'CD Calculator',                to: '/cd' },
      { label: 'Mutual Fund Calculator',       to: '/mutual-fund' },
      { label: 'Bond Calculator',              to: '/bond' },
      { label: 'Annuity Calculator',           to: '/annuity' },
      { label: 'Annuity Payout Calculator',    to: '/annuity-payout' },
      { label: 'Pension Calculator',           to: '/pension' },
      { label: 'RMD Calculator',               to: '/rmd' },
      { label: 'Average Return Calculator',    to: '/average-return' },
      { label: 'ROI Calculator',               to: '/roi' },
      { label: 'IRR Calculator',               to: '/irr' },
      { label: 'APR Calculator',               to: '/apr' },
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
