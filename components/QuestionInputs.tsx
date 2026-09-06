"use client";

import { useState } from "react";
import { Collateral, ExistingLoan } from "@/lib/types";
import { formatIndianDigits, stripToDigits } from "@/lib/format";

const fieldClass =
  "w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900";

const buttonBase =
  "rounded-lg px-4 py-3 text-base font-medium transition-colors";

export function NumberInput({
  prefix,
  suffix,
  min,
  max,
  onSubmit,
}: {
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  onSubmit: (value: number) => void;
}) {
  const grouped = prefix === "₹";
  const [digits, setDigits] = useState("");
  const numeric = Number(digits);
  const valid =
    digits.trim() !== "" && !Number.isNaN(numeric) && (min === undefined || numeric >= min) && (max === undefined || numeric <= max);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onSubmit(numeric);
      }}
      className="flex flex-col gap-4"
    >
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
            {prefix}
          </span>
        )}
        <input
          autoFocus
          inputMode="decimal"
          value={grouped ? formatIndianDigits(digits) : digits}
          onChange={(e) => setDigits(stripToDigits(e.target.value))}
          className={`${fieldClass} ${prefix ? "pl-9" : ""} ${suffix ? "pr-10" : ""}`}
          placeholder="0"
        />
        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
            {suffix}
          </span>
        )}
      </div>
      <button type="submit" disabled={!valid} className={`${buttonBase} bg-slate-900 text-white disabled:opacity-30`}>
        Continue
      </button>
    </form>
  );
}

export function SelectInput({
  options,
  onSubmit,
}: {
  options: { value: string; label: string }[];
  onSubmit: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onSubmit(opt.value)}
          className={`${buttonBase} border border-slate-300 bg-white text-left hover:border-slate-900`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function BooleanInput({ onSubmit }: { onSubmit: (value: boolean) => void }) {
  return (
    <div className="flex gap-3">
      <button onClick={() => onSubmit(true)} className={`${buttonBase} flex-1 border border-slate-300 bg-white hover:border-slate-900`}>
        Yes
      </button>
      <button onClick={() => onSubmit(false)} className={`${buttonBase} flex-1 border border-slate-300 bg-white hover:border-slate-900`}>
        No
      </button>
    </div>
  );
}

export function CreditScoreInput({ onSubmit }: { onSubmit: (value: number | "unknown") => void }) {
  const [value, setValue] = useState("");
  const numeric = Number(value);
  const valid = value.trim() !== "" && !Number.isNaN(numeric) && numeric >= 300 && numeric <= 900;

  return (
    <div className="flex flex-col gap-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) onSubmit(numeric);
        }}
        className="flex flex-col gap-4"
      >
        <input
          autoFocus
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(stripToDigits(e.target.value))}
          placeholder="e.g. 750"
          className={fieldClass}
        />
        <button type="submit" disabled={!valid} className={`${buttonBase} bg-slate-900 text-white disabled:opacity-30`}>
          Continue
        </button>
      </form>
      <button onClick={() => onSubmit("unknown")} className={`${buttonBase} border border-dashed border-slate-300 bg-white text-slate-600 hover:border-slate-900`}>
        I don&apos;t know my score
      </button>
    </div>
  );
}

export function EmergencySavingsInput({ onSubmit }: { onSubmit: (value: number | "unknown") => void }) {
  const [value, setValue] = useState("");
  const numeric = Number(value);
  const valid = value.trim() !== "" && !Number.isNaN(numeric) && numeric >= 0;

  return (
    <div className="flex flex-col gap-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) onSubmit(numeric);
        }}
        className="flex flex-col gap-4"
      >
        <div className="relative">
          <input
            autoFocus
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(stripToDigits(e.target.value))}
            placeholder="0"
            className={`${fieldClass} pr-20`}
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">months</span>
        </div>
        <button type="submit" disabled={!valid} className={`${buttonBase} bg-slate-900 text-white disabled:opacity-30`}>
          Continue
        </button>
      </form>
      <button onClick={() => onSubmit("unknown")} className={`${buttonBase} border border-dashed border-slate-300 bg-white text-slate-600 hover:border-slate-900`}>
        I&apos;m not sure
      </button>
    </div>
  );
}

export function CollateralInput({ onSubmit }: { onSubmit: (value: Collateral | undefined) => void }) {
  const [has, setHas] = useState<boolean | null>(null);
  const [type, setType] = useState<"property" | "gold">("property");
  const [digits, setDigits] = useState("");
  const [documented, setDocumented] = useState(true);
  const numeric = Number(digits);
  const valid = digits.trim() !== "" && !Number.isNaN(numeric) && numeric > 0;

  if (has === null) {
    return <BooleanInput onSubmit={(v) => (v ? setHas(true) : onSubmit(undefined))} />;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onSubmit({ type, value: numeric, documented });
      }}
      className="flex flex-col gap-4"
    >
      <div className="flex gap-3">
        <button type="button" onClick={() => setType("property")} className={`${buttonBase} flex-1 border ${type === "property" ? "border-slate-900" : "border-slate-300"}`}>
          Property
        </button>
        <button type="button" onClick={() => setType("gold")} className={`${buttonBase} flex-1 border ${type === "gold" ? "border-slate-900" : "border-slate-300"}`}>
          Gold
        </button>
      </div>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
        <input
          autoFocus
          inputMode="decimal"
          value={formatIndianDigits(digits)}
          onChange={(e) => setDigits(stripToDigits(e.target.value))}
          placeholder="Estimated value"
          className={`${fieldClass} pl-9`}
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" checked={documented} onChange={(e) => setDocumented(e.target.checked)} />
        I have clear papers / registration for this
      </label>
      <button type="submit" disabled={!valid} className={`${buttonBase} bg-slate-900 text-white disabled:opacity-30`}>
        Continue
      </button>
    </form>
  );
}

export function ExistingLoanInput({ onSubmit }: { onSubmit: (value: ExistingLoan[] | undefined) => void }) {
  const [has, setHas] = useState<boolean | null>(null);
  const [emiDigits, setEmiDigits] = useState("");
  const [rate, setRate] = useState("");
  const emiNumeric = Number(emiDigits);
  const rateNumeric = Number(rate);
  const valid = emiDigits.trim() !== "" && rate.trim() !== "" && emiNumeric > 0 && rateNumeric > 0;

  if (has === null) {
    return <BooleanInput onSubmit={(v) => (v ? setHas(true) : onSubmit([]))} />;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onSubmit([{ emi: emiNumeric, ratePct: rateNumeric, lenderType: "informal_app" }]);
      }}
      className="flex flex-col gap-4"
    >
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
        <input
          autoFocus
          inputMode="decimal"
          value={formatIndianDigits(emiDigits)}
          onChange={(e) => setEmiDigits(stripToDigits(e.target.value))}
          placeholder="Monthly EMI"
          className={`${fieldClass} pl-9`}
        />
      </div>
      <div className="relative">
        <input
          inputMode="decimal"
          value={rate}
          onChange={(e) => setRate(stripToDigits(e.target.value))}
          placeholder="Interest rate"
          className={`${fieldClass} pr-10`}
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">%</span>
      </div>
      <button type="submit" disabled={!valid} className={`${buttonBase} bg-slate-900 text-white disabled:opacity-30`}>
        Continue
      </button>
    </form>
  );
}
