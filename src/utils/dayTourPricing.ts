/**
 * Pricing utility for Day Tours with Adult and Tiered Group Pricing (up to 12 guests)
 * Group discounts are calculated dynamically per person from the base adult fare.
 */

export interface GroupPricingTier {
  minGuests: number;
  maxGuests: number;
  label: string;
  badge: string;
  discountPercent: number;
  pricePerPersonCents: number;
  savingsPerPersonCents: number;
}

export interface DayTourPricingCalculation {
  baseAdultPriceCents: number;
  guests: number;
  discountPercent: number;
  tierLabel: string;
  isGroupDiscountApplied: boolean;
  pricePerPersonCents: number;
  effectivePricePerPersonCents: number;
  totalPriceCents: number;
  totalCents: number;
  totalSavingsCents: number;
  savingsCents: number;
  tier: {
    minGuests: number;
    maxGuests: number;
    label: string;
    badge: string;
    discountPercent: number;
  };
  allTiers: GroupPricingTier[];
}

export const GROUP_TIER_CONFIG = [
  { minGuests: 1, maxGuests: 3, label: 'Individual / Couple', badge: 'Standard Adult Rate', discountPercent: 0 },
  { minGuests: 4, maxGuests: 6, label: 'Small Group', badge: '10% OFF per person', discountPercent: 10 },
  { minGuests: 7, maxGuests: 9, label: 'Medium Group', badge: '15% OFF per person', discountPercent: 15 },
  { minGuests: 10, maxGuests: 12, label: 'Full Group / Private', badge: '20% OFF per person', discountPercent: 20 },
];

export const DAY_TOUR_GROUP_TIERS = GROUP_TIER_CONFIG;

export function calculateDayTourPricing(
  baseAdultPriceCents: number,
  guests: number = 1
): DayTourPricingCalculation {
  const safeGuests = Math.max(1, Math.min(12, guests));

  const activeTier = GROUP_TIER_CONFIG.find(
    (t) => safeGuests >= t.minGuests && safeGuests <= t.maxGuests
  ) || GROUP_TIER_CONFIG[0];

  const discountPercent = activeTier.discountPercent;
  const pricePerPersonCents = Math.round(baseAdultPriceCents * (1 - discountPercent / 100));
  const totalPriceCents = pricePerPersonCents * safeGuests;
  const standardTotalCents = baseAdultPriceCents * safeGuests;
  const totalSavingsCents = Math.max(0, standardTotalCents - totalPriceCents);

  const allTiers: GroupPricingTier[] = GROUP_TIER_CONFIG.map((tier) => {
    const pppCents = Math.round(baseAdultPriceCents * (1 - tier.discountPercent / 100));
    return {
      minGuests: tier.minGuests,
      maxGuests: tier.maxGuests,
      label: tier.label,
      badge: tier.badge,
      discountPercent: tier.discountPercent,
      pricePerPersonCents: pppCents,
      savingsPerPersonCents: baseAdultPriceCents - pppCents,
    };
  });

  return {
    baseAdultPriceCents,
    guests: safeGuests,
    discountPercent,
    tierLabel: activeTier.label,
    isGroupDiscountApplied: discountPercent > 0,
    pricePerPersonCents,
    effectivePricePerPersonCents: pricePerPersonCents,
    totalPriceCents,
    totalCents: totalPriceCents,
    totalSavingsCents,
    savingsCents: totalSavingsCents,
    tier: activeTier,
    allTiers,
  };
}
