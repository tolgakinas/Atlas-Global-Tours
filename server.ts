import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';
import { TOURS_DATA } from './src/data/toursData.ts';
import { calculateDayTourPricing } from './src/utils/dayTourPricing.ts';
import {
  calculatePaymentPlan,
  clampInstallmentTerms,
  type AppliedPromoInput,
  type InstallmentItem,
  type PaymentPlanType,
} from './src/utils/paymentPlans.ts';
import {
  generateRandomPromoCode,
  normalizePromoCode,
  type PromoCode,
  type PromoDiscountType,
  type PromoScope,
  type PublicPromoSummary,
} from './src/utils/promoCodes.ts';
import { getPublishedJournalPostsForSeo, registerJournalAndSoroRoutes } from './server/journalStore.ts';
import {
  getRouteMetaForRequest,
  injectRouteMeta,
  registerSeoFileRoutes,
  registerSeoRedirects,
  type SeoDeps,
} from './server/seo.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';
const LEGACY_INFO_EMAIL = 'info@atlasglobaltours.com';
const rawAdminEmail = (process.env.ADMIN_BOOKING_EMAIL || '').trim();
const ADMIN_BOOKING_EMAIL =
  !rawAdminEmail || rawAdminEmail.toLowerCase() === LEGACY_INFO_EMAIL
    ? 'bookings@atlasglobaltours.com'
    : rawAdminEmail;
const DEFAULT_EMAIL_FROM = 'Atlas Global Tours <bookings@atlasglobaltours.com>';

// Simple in-memory rate limiter for booking notifications (15 requests per 15 minutes per IP)
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX_REQUESTS = 15;
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateBuckets.get(ip);
  if (!entry || now > entry.resetAt) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_MAX_REQUESTS;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function cleanSingleLine(value: unknown, maxLen = 200): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[\r\n]+/g, ' ').trim().slice(0, maxLen);
}

function cleanMultiLine(value: unknown, maxLen = 1500): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254;
}

// Separate rate limiter for Stripe payment endpoints (25 requests per 15 minutes per IP)
const STRIPE_RATE_MAX = 25;
const stripeRateBuckets = new Map<string, { count: number; resetAt: number }>();

function isStripeRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = stripeRateBuckets.get(ip);
  if (!entry || now > entry.resetAt) {
    stripeRateBuckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > STRIPE_RATE_MAX;
}

const SUPPORTED_STRIPE_CURRENCIES = new Set(['usd', 'eur', 'gbp', 'aud', 'cad', 'nzd']);

let cachedStripeClient: { key: string; client: Stripe } | null = null;
function getStripeClient(): Stripe | null {
  const secretKey = (process.env.STRIPE_SECRET_KEY || '').trim();
  if (!secretKey) return null;
  if (cachedStripeClient && cachedStripeClient.key === secretKey) {
    return cachedStripeClient.client;
  }
  const client = new Stripe(secretKey);
  cachedStripeClient = { key: secretKey, client };
  return client;
}

function getSafeAppBaseUrl(req: Request): string {
  const envUrl = (process.env.APP_URL || '').trim();
  if (/^https?:\/\/[a-zA-Z0-9.-]+(:\d+)?/.test(envUrl)) {
    return envUrl.replace(/\/+$/, '');
  }
  const proto = (req.headers['x-forwarded-proto'] as string)?.split(',')[0]?.trim() || req.protocol || 'https';
  const host = (req.headers['x-forwarded-host'] as string)?.split(',')[0]?.trim() || req.get('host') || 'localhost:3000';
  return `${proto === 'http' || proto === 'https' ? proto : 'https'}://${host}`;
}

// Idempotency cache for finalized PaymentIntents -> created installment Payment Links
const finalizedInstallmentsCache = new Map<string, InstallmentItem[]>();
// Webhook-confirmed paid installments keyed by bookingReference -> Set of installment numbers
const webhookPaidInstallments = new Map<string, Set<number>>();
// Tracks PaymentIntents whose promo redemption has already been incremented
const countedPromoRedemptions = new Set<string>();

// ============================================================================
// Server-Side Promo Code Store & Admin Passcode Auth
// ============================================================================
const DATA_DIR = path.resolve(__dirname, '.data');
const PROMO_CODES_FILE = path.join(DATA_DIR, 'promo-codes.json');
const ADMIN_AUTH_FILE = path.join(DATA_DIR, 'admin-auth.json');

const SESSION_SIGNING_SECRET =
  (process.env.ADMIN_SESSION_SECRET || '').trim() || crypto.randomBytes(32).toString('hex');
const ADMIN_TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

// Rate limiter for admin login & promo validation (20 requests / 15 min per IP)
const AUTH_RATE_MAX = 20;
const authRateBuckets = new Map<string, { count: number; resetAt: number }>();

function isAuthRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = authRateBuckets.get(ip);
  if (!entry || now > entry.resetAt) {
    authRateBuckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > AUTH_RATE_MAX;
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

interface StoredAdminAuth {
  saltHex: string;
  hashHex: string;
  claimedAt: string;
}

function readClaimedAdminAuth(): StoredAdminAuth | null {
  try {
    if (!fs.existsSync(ADMIN_AUTH_FILE)) return null;
    const raw = JSON.parse(fs.readFileSync(ADMIN_AUTH_FILE, 'utf-8')) as Partial<StoredAdminAuth>;
    if (typeof raw.saltHex === 'string' && typeof raw.hashHex === 'string') {
      return {
        saltHex: raw.saltHex,
        hashHex: raw.hashHex,
        claimedAt: typeof raw.claimedAt === 'string' ? raw.claimedAt : new Date().toISOString(),
      };
    }
  } catch {
    // ignore corrupt auth file
  }
  return null;
}

function saveClaimedAdminAuth(passcode: string): StoredAdminAuth {
  ensureDataDir();
  const saltHex = crypto.randomBytes(16).toString('hex');
  const hashHex = crypto.scryptSync(passcode, saltHex, 64).toString('hex');
  const record: StoredAdminAuth = {
    saltHex,
    hashHex,
    claimedAt: new Date().toISOString(),
  };
  fs.writeFileSync(ADMIN_AUTH_FILE, JSON.stringify(record, null, 2), { mode: 0o600 });
  return record;
}

function timingSafeCompareStrings(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

function verifyAdminPasscode(candidate: string): boolean {
  const envPasscode = (process.env.ADMIN_PASSCODE || '').trim();
  if (envPasscode) {
    return timingSafeCompareStrings(candidate, envPasscode);
  }
  const claimed = readClaimedAdminAuth();
  if (!claimed) return false;
  const derived = crypto.scryptSync(candidate, claimed.saltHex, 64);
  const stored = Buffer.from(claimed.hashHex, 'hex');
  if (derived.length !== stored.length) return false;
  return crypto.timingSafeEqual(derived, stored);
}

function signAdminToken(): { token: string; expiresAt: number } {
  const expiresAt = Date.now() + ADMIN_TOKEN_TTL_MS;
  const payload = Buffer.from(JSON.stringify({ role: 'admin', exp: expiresAt })).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SIGNING_SECRET).update(payload).digest('base64url');
  return { token: `${payload}.${sig}`, expiresAt };
}

function verifyAdminBearerToken(req: Request): boolean {
  const authHeader = req.headers.authorization;
  if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.slice(7).trim();
  const dotIdx = token.indexOf('.');
  if (dotIdx <= 0) return false;
  const payload = token.slice(0, dotIdx);
  const sig = token.slice(dotIdx + 1);
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SIGNING_SECRET)
    .update(payload)
    .digest('base64url');

  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return false;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as {
      role?: string;
      exp?: number;
    };
    return parsed.role === 'admin' && typeof parsed.exp === 'number' && parsed.exp > Date.now();
  } catch {
    return false;
  }
}

