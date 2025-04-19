"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";
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
  }, []);

  useEffect(() => {
    // Save data to localStorage whenever it changes
    localStorage.setItem("compoundInterestData", JSON.stringify(data));
  }, [data]);

  const calculateCompoundInterest = () => {
    // Validate data
    const newErrors: { [key: string]: string } = {};

    if (data.initialCapital <= 0) {
      newErrors.initialCapital = "O capital inicial deve ser maior que zero";
    }

    if (data.interestRate < 0.1) {
      newErrors.interestRate = "A taxa deve ser maior que 0.1%";
    } else if (data.interestRate > 100) {
      newErrors.interestRate = "A taxa deve ser menor que 100%";
    }

    if (data.time < 1) {
      newErrors.time = "O tempo deve ser pelo menos 1";
    }

    if (data.monthlyInvestment < 0) {
      newErrors.monthlyInvestment = "O valor não pode ser negativo";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { id, value } = e.target;
    setData({ ...data, [id]: value });
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    calculateCompoundInterest();
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
    <div>
      <form onSubmit={handleCalculate} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label
              htmlFor="initialCapital"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Valor Inicial
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                R$
              </span>
              <input
                id="initialCapital"
                type="number"
                min="0"
                step="0.01"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-8 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={data.initialCapital || ""}
                onChange={handleInputChange}
              />
            </div>
            {errors.initialCapital && (
              <p className="text-sm font-medium text-destructive">
                {errors.initialCapital}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="interestRate"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Taxa de Juros
            </label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <input
                  id="interestRate"
                  type="number"
                  min="0.1"
                  max="100"
                  step="0.1"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={data.interestRate || ""}
                  onChange={handleInputChange}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  %
                </span>
              </div>
              <select
                id="capitalization"
                className="flex h-10 w-[110px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={data.capitalization}
                onChange={handleSelectChange}
              >
                <option value="anual">ANUAL</option>
                <option value="mensal">MENSAL</option>
              </select>
            </div>
            {errors.interestRate && (
              <p className="text-sm font-medium text-destructive">
                {errors.interestRate}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="time"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Período
            </label>
            <div className="flex space-x-2">
              <input
                id="time"
                type="number"
                min="1"
                step="1"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={data.time || ""}
                onChange={handleInputChange}
              />
              <select
                id="timeUnit"
                className="flex h-10 w-[110px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={data.timeUnit}
                onChange={handleSelectChange}
              >
                <option value="anos">ANOS</option>
                <option value="meses">MESES</option>
              </select>
            </div>
            {errors.time && (
              <p className="text-sm font-medium text-destructive">
                {errors.time}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="monthlyInvestment"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Investimento Mensal
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                R$
              </span>
              <input
                id="monthlyInvestment"
                type="number"
                min="0"
                step="0.01"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-8 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={data.monthlyInvestment || ""}
                onChange={handleInputChange}
              />
            </div>
            {errors.monthlyInvestment && (
              <p className="text-sm font-medium text-destructive">
                {errors.monthlyInvestment}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
        >
          Calcular
        </button>
      </form>

      {showResults && result !== null && (
        <div className="mt-6 space-y-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold leading-none tracking-tight">
                  Montante final:
                </h3>
                <p className="text-3xl font-bold">
                  {formatCurrency(result.finalAmount)}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold leading-none tracking-tight">
                  Total de juros ganhos:
                </h3>
                <p className="text-3xl font-bold">
                  {formatCurrency(result.interestGained)}
                </p>
              </div>
            </div>
          </div>

          <div className="h-64 w-full bg-card rounded-lg border p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 20,
                  bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) =>
                    `R${
                      value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value
                    }`
                  }
                />
                <Tooltip
                  formatter={(value) => [
                    `R$ ${Number(value).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`,
                    "Valor",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#171717"
                  strokeWidth={2}
                  dot={{ fill: "#171717", strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                  name="Valor"
                />
              </LineChart>
            </ResponsiveContainer>
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
