// takeHome.ts - UK Income Tax and National Insurance Calculator for 2025/26 Tax Year

export type Period = 'year' | 'month' | 'week' | 'day';
export type Jurisdiction = 'ruk' | 'scotland'; // ruk: England + Wales + Northern Ireland
export type NICategory =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'S'
  | 'V'
  | 'Z';

export interface TakeHomeInput {
  gross: number; // seçilen period için brüt
  period: Period; // gross hangi periyotta
  jurisdiction?: Jurisdiction; // default: ruk (tax code S ise otomatik scotland seçilebilir)
  taxCode?: string; // örn: 1257L, S1257L, BR, D0, D1, 0T, NT
  niCategory?: NICategory; // default: A
  daysPerYear?: number; // period day ise default 260
}

export interface BandTaxLine {
  bandName: string;
  taxableInBand: number; // GBP
  rate: number; // örn 0.2
  tax: number; // GBP
}

export interface TakeHomeResult {
  annual: {
    gross: number;
    personalAllowance: number;
    taxableIncome: number;
    incomeTax: number;
    incomeTaxBreakdown: BandTaxLine[];
    nationalInsurance: number;
    takeHome: number;
  };
  perPeriod: {
    period: Period;
    gross: number;
    incomeTax: number;
    nationalInsurance: number;
    takeHome: number;
  };
  meta: {
    jurisdiction: Jurisdiction;
    niCategory: NICategory;
    taxCodeUsed?: string;
    calculationTaxYear: '2025/26';
  };
}

// ---------------- Money helpers ----------------

function round2(gbp: number): number {
  return Math.round(gbp * 100) / 100;
}

// ---------------- 2025/26 constants ----------------

// Personal Allowance
const PA_STANDARD_GBP = 12570;

// Income tax bands are on taxable income (after allowance)
const RUK_BANDS_GBP = [
  { upTo: 37700, rate: 0.2, name: 'basic' },
  { upTo: 125140, rate: 0.4, name: 'higher' },
  { upTo: Infinity, rate: 0.45, name: 'additional' },
] as const;

const SCOTLAND_BANDS_GBP = [
  { upTo: 2827, rate: 0.19, name: 'starter' },
  { upTo: 14921, rate: 0.2, name: 'basic' },
  { upTo: 31092, rate: 0.21, name: 'intermediate' },
  { upTo: 62430, rate: 0.42, name: 'higher' },
  { upTo: 125140, rate: 0.45, name: 'advanced' },
  { upTo: Infinity, rate: 0.48, name: 'top' },
] as const;

// NI thresholds (annual)
const NI_PT_GBP = 12570;
const NI_UEL_GBP = 50270;

// NI category rates (employee primary)
// From HMRC table: main rate is between PT and UEL; upper rate above UEL.
const NI_RATE_BY_CATEGORY: Record<NICategory, { main: number; upper: number }> =
  {
    A: { main: 0.08, upper: 0.02 },
    B: { main: 0.0185, upper: 0.02 },
    C: { main: 0.0, upper: 0.0 },
    D: { main: 0.02, upper: 0.02 },
    E: { main: 0.0185, upper: 0.02 },
    F: { main: 0.08, upper: 0.02 },
    H: { main: 0.08, upper: 0.02 },
    I: { main: 0.0185, upper: 0.02 },
    J: { main: 0.02, upper: 0.02 },
    K: { main: 0.0, upper: 0.0 },
    L: { main: 0.02, upper: 0.02 },
    M: { main: 0.08, upper: 0.02 },
    N: { main: 0.08, upper: 0.02 },
    S: { main: 0.0, upper: 0.0 },
    V: { main: 0.08, upper: 0.02 },
    Z: { main: 0.02, upper: 0.02 },
  };

// NI category descriptions for UI
export const NI_CATEGORY_DESCRIPTIONS: Record<NICategory, string> = {
  A: 'Standard rate (most employees)',
  B: 'Married women/widows with valid election',
  C: 'State pension age employees',
  D: 'Deferred (contracted-out)',
  E: 'Married women/widows + state pension age',
  F: 'Freeport standard rate',
  H: 'Apprentices under 25',
  I: 'Freeport married women/widows',
  J: 'Deferred rate',
  K: 'State pension age + no employer NI',
  L: 'Freeport deferred',
  M: 'Under 21',
  N: 'Under 21 in Freeport',
  S: 'Deferred + state pension age',
  V: 'Veterans (first 12 months)',
  Z: 'Under 21 deferred',
};

