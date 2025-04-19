"use client";

import { useState } from "react";
import EmergencyFundCalculator from "@/components/emergency-fund-calculator";
import FirstMillionCalculator from "@/components/first-million-calculator";
import CompoundInterestCalculator from "@/components/compound-interest-calculator";

export default function Home() {
  const [activeTab, setActiveTab] = useState("emergency");

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-center mb-8 text-foreground">
          Financeira Inteligente
        </h1>

        <div className="mb-8">
          <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-full">
            <button
              onClick={() => setActiveTab("emergency")}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1 ${
                activeTab === "emergency"
                  ? "bg-background text-foreground shadow-sm"
                  : "hover:bg-muted hover:text-foreground"
              }`}
            >
              Reserva de Emergência
            </button>
            <button
              onClick={() => setActiveTab("million")}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1 ${
                activeTab === "million"
                  ? "bg-background text-foreground shadow-sm"
                  : "hover:bg-muted hover:text-foreground"
              }`}
            >
              Primeiro Milhão
            </button>
            <button
              onClick={() => setActiveTab("compound")}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1 ${
                activeTab === "compound"
                  ? "bg-background text-foreground shadow-sm"
                  : "hover:bg-muted hover:text-foreground"
              }`}
            >
              Juros Compostos
            </button>
          </div>
        </div>

        <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
          <div className="p-6">
            {activeTab === "emergency" && <EmergencyFundCalculator />}
            {activeTab === "million" && <FirstMillionCalculator />}
            {activeTab === "compound" && <CompoundInterestCalculator />}
          </div>
        </div>
      </div>
    </main>
  );
}