function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  if (!verifyAdminBearerToken(req)) {
    res.status(401).json({ ok: false, error: 'Admin authorization required.' });
    return;
  }
  next();
}

const DEFAULT_PROMO_CODES: PromoCode[] = [
  {
    id: 'promo-atlas10',
    code: 'ATLAS10',
    description: 'Welcome 10% savings on any Atlas Global Tours journey',
    discountType: 'percentage',
    discountValue: 10,
    currency: 'USD',
    appliesTo: 'all',
    minOrderCents: 0,
    maxUses: null,
    usedCount: 0,
    expiresAt: null,
    active: true,
    stackableWithFullPayDiscount: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'promo-earlybird150',
    code: 'EARLYBIRD150',
    description: '$150 off multi-day small-group expeditions',
    discountType: 'fixed',
    discountValue: 15000,
    currency: 'USD',
    appliesTo: 'multi_day',
    minOrderCents: 100000,
    maxUses: 100,
    usedCount: 0,
    expiresAt: null,
    active: true,
    stackableWithFullPayDiscount: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

function loadPromoCodes(): PromoCode[] {
  try {
    if (fs.existsSync(PROMO_CODES_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(PROMO_CODES_FILE, 'utf-8'));
      if (Array.isArray(parsed)) {
        return parsed as PromoCode[];
      }
    }
  } catch {
    // fallback to defaults
  }
  savePromoCodes(DEFAULT_PROMO_CODES);
  return [...DEFAULT_PROMO_CODES];
}

function savePromoCodes(list: PromoCode[]): void {
  ensureDataDir();
  fs.writeFileSync(PROMO_CODES_FILE, JSON.stringify(list, null, 2), 'utf-8');
}

function toPublicPromoSummary(promo: PromoCode): PublicPromoSummary {
  return {
    code: promo.code,
    description: promo.description,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    currency: promo.currency,
    appliesTo: promo.appliesTo,
    minOrderCents: promo.minOrderCents,
    stackableWithFullPayDiscount: promo.stackableWithFullPayDiscount,
  };
}

function validatePromoForOrder(params: {
  rawCode: unknown;
  isDayTour: boolean;
  grossTotalCents: number;
}): { valid: true; promo: PromoCode } | { valid: false; error: string } {
  const code = normalizePromoCode(params.rawCode);
  if (!code) {
    return { valid: false, error: 'Please enter a promo code.' };
  }

  const allPromos = loadPromoCodes();
  const found = allPromos.find((p) => p.code.toUpperCase() === code);
  if (!found) {
    return { valid: false, error: 'Promo code not found. Please check the spelling and try again.' };
  }
  if (!found.active) {
    return { valid: false, error: 'This promo code is currently paused or inactive.' };
  }
  if (found.expiresAt && /^\d{4}-\d{2}-\d{2}$/.test(found.expiresAt)) {
    const todayIso = new Date().toISOString().slice(0, 10);
    if (todayIso > found.expiresAt) {
      return { valid: false, error: `This promo code expired on ${found.expiresAt}.` };
    }
  }
  if (typeof found.maxUses === 'number' && found.maxUses > 0 && found.usedCount >= found.maxUses) {
    return { valid: false, error: 'This promo code has reached its maximum redemption limit.' };
  }
  if (found.appliesTo === 'multi_day' && params.isDayTour) {
    return { valid: false, error: 'This promo code is valid for multi-day tours only.' };
  }
  if (found.appliesTo === 'day_tour' && !params.isDayTour) {
    return { valid: false, error: 'This promo code is valid for day tours only.' };
  }
  if (found.minOrderCents > 0 && params.grossTotalCents < found.minOrderCents) {
    const minFormatted = (found.minOrderCents / 100).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return {
      valid: false,
      error: `This promo code requires a minimum booking fare of $${minFormatted}.`,
    };
  }

  return { valid: true, promo: found };
}

function incrementPromoUsageOnce(paymentIntentId: string, rawCode?: string): void {
  const code = normalizePromoCode(rawCode);
  if (!code || countedPromoRedemptions.has(paymentIntentId)) return;
  countedPromoRedemptions.add(paymentIntentId);
  const allPromos = loadPromoCodes();
  const idx = allPromos.findIndex((p) => p.code.toUpperCase() === code);
  if (idx >= 0) {
    allPromos[idx] = {
      ...allPromos[idx],
      usedCount: (allPromos[idx].usedCount || 0) + 1,
    };
    savePromoCodes(allPromos);
  }
}

interface ResolvedAuthoritativeOrder {
  tour: (typeof TOURS_DATA)[number];
  isDayTour: boolean;
  isMultiDay: boolean;
  grossTotalCents: number;
  stripeCurrency: string;
  resolvedDepartureDate: string;
}

function resolveAuthoritativeOrder(body: Record<string, unknown>):
  | { ok: true; order: ResolvedAuthoritativeOrder }
  | { ok: false; status: number; error: string } {
  const tourId = cleanSingleLine(body.tourId, 80);
  const tourSlug = cleanSingleLine(body.tourSlug, 160);
  const departureId = cleanSingleLine(body.departureId, 80);
  const departureDateInput = cleanSingleLine(body.departureDate, 40);
  const guests = Number(body.guests);
  const singleRoomsInput = Number(body.singleRoomsCount ?? 0);

  if (!Number.isInteger(guests) || guests < 1 || guests > 50) {
    return { ok: false, status: 400, error: 'Invalid guest count.' };
  }

  const tour = TOURS_DATA.find(
    (t) => (tourId && t.id === tourId) || (tourSlug && t.slug === tourSlug)
  );
  if (!tour) {
    return { ok: false, status: 404, error: 'Selected tour could not be found.' };
  }

  const matchedDeparture = tour.departuresList?.find(
    (d) =>
      (departureId && d.id === departureId) ||
      (departureDateInput && d.start_date === departureDateInput)
  );
  const departure = matchedDeparture || tour.departuresList?.[0];

  const isDayTour = tour.tour_type === 'day' || tour.days === 1;
  const isMultiDay = !isDayTour;
  const pricePerPersonCents = departure?.price_cents || tour.price_cents;

  let grossTotalCents: number;
  if (isDayTour) {
    const dayPricing = calculateDayTourPricing(pricePerPersonCents, guests);
    grossTotalCents = dayPricing.totalPriceCents;
  } else {
    const safeSingleRooms = Number.isInteger(singleRoomsInput)
      ? Math.max(0, Math.min(guests, singleRoomsInput))
      : 0;
    const singleSupplementPercent = tour.single_supplement_percent ?? 15;
    const supplementPerPersonCents =
      typeof tour.single_supplement_cents === 'number' && tour.single_supplement_cents > 0
        ? tour.single_supplement_cents
        : Math.round(pricePerPersonCents * (singleSupplementPercent / 100));
    grossTotalCents = pricePerPersonCents * guests + safeSingleRooms * supplementPerPersonCents;
  }

  const rawCurrency = (tour.currency || 'USD').toLowerCase();
  const stripeCurrency = SUPPORTED_STRIPE_CURRENCIES.has(rawCurrency) ? rawCurrency : 'usd';
  const resolvedDepartureDate =
    matchedDeparture?.start_date ||
    (/^\d{4}-\d{2}-\d{2}$/.test(departureDateInput) ? departureDateInput : '') ||
    departure?.start_date ||
    'Flexible';

  return {
    ok: true,
    order: {
      tour,
      isDayTour,
      isMultiDay,
      grossTotalCents,
      stripeCurrency,
      resolvedDepartureDate,
    },
  };
}

interface BookingNotificationPayload {
  reference: string;
  tourCode?: string;
  tourTitle: string;
  tourSlug: string;
  departureDate: string;
  guests: number;
  remainingSeats?: number;
  capacity?: number;
  totalPriceFormatted: string;
  depositFormatted?: string;
  amountPaidFormatted?: string;
  remainingBalanceFormatted?: string;
  discountFormatted?: string;
  promoCode?: string;
  promoDiscountFormatted?: string;
  paymentPlanLabel?: string;
  stripePaymentIntentId?: string;
  installmentSummary?: string;
  currency: string;
  leadName: string;
  leadEmail: string;
  leadPhone: string;
  leadNationality?: string;
  paymentMethod?: string;
  roomSummary?: string;
  specialRequests?: string;
  isAdvisorBooking?: boolean;
  advisorName?: string;
  agencyName?: string;
  commissionRatePercent?: number;
}

function buildAdminEmailContent(data: BookingNotificationPayload): { subject: string; html: string; text: string } {
  const bookingTypeLabel = data.isAdvisorBooking ? 'B2B Advisor Booking' : 'Direct Traveler Booking';
  const codeTag = data.tourCode ? `${data.tourCode} · ` : '';
  const subject = `[New Booking ${data.reference}] ${codeTag}${data.tourTitle} (${data.guests} pax · ${data.departureDate})`;

  const availabilityLine =
    typeof data.remainingSeats === 'number' && typeof data.capacity === 'number'
      ? `${data.remainingSeats} of ${data.capacity} seats remaining`
      : typeof data.remainingSeats === 'number'
      ? `${data.remainingSeats} seats remaining`
      : 'Updated in system';

  const rows: Array<[string, string]> = [
    ['Booking / Voucher Ref', data.reference],
    ...(data.tourCode ? [['Tour Code', data.tourCode] as [string, string]] : []),
    ['Channel', bookingTypeLabel],
    ['Tour', data.tourTitle],
    ['Departure Date', data.departureDate],
    ['Passengers', `${data.guests} ${data.guests === 1 ? 'guest' : 'guests'}`],
    ['Updated Availability', availabilityLine],
    ['Total Tour Fare', data.totalPriceFormatted],
    ...(data.paymentPlanLabel ? [['Payment Plan', data.paymentPlanLabel] as [string, string]] : []),
    ...(data.promoCode && data.promoDiscountFormatted
      ? [[`Promo Code (${data.promoCode})`, data.promoDiscountFormatted] as [string, string]]
      : []),
    ...(data.discountFormatted ? [['Full-Pay Discount (5%)', data.discountFormatted] as [string, string]] : []),
    ...(data.amountPaidFormatted
      ? [['Paid Today', data.amountPaidFormatted] as [string, string]]
      : data.depositFormatted
      ? [['Deposit (10%)', data.depositFormatted] as [string, string]]
      : []),
    ...(data.remainingBalanceFormatted
      ? [['Remaining Balance', data.remainingBalanceFormatted] as [string, string]]
      : []),
    ['Payment Method', data.paymentMethod || 'Stripe'],
    ...(data.stripePaymentIntentId
      ? [['Stripe Payment Ref', data.stripePaymentIntentId] as [string, string]]
      : []),
    ...(data.installmentSummary
      ? [['Installment Schedule & Links', data.installmentSummary] as [string, string]]
      : []),
    ...(data.roomSummary ? [['Rooming / Lodging', data.roomSummary] as [string, string]] : []),
    ['Lead Traveler', data.leadName],
    ['Traveler Email', data.leadEmail],
    ['Traveler Phone', data.leadPhone || 'Not provided'],
    ...(data.leadNationality ? [['Nationality', data.leadNationality] as [string, string]] : []),
    ...(data.isAdvisorBooking && data.advisorName
      ? [
          ['Travel Advisor', `${data.advisorName}${data.agencyName ? ` (${data.agencyName})` : ''}`] as [string, string],
          ...(typeof data.commissionRatePercent === 'number'
            ? [['Advisor Commission', `${data.commissionRatePercent}%`] as [string, string]]
            : []),
        ]
      : []),
    ...(data.specialRequests ? [['Special Requests / Notes', data.specialRequests] as [string, string]] : []),
  ];

  const htmlRows = rows
    .map(
      ([label, val]) => `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#4b5563;width:36%;vertical-align:top;">
            ${escapeHtml(label)}
          </td>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#111827;white-space:pre-line;">
            ${escapeHtml(val)}
          </td>
        </tr>`
    )
    .join('');

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
      <div style="background:#1e6b52;padding:24px 28px;color:#ffffff;">
        <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.85;font-weight:600;">
          Atlas Global Tours · Operations Alert
        </div>
        <h1 style="margin:6px 0 0;font-size:22px;line-height:1.3;">
          New Booking Confirmed — ${escapeHtml(data.reference)}
        </h1>
      </div>
      <div style="padding:24px 28px;">
        <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.5;">
          A new reservation has been completed on Atlas Global Tours and departure availability has been automatically reduced by <strong>${data.guests}</strong> ${data.guests === 1 ? 'seat' : 'seats'}.
        </p>
        <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
          <tbody>
            ${htmlRows}
          </tbody>
        </table>
        <p style="margin:18px 0 0;font-size:12px;color:#6b7280;">
          Reply directly to this email to contact the lead traveler (${escapeHtml(data.leadEmail)}).
        </p>
      </div>
    </div>
  `;

  const text = [
    `NEW BOOKING CONFIRMED — ${data.reference}`,
    '========================================',
    ...rows.map(([label, val]) => `${label}: ${val}`),
  ].join('\n');

  return { subject, html, text };
}

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);

  // SEO: canonical-host + legacy WordPress 301s run before everything else
  const seoDeps: SeoDeps = { getPosts: getPublishedJournalPostsForSeo };
  registerSeoRedirects(app, seoDeps, { isProd: IS_PROD });
  registerSeoFileRoutes(app, seoDeps);

  // Stripe Webhook MUST receive raw request body before express.json() parses it
  app.post('/api/stripe/webhook', express.raw({ type: 'application/json', limit: '256kb' }), (req: Request, res: Response) => {
    const stripe = getStripeClient();
    const webhookSecret = (process.env.STRIPE_WEBHOOK_SECRET || '').trim();
    if (!stripe || !webhookSecret) {
      res.status(503).json({ ok: false, error: 'Stripe webhook is not configured.' });
      return;
    }

    const sig = req.headers['stripe-signature'];
    if (typeof sig !== 'string' || !sig) {
      res.status(400).json({ ok: false, error: 'Missing Stripe signature header.' });
      return;
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.warn('[Stripe Webhook] Signature verification failed:', err instanceof Error ? err.message : 'Invalid signature');
      res.status(400).json({ ok: false, error: 'Invalid Stripe webhook signature.' });
      return;
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        console.info(`[Stripe Webhook] PaymentIntent succeeded: ${pi.id} (${pi.amount} ${pi.currency.toUpperCase()})`);
        break;
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        console.warn(`[Stripe Webhook] PaymentIntent failed: ${pi.id}`);
        break;
      }
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const ref = cleanSingleLine(session.metadata?.booking_reference, 60);
        const termNum = Number(session.metadata?.installment_number);
        if (ref && Number.isInteger(termNum) && termNum >= 1 && termNum <= 4) {
          const set = webhookPaidInstallments.get(ref) || new Set<number>();
          set.add(termNum);
          webhookPaidInstallments.set(ref, set);
          console.info(`[Stripe Webhook] Installment #${termNum} paid for booking ${ref}`);
        }
        break;
      }
      default:
        break;
    }

    res.status(200).json({ received: true });
  });

  // Soro article publish endpoints allow up to 1MB rich HTML payloads; all other JSON routes stay capped at 64kb
  app.use(
    ['/wp-json/soro/v1/publish', '/api/soro/v1/publish'],
    express.json({ limit: '1mb' }),
    express.urlencoded({ extended: false, limit: '1mb' })
  );

  app.use(express.json({ limit: '64kb' }));

  // Public Stripe client configuration (exposes only publishable key, never secret key)
  app.get('/api/stripe/config', (_req: Request, res: Response) => {
    const secretKey = (process.env.STRIPE_SECRET_KEY || '').trim();
    const publishableKey = (
      process.env.VITE_STRIPE_PUBLISHABLE_KEY ||
      process.env.STRIPE_PUBLISHABLE_KEY ||
      ''
    ).trim();

    const mode = secretKey.startsWith('sk_live_') ? 'live' : 'test';
    res.status(200).json({
      configured: Boolean(secretKey && publishableKey),
      hasSecretKey: Boolean(secretKey),
      hasPublishableKey: Boolean(publishableKey),
      publishableKey: publishableKey || null,
      mode,
    });
  });

  // ============================================================================
  // Admin Auth & Promo Code Management Endpoints
  // ============================================================================
  app.get('/api/admin/auth/status', (req: Request, res: Response) => {
    const configuredViaEnv = Boolean((process.env.ADMIN_PASSCODE || '').trim());
    const claimed = Boolean(readClaimedAdminAuth());
    res.status(200).json({
      ok: true,
      configuredViaEnv,
      claimed,
      needsFirstRunSetup: !configuredViaEnv && !claimed,
      authenticated: verifyAdminBearerToken(req),
    });
  });

  app.post('/api/admin/auth/claim', (req: Request, res: Response) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (isAuthRateLimited(clientIp)) {
      res.status(429).json({ ok: false, error: 'Too many attempts. Please wait a few minutes.' });
      return;
    }

    if ((process.env.ADMIN_PASSCODE || '').trim() || readClaimedAdminAuth()) {
      res.status(409).json({ ok: false, error: 'Admin passcode is already configured. Please sign in.' });
      return;
    }

    const passcode = typeof req.body?.passcode === 'string' ? req.body.passcode.trim() : '';
    if (passcode.length < 6 || passcode.length > 128) {
      res.status(400).json({ ok: false, error: 'Passcode must be between 6 and 128 characters.' });
      return;
    }

    saveClaimedAdminAuth(passcode);
    const { token, expiresAt } = signAdminToken();
    res.status(201).json({ ok: true, token, expiresAt });
  });

  app.post('/api/admin/auth/login', (req: Request, res: Response) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (isAuthRateLimited(clientIp)) {
      res.status(429).json({ ok: false, error: 'Too many login attempts. Please try again later.' });
      return;
    }

    const passcode = typeof req.body?.passcode === 'string' ? req.body.passcode.trim() : '';
    if (!passcode || !verifyAdminPasscode(passcode)) {
      res.status(401).json({ ok: false, error: 'Incorrect admin passcode.' });
      return;
    }

    const { token, expiresAt } = signAdminToken();
    res.status(200).json({ ok: true, token, expiresAt });
  });

  // Public rate-limited promo code validation for booking checkout
  app.post('/api/promo-codes/validate', (req: Request, res: Response) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (isAuthRateLimited(clientIp)) {
      res.status(429).json({ ok: false, valid: false, error: 'Too many promo attempts. Please try again shortly.' });
      return;
    }

    const body = (req.body ?? {}) as Record<string, unknown>;
    const resolved = resolveAuthoritativeOrder(body);
    if (!resolved.ok) {
      res.status(resolved.status).json({ ok: false, valid: false, error: resolved.error });
      return;
    }

    const { isDayTour, isMultiDay, grossTotalCents, stripeCurrency, resolvedDepartureDate } = resolved.order;
    const validation = validatePromoForOrder({
      rawCode: body.code,
      isDayTour,
      grossTotalCents,
    });

    if (!validation.valid) {
      res.status(200).json({ ok: true, valid: false, error: validation.error });
      return;
    }

    const promo = validation.promo;
    const paymentPlan: PaymentPlanType =
      body.paymentPlan === 'full_pay' ? 'full_pay' : 'deposit_installments';
    const installmentTerms = clampInstallmentTerms(body.installmentTerms ?? 2);

    const breakdown = calculatePaymentPlan({
      grossTotalCents,
      currency: stripeCurrency.toUpperCase(),
      isMultiDay,
      paymentPlan,
      installmentTerms,
      departureDate: resolvedDepartureDate,
      promo: {
        code: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        currency: promo.currency,
        stackableWithFullPayDiscount: promo.stackableWithFullPayDiscount,
      },
    });

    res.status(200).json({
      ok: true,
      valid: true,
      promo: toPublicPromoSummary(promo),
      breakdown,
    });
  });

  // Protected Admin Promo Code CRUD
  app.get('/api/admin/promo-codes', requireAdminAuth, (_req: Request, res: Response) => {
    const promoCodes = loadPromoCodes();
    res.status(200).json({ ok: true, promoCodes });
  });

  app.post('/api/admin/promo-codes', requireAdminAuth, (req: Request, res: Response) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const rawCode = normalizePromoCode(body.code);
    const code = rawCode || generateRandomPromoCode(cleanSingleLine(body.prefix, 10) || 'ATLAS');
    const description = cleanSingleLine(body.description, 160) || 'Special promotional discount';
    const discountType: PromoDiscountType = body.discountType === 'fixed' ? 'fixed' : 'percentage';
    const rawValue = Number(body.discountValue);

    if (!code || code.length < 3) {
      res.status(400).json({ ok: false, error: 'Promo code must be at least 3 alphanumeric characters.' });
      return;
    }

    if (!Number.isFinite(rawValue) || rawValue <= 0) {
      res.status(400).json({ ok: false, error: 'Discount value must be greater than zero.' });
      return;
    }

    const discountValue =
      discountType === 'percentage'
        ? Math.min(90, Math.max(1, Math.round(rawValue)))
        : Math.min(5000000, Math.max(100, Math.round(rawValue)));

    const rawCurrency = cleanSingleLine(body.currency, 8).toUpperCase();
    const currency = rawCurrency === 'EUR' ? 'EUR' : 'USD';
    const appliesTo: PromoScope =
      body.appliesTo === 'multi_day' || body.appliesTo === 'day_tour' ? body.appliesTo : 'all';

    const minOrderCents =
      typeof body.minOrderCents === 'number' && Number.isFinite(body.minOrderCents) && body.minOrderCents >= 0
        ? Math.round(body.minOrderCents)
        : 0;

    const maxUses =
      body.maxUses === null || body.maxUses === '' || body.maxUses === undefined
        ? null
        : Number.isInteger(Number(body.maxUses)) && Number(body.maxUses) > 0
        ? Number(body.maxUses)
        : null;

    const rawExpires = cleanSingleLine(body.expiresAt, 20);
    const expiresAt = /^\d{4}-\d{2}-\d{2}$/.test(rawExpires) ? rawExpires : null;

    const allPromos = loadPromoCodes();
    if (allPromos.some((p) => p.code.toUpperCase() === code)) {
      res.status(409).json({ ok: false, error: `Promo code "${code}" already exists.` });
      return;
    }

    const created: PromoCode = {
      id: `promo-${crypto.randomBytes(5).toString('hex')}`,
      code,
      description,
      discountType,
      discountValue,
      currency,
      appliesTo,
      minOrderCents,
      maxUses,
      usedCount: 0,
      expiresAt,
      active: body.active !== false,
      stackableWithFullPayDiscount: body.stackableWithFullPayDiscount !== false,
      createdAt: new Date().toISOString(),
    };

    const next = [created, ...allPromos];
    savePromoCodes(next);
    res.status(201).json({ ok: true, promoCode: created, promoCodes: next });
  });

  app.patch('/api/admin/promo-codes/:id', requireAdminAuth, (req: Request, res: Response) => {
    const id = cleanSingleLine(req.params.id, 60);
    const allPromos = loadPromoCodes();
    const idx = allPromos.findIndex((p) => p.id === id);
    if (idx < 0) {
      res.status(404).json({ ok: false, error: 'Promo code not found.' });
      return;
    }

    const current = allPromos[idx];
    const body = (req.body ?? {}) as Record<string, unknown>;
    const updated: PromoCode = { ...current };

    if (typeof body.code === 'string') {
      const nextCode = normalizePromoCode(body.code);
      if (nextCode.length < 3) {
        res.status(400).json({ ok: false, error: 'Promo code must be at least 3 characters.' });
        return;
      }
      if (allPromos.some((p, i) => i !== idx && p.code.toUpperCase() === nextCode)) {
        res.status(409).json({ ok: false, error: `Promo code "${nextCode}" already exists.` });
        return;
      }
      updated.code = nextCode;
    }
    if (typeof body.description === 'string') {
      updated.description = cleanSingleLine(body.description, 160) || current.description;
    }
    if (body.discountType === 'percentage' || body.discountType === 'fixed') {
      updated.discountType = body.discountType;
    }
    if (typeof body.discountValue === 'number' && Number.isFinite(body.discountValue) && body.discountValue > 0) {
      updated.discountValue =
        updated.discountType === 'percentage'
          ? Math.min(90, Math.max(1, Math.round(body.discountValue)))
          : Math.min(5000000, Math.max(100, Math.round(body.discountValue)));
    }
    if (typeof body.currency === 'string') {
      updated.currency = body.currency.toUpperCase() === 'EUR' ? 'EUR' : 'USD';
    }
    if (body.appliesTo === 'all' || body.appliesTo === 'multi_day' || body.appliesTo === 'day_tour') {
      updated.appliesTo = body.appliesTo;
    }
    if (typeof body.minOrderCents === 'number' && Number.isFinite(body.minOrderCents) && body.minOrderCents >= 0) {
      updated.minOrderCents = Math.round(body.minOrderCents);
    }
    if (body.maxUses === null || body.maxUses === '') {
      updated.maxUses = null;
    } else if (typeof body.maxUses === 'number' && Number.isInteger(body.maxUses) && body.maxUses > 0) {
      updated.maxUses = body.maxUses;
    }
    if (body.expiresAt === null || body.expiresAt === '') {
      updated.expiresAt = null;
    } else if (typeof body.expiresAt === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.expiresAt.trim())) {
      updated.expiresAt = body.expiresAt.trim();
    }
    if (typeof body.active === 'boolean') {
      updated.active = body.active;
    }
    if (typeof body.stackableWithFullPayDiscount === 'boolean') {
      updated.stackableWithFullPayDiscount = body.stackableWithFullPayDiscount;
    }

    allPromos[idx] = updated;
    savePromoCodes(allPromos);
    res.status(200).json({ ok: true, promoCode: updated, promoCodes: allPromos });
  });

  app.delete('/api/admin/promo-codes/:id', requireAdminAuth, (req: Request, res: Response) => {
    const id = cleanSingleLine(req.params.id, 60);
    const allPromos = loadPromoCodes();
    const next = allPromos.filter((p) => p.id !== id);
    if (next.length === allPromos.length) {
      res.status(404).json({ ok: false, error: 'Promo code not found.' });
      return;
    }
    savePromoCodes(next);
    res.status(200).json({ ok: true, promoCodes: next });
  });

  // Authoritative server-side PaymentIntent creation (calculates price from TOURS_DATA + promo + date rules)
  app.post('/api/stripe/create-payment-intent', async (req: Request, res: Response) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (isStripeRateLimited(clientIp)) {
      res.status(429).json({ ok: false, error: 'Too many payment requests. Please wait a moment and try again.' });
      return;
    }

    const stripe = getStripeClient();
    if (!stripe) {
      res.status(503).json({
        ok: false,
        error: 'Stripe is not configured on the server yet. Please add STRIPE_SECRET_KEY in Settings -> Secrets.',
      });
      return;
    }

    const body = (req.body ?? {}) as Record<string, unknown>;
    const guests = Number(body.guests);
    const paymentPlan: PaymentPlanType =
      body.paymentPlan === 'full_pay' ? 'full_pay' : 'deposit_installments';
    const installmentTerms = clampInstallmentTerms(body.installmentTerms ?? 2);
    const leadName = cleanSingleLine(body.leadName, 120);
    const leadEmail = cleanSingleLine(body.leadEmail, 254);
    const leadPhone = cleanSingleLine(body.leadPhone, 60);
    const roomSummary = cleanSingleLine(body.roomSummary, 240);
    const rawPromoCode = normalizePromoCode(body.promoCode);

    if (!leadName || !isValidEmail(leadEmail)) {
      res.status(400).json({ ok: false, error: 'Valid lead traveler name and email are required.' });
      return;
    }

    const resolved = resolveAuthoritativeOrder(body);
    if (!resolved.ok) {
      res.status(resolved.status).json({ ok: false, error: resolved.error });
      return;
    }

    const { tour, isDayTour, isMultiDay, grossTotalCents, stripeCurrency, resolvedDepartureDate } = resolved.order;

    let appliedPromo: AppliedPromoInput | null = null;
    if (rawPromoCode) {
      const promoCheck = validatePromoForOrder({
        rawCode: rawPromoCode,
        isDayTour,
        grossTotalCents,
      });
      if (!promoCheck.valid) {
        res.status(400).json({ ok: false, error: promoCheck.error });
        return;
      }
      appliedPromo = {
        code: promoCheck.promo.code,
        discountType: promoCheck.promo.discountType,
        discountValue: promoCheck.promo.discountValue,
        currency: promoCheck.promo.currency,
        stackableWithFullPayDiscount: promoCheck.promo.stackableWithFullPayDiscount,
      };
    }

    const breakdown = calculatePaymentPlan({
      grossTotalCents,
      currency: stripeCurrency.toUpperCase(),
      isMultiDay,
      paymentPlan,
      installmentTerms,
      departureDate: resolvedDepartureDate,
      promo: appliedPromo,
    });

    if (breakdown.chargeNowCents < 50) {
      res.status(400).json({ ok: false, error: 'Calculated payment amount is below Stripe minimum.' });
      return;
    }

    try {
      const promoTag = breakdown.promoCode ? ` [Promo: ${breakdown.promoCode}]` : '';
      const description =
        breakdown.paymentPlan === 'full_pay'
          ? `${tour.title} — Full Payment${breakdown.fullPayDiscountPercent > 0 ? ' (5% Multi-Day Discount)' : ''}${promoTag} (${guests} pax, ${resolvedDepartureDate})`
          : `${tour.title} — 10% Deposit + ${breakdown.installmentTerms} Installment${breakdown.installmentTerms > 1 ? 's' : ''}${promoTag} (${guests} pax, ${resolvedDepartureDate})`;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: breakdown.chargeNowCents,
        currency: stripeCurrency,
        automatic_payment_methods: { enabled: true },
        receipt_email: leadEmail,
        description,
        metadata: {
          tour_id: tour.id,
          tour_slug: tour.slug,
          tour_title: tour.title.slice(0, 200),
          departure_date: resolvedDepartureDate,
          guests: String(guests),
          is_multi_day: isMultiDay ? 'true' : 'false',
          payment_plan: breakdown.paymentPlan,
          installment_terms: String(breakdown.installmentTerms),
          gross_total_cents: String(breakdown.grossTotalCents),
          promo_code: breakdown.promoCode || '',
          promo_discount_cents: String(breakdown.promoDiscountCents),
          promo_discount_type: appliedPromo?.discountType || '',
          promo_discount_value: appliedPromo ? String(appliedPromo.discountValue) : '0',
          promo_currency: appliedPromo?.currency || '',
          promo_stackable: appliedPromo?.stackableWithFullPayDiscount ? 'true' : 'false',
          full_pay_discount_cents: String(breakdown.fullPayDiscountCents),
          net_total_cents: String(breakdown.netTotalCents),
          charge_now_cents: String(breakdown.chargeNowCents),
          remaining_balance_cents: String(breakdown.remainingBalanceCents),
          currency: breakdown.currency,
          lead_name: leadName,
          lead_email: leadEmail,
          lead_phone: leadPhone,
          room_summary: roomSummary.slice(0, 200),
        },
      });

      res.status(200).json({
        ok: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        breakdown,
      });
    } catch (err) {
      console.error('[Stripe] Failed to create PaymentIntent:', err instanceof Error ? err.message : 'Unknown error');
      res.status(502).json({
        ok: false,
        error: 'Unable to initialize Stripe payment session. Please verify your Stripe Test Secret key.',
      });
    }
  });

  // Verify completed PaymentIntent and generate Stripe Payment Links for any scheduled installments
  app.post('/api/stripe/finalize-payment', async (req: Request, res: Response) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (isStripeRateLimited(clientIp)) {
      res.status(429).json({ ok: false, error: 'Too many requests. Please try again shortly.' });
      return;
    }

    const stripe = getStripeClient();
    if (!stripe) {
      res.status(503).json({ ok: false, error: 'Stripe is not configured on the server.' });
      return;
    }

    const body = req.body ?? {};
    const paymentIntentId = cleanSingleLine(body.paymentIntentId, 120);
    const bookingReference = cleanSingleLine(body.bookingReference, 60);

    if (!/^pi_[A-Za-z0-9_]+$/.test(paymentIntentId)) {
      res.status(400).json({ ok: false, error: 'Invalid PaymentIntent identifier.' });
      return;
    }

    try {
      const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (pi.status !== 'succeeded' && pi.status !== 'processing') {
        res.status(402).json({
          ok: false,
          verified: false,
          status: pi.status,
          error: `Payment has not completed (current status: ${pi.status}).`,
        });
        return;
      }

      const meta = pi.metadata || {};
      const paymentPlan: PaymentPlanType =
        meta.payment_plan === 'full_pay' ? 'full_pay' : 'deposit_installments';
      const installmentTerms = clampInstallmentTerms(meta.installment_terms ?? 2);
      const grossTotalCents = Number(meta.gross_total_cents) || pi.amount;
      const isMultiDay = meta.is_multi_day === 'true';
      const currency = (meta.currency || pi.currency || 'USD').toUpperCase();
      const departureDate = meta.departure_date || 'Flexible';
      const tourTitle = meta.tour_title || 'Atlas Global Tours Reservation';
      const leadEmail = meta.lead_email || pi.receipt_email || '';

      const reconstructedPromo: AppliedPromoInput | null =
        meta.promo_code && Number(meta.promo_discount_value) > 0
          ? {
              code: meta.promo_code,
              discountType: meta.promo_discount_type === 'fixed' ? 'fixed' : 'percentage',
              discountValue: Number(meta.promo_discount_value),
              currency: meta.promo_currency || currency,
              stackableWithFullPayDiscount: meta.promo_stackable === 'true',
            }
          : null;

      // Increment promo code usage counter once per verified PaymentIntent
      if (meta.promo_code) {
        incrementPromoUsageOnce(paymentIntentId, meta.promo_code);
      }

      // Record booking reference in Stripe metadata for easy reconciliation
      if (bookingReference && meta.booking_reference !== bookingReference) {
        try {
          await stripe.paymentIntents.update(paymentIntentId, {
            metadata: { ...meta, booking_reference: bookingReference },
          });
        } catch {
          // Non-blocking if metadata update fails
        }
      }

      const breakdown = calculatePaymentPlan({
        grossTotalCents,
        currency,
        isMultiDay,
        paymentPlan,
        installmentTerms,
        departureDate,
        promo: reconstructedPromo,
      });

      let installments: InstallmentItem[] = [];

      if (breakdown.paymentPlan === 'deposit_installments' && breakdown.installmentSchedule.length > 0) {
        const cached = finalizedInstallmentsCache.get(paymentIntentId);
        if (cached) {
          installments = cached;
        } else {
          const appBaseUrl = getSafeAppBaseUrl(req);
          const createdItems: InstallmentItem[] = [];

          for (const item of breakdown.installmentSchedule) {
            let paymentLinkUrl: string | undefined;
            let stripePaymentLinkId: string | undefined;

            try {
              const price = await stripe.prices.create({
                currency: currency.toLowerCase(),
                unit_amount: item.amountCents,
                product_data: {
                  name: `${tourTitle.slice(0, 110)} — Installment ${item.installmentNumber}/${item.totalInstallments}`,
                  metadata: {
                    booking_reference: bookingReference || paymentIntentId,
                    installment_number: String(item.installmentNumber),
                    due_date: item.dueDate,
                  },
                },
              });

              const paymentLink = await stripe.paymentLinks.create({
                line_items: [{ price: price.id, quantity: 1 }],
                metadata: {
                  booking_reference: bookingReference || paymentIntentId,
                  parent_payment_intent_id: paymentIntentId,
                  installment_number: String(item.installmentNumber),
                  total_installments: String(item.totalInstallments),
                  due_date: item.dueDate,
                  lead_email: leadEmail,
                  tour_title: tourTitle.slice(0, 160),
                },
                after_completion: {
                  type: 'redirect',
                  redirect: {
                    url: `${appBaseUrl}/account?installment_paid=${encodeURIComponent(
                      bookingReference || paymentIntentId
                    )}&term=${item.installmentNumber}&session_id={CHECKOUT_SESSION_ID}`,
                  },
                },
              });

              if (typeof paymentLink.url === 'string' && paymentLink.url.startsWith('https://')) {
                paymentLinkUrl = paymentLink.url;
                stripePaymentLinkId = paymentLink.id;
              }
            } catch (linkErr) {
              console.warn(
                `[Stripe] Could not create Payment Link for installment ${item.installmentNumber}:`,
                linkErr instanceof Error ? linkErr.message : 'Unknown error'
              );
            }

            createdItems.push({
              ...item,
              paymentLinkUrl,
              stripePaymentLinkId,
            });
          }

          finalizedInstallmentsCache.set(paymentIntentId, createdItems);
          installments = createdItems;
        }
      }

      res.status(200).json({
        ok: true,
        verified: true,
        status: pi.status,
        paymentIntentId: pi.id,
        amountPaidCents: pi.amount_received || pi.amount,
        currency,
        paymentPlan: breakdown.paymentPlan,
        installmentTerms: breakdown.installmentTerms,
        grossTotalCents: breakdown.grossTotalCents,
        promoCode: breakdown.promoCode,
        promoDiscountCents: breakdown.promoDiscountCents,
        fullPayDiscountCents: breakdown.fullPayDiscountCents,
        netTotalCents: breakdown.netTotalCents,
        remainingBalanceCents: breakdown.remainingBalanceCents,
        installments,
      });
    } catch (err) {
      console.error('[Stripe] Payment verification failed:', err instanceof Error ? err.message : 'Unknown error');
      res.status(502).json({ ok: false, error: 'Failed to verify Stripe payment status.' });
    }
  });

  // Server-verified installment Checkout Session check (prevents URL query spoofing)
  app.post('/api/stripe/verify-installment-session', async (req: Request, res: Response) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (isStripeRateLimited(clientIp)) {
      res.status(429).json({ ok: false, verified: false, error: 'Too many requests.' });
      return;
    }

    const stripe = getStripeClient();
    if (!stripe) {
      res.status(503).json({ ok: false, verified: false, error: 'Stripe is not configured.' });
      return;
    }

    const body = req.body ?? {};
    const sessionId = cleanSingleLine(body.sessionId, 160);
    const expectedRef = cleanSingleLine(body.bookingReference, 60);
    const expectedTerm = Number(body.installmentNumber);

    if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId) || !expectedRef || !Number.isInteger(expectedTerm)) {
      res.status(400).json({ ok: false, verified: false, error: 'Invalid session verification parameters.' });
      return;
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const isPaid = session.payment_status === 'paid';
      const metaRef = cleanSingleLine(session.metadata?.booking_reference, 60);
      const metaTerm = Number(session.metadata?.installment_number);

      if (!isPaid || metaRef !== expectedRef || metaTerm !== expectedTerm) {
        res.status(402).json({
          ok: false,
          verified: false,
          error: 'Installment payment could not be verified with Stripe.',
        });
        return;
      }

      const paidSet = webhookPaidInstallments.get(expectedRef) || new Set<number>();
      paidSet.add(expectedTerm);
      webhookPaidInstallments.set(expectedRef, paidSet);

      res.status(200).json({
        ok: true,
        verified: true,
        bookingReference: expectedRef,
        installmentNumber: expectedTerm,
      });
    } catch (err) {
      console.error('[Stripe] Installment session verify failed:', err instanceof Error ? err.message : 'Unknown error');
      res.status(502).json({ ok: false, verified: false, error: 'Unable to verify installment session.' });
    }
  });

  // Lookup webhook-confirmed paid installments for a booking reference
  app.get('/api/stripe/installment-status/:reference', (req: Request, res: Response) => {
    const reference = cleanSingleLine(req.params.reference, 60);
    if (!reference) {
      res.status(400).json({ ok: false, paidInstallments: [] });
      return;
    }
    const paidSet = webhookPaidInstallments.get(reference);
    res.status(200).json({
      ok: true,
      paidInstallments: paidSet ? Array.from(paidSet).sort((a, b) => a - b) : [],
    });
  });

  // Admin booking notification endpoint (sends via Resend when RESEND_API_KEY is configured)
  app.post('/api/bookings/notify', async (req: Request, res: Response) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (isRateLimited(clientIp)) {
      res.status(429).json({ ok: false, error: 'Too many booking notification requests. Please try again shortly.' });
      return;
    }

    const body = req.body ?? {};
    const reference = cleanSingleLine(body.reference, 60);
    const tourCode = cleanSingleLine(body.tourCode, 20) || undefined;
    const tourTitle = cleanSingleLine(body.tourTitle, 180);
    const tourSlug = cleanSingleLine(body.tourSlug, 160);
    const departureDate = cleanSingleLine(body.departureDate, 60);
    const leadName = cleanSingleLine(body.leadName, 120);
    const leadEmail = cleanSingleLine(body.leadEmail, 254);
    const leadPhone = cleanSingleLine(body.leadPhone, 60);
    const guests = Number(body.guests);

    if (!reference || !tourTitle || !departureDate || !leadName || !isValidEmail(leadEmail)) {
      res.status(400).json({ ok: false, error: 'Missing or invalid booking notification fields.' });
      return;
    }

    if (!Number.isInteger(guests) || guests < 1 || guests > 50) {
      res.status(400).json({ ok: false, error: 'Invalid passenger count.' });
      return;
    }

    const payload: BookingNotificationPayload = {
      reference,
      tourCode,
      tourTitle,
      tourSlug,
      departureDate,
      guests,
      remainingSeats: typeof body.remainingSeats === 'number' && Number.isFinite(body.remainingSeats)
        ? Math.max(0, Math.floor(body.remainingSeats))
        : undefined,
      capacity: typeof body.capacity === 'number' && Number.isFinite(body.capacity)
        ? Math.max(1, Math.floor(body.capacity))
        : undefined,
      totalPriceFormatted: cleanSingleLine(body.totalPriceFormatted, 60) || 'Confirmed',
      depositFormatted: cleanSingleLine(body.depositFormatted, 60) || undefined,
      amountPaidFormatted: cleanSingleLine(body.amountPaidFormatted, 60) || undefined,
      remainingBalanceFormatted: cleanSingleLine(body.remainingBalanceFormatted, 60) || undefined,
      discountFormatted: cleanSingleLine(body.discountFormatted, 60) || undefined,
      promoCode: normalizePromoCode(body.promoCode) || undefined,
      promoDiscountFormatted: cleanSingleLine(body.promoDiscountFormatted, 60) || undefined,
      paymentPlanLabel: cleanSingleLine(body.paymentPlanLabel, 120) || undefined,
      stripePaymentIntentId: cleanSingleLine(body.stripePaymentIntentId, 120) || undefined,
      installmentSummary: cleanMultiLine(body.installmentSummary, 1500) || undefined,
      currency: cleanSingleLine(body.currency, 10) || 'USD',
      leadName,
      leadEmail,
      leadPhone,
      leadNationality: cleanSingleLine(body.leadNationality, 80) || undefined,
      paymentMethod: cleanSingleLine(body.paymentMethod, 60) || undefined,
      roomSummary: cleanSingleLine(body.roomSummary, 240) || undefined,
      specialRequests: cleanMultiLine(body.specialRequests, 1200) || undefined,
      isAdvisorBooking: Boolean(body.isAdvisorBooking),
      advisorName: cleanSingleLine(body.advisorName, 120) || undefined,
      agencyName: cleanSingleLine(body.agencyName, 140) || undefined,
      commissionRatePercent: typeof body.commissionRatePercent === 'number' && Number.isFinite(body.commissionRatePercent)
        ? Math.min(100, Math.max(0, body.commissionRatePercent))
        : undefined,
    };

    const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
    const rawEmailFrom = (process.env.EMAIL_FROM || '').trim();
    const emailFrom =
      !rawEmailFrom || rawEmailFrom.toLowerCase() === LEGACY_INFO_EMAIL
        ? DEFAULT_EMAIL_FROM
        : rawEmailFrom;
    const { subject, html, text } = buildAdminEmailContent(payload);

    if (!resendApiKey) {
      console.info(
        `[Booking Notify] RESEND_API_KEY not configured; queued notification for ${reference} -> ${ADMIN_BOOKING_EMAIL}`
      );
      res.status(200).json({
        ok: true,
        delivered: false,
        configured: false,
        recipient: ADMIN_BOOKING_EMAIL,
      });
      return;
    }

    try {
      const sendViaResend = async (fromAddress: string) => {
        return fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [ADMIN_BOOKING_EMAIL],
            reply_to: payload.leadEmail,
            subject,
            html,
            text,
          }),
        });
      };

      let usedFrom = emailFrom;
      let resendRes = await sendViaResend(usedFrom);
      let primaryError: string | undefined;

      // If custom domain isn't verified yet in Resend, capture primary error and retry once with onboarding@resend.dev
      if (!resendRes.ok && (resendRes.status === 403 || resendRes.status === 422) && !usedFrom.includes('onboarding@resend.dev')) {
        try {
          const firstJson = (await resendRes.json()) as { message?: string };
          primaryError = typeof firstJson.message === 'string' ? firstJson.message.trim().slice(0, 240) : undefined;
        } catch {
          primaryError = `HTTP ${resendRes.status}`;
        }
        console.warn(`[Booking Notify] Primary sender (${usedFrom}) rejected (${resendRes.status}): ${primaryError}. Retrying with onboarding@resend.dev...`);
        usedFrom = 'Atlas Global Tours <onboarding@resend.dev>';
        resendRes = await sendViaResend(usedFrom);
      }

      if (!resendRes.ok) {
        let providerMessage = 'Email provider rejected the notification request.';
        try {
          const errJson = (await resendRes.json()) as { message?: string };
          if (typeof errJson.message === 'string' && errJson.message.trim()) {
            providerMessage = errJson.message.trim().slice(0, 240);
          }
        } catch {
          // keep generic message
        }
        console.error(`[Booking Notify] Resend rejected email (${resendRes.status}): ${providerMessage}`);
        res.status(502).json({
          ok: false,
          delivered: false,
          configured: true,
          recipient: ADMIN_BOOKING_EMAIL,
          primaryFrom: emailFrom,
          primaryError: primaryError || providerMessage,
          providerStatus: resendRes.status,
          error: providerMessage,
        });
        return;
      }

      const data = (await resendRes.json()) as { id?: string };
      res.status(200).json({
        ok: true,
        delivered: true,
        configured: true,
        recipient: ADMIN_BOOKING_EMAIL,
        from: usedFrom,
        messageId: data.id || null,
      });
    } catch (err) {
      console.error('[Booking Notify] Failed to reach Resend API:', err instanceof Error ? err.message : 'Unknown error');
      res.status(502).json({
        ok: false,
        delivered: false,
        configured: true,
        error: 'Unable to reach email service.',
      });
    }
  });

  registerJournalAndSoroRoutes(app, requireAdminAuth, getSafeAppBaseUrl);

  // Every non-API, non-file GET renders the SPA shell with route-specific
  // <head> tags and the correct HTTP status (404 for unknown routes).
  const sendAppShell = (req: Request, res: Response, template: string) => {
    if (req.path.startsWith('/api/')) {
      res.status(404).json({ ok: false, error: 'Not found.' });
      return;
    }
    const meta = getRouteMetaForRequest(req.path, seoDeps);
    res
      .status(meta.status)
      .set('Content-Type', 'text/html; charset=utf-8')
      .set('Cache-Control', 'no-cache')
      .send(injectRouteMeta(template, meta));
  };

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    app.get('*', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const raw = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf8');
        const template = await vite.transformIndexHtml(req.originalUrl, raw);
        sendAppShell(req, res, template);
      } catch (err) {
        vite.ssrFixStacktrace(err as Error);
        next(err);
      }
    });
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    const indexPath = path.join(distDir, 'index.html');
    // index: false so "/" also goes through the meta-injecting handler below
    app.use(express.static(distDir, { index: false }));
    let cachedTemplate: string | null = null;
    app.get('*', (req: Request, res: Response) => {
      if (!cachedTemplate) {
        if (!fs.existsSync(indexPath)) {
          res.status(404).send('Build output not found. Run npm run build first.');
          return;
        }
        cachedTemplate = fs.readFileSync(indexPath, 'utf8');
      }
      sendAppShell(req, res, cachedTemplate);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Atlas Global Tours server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