// ---------------- Period conversion ----------------

function periodsPerYear(period: Period, daysPerYear: number): number {
  switch (period) {
    case 'year':
      return 1;
    case 'month':
      return 12;
    case 'week':
      return 52;
    case 'day':
      return daysPerYear;
  }
}

function annualise(gross: number, period: Period, daysPerYear: number): number {
  return gross * periodsPerYear(period, daysPerYear);
}

function deAnnualise(
  annual: number,
  period: Period,
  daysPerYear: number
): number {
  return annual / periodsPerYear(period, daysPerYear);
}

// ---------------- Tax code parsing (pragmatic) ----------------

type TaxCodeMode =
  | { kind: 'standard'; personalAllowanceGBP: number }
  | { kind: 'flat'; rate: number } // BR, D0, D1
  | { kind: 'none'; personalAllowanceGBP: number } // 0T
  | { kind: 'nt' };

function parseTaxCode(raw?: string): {
  mode?: TaxCodeMode;
  impliedJurisdiction?: Jurisdiction;
  taxCodeUsed?: string;
} {
  if (!raw) return {};
  const code = raw.trim().toUpperCase();
  if (!code) return {};

  // Jurisdiction hint: S prefix is Scotland
  const impliedJurisdiction: Jurisdiction | undefined = code.startsWith('S')
    ? 'scotland'
    : undefined;

  const core = impliedJurisdiction ? code.slice(1) : code;

  if (core === 'NT')
    return { mode: { kind: 'nt' }, impliedJurisdiction, taxCodeUsed: code };
  if (core === 'BR')
    return {
      mode: { kind: 'flat', rate: 0.2 },
      impliedJurisdiction,
      taxCodeUsed: code,
    };
  if (core === 'D0')
    return {
      mode: { kind: 'flat', rate: 0.4 },
      impliedJurisdiction,
      taxCodeUsed: code,
    };
  if (core === 'D1')
    return {
      mode: { kind: 'flat', rate: 0.45 },
      impliedJurisdiction,
      taxCodeUsed: code,
    };
  if (core === '0T')
    return {
      mode: { kind: 'none', personalAllowanceGBP: 0 },
      impliedJurisdiction,
      taxCodeUsed: code,
    };

  // K code: negative allowance (deductions exceed allowances)
  if (core.startsWith('K')) {
    const digits = core.slice(1).match(/\d+/)?.[0];
    if (!digits) return { impliedJurisdiction, taxCodeUsed: code };
    const negAllowance = -Number(digits) * 10;
    return {
      mode: { kind: 'standard', personalAllowanceGBP: negAllowance },
      impliedJurisdiction,
      taxCodeUsed: code,
    };
  }

  // Standard codes like 1257L, 1257T, etc.
  const digits = core.match(/\d+/)?.[0];
  if (!digits) return { impliedJurisdiction, taxCodeUsed: code };

  const allowance = Number(digits) * 10;
  return {
    mode: { kind: 'standard', personalAllowanceGBP: allowance },
    impliedJurisdiction,
    taxCodeUsed: code,
  };
}

// ---------------- Core calculations ----------------

function computePersonalAllowance(
  annualGrossGBP: number,
  baseAllowanceGBP: number
): number {
  // Taper rule: reduce by £1 for every £2 above £100,000, to zero at £125,140
  if (annualGrossGBP <= 100000) return baseAllowanceGBP;

  const reduction = Math.floor((annualGrossGBP - 100000) / 2);
  const tapered = baseAllowanceGBP - reduction;
  return Math.max(0, tapered);
}

