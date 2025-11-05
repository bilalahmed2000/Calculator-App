import React from 'react';
import '../css/Home.css'; 

function Home() {
  return (
    <div className="home-container">
      <h1>Welcome to Calculator.net</h1>
      <p>
        The Payment Calculator can determine the monthly payment amount or loan term for a fixed interest loan.
      </p>
      <button className="btn">Get Started</button>
    </div>
  );
}

export default Home;
