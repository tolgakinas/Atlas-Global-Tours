import React, { useEffect } from 'react';
import {
  Shield,
  Compass,
  Globe,
  ExternalLink,
  Lock,
  CreditCard,
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { useTours } from '../context/ToursContext';
import { NewsletterSignup } from './NewsletterSignup';

interface FooterProps {
  onNavigate: (path: string) => void;
}

// Authentic Official Facebook Brand Mark
export const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'size-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

// Authentic Official Instagram Brand Mark
export const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'size-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

// Authentic Official TikTok Brand Mark
export const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'size-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

// Authentic Official LinkedIn Brand Mark
export const LinkedInIcon: React.FC<{ className?: string }> = ({ className = 'size-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.65 1.65 0 1 0 0-3.3 1.65 1.65 0 0 0 0 3.3m1.39 9.74v-8.37H5.07v8.37h2.78z" />
  </svg>
);

// Authentic Official X (formerly Twitter) Brand Mark
export const XIcon: React.FC<{ className?: string }> = ({ className = 'size-3.5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Authentic Official YouTube Brand Mark
export const YouTubeIcon: React.FC<{ className?: string }> = ({ className = 'size-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

// Authentic Official WhatsApp Brand Mark
export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'size-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

// Original Brand-Color Payment System Marks (compact, tailored for black background)
const VisaLogo: React.FC = () => (
  <svg viewBox="0 0 54 18" className="h-3.5 w-auto" role="img" aria-label="Visa">
    <path d="M9.5 4.2h4.2l-1.1 2.2H8.4z" fill="#F7B600" />
    <text
      x="28"
      y="14.5"
      textAnchor="middle"
      fill="#FFFFFF"
      fontFamily="Inter, system-ui, -apple-system, sans-serif"
      fontWeight="900"
      fontStyle="italic"
      fontSize="14.5"
      letterSpacing="-0.4"
    >
      VISA
    </text>
  </svg>
);

const MastercardLogo: React.FC = () => (
  <svg viewBox="0 0 36 22" className="h-4 w-auto" role="img" aria-label="Mastercard">
    <circle cx="13" cy="11" r="8" fill="#EB001B" />
    <circle cx="23" cy="11" r="8" fill="#F79E1B" />
    <path
      d="M18 4.7A7.98 7.98 0 0 0 15 11c0 2.55 1.2 4.82 3 6.3a7.98 7.98 0 0 0 3-6.3c0-2.55-1.2-4.82-3-6.3z"
      fill="#FF5F00"
    />
  </svg>
);

const AmexLogo: React.FC = () => (
  <svg viewBox="0 0 54 18" className="h-3.5 w-auto" role="img" aria-label="American Express">
    <rect x="1" y="1" width="52" height="16" rx="2.5" fill="#006FCF" />
    <text
      x="27"
      y="12.5"
      textAnchor="middle"
      fill="#FFFFFF"
      fontFamily="Inter, system-ui, -apple-system, sans-serif"
      fontWeight="800"
      fontSize="9.5"
      letterSpacing="0.5"
    >
      AMEX
    </text>
  </svg>
);

const DiscoverLogo: React.FC = () => (
  <svg viewBox="0 0 74 18" className="h-3.5 w-auto" role="img" aria-label="Discover">
    <text
      x="37"
      y="12.5"
      textAnchor="middle"
      fill="#FFFFFF"
      fontFamily="Inter, system-ui, -apple-system, sans-serif"
      fontWeight="800"
      fontSize="10"
      letterSpacing="0.6"
    >
      DISC
      <tspan fill="#F47216">O</tspan>
      VER
    </text>
    <path d="M44 16.5c10 0 20-2 26-5v5H44z" fill="#F47216" />
  </svg>
);

const ApplePayLogo: React.FC = () => (
  <svg viewBox="0 0 60 20" className="h-3.5 w-auto" role="img" aria-label="Apple Pay">
    <path
      d="M14.4 7.7c-.6 0-1.6.7-2.1.7-.5 0-1.3-.7-2.2-.7-1.1 0-2.2.7-2.8 1.7-1.2 2-.3 5.1.8 6.7.6.8 1.2 1.7 2.1 1.7.8 0 1.1-.5 2.1-.5 1 0 1.3.5 2.1.5.9 0 1.5-.8 2.1-1.6.6-.9.9-1.8.9-1.9 0-.1-1.8-.7-1.8-2.7 0-1.7 1.4-2.5 1.5-2.6-.8-1.2-2-1.3-2.5-1.3h-.2zm-1.1-1.7c.5-.6.8-1.3.7-2.1-.7 0-1.5.4-2 1-.4.5-.8 1.3-.7 2 .8.1 1.5-.3 2-.9z"
      fill="#FFFFFF"
    />
    <text
      x="39"
      y="15"
      textAnchor="middle"
      fill="#FFFFFF"
      fontFamily="Inter, system-ui, -apple-system, sans-serif"
      fontWeight="600"
      fontSize="12"
      letterSpacing="-0.2"
    >
      Pay
    </text>
  </svg>
);

const GooglePayLogo: React.FC = () => (
  <svg viewBox="0 0 62 20" className="h-3.5 w-auto" role="img" aria-label="Google Pay">
    <path d="M18.3 10.4c0-.5 0-.9-.1-1.3h-6.1v2.4h3.5c-.2.8-.6 1.5-1.3 1.9v1.6h2.1c1.2-1.1 1.9-2.8 1.9-4.6z" fill="#4285F4" />
    <path d="M12.1 16.6c1.8 0 3.2-.6 4.3-1.6l-2.1-1.6c-.6.4-1.3.6-2.2.6-1.7 0-3.1-1.1-3.6-2.7H6.3v1.6c1.1 2.2 3.3 3.7 5.8 3.7z" fill="#34A853" />
    <path d="M8.5 11.3c-.1-.4-.2-.8-.2-1.3s.1-.9.2-1.3V7.1H6.3C5.9 8 5.6 9 5.6 10s.3 2 .7 2.9l2.2-1.6z" fill="#FBBC05" />
    <path d="M12.1 6c1 0 1.8.3 2.5 1l1.9-1.9C15.3 4.1 13.8 3.5 12.1 3.5c-2.5 0-4.7 1.5-5.8 3.6l2.2 1.6C9 7.1 10.4 6 12.1 6z" fill="#EA4335" />
    <text
      x="41"
      y="14.6"
      textAnchor="middle"
      fill="#FFFFFF"
      fontFamily="Inter, system-ui, -apple-system, sans-serif"
      fontWeight="600"
      fontSize="11.5"
      letterSpacing="-0.2"
    >
      Pay
    </text>
  </svg>
);

const PayPalLogo: React.FC = () => (
  <svg viewBox="0 0 74 20" className="h-3.5 w-auto" role="img" aria-label="PayPal">
    <path d="M7.2 3.2h5.2c2.8 0 4.2 1.3 3.8 4-.4 2.8-2.4 4.3-5.1 4.3H9.3l-.8 4.8H5.7l1.5-13.1z" fill="#0079C1" />
    <path d="M10.2 6.4h4.4c2.2 0 3.5 1 3.1 3.3-.4 2.4-2 3.6-4.3 3.6h-1.4l-.7 4h-2.3l1.2-10.9z" fill="#00ADEF" />
    <text
      x="46"
      y="14.5"
      textAnchor="middle"
      fontFamily="Inter, system-ui, -apple-system, sans-serif"
      fontWeight="800"
      fontStyle="italic"
      fontSize="12.5"
      letterSpacing="-0.3"
    >
      <tspan fill="#FFFFFF">Pay</tspan>
      <tspan fill="#00ADEF">Pal</tspan>
    </text>
  </svg>
);

const StripeLogo: React.FC = () => (
  <svg viewBox="0 0 58 18" className="h-3.5 w-auto" role="img" aria-label="Stripe">
    <text
      x="29"
      y="14"
      textAnchor="middle"
      fill="#635BFF"
      fontFamily="Inter, system-ui, -apple-system, sans-serif"
      fontWeight="800"
      fontSize="14.5"
      letterSpacing="-0.6"
    >
      stripe
    </text>
  </svg>
);

const KlarnaLogo: React.FC = () => (
  <svg viewBox="0 0 64 18" className="h-3.5 w-auto" role="img" aria-label="Klarna">
    <text
      x="32"
      y="13.8"
      textAnchor="middle"
      fill="#FFB3C7"
      fontFamily="Inter, system-ui, -apple-system, sans-serif"
      fontWeight="800"
      fontSize="13"
      letterSpacing="-0.3"
    >
      Klarna.
    </text>
  </svg>
);

const WiseLogo: React.FC = () => (
  <svg viewBox="0 0 62 18" className="h-3.5 w-auto" role="img" aria-label="Wise">
    <path
      d="M7.5 3.5h8.2l-1.5 2.4H11l1.8 2.4-3.1 3.5h5.2l-1.4 2.4H5.2l4.7-5.5L7.5 3.5z"
      fill="#9FE870"
    />
    <text
      x="39"
      y="13.8"
      textAnchor="middle"
      fill="#9FE870"
      fontFamily="Inter, system-ui, -apple-system, sans-serif"
      fontWeight="800"
      fontSize="12.5"
      letterSpacing="0.4"
    >
      WISE
    </text>
  </svg>
);

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { currency } = useCurrency();
  const { siteContent } = useTours();

  // Re-trigger TrustedSite inline trustmarks scan if the script is loaded
  useEffect(() => {
    const win = window as any;
    if (win.TrustedSite && typeof win.TrustedSite.init === 'function') {
      try {
        win.TrustedSite.init();
      } catch {
        // Safe fallback
      }
    }
  }, []);

  return (
    <footer className="mt-0 border-t border-sidebar-border/40 bg-sidebar text-sidebar-foreground">
      {/* Top Section: Newsletter & Dispatches Banner with Elements & Buttons on an Even Line */}
      <div className="border-b border-sidebar-border/40 py-8 bg-sidebar/60">
        <div className="container-page flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-xl space-y-1">
            <span className="eyebrow text-sidebar-primary tracking-wider">
              Travel Dispatches & Private Offers
            </span>
            <h3 className="font-display text-xl text-sidebar-foreground font-semibold">
              Join the Atlas Explorer Circle
            </h3>
            <p className="text-xs text-sidebar-foreground/75 leading-relaxed">
              Curated small group expeditions, field notes from licensed guides, and priority access to newly released departure dates.
            </p>
          </div>

          <div className="w-full lg:max-w-md">
            <NewsletterSignup variant="footer" hideHeader={true} />
          </div>
        </div>
      </div>

      {/* Main Footer Navigation: 5 Balanced Columns with Even Baselines */}
      <div className="container-page grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-7 py-10">
        {/* Column 1: Brand & Social */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="cursor-pointer text-left inline-block transition-opacity hover:opacity-90"
            aria-label="Atlas Global Tours Home"
          >
            <img
              src="/atlas-logo.png"
              alt="Atlas Global Tours"
              className="h-7 w-auto brightness-0 invert"
            />
          </button>

          <p className="text-xs text-sidebar-foreground/75 leading-relaxed max-w-xs">
            Direct boutique tour operator running small group multi-day expeditions and day journeys led exclusively by licensed local guides across Europe, Asia, Africa, the Mediterranean, and the Americas.
          </p>

          {/* Social Media Channels Evenly Sized & Lined Up */}
          <div className="space-y-2 pt-1">
            <span className="text-[0.6875rem] uppercase tracking-wider font-semibold text-sidebar-primary block">
              Connect With Us
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {/* Facebook */}
              <a
                href={siteContent.facebookUrl || "https://facebook.com/atlasglobaltours"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Atlas Global Tours on Facebook"
                title="Facebook"
                className="size-9 rounded-lg border border-sidebar-border/80 bg-[#252d37]/90 hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white text-sidebar-foreground flex items-center justify-center transition-all cursor-pointer shadow-xs"
              >
                <FacebookIcon className="size-4" />
              </a>

              {/* Instagram */}
              <a
                href={siteContent.instagramUrl || "https://instagram.com/atlasglobaltours"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Atlas Global Tours on Instagram"
                title="Instagram"
                className="size-9 rounded-lg border border-sidebar-border/80 bg-[#252d37]/90 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:border-[#dc2743] hover:text-white text-sidebar-foreground flex items-center justify-center transition-all cursor-pointer shadow-xs"
              >
                <InstagramIcon className="size-4" />
              </a>

              {/* WhatsApp */}
              <a
                href={siteContent.whatsappUrl || "https://wa.me/905067088939"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with Atlas Global Tours on WhatsApp"
                title="WhatsApp Direct Inquiry"
                className="size-9 rounded-lg border border-sidebar-border/80 bg-[#252d37]/90 hover:bg-[#25D366] hover:border-[#25D366] hover:text-white text-sidebar-foreground flex items-center justify-center transition-all cursor-pointer shadow-xs"
              >
                <WhatsAppIcon className="size-4" />
              </a>

              {/* TikTok */}
              <a
                href={siteContent.tiktokUrl || "https://www.tiktok.com/@atlasglobaltours"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Atlas Global Tours on TikTok"
                title="TikTok"
                className="size-9 rounded-lg border border-sidebar-border/80 bg-[#252d37]/90 hover:bg-black hover:border-[#25F4EE] hover:text-[#25F4EE] text-sidebar-foreground flex items-center justify-center transition-all cursor-pointer shadow-xs"
              >
                <TikTokIcon className="size-4" />
              </a>

              {/* LinkedIn */}
              <a
                href={siteContent.linkedinUrl || "https://www.linkedin.com/company/atlasglobaltours"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Atlas Global Tours on LinkedIn"
                title="LinkedIn"
                className="size-9 rounded-lg border border-sidebar-border/80 bg-[#252d37]/90 hover:bg-[#0A66C2] hover:border-[#0A66C2] hover:text-white text-sidebar-foreground flex items-center justify-center transition-all cursor-pointer shadow-xs"
              >
                <LinkedInIcon className="size-4" />
              </a>

              {/* Twitter / X */}
              <a
                href={siteContent.xUrl || "https://x.com/atlasglobaltours"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Atlas Global Tours on Twitter/X"
                title="Twitter / X"
                className="size-9 rounded-lg border border-sidebar-border/80 bg-[#252d37]/90 hover:bg-black hover:border-sidebar-foreground/50 hover:text-white text-sidebar-foreground flex items-center justify-center transition-all cursor-pointer shadow-xs"
              >
                <XIcon className="size-3.5" />
              </a>

              {/* YouTube */}
              <a
                href={siteContent.youtubeUrl || "https://youtube.com/@atlasglobaltours"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Atlas Global Tours on YouTube"
                title="YouTube"
                className="size-9 rounded-lg border border-sidebar-border/80 bg-[#252d37]/90 hover:bg-[#FF0000] hover:border-[#FF0000] hover:text-white text-sidebar-foreground flex items-center justify-center transition-all cursor-pointer shadow-xs"
              >
                <YouTubeIcon className="size-4" />
              </a>
            </div>
          </div>

          {/* Active Display Currency */}
          <div className="flex items-center gap-2 text-xs text-sidebar-foreground/70 pt-1">
            <Globe className="size-3.5 text-sidebar-primary shrink-0" />
            <span>
              Display Currency: <strong className="text-sidebar-foreground font-semibold">{currency}</strong> (OANDA)
            </span>
          </div>
        </div>

        {/* Column 2: Journeys */}
        <div className="space-y-3">
          <h3 className="eyebrow text-sidebar-primary tracking-wider">Journeys</h3>
          <ul className="space-y-1.5 text-sm text-sidebar-foreground/80">
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/tours')}
                className="h-7.5 flex items-center hover:text-sidebar-primary transition-colors cursor-pointer text-left"
              >
                Multi-day expeditions
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/day-tours')}
                className="h-7.5 flex items-center hover:text-sidebar-primary transition-colors cursor-pointer text-left"
              >
                Day tours & excursions
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/compare')}
                className="h-7.5 flex items-center hover:text-sidebar-primary transition-colors cursor-pointer text-left"
              >
                Compare Journeys
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/blog')}
                className="h-7.5 flex items-center hover:text-sidebar-primary transition-colors cursor-pointer text-left"
              >
                Journal & Field Guides
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/about')}
                className="h-7.5 flex items-center hover:text-sidebar-primary transition-colors cursor-pointer text-left"
              >
                About our mission
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/contact')}
                className="h-7.5 flex items-center hover:text-sidebar-primary transition-colors cursor-pointer text-left"
              >
                Custom trip inquiry
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Impact & Ethics */}
        <div className="space-y-3">
          <h3 className="eyebrow text-sidebar-primary tracking-wider">Impact & Care</h3>
          <ul className="space-y-1.5 text-sm text-sidebar-foreground/80">
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/sustainable-tourism')}
                className="h-7.5 flex items-center hover:text-sidebar-primary transition-colors cursor-pointer text-left"
              >
                Sustainable Tourism
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/responsible-travel')}
                className="h-7.5 flex items-center hover:text-sidebar-primary transition-colors cursor-pointer text-left"
              >
                Responsible Travel
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/atlas-cares')}
                className="h-7.5 flex items-center hover:text-sidebar-primary transition-colors cursor-pointer text-left text-primary font-medium"
              >
                Atlas Cares Initiative
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/modern-slavery-act')}
                className="h-7.5 flex items-center hover:text-sidebar-primary transition-colors cursor-pointer text-left"
              >
                Modern Slavery Act
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/about')}
                className="h-7.5 flex items-center hover:text-sidebar-primary transition-colors cursor-pointer text-left text-xs"
              >
                Safety & Standards
              </button>
            </li>
          </ul>
        </div>

        {/* Column 4: Travelers & Legal */}
        <div className="space-y-3">
          <h3 className="eyebrow text-sidebar-primary tracking-wider">Travelers & Legal</h3>
          <ul className="space-y-1.5 text-sm text-sidebar-foreground/80">
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/login')}
                className="h-7.5 flex items-center hover:text-sidebar-primary transition-colors cursor-pointer text-left"
              >
                Traveler portal login
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/account')}
                className="h-7.5 flex items-center hover:text-sidebar-primary transition-colors cursor-pointer text-left"
              >
                My Bookings & Vouchers
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/advisor')}
                className="h-7.5 flex items-center hover:text-sidebar-primary transition-colors cursor-pointer text-left"
              >
                Advisor Portal (20% Comm)
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/terms')}
                className="h-7.5 flex items-center hover:text-sidebar-primary transition-colors cursor-pointer text-left"
              >
                Terms & Conditions
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/privacy')}
                className="h-7.5 flex items-center hover:text-sidebar-primary transition-colors cursor-pointer text-left"
              >
                Privacy Policy
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/sitemap')}
                className="h-7.5 flex items-center hover:text-sidebar-primary transition-colors cursor-pointer text-left font-medium"
              >
                Sitemap & Directory
              </button>
            </li>
          </ul>
        </div>

        {/* Column 5: Staff Operations */}
        <div className="space-y-3">
          <h3 className="eyebrow text-sidebar-primary tracking-wider">Operations</h3>
          <p className="text-xs text-sidebar-foreground/60 leading-relaxed">
            Consoles for certified guides and logistics teams.
          </p>

          {/* Operations and Admin buttons placed side-by-side on an Even Line */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => onNavigate('/operations')}
              className="h-9 rounded-lg border border-sidebar-border/80 bg-[#252d37]/90 hover:bg-sidebar-primary hover:text-sidebar-primary-foreground px-2 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              title="Operations & Departures Dashboard"
            >
              <Compass className="size-3 text-sidebar-primary group-hover:text-sidebar-primary-foreground shrink-0" />
              <span className="truncate">Ops</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/admin')}
              className="h-9 rounded-lg border border-sidebar-border/80 bg-[#252d37]/90 hover:bg-sidebar-primary hover:text-sidebar-primary-foreground px-2 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              title="Website Admin Content Management System"
            >
              <Shield className="size-3 text-sidebar-primary group-hover:text-sidebar-primary-foreground shrink-0" />
              <span className="truncate">Admin</span>
            </button>
          </div>

          <ul className="space-y-1.5 text-sm text-sidebar-foreground/80 pt-1">
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/operations')}
                className="h-7 flex items-center hover:text-sidebar-primary transition-colors cursor-pointer text-left text-xs"
              >
                Guide Network Roster
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/contact')}
                className="h-7 flex items-center hover:text-sidebar-primary transition-colors cursor-pointer text-left text-xs"
              >
                Direct Support Desk
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* As seen on: Major Travel Marketplaces Banner - Spread and Lined Up Evenly */}
      <div className="border-t border-sidebar-border/40 py-6 sm:py-7 bg-sidebar/90">
        <div className="container-page space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-sidebar-border/30 pb-3">
            <div>
              <span className="eyebrow text-sidebar-primary tracking-wider text-[0.6875rem]">
                As seen on
              </span>
              <h4 className="font-display text-sm font-semibold text-sidebar-foreground">
                Verified, Reviewed & Booked Across Major Travel Marketplaces
              </h4>
            </div>
            <p className="text-xs text-sidebar-foreground/70 sm:text-right">
              Direct boutique supplier and verified tour operator across global booking channels.
            </p>
          </div>

          {/* 8 Logos Spread & Lined Up Evenly Across 8 Columns on XL Desktop (4x2 on Tablet/Laptop) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3 items-stretch">
            {/* 1. Trustpilot */}
            <a
              href={siteContent.trustpilotUrl || "https://www.trustpilot.com/review/atlasglobaltours.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/20 bg-white shadow-xs transition-all hover:border-[#00b67a] hover:shadow-md hover:-translate-y-0.5 cursor-pointer group h-16 w-full text-center"
              title="Trustpilot - Atlas Global Tours Customer Reviews"
              aria-label="Trustpilot Reviews"
            >
              <img
                src="/logos/trustpilot-logo.svg"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/logos/trustpilot-logo.png';
                }}
                alt="Trustpilot"
                className="h-6 w-auto max-w-[110px] object-contain transition-transform group-hover:scale-105"
                loading="lazy"
              />
              <span className="text-[0.625rem] text-[#005128] font-semibold mt-1 flex items-center gap-1">
                Verified Reviews
                <ExternalLink className="size-2 text-neutral-400 group-hover:text-[#00b67a]" />
              </span>
            </a>

            {/* 2. Viator */}
            <a
              href={siteContent.viatorUrl || "https://www.viator.com/operator/5592559"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/20 bg-white shadow-xs transition-all hover:border-sidebar-primary hover:shadow-md hover:-translate-y-0.5 cursor-pointer group h-16 w-full text-center"
              title="Viator - A Tripadvisor Company"
              aria-label="Viator"
            >
              <img
                src="/logos/viator-logo.png"
                alt="Viator"
                className="h-5 sm:h-5.5 w-auto max-w-[95px] object-contain transition-transform group-hover:scale-105"
                loading="lazy"
              />
              <span className="text-[0.625rem] text-neutral-500 mt-1 flex items-center gap-1">
                Tripadvisor Co.
                <ExternalLink className="size-2 text-neutral-400 group-hover:text-sidebar-primary" />
              </span>
            </a>

            {/* 3. TourRadar */}
            <a
              href={siteContent.tourRadarUrl || "https://www.tourradar.com/o/atlas-global-tours"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/20 bg-white shadow-xs transition-all hover:border-sidebar-primary hover:shadow-md hover:-translate-y-0.5 cursor-pointer group h-16 w-full text-center"
              title="TourRadar - Atlas Global Tours Profile & Reviews"
              aria-label="TourRadar"
            >
              <img
                src="/logos/tourradar-logo.svg"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/logos/tourradar-logo.png';
                }}
                alt="TourRadar"
                className="h-5 w-auto max-w-[105px] object-contain transition-transform group-hover:scale-105"
                loading="lazy"
              />
              <span className="text-[0.625rem] text-neutral-500 mt-1 flex items-center gap-1">
                Verified Operator
                <ExternalLink className="size-2 text-neutral-400 group-hover:text-sidebar-primary" />
              </span>
            </a>

            {/* 4. GetYourGuide */}
            <a
              href={siteContent.getYourGuideUrl || "https://www.getyourguide.com/atlas-global-tours-s644611/"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/20 bg-white shadow-xs transition-all hover:border-sidebar-primary hover:shadow-md hover:-translate-y-0.5 cursor-pointer group h-16 w-full text-center"
              title="GetYourGuide - Atlas Global Tours Certified Supplier"
              aria-label="GetYourGuide"
            >
              <img
                src="/logos/getyourguide-logo.svg"
                alt="GetYourGuide"
                className="h-6 sm:h-6.5 w-auto max-w-[65px] object-contain transition-transform group-hover:scale-105"
                loading="lazy"
              />
              <span className="text-[0.625rem] text-neutral-500 mt-1 flex items-center gap-1">
                Certified Supplier
                <ExternalLink className="size-2 text-neutral-400 group-hover:text-sidebar-primary" />
              </span>
            </a>

            {/* 5. tourhub */}
            <a
              href={siteContent.tourhubUrl || "https://tourhub.co/search/operator/Atlas%20Global%20Tours"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/20 bg-white shadow-xs transition-all hover:border-sidebar-primary hover:shadow-md hover:-translate-y-0.5 cursor-pointer group h-16 w-full text-center"
              title="tourhub - Atlas Global Tours Departures"
              aria-label="tourhub"
            >
              <img
                src="/logos/tourhub-logo.svg"
                alt="tourhub"
                className="h-5 w-auto max-w-[95px] object-contain transition-transform group-hover:scale-105"
                loading="lazy"
              />
              <span className="text-[0.625rem] text-neutral-500 mt-1 flex items-center gap-1">
                Tour Partner
                <ExternalLink className="size-2 text-neutral-400 group-hover:text-sidebar-primary" />
              </span>
            </a>

            {/* 6. Travelstride */}
            <a
              href={siteContent.travelstrideUrl || "https://www.travelstride.com/tour-operators/atlas-global-tours"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/20 bg-white shadow-xs transition-all hover:border-sidebar-primary hover:shadow-md hover:-translate-y-0.5 cursor-pointer group h-16 w-full text-center"
              title="Travelstride - Atlas Global Tours Reviews & Ratings"
              aria-label="Travelstride"
            >
              <img
                src="/logos/travelstride-logo.svg"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/logos/travelstride-icon.png';
                }}
                alt="Travelstride"
                className="h-5 w-auto max-w-[105px] object-contain transition-transform group-hover:scale-105"
                loading="lazy"
              />
              <span className="text-[0.625rem] text-neutral-500 mt-1 flex items-center gap-1">
                Reviews & Ratings
                <ExternalLink className="size-2 text-neutral-400 group-hover:text-sidebar-primary" />
              </span>
            </a>

            {/* 7. Responsible Travel */}
            <a
              href={siteContent.responsibleTravelUrl || "https://www.responsibletravel.com/"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-white/20 bg-white shadow-xs transition-all hover:border-[#007A5E] hover:shadow-md hover:-translate-y-0.5 cursor-pointer group h-16 w-full text-center"
              title="Responsible Travel - Ethical & Sustainable Tour Partner"
              aria-label="Responsible Travel"
            >
              <span className="inline-flex items-center justify-center rounded-md bg-[#0A3D31] px-2 py-0.5">
                <img
                  src="https://www.responsibletravel.com/images/logo-white-md.png"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    img.src = '/logos/responsibletravel-logo.svg';
                    if (img.parentElement) {
                      img.parentElement.className = 'inline-flex items-center justify-center';
                    }
                  }}
                  alt="Responsible Travel"
                  className="h-5.5 w-auto max-w-[100px] object-contain transition-transform group-hover:scale-105"
                  loading="lazy"
                />
              </span>
              <span className="text-[0.625rem] text-[#007A5E] font-semibold mt-1 flex items-center gap-1">
                Ethical Partner
                <ExternalLink className="size-2 text-neutral-400 group-hover:text-[#007A5E]" />
              </span>
            </a>

            {/* 8. Tripadvisor */}
            <a
              href={siteContent.tripadvisorUrl || "https://www.tripadvisor.com/"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/20 bg-white shadow-xs transition-all hover:border-[#34E0A1] hover:shadow-md hover:-translate-y-0.5 cursor-pointer group h-16 w-full text-center"
              title="Tripadvisor - Atlas Global Tours Traveler Reviews"
              aria-label="Tripadvisor"
            >
              <img
                src="/logos/tripadvisor-logo.svg"
                alt="Tripadvisor"
                className="h-5.5 w-auto max-w-[110px] object-contain transition-transform group-hover:scale-105"
                loading="lazy"
              />
              <span className="text-[0.625rem] text-[#005128] font-semibold mt-1 flex items-center gap-1">
                Traveler Reviews
                <ExternalLink className="size-2 text-neutral-400 group-hover:text-[#34E0A1]" />
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Accreditations & Regulatory Compliance Logos: ASTA, IRS & TrustedSite Security Banner - Spread and Lined Up Evenly */}
      <div className="border-t border-sidebar-border/40 py-6 bg-sidebar/70">
        <div className="container-page space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-sidebar-border/30 pb-3">
            <div>
              <span className="eyebrow text-sidebar-primary tracking-wider text-[0.6875rem]">
                Official Accreditations & Verified Security
              </span>
              <h4 className="font-display text-sm font-semibold text-sidebar-foreground">
                Regulated Industry Member & Encrypted Web Protection
              </h4>
            </div>
            <p className="text-xs text-sidebar-foreground/70 sm:text-right">
              Active ASTA member, registered U.S. federal entity, and McAfee / TrustedSite certified secure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 items-stretch">
            {/* ASTA Logo Card */}
            <a
              href="https://www.asta.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3.5 rounded-xl border border-white/20 bg-white px-4 py-3 shadow-xs transition-all hover:border-sidebar-primary hover:shadow-md cursor-pointer group h-16 w-full"
              title="ASTA - American Society of Travel Advisors Member"
              aria-label="ASTA - American Society of Travel Advisors"
            >
              <img
                src={siteContent.astaLogoUrl || "https://www.astanyc.com/uploads/1/3/1/3/131383421/astalogonew_4.png"}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/logos/asta-logo.png';
                }}
                alt="ASTA Member - American Society of Travel Advisors"
                className="h-8 sm:h-9 w-auto max-w-[110px] object-contain transition-transform group-hover:scale-105 shrink-0"
                loading="lazy"
              />
              <div className="text-left border-l border-neutral-200 pl-3.5 py-0.5">
                <span className="text-xs font-bold text-neutral-900 block leading-tight flex items-center gap-1">
                  ASTA Member
                  <ExternalLink className="size-2 text-neutral-400 group-hover:text-sidebar-primary" />
                </span>
                <span className="text-[0.6875rem] text-neutral-500 leading-tight">American Society of Travel Advisors</span>
              </div>
            </a>

            {/* IRS Logo Card */}
            <div
              className="flex items-center justify-center gap-3.5 rounded-xl border border-white/20 bg-white px-4 py-3 shadow-xs transition-all h-16 w-full"
              title="IRS - Internal Revenue Service Registered & Tax Compliant U.S. Business Entity"
              aria-label="IRS - Internal Revenue Service"
            >
              <img
                src={siteContent.irsLogoUrl || "https://1000logos.net/wp-content/uploads/2022/03/IRS-Logo-1862-500x281.png"}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/logos/irs-logo.png';
                }}
                alt="IRS Compliant - Internal Revenue Service"
                className="h-8 sm:h-9 w-auto max-w-[95px] object-contain shrink-0"
                loading="lazy"
              />
              <div className="text-left border-l border-neutral-200 pl-3.5 py-0.5">
                <span className="text-xs font-bold text-neutral-900 block leading-tight">IRS Compliant</span>
                <span className="text-[0.6875rem] text-neutral-500 leading-tight">Registered U.S. Business Entity</span>
              </div>
            </div>

            {/* TrustedSite Certified SECURE Badge & Script Container (https://cdn.ywxi.net/js/1.js) */}
            <div className="relative w-full">
              {/* TrustedSite Official Inline Trustmark Container */}
              <div
                className="trustedsite-trustmark hidden"
                data-type="202"
                data-width="120"
                data-height="50"
              />
              <a
                href={siteContent.trustedSiteUrl || "https://www.trustedsite.com/verify?host=atlasglobaltours.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3.5 rounded-xl border border-white/20 bg-white px-4 py-3 shadow-xs transition-all hover:border-[#80C600] hover:shadow-md hover:-translate-y-0.5 cursor-pointer group h-16 w-full"
                title="TrustedSite Certified SECURE - Active Web Security Verification for Atlas Global Tours"
                aria-label="TrustedSite Certified Secure"
              >
                <img
                  src={siteContent.trustedSiteLogoUrl || "/logos/trustedsite-certified-secure.svg"}
                  alt="TrustedSite Certified SECURE"
                  className="h-7 sm:h-8 w-auto max-w-[110px] object-contain transition-transform group-hover:scale-105 shrink-0"
                  loading="lazy"
                />
                <div className="text-left border-l border-neutral-200 pl-3.5 py-0.5">
                  <span className="text-xs font-bold text-neutral-900 block leading-tight flex items-center gap-1">
                    TrustedSite SECURE
                    <ExternalLink className="size-2 text-neutral-400 group-hover:text-[#80C600]" />
                  </span>
                  <span className="text-[0.6875rem] text-[#2e7d32] font-semibold leading-tight flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-[#80C600] inline-block animate-pulse"></span>
                    Certified Active Web Security
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Minimalist Accepted Payment Methods Strip (Original Colors on Black, Frameless) */}
      <div className="border-t border-sidebar-border/30 py-3.5 bg-sidebar/75">
        <div className="container-page flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex items-center gap-2 text-[0.7rem] text-sidebar-foreground/65 shrink-0">
            <Lock className="size-3 text-sidebar-primary shrink-0" />
            <span className="uppercase tracking-wider font-medium text-sidebar-foreground/75">
              Secure Payments
            </span>
            <span className="text-sidebar-foreground/30">·</span>
            <span>256-bit SSL encrypted</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className="inline-flex items-center justify-center h-7 px-2 rounded-md bg-black"
              title="Stripe"
            >
              <StripeLogo />
            </span>
            <span
              className="inline-flex items-center justify-center h-7 px-2 rounded-md bg-black"
              title="Visa"
            >
              <VisaLogo />
            </span>
            <span
              className="inline-flex items-center justify-center h-7 px-2 rounded-md bg-black"
              title="Mastercard"
            >
              <MastercardLogo />
            </span>
            <span
              className="inline-flex items-center justify-center h-7 px-1.5 rounded-md bg-black"
              title="American Express (Amex)"
            >
              <AmexLogo />
            </span>
            <span
              className="inline-flex items-center justify-center h-7 px-2 rounded-md bg-black"
              title="Discover"
            >
              <DiscoverLogo />
            </span>
            <span
              className="inline-flex items-center justify-center h-7 px-2 rounded-md bg-black"
              title="Apple Pay"
            >
              <ApplePayLogo />
            </span>
            <span
              className="inline-flex items-center justify-center h-7 px-2 rounded-md bg-black"
              title="Google Pay"
            >
              <GooglePayLogo />
            </span>
            <span
              className="inline-flex items-center justify-center h-7 px-2 rounded-md bg-black"
              title="PayPal"
            >
              <PayPalLogo />
            </span>
            <span
              className="inline-flex items-center justify-center h-7 px-2 rounded-md bg-black"
              title="Klarna"
            >
              <KlarnaLogo />
            </span>
            <span
              className="inline-flex items-center justify-center h-7 px-2 rounded-md bg-black"
              title="Wise"
            >
              <WiseLogo />
            </span>
            <span
              className="inline-flex items-center justify-center gap-1 h-7 px-2 rounded-md bg-black text-white text-[0.625rem] font-semibold tracking-wide"
              title="Credit & Debit Cards"
            >
              <CreditCard className="size-3 text-white shrink-0" />
              <span>Cards</span>
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Ethics Bar */}
      <div className="border-t border-sidebar-border/40 py-3.5 bg-sidebar/80">
        <div className="container-page flex flex-wrap items-center justify-between gap-y-2 gap-x-4 text-xs text-sidebar-foreground/70">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <button
              type="button"
              onClick={() => onNavigate('/terms')}
              className="hover:text-sidebar-primary transition-colors cursor-pointer text-left"
            >
              Terms & Conditions
            </button>
            <span className="text-sidebar-foreground/30">•</span>
            <button
              type="button"
              onClick={() => onNavigate('/privacy')}
              className="hover:text-sidebar-primary transition-colors cursor-pointer text-left"
            >
              Privacy Policy
            </button>
            <span className="text-sidebar-foreground/30">•</span>
            <button
              type="button"
              onClick={() => onNavigate('/modern-slavery-act')}
              className="hover:text-sidebar-primary transition-colors cursor-pointer text-left"
            >
              Modern Slavery Act
            </button>
            <span className="text-sidebar-foreground/30">•</span>
            <button
              type="button"
              onClick={() => onNavigate('/sustainable-tourism')}
              className="hover:text-sidebar-primary transition-colors cursor-pointer text-left"
            >
              Sustainable Tourism
            </button>
            <span className="text-sidebar-foreground/30">•</span>
            <button
              type="button"
              onClick={() => onNavigate('/responsible-travel')}
              className="hover:text-sidebar-primary transition-colors cursor-pointer text-left"
            >
              Responsible Travel
            </button>
            <span className="text-sidebar-foreground/30">•</span>
            <button
              type="button"
              onClick={() => onNavigate('/atlas-cares')}
              className="text-sidebar-primary hover:underline font-medium transition-colors cursor-pointer text-left"
            >
              Atlas Cares
            </button>
            <span className="text-sidebar-foreground/30">•</span>
            <button
              type="button"
              onClick={() => onNavigate('/sitemap')}
              className="hover:text-sidebar-primary transition-colors cursor-pointer text-left"
            >
              Sitemap
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-[0.6875rem] text-sidebar-foreground/50">
            <span>AGT Group LLC · Albuquerque, NM</span>
            <span>•</span>
            <a
              href="https://www.oanda.com/currency-converter/en/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sidebar-primary transition-colors"
            >
              Live OANDA FX Rates
            </a>
            <span>•</span>
            <a
              href={siteContent.trustedSiteUrl || "https://www.trustedsite.com/verify?host=atlasglobaltours.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1 text-sidebar-foreground/70"
              title="TrustedSite Certified SECURE Web Protection"
            >
              <span className="size-1.5 rounded-full bg-[#80C600] inline-block"></span>
              TrustedSite Certified
            </a>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-sidebar-border/20 py-3 bg-sidebar/95 text-[0.6875rem] text-sidebar-foreground/50">
        <div className="container-page flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Atlas Global Tours by AGT Group LLC. All Rights Reserved.</p>
          <p>Small groups (max 10–12) · Licensed local regional guides · Authentic cultural journeys</p>
        </div>
      </div>
    </footer>
  );
};
