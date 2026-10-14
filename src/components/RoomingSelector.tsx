import React, { useId } from 'react';
import { Bed, Users, User, Info, Check, ShieldCheck } from 'lucide-react';
import { RoomType, RoomingSelection, RoomPolicyNotes } from '../data/toursData';
import { useCurrency } from '../context/CurrencyContext';

interface RoomingSelectorProps {
  passengers: number;
  basePricePerPersonCents: number;
  currency: string;
  singleSupplementPercent?: number; // default 15
  singleSupplementCents?: number | null;
  policyNotes?: RoomPolicyNotes;
  selections: RoomingSelection[];
  onChange: (selections: RoomingSelection[]) => void;
  compact?: boolean;
}

export const RoomingSelector: React.FC<RoomingSelectorProps> = ({
  passengers,
  basePricePerPersonCents,
  currency,
  singleSupplementPercent = 15,
  singleSupplementCents,
  policyNotes,
  selections,
  onChange,
  compact = false,
}) => {
  const { formatPrice } = useCurrency();
  const selectorId = useId();

  // Calculate supplement per single occupant
  const supplementPerPersonCents =
    typeof singleSupplementCents === 'number' && singleSupplementCents > 0
      ? singleSupplementCents
      : Math.round(basePricePerPersonCents * (singleSupplementPercent / 100));

  // Ensure selections array matches passengers count
  const activeSelections: RoomingSelection[] = React.useMemo(() => {
    const list: RoomingSelection[] = [];
    for (let i = 0; i < passengers; i++) {
      if (selections[i]) {
        list.push(selections[i]);
      } else {
        // Sensible default:
        // Solo guest defaults to 'single' (solo traveler private room)
        // 2 guests default to 'double' (couple)
        // 3+ guests default to 'double' or 'twin'
        const defaultType: RoomType = passengers === 1 ? 'single' : (passengers === 2 ? 'double' : 'twin');
        list.push({ travelerIndex: i, roomType: defaultType });
      }
    }
    return list;
  }, [passengers, selections]);

  // Handle single traveler selection
  const handleSingleTravelerChange = (type: RoomType) => {
    onChange([{ travelerIndex: 0, roomType: type }]);
  };

  // Handle all guests at once (e.g. 2 travellers quick preset)
  const handlePresetAll = (type: RoomType) => {
    const next: RoomingSelection[] = [];
    for (let i = 0; i < passengers; i++) {
      next.push({ travelerIndex: i, roomType: type });
    }
    onChange(next);
  };

  // Handle specific traveler change
  const handleTravelerTypeChange = (index: number, type: RoomType) => {
    const updated = [...activeSelections];
    updated[index] = { travelerIndex: index, roomType: type };
    onChange(updated);
  };

  const singleRoomsCount = activeSelections.filter((s) => s.roomType === 'single').length;
  const doubleCount = activeSelections.filter((s) => s.roomType === 'double').length;
  const twinCount = activeSelections.filter((s) => s.roomType === 'twin').length;

  const totalSupplementCents = singleRoomsCount * supplementPerPersonCents;

  const doubleNote =
    policyNotes?.double || 'Double room for couples (1 large queen/king bed).';
  const twinNote =
    policyNotes?.twin || 'Twin share can be shared by two same gender travellers or friends (2 single beds).';
  const singleNote =
    policyNotes?.single ||
    `Single room for solo travelers (subject to apply single supplement: +${singleSupplementPercent}%).`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Rooming Type
        </label>
        {singleRoomsCount > 0 && (
          <span className="text-[0.7rem] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
            <span>+{singleSupplementPercent}% supplement applied</span>
          </span>
        )}
      </div>

      {/* CASE 1: Solo Traveler (1 Passenger) */}
      {passengers === 1 && (
        <div className="space-y-2">
          {/* Option A: Single Room (Private Solo) */}
          <button
            type="button"
            onClick={() => handleSingleTravelerChange('single')}
            className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer relative ${
              activeSelections[0]?.roomType === 'single'
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-border bg-card hover:bg-muted/40'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <div
                  className={`mt-0.5 p-1.5 rounded-md ${
                    activeSelections[0]?.roomType === 'single'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <User className="size-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">Single Room</span>
                    <span className="text-[0.65rem] font-medium px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                      Private Room
                    </span>
                  </div>
                  <p className="text-[0.7rem] text-muted-foreground mt-0.5">
                    {singleNote}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-foreground block">
                  +{formatPrice(supplementPerPersonCents, currency)}
                </span>
                <span className="text-[0.65rem] text-muted-foreground">
                  +{singleSupplementPercent}% supplement
                </span>
              </div>
            </div>
            {activeSelections[0]?.roomType === 'single' && (
              <div className="mt-2 pt-2 border-t border-border/60 flex items-center justify-between text-[0.68rem] text-muted-foreground">
                <span className="flex items-center gap-1 text-primary font-medium">
                  <Check className="size-3" /> Selected private single accommodation
                </span>
                <span>Guaranteed single occupancy</span>
              </div>
            )}
          </button>

          {/* Option B: Twin Share (Willing to share with same-gender traveler) */}
          <button
            type="button"
            onClick={() => handleSingleTravelerChange('twin')}
            className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
              activeSelections[0]?.roomType === 'twin'
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-border bg-card hover:bg-muted/40'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <div
                  className={`mt-0.5 p-1.5 rounded-md ${
                    activeSelections[0]?.roomType === 'twin'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Users className="size-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">Twin Share (Match)</span>
                    <span className="text-[0.65rem] font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                      Save +{singleSupplementPercent}%
                    </span>
                  </div>
                  <p className="text-[0.7rem] text-muted-foreground mt-0.5">
                    {twinNote}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                  $0 Surcharge
                </span>
                <span className="text-[0.65rem] text-muted-foreground">Standard price</span>
              </div>
            </div>
            {activeSelections[0]?.roomType === 'twin' && (
              <div className="mt-2 pt-2 border-t border-border/60 flex items-center justify-between text-[0.68rem] text-muted-foreground">
                <span className="flex items-center gap-1 text-primary font-medium">
                  <Check className="size-3" /> Matched with same-gender traveller
                </span>
                <span className="text-emerald-600 font-medium">No single supplement</span>
              </div>
            )}
          </button>

          {/* Option C: Double Room (for solo wanting large bed) */}
          <button
            type="button"
            onClick={() => handleSingleTravelerChange('double')}
            className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
              activeSelections[0]?.roomType === 'double'
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-border bg-card hover:bg-muted/40'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-1.5 rounded-md ${
                    activeSelections[0]?.roomType === 'double'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Bed className="size-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-foreground">Double Room (Single Use)</span>
                  <p className="text-[0.68rem] text-muted-foreground">
                    1 large double bed for sole occupancy.
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-foreground">
                  +{formatPrice(supplementPerPersonCents, currency)}
                </span>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* CASE 2: 2 Travelers (Couples or Friends) */}
      {passengers === 2 && (
        <div className="space-y-2">
          {/* Double Room (Couples) */}
          <button
            type="button"
            onClick={() => handlePresetAll('double')}
            className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
              doubleCount === 2
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-border bg-card hover:bg-muted/40'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <div
                  className={`mt-0.5 p-1.5 rounded-md ${
                    doubleCount === 2
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Bed className="size-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">Double Room (Couples)</span>
                    <span className="text-[0.65rem] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                      1 Bed
                    </span>
                  </div>
                  <p className="text-[0.7rem] text-muted-foreground mt-0.5">
                    {doubleNote}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                  Included
                </span>
                <span className="text-[0.65rem] text-muted-foreground">No supplement</span>
              </div>
            </div>
          </button>

          {/* Twin Share (Friends / Companions) */}
          <button
            type="button"
            onClick={() => handlePresetAll('twin')}
            className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
              twinCount === 2
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-border bg-card hover:bg-muted/40'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <div
                  className={`mt-0.5 p-1.5 rounded-md ${
                    twinCount === 2
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Users className="size-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">Twin Share (Friends / Pair)</span>
                    <span className="text-[0.65rem] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                      2 Single Beds
                    </span>
                  </div>
                  <p className="text-[0.7rem] text-muted-foreground mt-0.5">
                    {twinNote}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                  Included
                </span>
                <span className="text-[0.65rem] text-muted-foreground">No supplement</span>
              </div>
            </div>
          </button>

          {/* 2 Separate Single Rooms */}
          <button
            type="button"
            onClick={() => handlePresetAll('single')}
            className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
              singleRoomsCount === 2
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-border bg-card hover:bg-muted/40'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <div
                  className={`mt-0.5 p-1.5 rounded-md ${
                    singleRoomsCount === 2
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <User className="size-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">2 Separate Single Rooms</span>
                    <span className="text-[0.65rem] font-medium px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-800 dark:text-amber-300">
                      2 Private Rooms
                    </span>
                  </div>
                  <p className="text-[0.7rem] text-muted-foreground mt-0.5">
                    Each guest has their own private single room (+{singleSupplementPercent}% each).
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-foreground block">
                  +{formatPrice(supplementPerPersonCents * 2, currency)}
                </span>
                <span className="text-[0.65rem] text-muted-foreground">
                  +{singleSupplementPercent}% per room
                </span>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* CASE 3: 3+ Travelers (Detailed per-traveler assignment) */}
      {passengers >= 3 && (
        <div className="space-y-3">
          {/* Quick Presets for group */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handlePresetAll('twin')}
              className={`p-2 rounded-lg border text-center transition-colors cursor-pointer ${
                singleRoomsCount === 0
                  ? 'border-primary bg-primary/10 text-primary font-bold'
                  : 'border-border bg-card text-muted-foreground hover:bg-muted'
              }`}
            >
              Share Rooms (Twin/Double)
              <span className="block text-[0.65rem] font-normal text-emerald-600">No supplements</span>
            </button>
            <button
              type="button"
              onClick={() => handlePresetAll('single')}
              className={`p-2 rounded-lg border text-center transition-colors cursor-pointer ${
                singleRoomsCount === passengers
                  ? 'border-primary bg-primary/10 text-primary font-bold'
                  : 'border-border bg-card text-muted-foreground hover:bg-muted'
              }`}
            >
              All Private Single Rooms
              <span className="block text-[0.65rem] font-normal text-amber-600">+{singleSupplementPercent}% each</span>
            </button>
          </div>

          <div className="border border-border rounded-xl p-3 bg-muted/20 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span>Choose room type for each traveller:</span>
              <span className="text-[0.7rem] font-normal text-muted-foreground">
                {passengers} Travellers
              </span>
            </div>

            <div className="space-y-2">
              {activeSelections.map((sel, idx) => (
                <div
                  key={`${selectorId}-traveller-${idx}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-lg bg-card border border-border"
                >
                  <div className="flex items-center gap-2">
                    <span className="size-5 rounded-full bg-primary/10 text-primary font-bold text-[0.7rem] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-medium text-foreground">
                      Traveller {idx + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleTravelerTypeChange(idx, 'double')}
                      className={`px-2.5 py-1 rounded text-[0.7rem] font-medium border transition-colors cursor-pointer ${
                        sel.roomType === 'double'
                          ? 'border-primary bg-primary text-primary-foreground font-bold'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      Double (Couple)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTravelerTypeChange(idx, 'twin')}
                      className={`px-2.5 py-1 rounded text-[0.7rem] font-medium border transition-colors cursor-pointer ${
                        sel.roomType === 'twin'
                          ? 'border-primary bg-primary text-primary-foreground font-bold'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      Twin Share
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTravelerTypeChange(idx, 'single')}
                      className={`px-2.5 py-1 rounded text-[0.7rem] font-medium border transition-colors cursor-pointer ${
                        sel.roomType === 'single'
                          ? 'border-amber-500 bg-amber-500 text-white font-bold'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      Single (+{singleSupplementPercent}%)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rooming Summary Badge & Policy note */}
      <div className="rounded-lg bg-muted/30 border border-border/70 p-2.5 text-[0.7rem] text-muted-foreground space-y-1">
        <div className="flex items-center justify-between text-foreground font-semibold">
          <span className="flex items-center gap-1.5">
            <Bed className="size-3.5 text-primary" />
            Rooming Plan Summary
          </span>
          <span className="text-xs text-primary font-bold">
            {singleRoomsCount > 0
              ? `${singleRoomsCount} Single (+${formatPrice(totalSupplementCents, currency)})${
                  doubleCount > 0 ? `, ${Math.ceil(doubleCount / 2)} Double` : ''
                }${twinCount > 0 ? `, ${Math.ceil(twinCount / 2)} Twin` : ''}`
              : doubleCount > 0 && twinCount === 0
              ? `${Math.ceil(doubleCount / 2)} Double Room (Couples)`
              : twinCount > 0 && doubleCount === 0
              ? `${Math.ceil(twinCount / 2)} Twin Share Room`
              : 'Shared Accommodation'}
          </span>
        </div>
        <p className="text-[0.67rem] leading-relaxed text-muted-foreground">
          Double room for couples · Twin share for friends or matched same-gender travellers (no supplement) · Single room subject to +{singleSupplementPercent}% single supplement.
        </p>
      </div>
    </div>
  );
};
