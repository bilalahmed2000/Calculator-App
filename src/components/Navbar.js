import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Navbar.css';  

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">Calculator.net</Link>
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
