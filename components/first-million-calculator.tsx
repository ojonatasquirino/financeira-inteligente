"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const motivationalPhrases = [
  "O primeiro milhão é o mais difícil. Depois, o dinheiro trabalha para você!",
  "Consistência é a chave para alcançar grandes objetivos financeiros.",
  "Pequenos investimentos hoje, grandes resultados amanhã.",
  "Seu futuro milionário começa com as decisões que você toma hoje.",
];

type MillionData = {
  initialInvestment: number;
  annualInterestRate: number;
  years: number;
};

export default function FirstMillionCalculator() {
  const [data, setData] = useState<MillionData>({
    initialInvestment: 0,
    annualInterestRate: 10,
    years: 20,
  });
  const [monthlyAmount, setMonthlyAmount] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [motivationalPhrase, setMotivationalPhrase] = useState("");

  useEffect(() => {
    // Load data from localStorage
    const savedData = localStorage.getItem("millionData");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setData(parsedData);
        calculateMonthlyAmount(parsedData);
      } catch (e) {
        console.error("Error parsing saved data", e);
      }
    }

    // Set random motivational phrase
    setMotivationalPhrase(
      motivationalPhrases[
        Math.floor(Math.random() * motivationalPhrases.length)
      ]
    );
  }, []);

  useEffect(() => {
    // Save data to localStorage whenever it changes
    localStorage.setItem("millionData", JSON.stringify(data));
  }, [data]);

  const calculateMonthlyAmount = (currentData: MillionData) => {
    // Validate data
    const errors: { [key: string]: string } = {};

    if (currentData.initialInvestment < 0) {
      errors.initialInvestment = "O valor inicial não pode ser negativo";
    }

    if (currentData.annualInterestRate < 0.1) {
      errors.annualInterestRate = "A taxa deve ser maior que 0.1%";
    } else if (currentData.annualInterestRate > 100) {
      errors.annualInterestRate = "A taxa deve ser menor que 100%";
    }

    if (currentData.years < 1) {
      errors.years = "O prazo deve ser de pelo menos 1 ano";
    }

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    const PV = currentData.initialInvestment;
    const FV = 1000000; // 1 million
    const n = currentData.years * 12; // months
    const r = currentData.annualInterestRate / 100 / 12; // monthly interest rate

    // PMT = (FV - PV * (1 + r)^n) * r / ((1 + r)^n - 1)
    const futureValueOfPV = PV * Math.pow(1 + r, n);
    const PMT = ((FV - futureValueOfPV) * r) / (Math.pow(1 + r, n) - 1);

    setMonthlyAmount(PMT < 0 ? 0 : PMT); // If negative, initial investment already exceeds 1M with interest
    setErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const numValue = value === "" ? 0 : Number.parseFloat(value);
    setData({ ...data, [id]: numValue });
  };

  const handleCalculate = () => {
    calculateMonthlyAmount(data);
  };

  const getExplanation = () => {
    if (monthlyAmount === null) return "";

    if (monthlyAmount === 0) {
      return `Com seu investimento inicial de ${formatCurrency(
        data.initialInvestment
      )} e uma taxa de ${
        data.annualInterestRate
      }% ao ano, você já alcançará o primeiro milhão em ${
        data.years
      } anos sem precisar investir mensalmente!`;
    }

    const totalInvested =
      data.initialInvestment + monthlyAmount * data.years * 12;
    const interestEarned = 1000000 - totalInvested;

    return `Investindo ${formatCurrency(
      monthlyAmount
    )} por mês, junto com seu investimento inicial de ${formatCurrency(
      data.initialInvestment
    )}, você alcançará R$ 1 milhão em ${
      data.years
    } anos. Você terá investido um total de ${formatCurrency(
      totalInvested
    )} e ganho ${formatCurrency(interestEarned)} em juros.`;
  };

  const exportToTxt = () => {
    if (monthlyAmount === null) return;

    const content = `🔹 Calculadora do Primeiro Milhão

Valor já investido: ${formatCurrency(data.initialInvestment)}
Taxa de juros anual: ${data.annualInterestRate}%
Prazo em anos: ${data.years}
Aporte mensal necessário: ${formatCurrency(monthlyAmount)}

${getExplanation()}

${motivationalPhrase}
`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "primeiro-milhao.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-slate-200 shadow-sm">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">
          Quando chego no 1º milhão
        </h2>
        <p className="text-slate-500 mt-1">
          Calcule quanto você precisa investir mensalmente para alcançar R$
          1.000.000
        </p>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="initialInvestment"
            className="block text-sm font-medium text-slate-700"
          >
            Valor já investido (PV)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              R$
            </span>
            <input
              id="initialInvestment"
              type="number"
              min="0"
              step="0.01"
              className="w-full bg-white border border-slate-300 rounded-md py-2 pl-10 pr-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              value={data.initialInvestment || ""}
              onChange={handleInputChange}
            />
          </div>
          {errors.initialInvestment && (
            <p className="text-sm text-red-500">{errors.initialInvestment}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="annualInterestRate"
            className="block text-sm font-medium text-slate-700"
          >
            Taxa de juros anual (%)
          </label>
          <div className="relative">
            <input
              id="annualInterestRate"
              type="number"
              min="0.1"
              max="100"
              step="0.1"
              className="w-full bg-white border border-slate-300 rounded-md py-2 px-3 pr-8 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              value={data.annualInterestRate || ""}
              onChange={handleInputChange}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
              %
            </span>
          </div>
          {errors.annualInterestRate && (
            <p className="text-sm text-red-500">{errors.annualInterestRate}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="years"
            className="block text-sm font-medium text-slate-700"
          >
            Prazo em anos
          </label>
          <input
            id="years"
            type="number"
            min="1"
            step="1"
            className="w-full bg-white border border-slate-300 rounded-md py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            value={data.years || ""}
            onChange={handleInputChange}
          />
          {errors.years && (
            <p className="text-sm text-red-500">{errors.years}</p>
          )}
        </div>

        <button
          onClick={handleCalculate}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-md transition-colors"
        >
          Calcular
        </button>

        {monthlyAmount !== null && (
          <div className="mt-6 space-y-4">
            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
              <h3 className="text-sm font-medium text-slate-700 mb-2">
                Aporte mensal necessário:
              </h3>
              <p className="text-3xl font-bold text-slate-900">
                {formatCurrency(monthlyAmount)}
              </p>
              <p className="text-sm text-slate-600 mt-2">{getExplanation()}</p>
            </div>
            <p className="text-sm italic text-center text-slate-500">
              {motivationalPhrase}
            </p>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-slate-200">
        <button
          onClick={exportToTxt}
          disabled={monthlyAmount === null}
          className={`w-full flex items-center justify-center py-2 px-4 rounded-md ${
            monthlyAmount === null
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-amber-500 hover:bg-amber-600 text-white"
          } transition-colors`}
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar resultado (.txt)
        </button>
      </div>
    </div>
  );
}
