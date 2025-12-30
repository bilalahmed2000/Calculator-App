import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Navbar.css';  

function Navbar() {
  // example: add this near your Navbar component
document.querySelector('.navbar-toggle')?.addEventListener('click', () => {
  document.querySelector('.navbar-links')?.classList.toggle('open');
});

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">Smart Calulators</Link>
      </div>
      <ul className="navbar-links">
        <li><Link to="/">FINANCIAL</Link></li>
        <li><Link to="/">FITNESS & HEALTH</Link></li>
        <li><Link to="/">MATH</Link></li>
        <li><Link to="/">OTHER</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
