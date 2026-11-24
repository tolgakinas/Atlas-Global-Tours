/**
 * Security Rules Verification Suite (Phase 0 Payload-First TDD)
 * Verifies all "Dirty Dozen" adversarial payloads are rejected (PERMISSION_DENIED)
 * and authorized operations succeed against firestore.rules.
 *
 * Run with Firebase Emulator Suite when testing locally:
 *   firebase emulators:exec --only firestore "npx tsx firestore.rules.test.ts"
 */

export interface DirtyDozenCase {
  id: string;
  name: string;
  actor: {
    uid: string;
    email: string;
    email_verified: boolean;
    isAdmin?: boolean;
  };
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TESTS: DirtyDozenCase[] = [
  {
    id: 'P1',
    name: 'Self-Assigned Admin Privilege Escalation',
    actor: { uid: 'attacker-1', email: 'attacker@example.com', email_verified: true },
    operation: 'create',
    path: '/admins/attacker-1',
    payload: {
      uid: 'attacker-1',
      email: 'attacker@example.com',
      displayName: 'Attacker',
      grantedBy: 'attacker-1',
      createdAt: 'SERVER_TIMESTAMP',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'P2',
    name: 'Shadow Ghost Field Injection on Profile',
    actor: { uid: 'user-a', email: 'usera@example.com', email_verified: true },
    operation: 'create',
    path: '/users/user-a',
    payload: {
      uid: 'user-a',
      displayName: 'User A',
      email: 'usera@example.com',
      isAdmin: true,
      createdAt: 'SERVER_TIMESTAMP',
      updatedAt: 'SERVER_TIMESTAMP',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'P3',
    name: 'Cross-User PII Theft on Bookings',
    actor: { uid: 'user-a', email: 'usera@example.com', email_verified: true },
    operation: 'get',
    path: '/bookings/user-b-booking',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'P4',
    name: 'Unverified Admin Email Spoof Attack',
    actor: { uid: 'spoof-1', email: 'tolgakinas@gmail.com', email_verified: false },
    operation: 'get',
    path: '/guides/g-1',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'P5',
    name: 'Booking Identity Spoofing',
    actor: { uid: 'user-a', email: 'usera@example.com', email_verified: true },
    operation: 'create',
    path: '/bookings/bk-spoof',
    payload: {
      id: 'bk-spoof',
      userId: 'user-b',
      reference: 'ISET261130-111',
      tourCode: 'ISET',
      tourId: 'tour-1',
      tourSlug: 'shortbreak-eastern-turkiye',
      tourTitle: 'Eastern Turkiye',
      departureDate: '2026-11-30',
      guests: 2,
      totalPriceCents: 420000,
      currency: 'USD',
      leadName: 'Spoof User',
      leadEmail: 'userb@example.com',
      paymentStatus: 'paid',
      status: 'confirmed',
      createdAt: 'SERVER_TIMESTAMP',
      updatedAt: 'SERVER_TIMESTAMP',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'P6',
    name: 'Booking Payment Tampering by Owner',
    actor: { uid: 'user-a', email: 'usera@example.com', email_verified: true },
    operation: 'update',
    path: '/bookings/bk-user-a',
    payload: {
      paymentStatus: 'paid',
      totalPriceCents: 100,
      updatedAt: 'SERVER_TIMESTAMP',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'P7',
    name: 'Terminal Cancelled State Bypass',
    actor: { uid: 'user-a', email: 'usera@example.com', email_verified: true },
    operation: 'update',
    path: '/bookings/bk-cancelled-user-a',
    payload: {
      status: 'confirmed',
      updatedAt: 'SERVER_TIMESTAMP',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'P8',
    name: 'Orphaned Seat Reservation Without Atomic Booking',
    actor: { uid: 'user-a', email: 'usera@example.com', email_verified: true },
    operation: 'create',
    path: '/seat_reservations/orphan-1',
    payload: {
      bookingId: 'orphan-1',
      userId: 'user-a',
      tourId: 'tour-1',
      departureDate: '2026-11-30',
      guests: 4,
      status: 'active',
      createdAt: 'SERVER_TIMESTAMP',
      updatedAt: 'SERVER_TIMESTAMP',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'P9',
    name: 'ID Poisoning & Oversized Payload Attack',
    actor: { uid: 'user-a', email: 'usera@example.com', email_verified: true },
    operation: 'create',
    path: `/bookings/${'x'.repeat(180)}`,
    payload: {
      id: 'x'.repeat(180),
      userId: 'user-a',
      specialRequests: 'A'.repeat(5000),
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'P10',
    name: 'Client Timestamp Forgery',
    actor: { uid: 'user-a', email: 'usera@example.com', email_verified: true },
    operation: 'create',
    path: '/inquiries/inq-forged',
    payload: {
      id: 'inq-forged',
      userId: 'user-a',
      name: 'User A',
      email: 'usera@example.com',
      message: 'Hello',
      status: 'new',
      createdAt: '2020-01-01T00:00:00.000Z',
      updatedAt: '2020-01-01T00:00:00.000Z',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'P11',
    name: 'Unbounded Array Poisoning on Guide Languages',
    actor: { uid: 'admin-1', email: 'tolgakinas@gmail.com', email_verified: true, isAdmin: true },
    operation: 'create',
    path: '/guides/g-poison',
    payload: {
      id: 'g-poison',
      name: 'Test Guide',
      licenseNo: 'TR-100',
      languages: Array.from({ length: 15 }, (_, i) => `Lang${i}`),
      speciality: 'Test',
      phone: '+905551112233',
      email: 'guide@atlasglobaltours.com',
      status: 'available',
      createdAt: 'SERVER_TIMESTAMP',
      updatedAt: 'SERVER_TIMESTAMP',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'P12',
    name: 'Blanket Query Scraping on PII Collections',
    actor: { uid: 'user-a', email: 'usera@example.com', email_verified: true },
    operation: 'list',
    path: '/guides',
    expected: 'PERMISSION_DENIED',
  },
];
