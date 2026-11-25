import React, { useEffect, useMemo, useRef, useState } from 'react';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { AlertCircle, Loader2, Lock, ShieldCheck } from 'lucide-react';
import {
  formatExactCurrency,
  type InstallmentTerms,
  type PaymentPlanBreakdown,
  type PaymentPlanType,
} from '../utils/paymentPlans';

const stripePromiseCache = new Map<string, Promise<Stripe | null>>();

function getStripePromise(publishableKey: string): Promise<Stripe | null> {
  if (!stripePromiseCache.has(publishableKey)) {
    stripePromiseCache.set(publishableKey, loadStripe(publishableKey));
  }
  return stripePromiseCache.get(publishableKey)!;
}

export interface StripePaymentFormProps {
  tourId: string;
  tourSlug: string;
  departureId?: string;
  departureDate: string;
  guests: number;
  singleRoomsCount: number;
  roomSummary: string;
  paymentPlan: PaymentPlanType;
  installmentTerms: InstallmentTerms;
  promoCode?: string | null;
  leadName: string;
  leadEmail: string;
  leadPhone: string;
  agreeTerms: boolean;
  disabled?: boolean;
  localBreakdown: PaymentPlanBreakdown;
  onBeforeRedirect: (paymentIntentId: string) => void;
  onPaymentSuccess: (paymentIntentId: string) => Promise<void>;
}

interface InnerCheckoutFormProps {
  paymentIntentId: string;
  tourSlug: string;
  leadName: string;
  leadEmail: string;
  leadPhone: string;
  chargeNowCents: number;
  currency: string;
  paymentPlan: PaymentPlanType;
  agreeTerms: boolean;
  disabled?: boolean;
  onBeforeRedirect: (paymentIntentId: string) => void;
  onPaymentSuccess: (paymentIntentId: string) => Promise<void>;
}