function computeIncomeTax(
  taxableGBP: number,
  jurisdiction: Jurisdiction,
  taxCodeMode?: TaxCodeMode
): { tax: number; breakdown: BandTaxLine[] } {
  if (taxCodeMode?.kind === 'nt') {
    return {
      tax: 0,
      breakdown: [
        { bandName: 'nt', taxableInBand: taxableGBP, rate: 0, tax: 0 },
      ],
    };
  }

  if (taxCodeMode?.kind === 'flat') {
    const tax = taxableGBP * taxCodeMode.rate;
    return {
      tax: round2(tax),
      breakdown: [
        {
          bandName: 'flat',
          taxableInBand: taxableGBP,
          rate: taxCodeMode.rate,
          tax: round2(tax),
        },
      ],
    };
  }

  const bands =
    jurisdiction === 'scotland' ? SCOTLAND_BANDS_GBP : RUK_BANDS_GBP;

  let remaining = taxableGBP;
  let lower = 0;
  const breakdown: BandTaxLine[] = [];
  let totalTax = 0;

  for (const b of bands) {
    if (remaining <= 0) break;

    const upper = b.upTo;
    const bandSize =
      upper === Infinity
        ? remaining
        : Math.max(0, Math.min(remaining, upper - lower));
    if (bandSize <= 0) {
      lower = upper === Infinity ? lower : upper;
      continue;
    }

    const bandTax = bandSize * b.rate;
    breakdown.push({
      bandName: b.name,
      taxableInBand: round2(bandSize),
      rate: b.rate,
      tax: round2(bandTax),
    });

    totalTax += bandTax;
    remaining -= bandSize;
    lower = upper === Infinity ? lower : upper;
  }

  return { tax: round2(totalTax), breakdown };
}

function computeNI(annualGrossGBP: number, category: NICategory): number {
  const rates = NI_RATE_BY_CATEGORY[category];
  const mainBase = Math.max(
    0,
    Math.min(annualGrossGBP, NI_UEL_GBP) - NI_PT_GBP
  );
  const upperBase = Math.max(0, annualGrossGBP - NI_UEL_GBP);
  const ni = mainBase * rates.main + upperBase * rates.upper;
  return round2(ni);
}

export function estimateTakeHome(input: TakeHomeInput): TakeHomeResult {
  const daysPerYear = input.daysPerYear ?? 260;
  const annualGrossGBP = annualise(input.gross, input.period, daysPerYear);

  const parsed = parseTaxCode(input.taxCode);
  const jurisdiction: Jurisdiction =
    input.jurisdiction ?? parsed.impliedJurisdiction ?? 'ruk';

  const taxCodeMode = parsed.mode;
  const niCategory: NICategory = input.niCategory ?? 'A';

  // Personal Allowance selection
  let basePA = PA_STANDARD_GBP;
  if (taxCodeMode?.kind === 'standard')
    basePA = taxCodeMode.personalAllowanceGBP;
  if (taxCodeMode?.kind === 'none') basePA = taxCodeMode.personalAllowanceGBP;
  if (taxCodeMode?.kind === 'flat') basePA = 0;
  if (taxCodeMode?.kind === 'nt') basePA = 0;

  // Taper only makes sense when basePA is positive and tax code is not forcing flat/NT
  const personalAllowanceGBP =
    taxCodeMode?.kind === 'standard' ||
    taxCodeMode?.kind === 'none' ||
    !taxCodeMode
      ? computePersonalAllowance(annualGrossGBP, basePA)
      : basePA;

  const taxableGBP = Math.max(0, annualGrossGBP - personalAllowanceGBP);

  const { tax: incomeTaxGBP, breakdown } = computeIncomeTax(
    taxableGBP,
    jurisdiction,
    taxCodeMode
  );
  const niGBP = computeNI(annualGrossGBP, niCategory);
  const takeHomeGBP = round2(annualGrossGBP - incomeTaxGBP - niGBP);

  const perGross = input.gross;
  const perIncomeTax = round2(
    deAnnualise(incomeTaxGBP, input.period, daysPerYear)
  );
  const perNI = round2(deAnnualise(niGBP, input.period, daysPerYear));
  const perTakeHome = round2(
    deAnnualise(takeHomeGBP, input.period, daysPerYear)
  );

  return {
    annual: {
      gross: round2(annualGrossGBP),
      personalAllowance: round2(personalAllowanceGBP),
      taxableIncome: round2(taxableGBP),
      incomeTax: round2(incomeTaxGBP),
      incomeTaxBreakdown: breakdown,
      nationalInsurance: round2(niGBP),
      takeHome: round2(takeHomeGBP),
    },
    perPeriod: {
      period: input.period,
      gross: round2(perGross),
      incomeTax: perIncomeTax,
      nationalInsurance: perNI,
      takeHome: perTakeHome,
    },
    meta: {
      jurisdiction,
      niCategory,
      taxCodeUsed: parsed.taxCodeUsed,
      calculationTaxYear: '2025/26',
    },
  };
}

// Export constants for UI
export {
  PA_STANDARD_GBP,
  NI_PT_GBP,
  NI_UEL_GBP,
  RUK_BANDS_GBP,
  SCOTLAND_BANDS_GBP,
};
