import React, { useState } from 'react';
import { Users, Tag, Sparkles, ChevronDown, ChevronUp, Check, ShieldCheck } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { calculateDayTourPricing, DayTourPricingCalculation } from '../utils/dayTourPricing';

interface DayTourPricingSelectorProps {
  baseAdultPriceCents: number;
  passengers: number;
  onChangePassengers: (count: number) => void;
  currency?: string;
  maxPax?: number;
  className?: string;
}

export const DayTourPricingSelector: React.FC<DayTourPricingSelectorProps> = ({
  baseAdultPriceCents,
  passengers,
  onChangePassengers,
  currency,
  maxPax = 12,
  className = '',
}) => {
  const { formatPrice } = useCurrency();
  const [showTierBreakdown, setShowTierBreakdown] = useState(false);

  const pricing = calculateDayTourPricing(baseAdultPriceCents, passengers);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Passenger Counter (Adults & Group) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Users className="size-3.5 text-primary" />
            <span>Adults / Group Size</span>
          </label>
          <span className="text-[0.7rem] text-muted-foreground font-medium">
            Max {maxPax} guests (Small group)
          </span>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border bg-background p-2.5">
          <div>
            <div className="text-sm font-bold text-foreground">
              {passengers} {passengers === 1 ? 'Adult' : 'Adults'}
            </div>
            <div className="text-[0.68rem] text-muted-foreground">
              {pricing.isGroupDiscountApplied ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-1">
                  <Sparkles className="size-3" />
                  <span>{pricing.discountPercent}% Group discount applied</span>
                </span>
              ) : (
                <span>Standard adult ticket pricing</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChangePassengers(Math.max(1, passengers - 1))}
              disabled={passengers <= 1}
              className="size-8 rounded-lg border border-border bg-card text-foreground font-bold hover:bg-muted disabled:opacity-30 cursor-pointer flex items-center justify-center transition-colors"
              aria-label="Decrease guests"
            >
              -
            </button>
            <span className="w-7 text-center text-sm font-bold text-foreground">
              {passengers}
            </span>
            <button
              type="button"
              onClick={() => onChangePassengers(Math.min(maxPax, passengers + 1))}
              disabled={passengers >= maxPax}
              className="size-8 rounded-lg border border-border bg-card text-foreground font-bold hover:bg-muted disabled:opacity-30 cursor-pointer flex items-center justify-center transition-colors"
              aria-label="Increase guests"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Group Pricing Discount Callout */}
      <div className={`rounded-xl border p-3 transition-colors ${
        pricing.isGroupDiscountApplied
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200'
          : 'border-border/80 bg-muted/30 text-foreground'
      }`}>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <Tag className="size-3.5 text-primary" />
              <span>
                {pricing.isGroupDiscountApplied
                  ? `${pricing.tierLabel} Rate`
                  : 'Group Discount Available'}
              </span>
            </div>
            <p className="text-[0.72rem] text-muted-foreground leading-snug">
              {pricing.isGroupDiscountApplied ? (
                <>
                  Group discount applied: You pay{' '}
                  <strong className="text-foreground">
                    {formatPrice(pricing.pricePerPersonCents, currency)}
                  </strong>{' '}
                  / adult (saving {formatPrice(pricing.totalSavingsCents, currency)} total)
                </>
              ) : (
                'Travel with friends or family: booking 4 or more adults unlocks automatic tiered group discounts up to 20% off per person.'
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowTierBreakdown(!showTierBreakdown)}
            className="text-[0.68rem] text-primary hover:underline font-semibold flex items-center gap-0.5 shrink-0 pt-0.5 cursor-pointer"
          >
            <span>{showTierBreakdown ? 'Hide tiers' : 'View tiers'}</span>
            {showTierBreakdown ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
          </button>
        </div>

        {/* Expandable Group Tiers Matrix */}
        {showTierBreakdown && (
          <div className="mt-3 pt-3 border-t border-border/60 space-y-1.5 text-[0.7rem]">
            <div className="font-semibold text-foreground mb-1 text-[0.68rem] uppercase tracking-wider">
              Group Pricing Scale (Calculated per adult):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {pricing.allTiers.map((tier) => {
                const isActive =
                  passengers >= tier.minGuests && passengers <= tier.maxGuests;
                return (
                  <div
                    key={tier.label}
                    className={`rounded-lg p-2 border flex items-center justify-between gap-2 transition-colors ${
                      isActive
                        ? 'border-primary bg-primary/10 text-primary font-bold'
                        : 'border-border/60 bg-card/60 text-muted-foreground'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-foreground text-[0.72rem]">
                        {tier.minGuests}–{tier.maxGuests} Adults
                      </div>
                      <div className="text-[0.65rem] text-muted-foreground">
                        {tier.discountPercent === 0
                          ? 'Standard fare'
                          : `${tier.discountPercent}% off per person`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-foreground">
                        {formatPrice(tier.pricePerPersonCents, currency)}
                      </div>
                      <span className="text-[0.62rem] text-muted-foreground">/ person</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Day Tour Inclusions & Accommodation Notice */}
      <div className="rounded-lg border border-border/70 bg-card p-3 text-[0.72rem] text-muted-foreground space-y-1.5">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Day Excursion (No lodging / rooming required)</span>
        </div>
        <p className="leading-relaxed pl-6">
          This is a full-day guided city excursion. Rooming and single supplement options do not apply. Tickets include all entrance fees, audio headsets, and licensed local historian guide.
        </p>
      </div>
    </div>
  );
};
