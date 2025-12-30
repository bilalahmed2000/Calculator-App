import React from "react";
import { Link } from "react-router-dom"; // optional; remove if not using React Router
import "../css/Home.css";

const categories = [
  {
    title: "Financial Calculators",
    links: [
      { label: "Mortgage Calculator", to: "/mortgage" },
      { label: "Loan Calculator", to: "/loan" },
      { label: "Auto Loan Calculator", to: "/auto-loan" },
      { label: "Interest Calculator", to: "/interest" },
      { label: "Payment Calculator", to: "/payment" },
      { label: "Retirement Calculator", to: "/retirement" },
      { label: "Amortization Calculator", to: "/amortization" },
      { label: "Investment Calculator", to: "/investment" },
      { label: "Inflation Calculator", to: "/inflation" },
      { label: "Income Tax Calculator", to: "/income-tax" },
    ],
  },
  {
    title: "Fitness & Health Calculators",
    links: [
      { label: "BMI Calculator", to: "/bmi" },
      { label: "Calorie Calculator", to: "/calories" },
      { label: "Body Fat Calculator", to: "/body-fat" },
      { label: "BMR Calculator", to: "/bmr" },
      { label: "Ideal Weight Calculator", to: "/ideal-weight" },
      { label: "Pace Calculator", to: "/pace" },
      { label: "Pregnancy Calculator", to: "/pregnancy" },
      { label: "Due Date Calculator", to: "/due-date" },
    ],
  },
  {
    title: "Math Calculators",
    links: [
      { label: "Scientific Calculator", to: "/scientific" },
      { label: "Fraction Calculator", to: "/fraction" },
      { label: "Percentage Calculator", to: "/percentage" },
      { label: "Random Number Generator", to: "/rng" },
      { label: "Triangle Calculator", to: "/triangle" },
      { label: "Standard Deviation", to: "/std-dev" },
    ],
  },
  {
    title: "Other Calculators",
    links: [
      { label: "Age Calculator", to: "/age" },
      { label: "Date Calculator", to: "/date" },
      { label: "Time Calculator", to: "/time" },
      { label: "Hours Calculator", to: "/hours" },
      { label: "GPA Calculator", to: "/gpa" },
      { label: "Subnet Calculator", to: "/subnet" },
      { label: "Password Generator", to: "/password" },
      { label: "Conversion Calculator", to: "/conversion" },
    ],
  },
];

export default function Home() {
  return (
    <div className="home-container">
      {/* Hero */}
      {/* <section className="hero-card">
        <h1>Welcome to Calculator.net</h1>
        <p>
          The Payment Calculator can determine the monthly payment amount or
          loan term for a fixed-interest loan.
        </p>
        <div className="btn-row">
          <a className="btn" href="#catalog">
            Get Started
          </a>
        </div>
      </section> */}

      {/* Category Grid */}
      <section id="catalog" className="catalog">
        {categories.map((cat) => (
          <div key={cat.title} className="category">
            <h2 className="category-title">{cat.title}</h2>
            <ul className="link-list">
              {cat.links.map((l) => (
                <li key={l.label}>
                  {/* If you don’t use React Router, replace <Link> with <a href={l.to}> */}
                  <Link to={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="cta-wrap">
        <a className="cta-btn" href="/all">
          <span>All Calculators</span>
          <svg
            aria-hidden="true"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            className="cta-icon"
          >
            <path d="M5 12h12M13 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </a>
      </section>
    </div>
  );
}
