import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

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
    ...(data.depositFormatted ? [['Deposit (20%)', data.depositFormatted] as [string, string]] : []),
    ['Payment Method', data.paymentMethod || 'Card'],
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
  app.use(express.json({ limit: '64kb' }));

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

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexPath = path.join(distDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
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
