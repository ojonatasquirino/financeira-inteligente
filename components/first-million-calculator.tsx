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
    const newErrors: { [key: string]: string } = {};

    if (currentData.initialInvestment < 0) {
      newErrors.initialInvestment = "O valor inicial não pode ser negativo";
    }

    if (currentData.annualInterestRate < 0.1) {
      newErrors.annualInterestRate = "A taxa deve ser maior que 0.1%";
    } else if (currentData.annualInterestRate > 100) {
      newErrors.annualInterestRate = "A taxa deve ser menor que 100%";
    }

    if (currentData.years < 1) {
      newErrors.years = "O prazo deve ser de pelo menos 1 ano";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
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
    <div>
      <form onSubmit={handleCalculate} className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="initialInvestment"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Valor já investido
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              R$
            </span>
            <input
              id="initialInvestment"
              type="number"
              min="0"
              step="0.01"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-8 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={data.initialInvestment || ""}
              onChange={handleInputChange}
            />
          </div>
          {errors.initialInvestment && (
            <p className="text-sm font-medium text-destructive">
              {errors.initialInvestment}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="annualInterestRate"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={data.annualInterestRate || ""}
              onChange={handleInputChange}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              %
            </span>
          </div>
          {errors.annualInterestRate && (
            <p className="text-sm font-medium text-destructive">
              {errors.annualInterestRate}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="years"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Prazo em anos
          </label>
          <input
            id="years"
            type="number"
            min="1"
            step="1"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={data.years || ""}
            onChange={handleInputChange}
          />
          {errors.years && (
            <p className="text-sm font-medium text-destructive">
              {errors.years}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
        >
          Calcular
        </button>
      </form>

      {monthlyAmount !== null && (
        <div className="mt-6 space-y-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <div className="space-y-1.5">
              <h3 className="text-lg font-semibold leading-none tracking-tight">
                Aporte mensal necessário:
              </h3>
              <p className="text-3xl font-bold">
                {formatCurrency(monthlyAmount)}
              </p>
              <p className="text-sm text-muted-foreground">
                {getExplanation()}
              </p>
            </div>
          </div>

          <p className="text-sm text-center text-muted-foreground italic">
            {motivationalPhrase}
          </p>

          <button
            onClick={exportToTxt}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar resultado (.txt)
          </button>
        </div>
      )}
    </div>
  );
}
