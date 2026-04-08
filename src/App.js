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
import InflationCalculator from './pages/InflationCalculator';
import IncomeTaxCalculator from './pages/IncomeTaxCalculator';
import ScientificCalculator from './pages/ScientificCalculator';
import FractionCalculator from './pages/FractionCalculator';
import PercentageCalculator from './pages/PercentageCalculator';
import RandomNumberGenerator from './pages/RandomNumberGenerator';
import TriangleCalculator from './pages/TriangleCalculator';
import StandardDeviationCalculator from './pages/StandardDeviationCalculator';
import HoursCalculator from './pages/HoursCalculator';
import GPACalculator from './pages/GPACalculator';
import IPSubnetCalculator from './pages/IPSubnetCalculator';
import GradeCalculator from './pages/GradeCalculator';
import ConcreteCalculator from './pages/ConcreteCalculator';
import AllCalculators from './pages/AllCalculators';
import ComingSoon from './pages/ComingSoon';
import PersonalLoanCalculator from './pages/PersonalLoanCalculator';
import StudentLoanCalculator from './pages/StudentLoanCalculator';
import BusinessLoanCalculator from './pages/BusinessLoanCalculator';
import BoatLoanCalculator from './pages/BoatLoanCalculator';
import AutoLeaseCalculator from './pages/AutoLeaseCalculator';
import LeaseCalculator from './pages/LeaseCalculator';
import VAMortgageCalculator from './pages/VAMortgageCalculator';
import FHALoanCalculator from './pages/FHALoanCalculator';
import HELOCCalculator from './pages/HELOCCalculator';
import HomeEquityLoanCalculator from './pages/HomeEquityLoanCalculator';
import MortgagePayoffCalculator from './pages/MortgagePayoffCalculator';
import RefinanceCalculator from './pages/RefinanceCalculator';
import DownPaymentCalculator from './pages/DownPaymentCalculator';
import FinancialCalculators from './pages/FinancialCalculators';
import FitnessHealthCalculators from './pages/FitnessHealthCalculators';
import MathCalculators from './pages/MathCalculators';
import OtherCalculators from './pages/OtherCalculators';
import SalaryCalculator from './pages/SalaryCalculator';
import SocialSecurityCalculator from './pages/SocialSecurityCalculator';
import EstateTaxCalculator from './pages/EstateTaxCalculator';
import SalesTaxCalculator from './pages/SalesTaxCalculator';
import VATCalculator from './pages/VATCalculator';
import MarriageTaxCalculator from './pages/MarriageTaxCalculator';
import TakeHomePayCalculator from './pages/TakeHomePayCalculator';
import CompoundInterestCalculator from './pages/CompoundInterestCalculator';
import SavingsCalculator from './pages/SavingsCalculator';
import Calculator401K from './pages/Calculator401K';
import RothIRACalculator from './pages/RothIRACalculator';
import IRACalculator from './pages/IRACalculator';
import CDCalculator from './pages/CDCalculator';
import MutualFundCalculator from './pages/MutualFundCalculator';
import BondCalculator from './pages/BondCalculator';
import AnnuityCalculator from './pages/AnnuityCalculator';
import AnnuityPayoutCalculator from './pages/AnnuityPayoutCalculator';
import PensionCalculator from './pages/PensionCalculator';
import RMDCalculator from './pages/RMDCalculator';
import AverageReturnCalculator from './pages/AverageReturnCalculator';
import ROICalculator from './pages/ROICalculator';
import IRRCalculator from './pages/IRRCalculator';
import APRCalculator from './pages/APRCalculator';

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
          <Route path="/inflation" element={<InflationCalculator />} />
          <Route path="/income-tax" element={<IncomeTaxCalculator />} />
          <Route path="/scientific" element={<ScientificCalculator />} />
          <Route path="/fraction-calculator" element={<FractionCalculator />} />
          <Route path="/percentage-calculator" element={<PercentageCalculator />} />
          <Route path="/random-number-generator" element={<RandomNumberGenerator />} />
          <Route path="/triangle-calculator" element={<TriangleCalculator />} />
          <Route path="/standard-deviation-calculator" element={<StandardDeviationCalculator />} />
          <Route path="/std-dev" element={<StandardDeviationCalculator />} />
          <Route path="/fraction" element={<FractionCalculator />} />
          <Route path="/percentage" element={<PercentageCalculator />} />
          <Route path="/hours-calculator" element={<HoursCalculator />} />
          <Route path="/gpa-calculator" element={<GPACalculator />} />
          <Route path="/ip-subnet-calculator" element={<IPSubnetCalculator />} />
          <Route path="/grade-calculator" element={<GradeCalculator />} />
          <Route path="/concrete-calculator" element={<ConcreteCalculator />} />
          <Route path="/personal-loan" element={<PersonalLoanCalculator />} />
          <Route path="/student-loan" element={<StudentLoanCalculator />} />
          <Route path="/business-loan" element={<BusinessLoanCalculator />} />
          <Route path="/boat-loan" element={<BoatLoanCalculator />} />
          <Route path="/auto-lease" element={<AutoLeaseCalculator />} />
          <Route path="/lease" element={<LeaseCalculator />} />
          <Route path="/va-mortgage" element={<VAMortgageCalculator />} />
          <Route path="/fha-loan" element={<FHALoanCalculator />} />
          <Route path="/heloc" element={<HELOCCalculator />} />
          <Route path="/home-equity-loan" element={<HomeEquityLoanCalculator />} />
          <Route path="/mortgage-payoff" element={<MortgagePayoffCalculator />} />
          <Route path="/refinance" element={<RefinanceCalculator />} />
          <Route path="/down-payment" element={<DownPaymentCalculator />} />
          <Route path="/salary" element={<SalaryCalculator />} />
          <Route path="/social-security" element={<SocialSecurityCalculator />} />
          <Route path="/estate-tax" element={<EstateTaxCalculator />} />
          <Route path="/sales-tax" element={<SalesTaxCalculator />} />
          <Route path="/vat" element={<VATCalculator />} />
          <Route path="/marriage-tax" element={<MarriageTaxCalculator />} />
          <Route path="/take-home-pay" element={<TakeHomePayCalculator />} />
          <Route path="/compound-interest" element={<CompoundInterestCalculator />} />
          <Route path="/savings" element={<SavingsCalculator />} />
          <Route path="/401k" element={<Calculator401K />} />
          <Route path="/roth-ira" element={<RothIRACalculator />} />
          <Route path="/ira" element={<IRACalculator />} />
          <Route path="/cd" element={<CDCalculator />} />
          <Route path="/mutual-fund" element={<MutualFundCalculator />} />
          <Route path="/bond" element={<BondCalculator />} />
          <Route path="/annuity" element={<AnnuityCalculator />} />
          <Route path="/annuity-payout" element={<AnnuityPayoutCalculator />} />
          <Route path="/pension" element={<PensionCalculator />} />
          <Route path="/rmd" element={<RMDCalculator />} />
          <Route path="/average-return" element={<AverageReturnCalculator />} />
          <Route path="/roi" element={<ROICalculator />} />
          <Route path="/irr" element={<IRRCalculator />} />
          <Route path="/apr" element={<APRCalculator />} />
          <Route path="/all" element={<AllCalculators />} />
          <Route path="/coming-soon" element={<ComingSoon />} />
          <Route path="/financial" element={<FinancialCalculators />} />
          <Route path="/fitness" element={<FitnessHealthCalculators />} />
          <Route path="/math" element={<MathCalculators />} />
          <Route path="/other" element={<OtherCalculators />} />
      </Routes>
    </Router>
  );
}

export default App;
