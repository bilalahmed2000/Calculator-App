import React from "react";
import EmbedCalculatorPage from "../components/EmbedCalculatorPage";
import PercentageCalculator from "./PercentageCalculator";

export default function MathCalculatorForYourSite() {
  return (
    <EmbedCalculatorPage
      title="Math Calculator for Your Site"
      description="Embed a versatile math calculator on your website. Great for educational platforms, tutoring sites, or any content that involves mathematical calculations."
      calcPath="/percentage"
      CalculatorComponent={PercentageCalculator}
    />
  );
}
