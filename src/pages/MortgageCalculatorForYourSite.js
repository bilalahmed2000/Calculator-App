import React from "react";
import EmbedCalculatorPage from "../components/EmbedCalculatorPage";
import MortgageCalculator from "./MortgageCalculator";

export default function MortgageCalculatorForYourSite() {
  return (
    <EmbedCalculatorPage
      title="Mortgage Calculator for Your Site"
      description="Embed a fully functional mortgage calculator on your website. Perfect for real estate, finance, or home-buying blogs. Free to use — no sign-up required."
      calcPath="/mortgage"
      CalculatorComponent={MortgageCalculator}
    />
  );
}
