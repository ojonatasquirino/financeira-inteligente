"use client";

import { useState } from "react";
import EmergencyFundCalculator from "@/components/emergency-fund-calculator";
import FirstMillionCalculator from "@/components/first-million-calculator";
import CompoundInterestCalculator from "@/components/compound-interest-calculator";

export default function Home() {
  const [activeTab, setActiveTab] = useState("emergency");

  return (
    <main className="min-h-screen bg-white text-slate-900 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Financeira Inteligente
          </h1>
        </div>

        <div className="mb-8">
          <div className="flex rounded-md border border-slate-200 p-1 bg-slate-50">
            <button
              onClick={() => setActiveTab("emergency")}
              className={`flex-1 py-2 px-4 rounded-md transition-all ${
                activeTab === "emergency"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Reserva de Emergência
            </button>
            <button
              onClick={() => setActiveTab("million")}
              className={`flex-1 py-2 px-4 rounded-md transition-all ${
                activeTab === "million"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Primeiro Milhão
            </button>
            <button
              onClick={() => setActiveTab("compound")}
              className={`flex-1 py-2 px-4 rounded-md transition-all ${
                activeTab === "compound"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Juros Compostos
            </button>
          </div>
        </div>

        <div className="transition-all">
          {activeTab === "emergency" && <EmergencyFundCalculator />}
          {activeTab === "million" && <FirstMillionCalculator />}
          {activeTab === "compound" && <CompoundInterestCalculator />}
        </div>
      </div>
    </main>
  );
}
