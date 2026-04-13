import React from "react";
import EmbedCalculatorPage from "../components/EmbedCalculatorPage";
import ScientificCalculator from "./ScientificCalculator";

export default function ScientificCalculatorForYourSite() {
  return (
    <EmbedCalculatorPage
      title="Scientific Calculator for Your Site"
      description="Embed a full-featured scientific calculator on your website. Great for educational sites, math blogs, or any site that needs quick computation tools."
      calcPath="/scientific"
      CalculatorComponent={ScientificCalculator}
    />
  );
}
