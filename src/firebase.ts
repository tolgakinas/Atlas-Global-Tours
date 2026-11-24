import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

export const BOOTSTRAPPED_ADMIN_EMAIL = 'tolgakinas@gmail.com';

// Validate connection to Firestore on startup
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
void testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ============================================================================
// Defensive Payload Sanitization (Verbatim synced with firebase-blueprint.json)
// ============================================================================
export const ID_PATTERN = /^[a-zA-Z0-9_-]+$/;
export const CODE_PATTERN = /^[A-Z0-9-]+$/;

export function sanitizeId(raw: string, fallbackPrefix = 'doc'): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128);
  if (cleaned.length >= 1 && ID_PATTERN.test(cleaned)) {
    return cleaned;
  }
  return `${fallbackPrefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function sanitizeUpperCode(raw: string, maxLen: number, fallback: string): string {
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, maxLen);
  if (cleaned.length >= 1 && CODE_PATTERN.test(cleaned)) {
    return cleaned;
  }
  return fallback;
}

export function clampString(value: string | undefined | null, maxLen: number, fallback = ''): string {
  const str = (value ?? fallback).trim();
  return str.length > maxLen ? str.slice(0, maxLen) : str;
}

export function clampInt(value: number, min: number, max: number): number {
  const rounded = Math.round(Number.isFinite(value) ? value : min);
  return Math.min(max, Math.max(min, rounded));
}

export function clampNumber(value: number, min: number, max: number): number {
  const num = Number.isFinite(value) ? value : min;
  return Math.min(max, Math.max(min, num));
}

export const ALLOWED_CURRENCIES = ['USD', 'EUR', 'GBP', 'AUD', 'NZD', 'CAD'] as const;
export type AllowedCurrency = (typeof ALLOWED_CURRENCIES)[number];

export function sanitizeCurrency(currency?: string): AllowedCurrency {
  const upper = (currency || 'USD').toUpperCase();
  return (ALLOWED_CURRENCIES as readonly string[]).includes(upper)
    ? (upper as AllowedCurrency)
    : 'USD';
}

export { firebaseConfig };
