"use client";

import { useMemo } from "react";
import { HiShieldCheck, HiShieldExclamation } from "react-icons/hi";

interface PasswordStrengthMeterProps {
  password: string;
}

interface StrengthResult {
  score: number;
  label: "Weak" | "Medium" | "Strong";
  color: string;
  bgColor: string;
  width: string;
  criteria: { label: string; met: boolean }[];
}

export default function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const strength = useMemo<StrengthResult | null>(() => {
    if (!password) return null;

    const len = password.length;

    const criteria = [
      { label: "At least 8 characters", met: len >= 8 },
      { label: "Uppercase letter (A-Z)", met: /[A-Z]/.test(password) },
      { label: "Lowercase letter (a-z)", met: /[a-z]/.test(password) },
      { label: "Number (0-9)", met: /[0-9]/.test(password) },
      { label: "Special character (!@#$%^&*)", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ];

    const passed = criteria.filter((c) => c.met).length;

    if (passed <= 2) {
      return {
        score: passed,
        label: "Weak",
        color: "#E85D4A",
        bgColor: "bg-red-500",
        width: "w-1/3",
        criteria,
      };
    } else if (passed <= 4) {
      return {
        score: passed,
        label: "Medium",
        color: "#F59E0B",
        bgColor: "bg-yellow-500",
        width: "w-2/3",
        criteria,
      };
    } else {
      return {
        score: passed,
        label: "Strong",
        color: "#10B981",
        bgColor: "bg-green-500",
        width: "w-full",
        criteria,
      };
    }
  }, [password]);

  if (!password || !strength) return null;

  return (
    <div className="mt-2 space-y-2 animate-fade-in">
      {/* Strength bar */}
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${strength.bgColor}`}
          style={{ width: password ? `${Math.min((strength.score / 5) * 100, 100)}%` : "0%" }}
        />
      </div>

      {/* Label */}
      <div className="flex items-center gap-1.5">
        {strength.label === "Strong" ? (
          <HiShieldCheck className="text-green-500" size={14} />
        ) : (
          <HiShieldExclamation className="text-yellow-500" size={14} />
        )}
        <span className="text-xs font-medium" style={{ color: strength.color }}>
          {strength.label}
        </span>
        <span className="text-xs text-gray-400">
          — {strength.score}/5 criteria met
        </span>
      </div>

      {/* Criteria checklist */}
      <ul className="space-y-0.5">
        {strength.criteria.map((criterion) => (
          <li
            key={criterion.label}
            className={`text-xs flex items-center gap-1.5 transition-colors duration-300 ${
              criterion.met ? "text-green-600" : "text-gray-400"
            }`}
          >
            <span className={`text-xs ${criterion.met ? "text-green-500" : "text-gray-300"}`}>
              {criterion.met ? "✓" : "○"}
            </span>
            {criterion.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