const InnerCheckoutForm: React.FC<InnerCheckoutFormProps> = ({
  paymentIntentId,
  tourSlug,
  leadName,
  leadEmail,
  leadPhone,
  chargeNowCents,
  currency,
  paymentPlan,
  agreeTerms,
  disabled,
  onBeforeRedirect,
  onPaymentSuccess,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConfirmPayment = async () => {
    if (!stripe || !elements || isProcessing || disabled || !agreeTerms) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Persist booking draft in sessionStorage before Stripe possibly redirects (e.g., Klarna / 3DS)
      onBeforeRedirect(paymentIntentId);

      const returnUrl = `${window.location.origin}/tours/${encodeURIComponent(tourSlug)}/book?stripe_return=1`;

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: returnUrl,
          receipt_email: leadEmail,
          payment_method_data: {
            billing_details: {
              name: leadName,
              email: leadEmail,
              phone: leadPhone || undefined,
            },
          },
        },
      });

      if (error) {
        setErrorMessage(error.message || 'Your payment could not be completed. Please check your details and try again.');
        setIsProcessing(false);
        return;
      }

      if (
        paymentIntent &&
        (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing')
      ) {
        await onPaymentSuccess(paymentIntent.id);
        return;
      }

      setErrorMessage('Payment requires additional confirmation. Please follow the prompt or try another method.');
      setIsProcessing(false);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred while processing payment.'
      );
      setIsProcessing(false);
    }
  };

  const formattedCharge = formatExactCurrency(chargeNowCents, currency);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-background p-4">
        <PaymentElement
          onReady={() => setIsReady(true)}
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: {
                name: leadName,
                email: leadEmail,
                phone: leadPhone,
              },
            },
          }}
        />
      </div>

      {errorMessage && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-xs font-medium text-destructive">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 text-[0.7rem] text-muted-foreground">
          <ShieldCheck className="size-4 text-primary shrink-0" />
          <span>256-bit TLS encrypted checkout powered by Stripe · Charged in {currency}</span>
        </div>

        <button
          type="button"
          onClick={handleConfirmPayment}
          disabled={!stripe || !elements || !isReady || !agreeTerms || isProcessing || disabled}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-7 py-3 text-xs font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg cursor-pointer shrink-0"
        >
          {isProcessing ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              <span>Processing Payment...</span>
            </>
          ) : (
            <>
              <Lock className="size-3.5" />
              <span>
                {paymentPlan === 'full_pay'
                  ? `Pay ${formattedCharge} in Full`
                  : `Pay ${formattedCharge} Deposit Now`}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  tourId,
  tourSlug,
  departureId,
  departureDate,
  guests,
  singleRoomsCount,
  roomSummary,
  paymentPlan,
  installmentTerms,
  promoCode,
  leadName,
  leadEmail,
  leadPhone,
  agreeTerms,
  disabled,
  localBreakdown,
  onBeforeRedirect,
  onPaymentSuccess,
}) => {
  const [publishableKey, setPublishableKey] = useState<string | null>(
    () => (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '').trim() || null
  );
  const [configLoaded, setConfigLoaded] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [serverBreakdown, setServerBreakdown] = useState<PaymentPlanBreakdown | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [retryCounter, setRetryCounter] = useState(0);

  const requestVersionRef = useRef(0);

  // Resolve publishable key from backend config as fallback if Vite env wasn't bundled yet
  useEffect(() => {
    let active = true;
    const loadConfig = async () => {
      try {
        const res = await fetch('/api/stripe/config');
        if (!res.ok) throw new Error('Unable to load Stripe configuration.');
        const data = (await res.json()) as {
          configured?: boolean;
          publishableKey?: string | null;
        };
        if (!active) return;
        if (data.publishableKey) {
          setPublishableKey(data.publishableKey);
        }
        if (!data.configured) {
          setInitError(
            'Stripe keys are not active on the server yet. Please verify STRIPE_SECRET_KEY and VITE_STRIPE_PUBLISHABLE_KEY in Settings -> Secrets.'
          );
        }
      } catch {
        if (active && !publishableKey) {
          setInitError('Unable to reach payment configuration service.');
        }
      } finally {
        if (active) setConfigLoaded(true);
      }
    };
    loadConfig();
    return () => {
      active = false;
    };
  }, [retryCounter]);

  // Create or refresh PaymentIntent whenever booking pricing parameters change
  useEffect(() => {
    if (!configLoaded) return;
    if (!publishableKey) {
      setIsInitializing(false);
      return;
    }

    const version = ++requestVersionRef.current;
    const controller = new AbortController();
    setIsInitializing(true);
    setInitError(null);

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            tourId,
            tourSlug,
            departureId,
            departureDate,
            guests,
            singleRoomsCount,
            roomSummary,
            paymentPlan,
            installmentTerms,
            promoCode: promoCode || undefined,
            leadName,
            leadEmail,
            leadPhone,
          }),
        });

        const data = await response.json().catch(() => ({}));
        if (requestVersionRef.current !== version) return;

        if (!response.ok || !data.clientSecret || !data.paymentIntentId) {
          setClientSecret(null);
          setPaymentIntentId(null);
          setInitError(
            typeof data.error === 'string'
              ? data.error
              : 'Could not initialize Stripe checkout session.'
          );
          setIsInitializing(false);
          return;
        }

        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
        if (data.breakdown) {
          setServerBreakdown(data.breakdown as PaymentPlanBreakdown);
        }
        setIsInitializing(false);
      } catch (err) {
        if (controller.signal.aborted || requestVersionRef.current !== version) return;
        setClientSecret(null);
        setPaymentIntentId(null);
        setInitError(
          err instanceof Error ? err.message : 'Unable to connect to payment server.'
        );
        setIsInitializing(false);
      }
    }, 220);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [
    configLoaded,
    publishableKey,
    tourId,
    tourSlug,
    departureId,
    departureDate,
    guests,
    singleRoomsCount,
    roomSummary,
    paymentPlan,
    installmentTerms,
    promoCode,
    leadName,
    leadEmail,
    leadPhone,
    retryCounter,
  ]);

  const stripePromise = useMemo(
    () => (publishableKey ? getStripePromise(publishableKey) : null),
    [publishableKey]
  );

  const activeBreakdown = serverBreakdown || localBreakdown;

  if (initError) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 space-y-3">
        <div className="flex items-start gap-2.5 text-xs text-destructive">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Stripe Checkout Unavailable</p>
            <p className="mt-1 opacity-90">{initError}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setRetryCounter((c) => c + 1)}
          className="rounded-md border border-destructive/40 bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          Retry Payment Setup
        </button>
      </div>
    );
  }

  if (isInitializing || !clientSecret || !paymentIntentId || !stripePromise) {
    return (
      <div className="rounded-xl border border-border bg-background p-6 flex flex-col items-center justify-center gap-2.5 text-center">
        <Loader2 className="size-5 animate-spin text-primary" />
        <p className="text-xs font-medium text-muted-foreground">
          Preparing secure Stripe payment form (Cards, Apple Pay, Google Pay, Klarna)...
        </p>
      </div>
    );
  }

  return (
    <Elements
      key={clientSecret}
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#1e6b52',
            colorBackground: '#ffffff',
            colorText: '#111827',
            colorDanger: '#dc2626',
            borderRadius: '8px',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          },
        },
      }}
    >
      <InnerCheckoutForm
        paymentIntentId={paymentIntentId}
        tourSlug={tourSlug}
        leadName={leadName}
        leadEmail={leadEmail}
        leadPhone={leadPhone}
        chargeNowCents={activeBreakdown.chargeNowCents}
        currency={activeBreakdown.currency}
        paymentPlan={activeBreakdown.paymentPlan}
        agreeTerms={agreeTerms}
        disabled={disabled}
        onBeforeRedirect={onBeforeRedirect}
        onPaymentSuccess={onPaymentSuccess}
      />
    </Elements>
  );
};
