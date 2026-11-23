export interface BookingEmailNotificationRequest {
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

export interface BookingEmailNotificationResult {
  ok: boolean;
  delivered: boolean;
  configured: boolean;
  recipient?: string;
}

/**
 * Sends a booking alert to the backend notification route, which dispatches
 * the confirmation email to bookings@atlasglobaltours.com via Resend.
 */
export async function sendAdminBookingNotification(
  payload: BookingEmailNotificationRequest
): Promise<BookingEmailNotificationResult> {
  try {
    const response = await fetch('/api/bookings/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    return {
      ok: Boolean(data.ok),
      delivered: Boolean(data.delivered),
      configured: Boolean(data.configured),
      recipient: typeof data.recipient === 'string' ? data.recipient : 'bookings@atlasglobaltours.com',
    };
  } catch {
    return {
      ok: false,
      delivered: false,
      configured: false,
      recipient: 'bookings@atlasglobaltours.com',
    };
  }
}
