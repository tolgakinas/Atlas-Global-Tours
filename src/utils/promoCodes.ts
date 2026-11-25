export type PromoDiscountType = 'percentage' | 'fixed';
export type PromoScope = 'all' | 'multi_day' | 'day_tour';

export interface PromoCode {
  id: string;
  code: string;
  description: string;
  discountType: PromoDiscountType;
  discountValue: number; // 1..90 when percentage, cents when fixed
  currency: string; // 'USD' | 'EUR'
  appliesTo: PromoScope;
  minOrderCents: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null; // YYYY-MM-DD or null
  active: boolean;
  stackableWithFullPayDiscount: boolean;
  createdAt: string;
}

export interface PublicPromoSummary {
  code: string;
  description: string;
  discountType: PromoDiscountType;
  discountValue: number;
  currency: string;
  appliesTo: PromoScope;
  minOrderCents: number;
  stackableWithFullPayDiscount: boolean;
}

export function normalizePromoCode(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, '')
    .trim()
    .slice(0, 32);
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateRandomPromoCode(prefix = 'ATLAS'): string {
  const cleanPrefix = normalizePromoCode(prefix).slice(0, 10);
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    const idx = Math.floor(Math.random() * CODE_ALPHABET.length);
    suffix += CODE_ALPHABET[idx];
  }
  return cleanPrefix ? `${cleanPrefix}-${suffix}` : suffix;
}

export function formatPromoBenefitLabel(promo: {
  discountType: PromoDiscountType;
  discountValue: number;
  currency: string;
}): string {
  if (promo.discountType === 'percentage') {
    return `${promo.discountValue}% OFF`;
  }
  const amount = (promo.discountValue / 100).toFixed(2).replace(/\.00$/, '');
  const symbol = promo.currency.toUpperCase() === 'EUR' ? '€' : '$';
  return `${symbol}${amount} OFF`;
}
