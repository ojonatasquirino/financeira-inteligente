"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const profileMultipliers = {
  public: 3,
  clt: 6,
  autonomous: 12,
};

const profileLabels = {
  public: "Funcionário Público",
  clt: "CLT",
  autonomous: "MEI/Autônomo",
};

const profileExplanations = {
  public:
    "Como funcionário público, sua estabilidade permite uma reserva menor, de 3 meses de despesas.",
  clt: "Para profissionais CLT, recomenda-se uma reserva de 6 meses para cobrir imprevistos e transições de carreira.",
  autonomous:
    "Como autônomo ou MEI, sua renda pode variar mais, por isso é importante ter uma reserva maior, de 12 meses.",
};

const motivationalPhrases = [
  "Sua segurança financeira começa com uma boa reserva de emergência!",
  "Planeje hoje para não se preocupar amanhã.",
  "Cada real guardado é um passo em direção à sua liberdade financeira.",
  "Sua reserva de emergência é seu escudo contra imprevistos.",
];

type EmergencyFundData = {
  monthlyExpenses: number;
  profile: "public" | "clt" | "autonomous";
};

export default function EmergencyFundCalculator() {
  const [data, setData] = useState<EmergencyFundData>({
    monthlyExpenses: 0,
    profile: "clt",
  });
  const [emergencyFund, setEmergencyFund] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [motivationalPhrase, setMotivationalPhrase] = useState("");

  useEffect(() => {
    // Load data from localStorage
    const savedData = localStorage.getItem("emergencyFundData");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setData(parsedData);
        calculateEmergencyFund(parsedData);
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
    localStorage.setItem("emergencyFundData", JSON.stringify(data));
  }, [data]);

  const calculateEmergencyFund = (currentData: EmergencyFundData) => {
    if (currentData.monthlyExpenses <= 0) {
      setError("Informe um valor válido");
      return;
    }

    const result =
      currentData.monthlyExpenses * profileMultipliers[currentData.profile];
    setEmergencyFund(result);
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? 0 : Number.parseFloat(e.target.value);
    setData({ ...data, monthlyExpenses: value });
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as "public" | "clt" | "autonomous";
    setData({ ...data, profile: value });
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    calculateEmergencyFund(data);
  };

  const exportToTxt = () => {
    if (emergencyFund === null) return;

    const content = `🔹 Calculadora de Reserva de Emergência

Perfil: ${profileLabels[data.profile]}
Custo fixo mensal: ${formatCurrency(data.monthlyExpenses)}
Reserva ideal: ${formatCurrency(emergencyFund)}

Recomendação: ${profileExplanations[data.profile]}
Mantenha esse valor em uma aplicação com alta liquidez e segurança.

${motivationalPhrase}
`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "reserva-emergencia.txt";
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
            htmlFor="monthlyExpenses"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Valor mensal dos custos fixos
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              R$
            </span>
            <input
              id="monthlyExpenses"
              type="number"
              min="0"
              step="0.01"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-8 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={data.monthlyExpenses || ""}
              onChange={handleInputChange}
            />
          </div>
          {error && (
            <p className="text-sm font-medium text-destructive">{error}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Perfil profissional
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                id="profile-public"
                type="radio"
                name="profile"
                value="public"
                checked={data.profile === "public"}
                onChange={handleProfileChange}
                className="h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 accent-primary"
              />
              <label
                htmlFor="profile-public"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Funcionário Público
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="profile-clt"
                type="radio"
                name="profile"
                value="clt"
                checked={data.profile === "clt"}
                onChange={handleProfileChange}
                className="h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 accent-primary"
              />
              <label
                htmlFor="profile-clt"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                CLT
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="profile-autonomous"
                type="radio"
                name="profile"
                value="autonomous"
                checked={data.profile === "autonomous"}
                onChange={handleProfileChange}
                className="h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 accent-primary"
              />
              <label
                htmlFor="profile-autonomous"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                MEI/Autônomo
              </label>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
        >
          Calcular
        </button>
      </form>

      {emergencyFund !== null && (
        <div className="mt-6 space-y-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <div className="space-y-1.5">
              <h3 className="text-lg font-semibold leading-none tracking-tight">
                Sua reserva ideal é de:
              </h3>
              <p className="text-3xl font-bold">
                {formatCurrency(emergencyFund)}
              </p>
              <p className="text-sm text-muted-foreground">
                {profileExplanations[data.profile]}
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
