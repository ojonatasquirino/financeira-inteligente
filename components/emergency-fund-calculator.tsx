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
  const [errors, setErrors] = useState<{ monthlyExpenses?: string }>({});
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
      setErrors({ monthlyExpenses: "Informe um valor válido" });
      return;
    }

    const result =
      currentData.monthlyExpenses * profileMultipliers[currentData.profile];
    setEmergencyFund(result);
    setErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? 0 : Number.parseFloat(e.target.value);
    setData({ ...data, monthlyExpenses: value });
  };

  const handleProfileChange = (value: "public" | "clt" | "autonomous") => {
    setData({ ...data, profile: value });
    calculateEmergencyFund({ ...data, profile: value });
  };

  const handleCalculate = () => {
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
    <div className="bg-white rounded-lg overflow-hidden border border-slate-200 shadow-sm">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">
          Calculadora de Reserva de Emergência
        </h2>
        <p className="text-slate-500 mt-1">
          Calcule quanto você precisa guardar para sua segurança financeira
        </p>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="monthlyExpenses"
            className="block text-sm font-medium text-slate-700"
          >
            Valor mensal dos custos fixos
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              R$
            </span>
            <input
              id="monthlyExpenses"
              type="number"
              min="0"
              step="0.01"
              className="w-full bg-white border border-slate-300 rounded-md py-2 pl-10 pr-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              value={data.monthlyExpenses || ""}
              onChange={handleInputChange}
              onBlur={handleCalculate}
            />
          </div>
          {errors.monthlyExpenses && (
            <p className="text-sm text-red-500">{errors.monthlyExpenses}</p>
          )}
        </div>

        <div className="space-y-2">
          <span className="block text-sm font-medium text-slate-700">
            Perfil profissional
          </span>
          <div className="space-y-2">
            <label className="flex items-center custom-radio">
              <input
                type="radio"
                name="profile"
                checked={data.profile === "public"}
                onChange={() => handleProfileChange("public")}
              />
              <span className="radio-mark"></span>
              <span className="text-slate-900">Funcionário Público</span>
            </label>
            <label className="flex items-center custom-radio">
              <input
                type="radio"
                name="profile"
                checked={data.profile === "clt"}
                onChange={() => handleProfileChange("clt")}
              />
              <span className="radio-mark"></span>
              <span className="text-slate-900">CLT</span>
            </label>
            <label className="flex items-center custom-radio">
              <input
                type="radio"
                name="profile"
                checked={data.profile === "autonomous"}
                onChange={() => handleProfileChange("autonomous")}
              />
              <span className="radio-mark"></span>
              <span className="text-slate-900">MEI/Autônomo</span>
            </label>
          </div>
        </div>

        {emergencyFund !== null && (
          <div className="mt-6 space-y-4">
            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
              <h3 className="text-sm font-medium text-slate-700 mb-2">
                Sua reserva ideal é de:
              </h3>
              <p className="text-3xl font-bold text-slate-900">
                {formatCurrency(emergencyFund)}
              </p>
              <p className="text-sm text-slate-600 mt-2">
                {profileExplanations[data.profile]}
              </p>
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
          disabled={emergencyFund === null}
          className={`w-full flex items-center justify-center py-2 px-4 rounded-md ${
            emergencyFund === null
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
