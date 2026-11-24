# Security Specification & Payload-First TDD (`security_spec.md`)

## 1. Data Invariants & Master Source of Truth
1. **Authoritative RBAC Isolation**: Roles (`admin`, `operations`) live exclusively in `/admins/{userId}` and `/operations_staff/{userId}` (plus the verified bootstrapped admin `tolgakinas@gmail.com`). Regular users can NEVER write to `/admins`, `/operations_staff`, or inject RBAC fields into `/users/{userId}`.
2. **PII Isolation**: Collections containing PII (`/users`, `/bookings`, `/inquiries`, `/guides`, `/advisors`) strictly reject reads from non-owners and non-staff. Public seat availability is split into PII-free `/seat_reservations/{bookingId}`.
3. **Atomic Seat Reservation Sync**: Creating `/seat_reservations/{bookingId}` requires `existsAfter(/databases/$(database)/documents/bookings/$(bookingId))` with matching `userId`, `tourId`, `departureDate`, and `guests`.
4. **Immutable Ownership & Timestamps**: `userId`/`authorId`/`uid` and `createdAt` are immutable after create. All `createdAt` and `updatedAt` fields must equal `request.time`.
5. **Terminal State Locking**: Once a `/bookings/{bookingId}` document reaches `status == 'cancelled'`, non-staff travelers cannot modify it further.
6. **Verified Email Mandate**: All authenticated write operations require `request.auth.token.email_verified == true`.
7. **ID & Payload Size Hardening**: Every single-doc operation validates `isValidId(id)` (`^[a-zA-Z0-9_\-]+$`, max 128 chars), every string enforces `.size()` limits matching `firebase-blueprint.json`, and every array (`guides.languages`) is bounded to `<= 10` elements with first-element type checks.

## 2. The "Dirty Dozen" Adversarial Payloads (Must Return PERMISSION_DENIED)

1. **P1 — Self-Assigned Admin Privilege Escalation**: Non-admin user attempts `create` on `/admins/{uid}` with `{ uid: attackerUid, email: "attacker@example.com", displayName: "Attacker", grantedBy: attackerUid, createdAt: serverTimestamp() }`.
2. **P2 — Shadow Ghost Field Injection on Profile**: User creates `/users/{uid}` with valid required fields plus ghost field `{ isAdmin: true }`.
3. **P3 — Cross-User PII Theft (`get`)**: Authenticated user A attempts `get` on `/users/{userB}` or `/bookings/{userB_booking}`.
4. **P4 — Unverified Email Spoof Attack**: Attacker with `email: "tolgakinas@gmail.com"` and `email_verified: false` attempts to read `/guides/{id}` or write `/site_content/main`.
5. **P5 — Booking Identity Spoofing**: User A attempts `create` on `/bookings/bk-1` with `{ userId: userB, ... }`.
6. **P6 — Booking Payment Tampering (Value / Field Escalation)**: Traveler owner attempts `update` on their `/bookings/bk-1` modifying `paymentStatus` or `totalPriceCents` or `internalNotes`.
7. **P7 — Terminal State Bypass**: Traveler owner attempts to revert a `status: "cancelled"` booking back to `status: "confirmed"`.
8. **P8 — Orphaned Seat Reservation**: User attempts `create` on `/seat_reservations/orphan-1` without atomically creating `/bookings/orphan-1` in the same batch.
9. **P9 — Resource Exhaustion / ID Poisoning**: User attempts `create` on `/bookings/<200-char-invalid-id!@#>` or submits `specialRequests` exceeding 1000 chars.
10. **P10 — Client Timestamp Forgery**: User submits a client-supplied past timestamp for `createdAt` or `updatedAt` instead of `request.time`.
11. **P11 — Unbounded Array Poisoning on Guide**: Staff attempts `create` on `/guides/g-1` with 15 items in `languages` (exceeds max 10) or non-string element `[123]`.
12. **P12 — Blanket Query Scraping (`list`)**: Non-staff user attempts unfiltered `list` on `/bookings`, `/inquiries`, `/guides`, or `/users`.
