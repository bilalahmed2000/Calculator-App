import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import './App.css';
import CalorieCalculator from './pages/CalorieCalculator';
import BMICalculator from './pages/BMICalculator';
import BodyFatCalculator from './pages/BodyFatCalculator';
import BMRCalculator from './pages/BMRCalculator';
import IdealWeightCalculator from './pages/IdealWeightCalculator';
import PaceCalculator from './pages/PaceCalculator';
import PregnancyCalculator from './pages/PregnancyCalculator';
import DueDateCalculator from './pages/DueDateCalculator';
import MortgageCalculator from './pages/MortgageCalculator';
import LoanCalculator from './pages/LoanCalculator';
import AutoLoanCalculator from './pages/AutoLoanCalculator';
import InterestCalculator from './pages/InterestCalculator';
import AgeCalculator from './pages/AgeCalculator';
import PasswordGenerator from './pages/PasswordGenerator';
import ConversionCalculator from './pages/ConversionCalculator';
import DateCalculator from './pages/ConversionCalculator';
import TimeCalculator from './pages/TimeCalculator';
import PaymentCalculator from './pages/PaymentCalculator';
import RetirementCalculator from './pages/RetirementCalculator';
import AmortizationCalculator from './pages/AmortizationCalculator';
import InvestmentCalculator from './pages/InvestmentCalculator';


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calories" element={<CalorieCalculator />} />
         <Route path="/bmi" element={<BMICalculator />} />
         <Route path="/body-fat" element={<BodyFatCalculator />} />
          <Route path="/bmr" element={<BMRCalculator />} />
          <Route path="/ideal-weight" element={<IdealWeightCalculator />} />
           <Route path="/pace" element={<PaceCalculator />} />
           <Route path="/pregnancy" element={<PregnancyCalculator />} />
           <Route path="/due-date" element={<DueDateCalculator />} />
           <Route path="/mortgage" element={<MortgageCalculator />} />
           <Route path="/loan" element={<LoanCalculator />} />
           <Route path="/auto-loan" element={<AutoLoanCalculator />} />
           <Route path="/interest" element={<InterestCalculator />} />
           <Route path="/age" element={<AgeCalculator />} />
           <Route path="/password" element={<PasswordGenerator />} />
           <Route path="/conversion" element={<ConversionCalculator />} />
           <Route path="/date" element={<DateCalculator />} />
           <Route path="/time" element={<TimeCalculator />} />
           <Route path="/payment" element={<PaymentCalculator />} />
          <Route path="/retirement" element={<RetirementCalculator />} /> 
          <Route path="/amortization" element={<AmortizationCalculator />} />
          <Route path="/investment" element={<InvestmentCalculator />} />





      </Routes>
    </Router>
  );
}

export default App;
