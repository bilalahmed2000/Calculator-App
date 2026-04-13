import React from "react";
import EmbedCalculatorPage from "../components/EmbedCalculatorPage";
import ConcreteCalculator from "./ConcreteCalculator";

export default function ConcreteCalculatorForYourSite() {
  return (
    <EmbedCalculatorPage
      title="Concrete Calculator for Your Site"
      description="Embed a concrete volume calculator on your website. Ideal for construction, contracting, or home improvement sites to help visitors estimate concrete needs."
      calcPath="/concrete-calculator"
      CalculatorComponent={ConcreteCalculator}
    />
  );
}
