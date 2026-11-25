import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Check,
  Copy,
  Edit2,
  KeyRound,
  Loader2,
  Lock,
  PauseCircle,
  PlayCircle,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  Wand2,
  AlertCircle,
} from 'lucide-react';
import {
  formatPromoBenefitLabel,
  generateRandomPromoCode,
  normalizePromoCode,
  type PromoCode,
  type PromoDiscountType,
  type PromoScope,
} from '../utils/promoCodes';

interface AdminPromoCodesTabProps {
  onBanner: (message: string) => void;
}

const GENERATOR_PREFIXES = ['ATLAS', 'VIP', 'EARLY', 'SUMMER', 'AUTUMN', 'EXPLORE'];

export const AdminPromoCodesTab: React.FC<AdminPromoCodesTabProps> = ({ onBanner }) => {
  // Server-verified Bearer token held in memory only (never stored in localStorage)
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [needsFirstRunSetup, setNeedsFirstRunSetup] = useState(false);
  const [configuredViaEnv, setConfiguredViaEnv] = useState(false);

  // Auth form state
  const [passcodeInput, setPasscodeInput] = useState('');
  const [confirmPasscodeInput, setConfirmPasscodeInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Promo list state
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'expired'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Create / Edit form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [generatorPrefix, setGeneratorPrefix] = useState('ATLAS');
  const [codeInput, setCodeInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [discountType, setDiscountType] = useState<PromoDiscountType>('percentage');
  const [discountValueInput, setDiscountValueInput] = useState('10');
  const [currencyInput, setCurrencyInput] = useState<'USD' | 'EUR'>('USD');
  const [appliesTo, setAppliesTo] = useState<PromoScope>('all');
  const [minOrderDollarsInput, setMinOrderDollarsInput] = useState('');
  const [maxUsesInput, setMaxUsesInput] = useState('');
  const [expiresAtInput, setExpiresAtInput] = useState('');
  const [stackable, setStackable] = useState(true);
  const [activeOnSave, setActiveOnSave] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Check admin passcode setup state on mount
  useEffect(() => {
    let active = true;
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/admin/auth/status');
        const data = await res.json().catch(() => ({}));
        if (!active) return;
        setNeedsFirstRunSetup(Boolean(data.needsFirstRunSetup));
        setConfiguredViaEnv(Boolean(data.configuredViaEnv));
      } catch {
        if (active) setAuthError('Unable to reach admin authentication endpoint.');
      } finally {
        if (active) setAuthLoading(false);
      }
    };
    checkStatus();
    return () => {
      active = false;
    };
  }, []);

  const fetchPromoCodes = useCallback(async (token: string) => {
    setListLoading(true);
    setListError(null);
    try {
      const res = await fetch('/api/admin/promo-codes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setAdminToken(null);
        setAuthError('Admin session expired. Please unlock again.');
        return;
      }
      if (!res.ok || !Array.isArray(data.promoCodes)) {
        setListError(data.error || 'Failed to load promo codes.');
        return;
      }
      setPromoCodes(data.promoCodes);
    } catch {
      setListError('Network error while loading promo codes.');
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    if (adminToken) {
      fetchPromoCodes(adminToken);
    }
  }, [adminToken, fetchPromoCodes]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authSubmitting) return;
    setAuthError(null);

    if (needsFirstRunSetup) {
      if (passcodeInput.trim().length < 6) {
        setAuthError('Please choose an admin passcode of at least 6 characters.');
        return;
      }
      if (passcodeInput.trim() !== confirmPasscodeInput.trim()) {
        setAuthError('Passcodes do not match.');
        return;
      }
    }

    setAuthSubmitting(true);
    try {
      const endpoint = needsFirstRunSetup ? '/api/admin/auth/claim' : '/api/admin/auth/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcodeInput.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.token) {
        setAuthError(data.error || 'Authentication failed.');
        return;
      }
      setAdminToken(data.token);
      setNeedsFirstRunSetup(false);
      setPasscodeInput('');
      setConfirmPasscodeInput('');
      onBanner(
        needsFirstRunSetup
          ? 'Admin passcode claimed and Promo Code Controls unlocked.'
          : 'Promo Code Controls unlocked.'
      );
    } catch {
      setAuthError('Unable to reach admin authentication server.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setCodeInput('');
    setDescriptionInput('');
    setDiscountType('percentage');
    setDiscountValueInput('10');
    setCurrencyInput('USD');
    setAppliesTo('all');
    setMinOrderDollarsInput('');
    setMaxUsesInput('');
    setExpiresAtInput('');
    setStackable(true);
    setActiveOnSave(true);
    setFormError(null);
  };

  const handleGenerateCode = () => {
    const generated = generateRandomPromoCode(generatorPrefix);
    setCodeInput(generated);
    setFormError(null);
  };

  const startEdit = (promo: PromoCode) => {
    setEditingId(promo.id);
    setCodeInput(promo.code);
    setDescriptionInput(promo.description);
    setDiscountType(promo.discountType);
    setDiscountValueInput(
      promo.discountType === 'percentage'
        ? String(promo.discountValue)
        : String(promo.discountValue / 100)
    );
    setCurrencyInput(promo.currency === 'EUR' ? 'EUR' : 'USD');
    setAppliesTo(promo.appliesTo);
    setMinOrderDollarsInput(promo.minOrderCents > 0 ? String(promo.minOrderCents / 100) : '');
    setMaxUsesInput(promo.maxUses ? String(promo.maxUses) : '');
    setExpiresAtInput(promo.expiresAt || '');
    setStackable(promo.stackableWithFullPayDiscount);
    setActiveOnSave(promo.active);
    setFormError(null);
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken || formSubmitting) return;
    setFormError(null);

    const normalizedCode = normalizePromoCode(codeInput);
    if (normalizedCode.length < 3) {
      setFormError('Enter a promo code (at least 3 characters) or click Generate Code.');
      return;
    }

    const numericVal = Number(discountValueInput);
    if (!Number.isFinite(numericVal) || numericVal <= 0) {
      setFormError('Discount value must be greater than zero.');
      return;
    }

    if (discountType === 'percentage' && numericVal > 90) {
      setFormError('Percentage discounts are capped at 90%.');
      return;
    }

    const discountValuePayload =
      discountType === 'percentage' ? Math.round(numericVal) : Math.round(numericVal * 100);
    const minOrderCents =
      minOrderDollarsInput.trim() !== '' && Number(minOrderDollarsInput) > 0
        ? Math.round(Number(minOrderDollarsInput) * 100)
        : 0;
    const maxUses =
      maxUsesInput.trim() !== '' && Number(maxUsesInput) > 0
        ? Math.floor(Number(maxUsesInput))
        : null;

    setFormSubmitting(true);
    try {
      const url = editingId ? `/api/admin/promo-codes/${editingId}` : '/api/admin/promo-codes';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          code: normalizedCode,
          description:
            descriptionInput.trim() ||
            `${discountType === 'percentage' ? `${Math.round(numericVal)}%` : `${currencyInput === 'EUR' ? '€' : '$'}${numericVal}`} promotional discount`,
          discountType,
          discountValue: discountValuePayload,
          currency: currencyInput,
          appliesTo,
          minOrderCents,
          maxUses,
          expiresAt: expiresAtInput.trim() || null,
          stackableWithFullPayDiscount: stackable,
          active: activeOnSave,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setAdminToken(null);
        setAuthError('Session expired. Please sign in again.');
        return;
      }
      if (!res.ok) {
        setFormError(data.error || 'Could not save promo code.');
        return;
      }

      if (Array.isArray(data.promoCodes)) {
        setPromoCodes(data.promoCodes);
      }
      onBanner(
        editingId
          ? `Promo code "${normalizedCode}" updated successfully.`
          : `Promo code "${normalizedCode}" created and live for checkout.`
      );
      resetForm();
    } catch {
      setFormError('Network error while saving promo code.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleActive = async (promo: PromoCode) => {
    if (!adminToken) return;
    try {
      const res = await fetch(`/api/admin/promo-codes/${promo.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ active: !promo.active }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(data.promoCodes)) {
        setPromoCodes(data.promoCodes);
        onBanner(
          `Promo code "${promo.code}" is now ${!promo.active ? 'active' : 'paused'}.`
        );
      }
    } catch {
      setListError('Failed to update promo status.');
    }
  };

  const handleDeletePromo = async (promo: PromoCode) => {
    if (!adminToken) return;
    try {
      const res = await fetch(`/api/admin/promo-codes/${promo.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(data.promoCodes)) {
        setPromoCodes(data.promoCodes);
        if (editingId === promo.id) resetForm();
        onBanner(`Promo code "${promo.code}" deleted.`);
      }
    } catch {
      setListError('Failed to delete promo code.');
    }
  };

  const handleCopyCode = async (promo: PromoCode) => {
    try {
      await navigator.clipboard.writeText(promo.code);
      setCopiedId(promo.id);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // clipboard unavailable
    }
  };

  const todayIso = new Date().toISOString().slice(0, 10);

  const isExpired = (promo: PromoCode) =>
    Boolean(promo.expiresAt && todayIso > promo.expiresAt);

  const stats = useMemo(() => {
    const activeCount = promoCodes.filter((p) => p.active && !isExpired(p)).length;
    const totalRedemptions = promoCodes.reduce((sum, p) => sum + (p.usedCount || 0), 0);
    return { total: promoCodes.length, activeCount, totalRedemptions };
  }, [promoCodes, todayIso]);

  const filteredPromos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return promoCodes.filter((p) => {
      const expired = isExpired(p);
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && p.active && !expired) ||
        (statusFilter === 'paused' && !p.active && !expired) ||
        (statusFilter === 'expired' && expired);
      const matchSearch =
        !q ||
        p.code.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [promoCodes, searchQuery, statusFilter, todayIso]);

  if (authLoading) {
    return (
      <div className="mt-6 rounded-xl border border-border bg-card p-10 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="size-4 animate-spin text-primary" />
        <span>Checking promo code management access...</span>
      </div>
    );
  }

  if (!adminToken) {
    return (
      <div className="mt-6 max-w-md mx-auto rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <KeyRound className="size-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">
              {needsFirstRunSetup ? 'Set Admin Promo Passcode' : 'Unlock Promo Code Controls'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {needsFirstRunSetup
                ? 'First-time setup: create a server-protected passcode to manage promo codes.'
                : configuredViaEnv
                ? 'Enter your ADMIN_PASSCODE from Settings -> Secrets to manage promo codes.'
                : 'Enter your admin passcode to generate, pause, or edit checkout promo codes.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              {needsFirstRunSetup ? 'Create Passcode (min 6 chars)' : 'Admin Passcode'}
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={passcodeInput}
              onChange={(e) => setPasscodeInput(e.target.value)}
              placeholder="Enter admin passcode"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {needsFirstRunSetup && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Confirm Passcode
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPasscodeInput}
                onChange={(e) => setConfirmPasscodeInput(e.target.value)}
                placeholder="Re-enter passcode"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          )}

          {authError && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={authSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {authSubmitting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Lock className="size-3.5" />
            )}
            <span>{needsFirstRunSetup ? 'Save Passcode & Unlock' : 'Unlock Promo Manager'}</span>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      {/* KPI Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <span className="text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
            Active Promo Codes
          </span>
          <p className="mt-1 font-display text-2xl font-bold text-primary">{stats.activeCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <span className="text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
            Total Codes Created
          </span>
          <p className="mt-1 font-display text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <span className="text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
            Verified Redemptions
          </span>
          <p className="mt-1 font-display text-2xl font-bold text-foreground">
            {stats.totalRedemptions}
          </p>
        </div>
      </div>

      {/* Create / Generate / Edit Promo Form */}
      <form
        onSubmit={handleSavePromo}
        className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Tag className="size-4 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">
              {editingId ? 'Edit Promo Code' : 'Create or Generate Promo Code'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={generatorPrefix}
              onChange={(e) => setGeneratorPrefix(e.target.value)}
              className="rounded-md border border-input bg-background px-2.5 py-1.5 text-xs font-medium text-foreground"
              aria-label="Generator prefix"
            >
              {GENERATOR_PREFIXES.map((pref) => (
                <option key={pref} value={pref}>
                  Prefix: {pref}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleGenerateCode}
              className="inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
            >
              <Wand2 className="size-3.5" />
              <span>Generate Code</span>
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Promo Code *
            </label>
            <input
              type="text"
              required
              value={codeInput}
              onChange={(e) => setCodeInput(normalizePromoCode(e.target.value))}
              placeholder="e.g. ATLAS15"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono font-bold uppercase text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Discount Type
            </label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as PromoDiscountType)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="percentage">Percentage (% OFF)</option>
              <option value="fixed">Fixed Amount ($ / € OFF)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              {discountType === 'percentage' ? 'Discount Percent (1–90%)' : `Discount Amount (${currencyInput})`}
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                required
                min={1}
                max={discountType === 'percentage' ? 90 : 50000}
                step={discountType === 'percentage' ? 1 : 1}
                value={discountValueInput}
                onChange={(e) => setDiscountValueInput(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {discountType === 'fixed' && (
                <select
                  value={currencyInput}
                  onChange={(e) => setCurrencyInput(e.target.value as 'USD' | 'EUR')}
                  className="rounded-md border border-input bg-background px-2.5 py-2 text-xs font-semibold text-foreground"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Applies To
            </label>
            <select
              value={appliesTo}
              onChange={(e) => setAppliesTo(e.target.value as PromoScope)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Tours</option>
              <option value="multi_day">Multi-Day Tours Only</option>
              <option value="day_tour">Day Tours Only</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Customer Description
            </label>
            <input
              type="text"
              value={descriptionInput}
              onChange={(e) => setDescriptionInput(e.target.value)}
              placeholder="e.g. Early booking reward for 2027 departures"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Max Redemptions (blank = unlimited)
            </label>
            <input
              type="number"
              min={1}
              value={maxUsesInput}
              onChange={(e) => setMaxUsesInput(e.target.value)}
              placeholder="Unlimited"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Expiration Date (optional)
            </label>
            <input
              type="date"
              value={expiresAtInput}
              onChange={(e) => setExpiresAtInput(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Min Booking Fare ($ optional)
            </label>
            <input
              type="number"
              min={0}
              value={minOrderDollarsInput}
              onChange={(e) => setMinOrderDollarsInput(e.target.value)}
              placeholder="0"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="sm:col-span-3 flex flex-wrap items-center gap-5 pt-4">
            <label className="inline-flex items-center gap-2 text-xs text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={stackable}
                onChange={(e) => setStackable(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span>Stackable with 5% multi-day pay-in-full discount</span>
            </label>

            <label className="inline-flex items-center gap-2 text-xs text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={activeOnSave}
                onChange={(e) => setActiveOnSave(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span>Active at checkout immediately</span>
            </label>
          </div>
        </div>

        {formError && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-xs text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-md border border-input bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted cursor-pointer"
            >
              Cancel Edit
            </button>
          )}
          <button
            type="submit"
            disabled={formSubmitting}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {formSubmitting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Plus className="size-3.5" />
            )}
            <span>{editingId ? 'Save Changes' : 'Create Promo Code'}</span>
          </button>
        </div>
      </form>

      {/* Filter & Promo Code Table */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search promo codes or description..."
              className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(['all', 'active', 'paused', 'expired'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize border transition-colors cursor-pointer ${
                  statusFilter === status
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:text-foreground'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {listError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-xs text-destructive">
            {listError}
          </div>
        )}

        {listLoading ? (
          <div className="py-10 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-primary" />
            <span>Loading promo codes...</span>
          </div>
        ) : filteredPromos.length === 0 ? (
          <div className="py-10 text-center text-xs text-muted-foreground">
            No promo codes match your filter. Use the form above to generate one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border text-[0.68rem] uppercase tracking-wider text-muted-foreground">
                  <th className="py-2.5 pr-3">Code</th>
                  <th className="py-2.5 px-3">Benefit</th>
                  <th className="py-2.5 px-3">Scope & Rules</th>
                  <th className="py-2.5 px-3">Usage</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 pl-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPromos.map((promo) => {
                  const expired = isExpired(promo);
                  const exhausted =
                    typeof promo.maxUses === 'number' && promo.usedCount >= promo.maxUses;

                  return (
                    <tr key={promo.id} className="hover:bg-muted/30">
                      <td className="py-3 pr-3 align-top">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-sm text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                            {promo.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(promo)}
                            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Copy code"
                          >
                            {copiedId === promo.id ? (
                              <Check className="size-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                          </button>
                        </div>
                        <p className="mt-1 text-[0.72rem] text-muted-foreground max-w-[240px]">
                          {promo.description}
                        </p>
                      </td>

                      <td className="py-3 px-3 align-top">
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded">
                          <Sparkles className="size-3" />
                          {formatPromoBenefitLabel(promo)}
                        </span>
                      </td>

                      <td className="py-3 px-3 align-top space-y-0.5 text-[0.72rem] text-muted-foreground">
                        <div className="font-medium text-foreground">
                          {promo.appliesTo === 'all'
                            ? 'All Tours'
                            : promo.appliesTo === 'multi_day'
                            ? 'Multi-Day Tours Only'
                            : 'Day Tours Only'}
                        </div>
                        {promo.minOrderCents > 0 && (
                          <div>Min fare: ${(promo.minOrderCents / 100).toLocaleString()}</div>
                        )}
                        {promo.expiresAt && <div>Expires: {promo.expiresAt}</div>}
                        <div>
                          {promo.stackableWithFullPayDiscount
                            ? 'Stacks with 5% full-pay'
                            : 'Does not stack with 5% full-pay'}
                        </div>
                      </td>

                      <td className="py-3 px-3 align-top font-mono font-semibold text-foreground">
                        {promo.usedCount} / {promo.maxUses ?? '∞'}
                      </td>

                      <td className="py-3 px-3 align-top">
                        {expired ? (
                          <span className="rounded-full bg-destructive/10 text-destructive px-2 py-0.5 text-[0.65rem] font-bold uppercase">
                            Expired
                          </span>
                        ) : exhausted ? (
                          <span className="rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 px-2 py-0.5 text-[0.65rem] font-bold uppercase">
                            Limit Reached
                          </span>
                        ) : promo.active ? (
                          <span className="rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-[0.65rem] font-bold uppercase">
                            Active
                          </span>
                        ) : (
                          <span className="rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-[0.65rem] font-bold uppercase">
                            Paused
                          </span>
                        )}
                      </td>

                      <td className="py-3 pl-3 align-top text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(promo)}
                            className="inline-flex items-center gap-1 rounded border border-input bg-background px-2 py-1 text-[0.7rem] font-medium text-foreground hover:bg-muted cursor-pointer"
                            title={promo.active ? 'Pause promo code' : 'Activate promo code'}
                          >
                            {promo.active ? (
                              <>
                                <PauseCircle className="size-3 text-amber-600" />
                                <span>Pause</span>
                              </>
                            ) : (
                              <>
                                <PlayCircle className="size-3 text-emerald-600" />
                                <span>Activate</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => startEdit(promo)}
                            className="p-1.5 rounded border border-input bg-background text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                            title="Edit promo code"
                          >
                            <Edit2 className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePromo(promo)}
                            className="p-1.5 rounded border border-destructive/30 bg-background text-destructive hover:bg-destructive/10 cursor-pointer"
                            title="Delete promo code"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
