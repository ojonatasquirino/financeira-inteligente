"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Download, Calculator } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const motivationalPhrases = [
  "O tempo é seu maior aliado nos investimentos. Comece hoje!",
  "Juros compostos são a oitava maravilha do mundo. Quem entende, ganha; quem não entende, paga.",
  "Pequenos investimentos consistentes geram grandes resultados ao longo do tempo.",
  "A mágica dos juros compostos transforma pequenas economias em grandes fortunas.",
];

type CompoundInterestData = {
  initialCapital: number;
  interestRate: number;
  time: number;
  timeUnit: "anos" | "meses";
  monthlyInvestment: number;
  capitalization: "mensal" | "anual";
};

type ChartData = {
  period: string;
  amount: number;
};

export default function CompoundInterestCalculator() {
  const [data, setData] = useState<CompoundInterestData>({
    initialCapital: 1000,
    interestRate: 10,
    time: 5,
    timeUnit: "anos",
    monthlyInvestment: 0,
    capitalization: "anual",
  });
  const [result, setResult] = useState<{
    finalAmount: number;
    interestGained: number;
  } | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [motivationalPhrase, setMotivationalPhrase] = useState("");
  const [showResults, setShowResults] = useState(false);

  // Dropdowns state
  const [timeUnitOpen, setTimeUnitOpen] = useState(false);
  const [capitalizationOpen, setCapitalizationOpen] = useState(false);
  const timeUnitRef = useRef<HTMLDivElement>(null);
  const capitalizationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load data from localStorage
    const savedData = localStorage.getItem("compoundInterestData");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setData(parsedData);
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

    // Close dropdowns when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        timeUnitRef.current &&
        !timeUnitRef.current.contains(event.target as Node)
      ) {
        setTimeUnitOpen(false);
      }
      if (
        capitalizationRef.current &&
        !capitalizationRef.current.contains(event.target as Node)
      ) {
        setCapitalizationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Save data to localStorage whenever it changes
    localStorage.setItem("compoundInterestData", JSON.stringify(data));
  }, [data]);

  const calculateCompoundInterest = () => {
    // Validate data
    const errors: { [key: string]: string } = {};

    if (data.initialCapital <= 0) {
      errors.initialCapital = "O capital inicial deve ser maior que zero";
    }

    if (data.interestRate < 0.1) {
      errors.interestRate = "A taxa deve ser maior que 0.1%";
    } else if (data.interestRate > 100) {
      errors.interestRate = "A taxa deve ser menor que 100%";
    }

    if (data.time < 1) {
      errors.time = "O tempo deve ser pelo menos 1";
    }

    if (data.monthlyInvestment < 0) {
      errors.monthlyInvestment = "O valor não pode ser negativo";
    }

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    const C = data.initialCapital;
    const i = data.interestRate / 100;
    const t = data.time;
    const M = data.monthlyInvestment;

    let finalAmount: number;
    let periods: number;
    let periodLabel: string;
    let monthlyRate: number;

    // Convert everything to monthly calculations
    if (data.capitalization === "anual") {
      monthlyRate = Math.pow(1 + i, 1 / 12) - 1; // Convert annual rate to monthly
    } else {
      monthlyRate = i / 12; // Monthly rate directly
    }

    if (data.timeUnit === "anos") {
      periods = t * 12; // Convert years to months
      periodLabel = "Ano";
    } else {
      periods = t; // Already in months
      periodLabel = "Mês";
    }

    // Calculate with monthly contributions
    // Formula: P(1+r)^n + PMT * ((1+r)^n - 1) / r
    finalAmount = C * Math.pow(1 + monthlyRate, periods);

    if (M > 0) {
      finalAmount +=
        (M * (Math.pow(1 + monthlyRate, periods) - 1)) / monthlyRate;
    }

    const interestGained = finalAmount - C - M * periods;

    setResult({
      finalAmount,
      interestGained,
    });

    // Generate chart data
    const newChartData: ChartData[] = [];

    if (data.timeUnit === "anos") {
      // For yearly display, show one point per year
      for (let year = 0; year <= t; year++) {
        const monthsElapsed = year * 12;
        let amount = C * Math.pow(1 + monthlyRate, monthsElapsed);

        if (M > 0) {
          amount +=
            (M * (Math.pow(1 + monthlyRate, monthsElapsed) - 1)) / monthlyRate;
        }

        newChartData.push({
          period: `Ano ${year}`,
          amount: Number(amount.toFixed(2)),
        });
      }
    } else {
      // For monthly display, show points at appropriate intervals
      const interval = Math.max(1, Math.floor(t / 12)); // Show at most 12 points

      for (let month = 0; month <= t; month += interval) {
        let amount = C * Math.pow(1 + monthlyRate, month);

        if (M > 0) {
          amount += (M * (Math.pow(1 + monthlyRate, month) - 1)) / monthlyRate;
        }

        newChartData.push({
          period: `Mês ${month}`,
          amount: Number(amount.toFixed(2)),
        });
      }
    }

    setChartData(newChartData);
    setErrors({});
    setShowResults(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const numValue = value === "" ? 0 : Number.parseFloat(value);
    setData({ ...data, [id]: numValue });
  };

  const handleReset = () => {
    setData({
      initialCapital: 0,
      interestRate: 0,
      time: 0,
      timeUnit: "anos",
      monthlyInvestment: 0,
      capitalization: "anual",
    });
    setShowResults(false);
    setResult(null);
  };

  const exportToTxt = () => {
    if (result === null) return;

    const content = `🔹 Calculadora de Juros Compostos

Capital inicial: ${formatCurrency(data.initialCapital)}
Taxa de juros: ${data.interestRate}% ${data.capitalization}
Tempo: ${data.time} ${data.timeUnit}
Aporte mensal: ${formatCurrency(data.monthlyInvestment)}

Montante final: ${formatCurrency(result.finalAmount)}
Total de juros ganhos: ${formatCurrency(result.interestGained)}

A mágica dos juros compostos transformou seu investimento inicial de ${formatCurrency(
      data.initialCapital
    )} em ${formatCurrency(result.finalAmount)}.

${motivationalPhrase}
`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "juros-compostos.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-slate-200 shadow-sm">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">
          Calculadora de Juros Compostos
        </h2>
        <p className="text-slate-500 mt-1">
          Calcule o poder dos juros compostos no seu investimento
        </p>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label
              htmlFor="initialCapital"
              className="block text-sm font-medium text-slate-700"
            >
              Valor Inicial
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                R$
              </span>
              <input
                id="initialCapital"
                type="number"
                min="0"
                step="0.01"
                className="w-full bg-white border border-slate-300 rounded-md py-2 pl-10 pr-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                value={data.initialCapital || ""}
                onChange={handleInputChange}
              />
            </div>
            {errors.initialCapital && (
              <p className="text-sm text-red-500">{errors.initialCapital}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="interestRate"
              className="block text-sm font-medium text-slate-700"
            >
              Taxa de Juros
            </label>
            <div className="flex">
              <input
                id="interestRate"
                type="number"
                min="0.1"
                max="100"
                step="0.1"
                className="flex-1 bg-white border border-slate-300 rounded-l-md py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                value={data.interestRate || ""}
                onChange={handleInputChange}
              />
              <div className="custom-select" ref={capitalizationRef}>
                <button
                  type="button"
                  onClick={() => setCapitalizationOpen(!capitalizationOpen)}
                  className="bg-white border border-slate-300 border-l-0 rounded-r-md py-2 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent flex items-center justify-between min-w-[120px]"
                >
                  <span>
                    {data.capitalization === "anual" ? "ANUAL" : "MENSAL"}
                  </span>
                  <span className="ml-2">▼</span>
                </button>
                {capitalizationOpen && (
                  <div className="custom-select-dropdown">
                    <div
                      className={`custom-select-option ${
                        data.capitalization === "anual" ? "selected" : ""
                      }`}
                      onClick={() => {
                        setData({ ...data, capitalization: "anual" });
                        setCapitalizationOpen(false);
                      }}
                    >
                      ANUAL
                    </div>
                    <div
                      className={`custom-select-option ${
                        data.capitalization === "mensal" ? "selected" : ""
                      }`}
                      onClick={() => {
                        setData({ ...data, capitalization: "mensal" });
                        setCapitalizationOpen(false);
                      }}
                    >
                      MENSAL
                    </div>
                  </div>
                )}
              </div>
            </div>
            {errors.interestRate && (
              <p className="text-sm text-red-500">{errors.interestRate}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="time"
              className="block text-sm font-medium text-slate-700"
            >
              Período
            </label>
            <div className="flex">
              <input
                id="time"
                type="number"
                min="1"
                step="1"
                className="flex-1 bg-white border border-slate-300 rounded-l-md py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                value={data.time || ""}
                onChange={handleInputChange}
              />
              <div className="custom-select" ref={timeUnitRef}>
                <button
                  type="button"
                  onClick={() => setTimeUnitOpen(!timeUnitOpen)}
                  className="bg-white border border-slate-300 border-l-0 rounded-r-md py-2 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent flex items-center justify-between min-w-[120px]"
                >
                  <span>{data.timeUnit === "anos" ? "ANOS" : "MESES"}</span>
                  <span className="ml-2">▼</span>
                </button>
                {timeUnitOpen && (
                  <div className="custom-select-dropdown">
                    <div
                      className={`custom-select-option ${
                        data.timeUnit === "anos" ? "selected" : ""
                      }`}
                      onClick={() => {
                        setData({ ...data, timeUnit: "anos" });
                        setTimeUnitOpen(false);
                      }}
                    >
                      ANOS
                    </div>
                    <div
                      className={`custom-select-option ${
                        data.timeUnit === "meses" ? "selected" : ""
                      }`}
                      onClick={() => {
                        setData({ ...data, timeUnit: "meses" });
                        setTimeUnitOpen(false);
                      }}
                    >
                      MESES
                    </div>
                  </div>
                )}
              </div>
            </div>
            {errors.time && (
              <p className="text-sm text-red-500">{errors.time}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="monthlyInvestment"
              className="block text-sm font-medium text-slate-700"
            >
              Investimento Mensal
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                R$
              </span>
              <input
                id="monthlyInvestment"
                type="number"
                min="0"
                step="0.01"
                className="w-full bg-white border border-slate-300 rounded-md py-2 pl-10 pr-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                value={data.monthlyInvestment || ""}
                onChange={handleInputChange}
              />
            </div>
            {errors.monthlyInvestment && (
              <p className="text-sm text-red-500">{errors.monthlyInvestment}</p>
            )}
          </div>
        </div>

        <div className="flex justify-between gap-4 mt-6">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
          >
            Limpar
          </button>
          <button
            onClick={calculateCompoundInterest}
            className="flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md transition-colors"
          >
            <Calculator className="mr-2 h-4 w-4" />
            Calcular
          </button>
        </div>

        {showResults && result !== null && (
          <div className="mt-6 space-y-6">
            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-2">
                    Montante final:
                  </h3>
                  <p className="text-3xl font-bold text-slate-900">
                    {formatCurrency(result.finalAmount)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-2">
                    Total de juros ganhos:
                  </h3>
                  <p className="text-3xl font-bold text-slate-900">
                    {formatCurrency(result.interestGained)}
                  </p>
                </div>
              </div>
            </div>

            <div className="h-64 w-full mt-4 bg-white p-4 rounded-lg border border-slate-200">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 12, fill: "#64748B" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#64748B" }}
                    tickFormatter={(value) =>
                      `R${
                        value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value
                      }`
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E5E7EB",
                      borderRadius: "0.375rem",
                    }}
                    formatter={(value) => [
                      `R$ ${Number(value).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`,
                      "Valor",
                    ]}
                    labelStyle={{ color: "#334155" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    dot={{ fill: "#F59E0B", strokeWidth: 2 }}
                    activeDot={{ r: 8 }}
                    name="Valor"
                  />
                </LineChart>
              </ResponsiveContainer>
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
          disabled={result === null}
          className={`w-full flex items-center justify-center py-2 px-4 rounded-md ${
            result === null
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
