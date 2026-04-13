import React from "react";
import EmbedCalculatorPage from "../components/EmbedCalculatorPage";
import LoveCalculator from "./LoveCalculator";

export default function LoveCalculatorForYourSite() {
  return (
    <EmbedCalculatorPage
      title="Love Calculator for Your Site"
      description="Embed a fun love compatibility calculator on your website. Perfect for entertainment, dating, or lifestyle blogs to engage your visitors with a lighthearted tool."
      calcPath="/love-calculator"
      CalculatorComponent={LoveCalculator}
    />
  );
}
