export type PaymentPlanType = 'deposit_installments' | 'full_pay';
export type InstallmentTerms = 1 | 2 | 3 | 4;

export interface AppliedPromoInput {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // 1..90 for percentage, cents for fixed
  currency: string;
  stackableWithFullPayDiscount: boolean;
}

export interface InstallmentEligibility {
  eligible: boolean;
  daysUntilDeparture: number | null;
  maxAllowedTerms: 0 | 1 | 2 | 3 | 4;
  finalDueDate: string | null; // YYYY-MM-DD (14 days before trip)
  reason: string;
}

export interface InstallmentItem {
  installmentNumber: number;
  totalInstallments: number;
  amountCents: number;
  currency: string;
  dueDate: string; // YYYY-MM-DD
  status: 'pending' | 'paid';
  paymentLinkUrl?: string;
  stripePaymentLinkId?: string;
  paidAt?: string;
}

export interface PaymentPlanBreakdown {
  paymentPlan: PaymentPlanType;
  installmentTerms: InstallmentTerms;
  installmentEligibility: InstallmentEligibility;
  isMultiDay: boolean;
  grossTotalCents: number;
  promoCode: string | null;
  promoDiscountCents: number;
  fullPayDiscountPercent: number;
  fullPayDiscountCents: number;
  netTotalCents: number;
  depositPercent: number;
  chargeNowCents: number;
  remainingBalanceCents: number;
  currency: string;
  installmentSchedule: InstallmentItem[];
}

export const DEPOSIT_PERCENT = 10;
export const MULTI_DAY_FULL_PAY_DISCOUNT_PERCENT = 5;
export const MAX_INSTALLMENT_TERMS = 4;
export const MIN_DAYS_FOR_INSTALLMENTS = 30;
export const FINAL_PAYMENT_LEAD_DAYS = 14;

const DAY_MS = 24 * 60 * 60 * 1000;

// Benchmark rates aligned with CurrencyContext (1 EUR base) for cross-currency fixed promo amounts
const BENCHMARK_EUR_RATES: Record<string, number> = {
  EUR: 1.0,
  USD: 1.085,
  GBP: 0.855,
  AUD: 1.672,
  CAD: 1.494,
  NZD: 1.823,
};

export function clampInstallmentTerms(value: unknown, maxTerms: number = MAX_INSTALLMENT_TERMS): InstallmentTerms {
  const safeMax = Math.max(1, Math.min(MAX_INSTALLMENT_TERMS, Math.floor(maxTerms)));
  const num = Number(value);
  if (Number.isInteger(num) && num >= 1 && num <= safeMax) {
    return num as InstallmentTerms;
  }
  return safeMax as InstallmentTerms;
}

function toIsoDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDaysUtc(baseDate: Date, days: number): Date {
  const copy = new Date(baseDate.getTime());
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

function convertCentsBetweenCurrencies(amountCents: number, fromCurrency: string, toCurrency: string): number {
  const from = (fromCurrency || 'USD').toUpperCase();
  const to = (toCurrency || 'USD').toUpperCase();
  if (from === to) return Math.round(amountCents);
  const fromRate = BENCHMARK_EUR_RATES[from] || BENCHMARK_EUR_RATES.USD;
  const toRate = BENCHMARK_EUR_RATES[to] || BENCHMARK_EUR_RATES.USD;
  return Math.round((amountCents / fromRate) * toRate);
}

/**
 * Evaluates installment eligibility and allowed term count based on departure date:
 * - Less than 30 days (< 1 month) to departure: installments NOT allowed (full payment required).
 * - Full payment must be completed at least 14 days before departure.
 * - Available terms scale dynamically with lead time before the 14-day payoff deadline:
 *   - 30–44 days out (16–30 day window): up to 1 installment
 *   - 45–74 days out (31–60 day window): up to 2 installments
 *   - 75–104 days out (61–90 day window): up to 3 installments
 *   - 105+ days out (91+ day window): up to 4 installments
 */
export function evaluateInstallmentEligibility(
  departureDateStr?: string,
  referenceNow: Date = new Date()
): InstallmentEligibility {
  const todayUtc = new Date(
    Date.UTC(referenceNow.getUTCFullYear(), referenceNow.getUTCMonth(), referenceNow.getUTCDate())
  );

  if (!departureDateStr || !/^\d{4}-\d{2}-\d{2}$/.test(departureDateStr.trim())) {
    return {
      eligible: true,
      daysUntilDeparture: null,
      maxAllowedTerms: 4,
      finalDueDate: null,
      reason: 'Up to 4 installments available (full balance due 14 days prior to confirmed trip date).',
    };
  }

  const depUtc = new Date(`${departureDateStr.trim()}T00:00:00Z`);
  if (Number.isNaN(depUtc.getTime())) {
    return {
      eligible: true,
      daysUntilDeparture: null,
      maxAllowedTerms: 4,
      finalDueDate: null,
      reason: 'Up to 4 installments available (full balance due 14 days prior to trip).',
    };
  }

  const daysUntilDeparture = Math.floor((depUtc.getTime() - todayUtc.getTime()) / DAY_MS);
  const finalDueUtc = addDaysUtc(depUtc, -FINAL_PAYMENT_LEAD_DAYS);
  const finalDueDate = toIsoDate(finalDueUtc);

  if (daysUntilDeparture < MIN_DAYS_FOR_INSTALLMENTS) {
    return {
      eligible: false,
      daysUntilDeparture,
      maxAllowedTerms: 0,
      finalDueDate,
      reason:
        daysUntilDeparture <= 0
          ? 'Installments are unavailable for imminent departures. Full payment is required today.'
          : `Departures within 30 days (${daysUntilDeparture} day${daysUntilDeparture === 1 ? '' : 's'} away) require full payment today.`,
    };
  }

  // Remaining window until the mandatory 14-day pre-trip payoff deadline
  const paymentWindowDays = daysUntilDeparture - FINAL_PAYMENT_LEAD_DAYS;
  let maxAllowedTerms: 1 | 2 | 3 | 4;
  if (paymentWindowDays >= 91) {
    maxAllowedTerms = 4;
  } else if (paymentWindowDays >= 61) {
    maxAllowedTerms = 3;
  } else if (paymentWindowDays >= 31) {
    maxAllowedTerms = 2;
  } else {
    maxAllowedTerms = 1;
  }

  return {
    eligible: true,
    daysUntilDeparture,
    maxAllowedTerms,
    finalDueDate,
    reason: `Up to ${maxAllowedTerms} installment${maxAllowedTerms === 1 ? '' : 's'} available — full balance due by ${formatShortUtcDate(finalDueDate)} (14 days before trip).`,
  };
}

/**
 * Generates evenly spaced due dates for 1..maxAllowedTerms installments,
 * always landing the final payment exactly 14 days before the departure date.
 */
export function computeInstallmentDueDates(
  terms: InstallmentTerms,
  departureDateStr?: string,
  referenceNow: Date = new Date()
): string[] {
  const todayUtc = new Date(
    Date.UTC(referenceNow.getUTCFullYear(), referenceNow.getUTCMonth(), referenceNow.getUTCDate())
  );

  const eligibility = evaluateInstallmentEligibility(departureDateStr, referenceNow);
  const effectiveTerms = eligibility.eligible
    ? clampInstallmentTerms(terms, Math.max(1, eligibility.maxAllowedTerms))
    : 1;

  if (eligibility.finalDueDate && eligibility.daysUntilDeparture !== null && eligibility.eligible) {
    const finalDueUtc = new Date(`${eligibility.finalDueDate}T00:00:00Z`);
    const totalWindowDays = Math.max(
      effectiveTerms,
      Math.floor((finalDueUtc.getTime() - todayUtc.getTime()) / DAY_MS)
    );

    const dates: string[] = [];
    for (let i = 1; i <= effectiveTerms; i++) {
      if (i === effectiveTerms) {
        dates.push(eligibility.finalDueDate);
      } else {
        const offsetDays = Math.max(i, Math.round((totalWindowDays * i) / effectiveTerms));
        dates.push(toIsoDate(addDaysUtc(todayUtc, offsetDays)));
      }
    }
    return dates;
  }

  // Fallback for flexible departure dates
  const dates: string[] = [];
  for (let i = 1; i <= effectiveTerms; i++) {
    dates.push(toIsoDate(addDaysUtc(todayUtc, i * 30)));
  }
  return dates;
}

/**
 * Computes promo code discount cents safely capped so net fare stays above Stripe's minimum ($1.00).
 */
export function computePromoDiscountCents(
  grossTotalCents: number,
  tourCurrency: string,
  promo?: AppliedPromoInput | null
): number {
  if (!promo || grossTotalCents <= 100) return 0;
  let rawDiscount = 0;
  if (promo.discountType === 'percentage') {
    const pct = Math.max(0, Math.min(90, promo.discountValue));
    rawDiscount = Math.round(grossTotalCents * (pct / 100));
  } else {
    const fixedInTourCurrency = convertCentsBetweenCurrencies(
      Math.max(0, promo.discountValue),
      promo.currency,
      tourCurrency
    );
    rawDiscount = fixedInTourCurrency;
  }
  // Never reduce order below 100 cents ($1.00) so Stripe charges remain valid
  return Math.max(0, Math.min(grossTotalCents - 100, rawDiscount));
}

/**
 * Calculates authoritative tour payment plan amounts, promo code discount,
 * 5% multi-day full-pay discount, and departure-date-aware installment schedule in cents.
 * Shared between client UI and Express Stripe backend so numbers match to the exact cent.
 */
export function calculatePaymentPlan(params: {
  grossTotalCents: number;
  currency: string;
  isMultiDay: boolean;
  paymentPlan: PaymentPlanType;
  installmentTerms?: InstallmentTerms;
  departureDate?: string;
  promo?: AppliedPromoInput | null;
  referenceNow?: Date;
}): PaymentPlanBreakdown {
  const grossTotalCents = Math.max(0, Math.round(params.grossTotalCents));
  const currency = (params.currency || 'USD').toUpperCase();
  const isMultiDay = Boolean(params.isMultiDay);
  const eligibility = evaluateInstallmentEligibility(params.departureDate, params.referenceNow);

  // Enforce < 30 days rule: force full payment whenever installments are not eligible
  const requestedPlan: PaymentPlanType =
    params.paymentPlan === 'full_pay' ? 'full_pay' : 'deposit_installments';
  const effectivePlan: PaymentPlanType = eligibility.eligible ? requestedPlan : 'full_pay';

  const promoDiscountCents = computePromoDiscountCents(grossTotalCents, currency, params.promo);
  const promoCode = promoDiscountCents > 0 && params.promo ? params.promo.code.toUpperCase() : null;
  const subtotalAfterPromo = Math.max(100, grossTotalCents - promoDiscountCents);

  if (effectivePlan === 'full_pay') {
    const canApplyFullPayDiscount =
      isMultiDay && (!promoCode || Boolean(params.promo?.stackableWithFullPayDiscount));
    const fullPayDiscountPercent = canApplyFullPayDiscount ? MULTI_DAY_FULL_PAY_DISCOUNT_PERCENT : 0;
    const fullPayDiscountCents = canApplyFullPayDiscount
      ? Math.round(subtotalAfterPromo * (MULTI_DAY_FULL_PAY_DISCOUNT_PERCENT / 100))
      : 0;
    const netTotalCents = Math.max(100, subtotalAfterPromo - fullPayDiscountCents);

    return {
      paymentPlan: 'full_pay',
      installmentTerms: 1,
      installmentEligibility: eligibility,
      isMultiDay,
      grossTotalCents,
      promoCode,
      promoDiscountCents,
      fullPayDiscountPercent,
      fullPayDiscountCents,
      netTotalCents,
      depositPercent: 100,
      chargeNowCents: netTotalCents,
      remainingBalanceCents: 0,
      currency,
      installmentSchedule: [],
    };
  }

  // 10% deposit today + remaining 90% split across 1..maxAllowedTerms (final payment 14 days before trip)
  const effectiveTerms = clampInstallmentTerms(
    params.installmentTerms ?? eligibility.maxAllowedTerms,
    Math.max(1, eligibility.maxAllowedTerms)
  );
  const netTotalCents = subtotalAfterPromo;
  const chargeNowCents = Math.max(50, Math.round(netTotalCents * (DEPOSIT_PERCENT / 100)));
  const remainingBalanceCents = Math.max(0, netTotalCents - chargeNowCents);
  const dueDates = computeInstallmentDueDates(
    effectiveTerms,
    params.departureDate,
    params.referenceNow
  );

  const baseInstallmentCents = Math.floor(remainingBalanceCents / effectiveTerms);
  const remainderCents = remainingBalanceCents - baseInstallmentCents * effectiveTerms;

  const installmentSchedule: InstallmentItem[] = dueDates.map((dueDate, idx) => {
    const isLast = idx === effectiveTerms - 1;
    return {
      installmentNumber: idx + 1,
      totalInstallments: effectiveTerms,
      amountCents: baseInstallmentCents + (isLast ? remainderCents : 0),
      currency,
      dueDate,
      status: 'pending',
    };
  });

  return {
    paymentPlan: 'deposit_installments',
    installmentTerms: effectiveTerms,
    installmentEligibility: eligibility,
    isMultiDay,
    grossTotalCents,
    promoCode,
    promoDiscountCents,
    fullPayDiscountPercent: 0,
    fullPayDiscountCents: 0,
    netTotalCents,
    depositPercent: DEPOSIT_PERCENT,
    chargeNowCents,
    remainingBalanceCents,
    currency,
    installmentSchedule,
  };
}

export function formatExactCurrency(amountCents: number, currency: string = 'USD'): string {
  const code = (currency || 'USD').toUpperCase();
  const amount = amountCents / 100;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${code} ${amount.toFixed(2)}`;
  }
}

export function formatShortUtcDate(isoDate: string): string {
  if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate;
  const parsed = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
