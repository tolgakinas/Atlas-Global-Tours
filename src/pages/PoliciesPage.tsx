import React, { useState, useEffect } from 'react';
import {
  FileText,
  Shield,
  Leaf,
  Scale,
  HeartHandshake,
  Heart,
  Printer,
  ChevronRight,
  MapPin,
  Mail,
  Phone,
  CheckCircle2,
  Calendar,
  Building,
  Sparkles,
  Info,
  ExternalLink,
  Users,
  Compass,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useTours } from '../context/ToursContext';

export type PolicyTab =
  | 'terms'
  | 'privacy'
  | 'modern-slavery'
  | 'sustainable-tourism'
  | 'responsible-travel'
  | 'atlas-cares';

interface PoliciesPageProps {
  initialTab?: PolicyTab;
  onNavigate: (path: string) => void;
}

export const PoliciesPage: React.FC<PoliciesPageProps> = ({
  initialTab = 'terms',
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<PolicyTab>(initialTab);
  const [copiedLink, setCopiedLink] = useState(false);
  const { siteContent } = useTours();

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const tabs: { id: PolicyTab; label: string; shortLabel: string; icon: React.FC<{ className?: string }>; path: string }[] = [
    {
      id: 'terms',
      label: 'Terms & Conditions',
      shortLabel: 'Booking Terms',
      icon: FileText,
      path: '/terms',
    },
    {
      id: 'privacy',
      label: 'Privacy Policy',
      shortLabel: 'Privacy',
      icon: Shield,
      path: '/privacy',
    },
    {
      id: 'modern-slavery',
      label: 'Modern Slavery Act',
      shortLabel: 'Modern Slavery',
      icon: Scale,
      path: '/modern-slavery-act',
    },
    {
      id: 'sustainable-tourism',
      label: 'Sustainable Tourism',
      shortLabel: 'Sustainability',
      icon: Leaf,
      path: '/sustainable-tourism',
    },
    {
      id: 'responsible-travel',
      label: 'Responsible Travel',
      shortLabel: 'Fair Travels',
      icon: HeartHandshake,
      path: '/responsible-travel',
    },
    {
      id: 'atlas-cares',
      label: 'Atlas Cares',
      shortLabel: 'Atlas Cares',
      icon: Heart,
      path: '/atlas-cares',
    },
  ];

  const handleTabChange = (tabId: PolicyTab, path: string) => {
    setActiveTab(tabId);
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-sidebar text-sidebar-foreground border-b border-sidebar-border/60 py-14 sm:py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-sidebar via-sidebar/95 to-sidebar/80 z-0 pointer-events-none" />
        <div className="container-page relative z-10">
          <div className="flex flex-wrap items-center gap-2 text-xs text-sidebar-primary uppercase tracking-wider font-semibold mb-3">
            <span>AGT Group LLC</span>
            <span>•</span>
            <span>Atlas Global Tours</span>
            <span>•</span>
            <span>Governance, Ethics & Compliance</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
            Corporate Governance & Trust
          </h1>

          <p className="mt-4 max-w-3xl text-sm sm:text-base text-sidebar-foreground/80 leading-relaxed">
            Transparent legal terms, strict modern slavery safeguards, data privacy standards, and our foundational commitment to sustainable tourism, responsible fair travel, and community care through Atlas Cares.
          </p>

          {/* Quick Corporate Identity Card */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl pt-2">
            <div className="rounded-xl border border-sidebar-border/70 bg-[#252d37]/80 p-3.5 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-sidebar-primary text-xs font-semibold mb-1">
                <Building className="size-3.5" />
                <span>Operating Entity</span>
              </div>
              <p className="text-xs text-white font-medium">AGT Group LLC</p>
              <p className="text-[0.6875rem] text-sidebar-foreground/60">Registered US Tour Operator</p>
            </div>

            <div className="rounded-xl border border-sidebar-border/70 bg-[#252d37]/80 p-3.5 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-sidebar-primary text-xs font-semibold mb-1">
                <MapPin className="size-3.5" />
                <span>Legal Jurisdiction</span>
              </div>
              <p className="text-xs text-white font-medium">Albuquerque, NM, USA</p>
              <p className="text-[0.6875rem] text-sidebar-foreground/60">Bernalillo County · IRS Compliant</p>
            </div>

            <div className="rounded-xl border border-sidebar-border/70 bg-[#252d37]/80 p-3.5 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-sidebar-primary text-xs font-semibold mb-1">
                <Shield className="size-3.5" />
                <span>Industry Accreditations</span>
              </div>
              <p className="text-xs text-white font-medium">ASTA Active Member</p>
              <p className="text-[0.6875rem] text-sidebar-foreground/60">American Society of Travel Advisors</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="container-page py-10 lg:py-16">
        {/* Navigation Tabs Bar */}
        <div className="sticky top-18 z-30 mb-8 rounded-2xl border border-border bg-card/95 p-1.5 shadow-md backdrop-blur-md">
          <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 sm:gap-1.5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id, tab.path)}
                    className={`flex items-center gap-2 rounded-xl px-3 sm:px-4 py-2.5 text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="size-3.5 shrink-0" />
                    <span className="hidden md:inline">{tab.label}</span>
                    <span className="md:hidden">{tab.shortLabel}</span>
                  </button>
                );
              })}
            </div>

            {/* Print & Share actions */}
            <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-border/70 shrink-0">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-muted/30 hover:bg-muted px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Print current policy document"
              >
                <Printer className="size-3.5" />
                <span className="hidden lg:inline">Print</span>
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-muted/30 hover:bg-muted px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Copy shareable link"
              >
                <ExternalLink className="size-3.5" />
                <span className="hidden lg:inline">{copiedLink ? 'Copied!' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Policy Body Container */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 items-start">
          {/* Main Document Content */}
          <div className="min-w-0 bg-card rounded-2xl border border-border p-6 sm:p-10 shadow-sm">
            {/* 1. TERMS & CONDITIONS */}
            {activeTab === 'terms' && (
              <article className="prose prose-neutral max-w-none text-foreground space-y-8">
                <div className="border-b border-border/60 pb-6">
                  <span className="eyebrow text-primary">Legal Agreement</span>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mt-2">
                    Booking Terms & Conditions
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3.5" />
                      Last Updated: December 2025
                    </span>
                    <span>•</span>
                    <span>AGT Group LLC</span>
                    <span>•</span>
                    <span>Governing Jurisdiction: State of New Mexico, USA</span>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4.5 text-xs sm:text-sm text-foreground/90 leading-relaxed space-y-2">
                  <p className="font-semibold text-primary">Agreement Overview</p>
                  <p>
                    These Booking Terms & Conditions form the binding legal agreement between <strong>AGT Group LLC</strong> (doing business as <strong>Atlas Global Tours</strong>) and the traveler. By booking a tour with us, submitting a deposit, or participating in any travel itinerary, you acknowledge that you have read, understood, and agreed to be bound by these Terms & Conditions.
                  </p>
                </div>

                {/* Section 1 */}
                <div className="space-y-3">
                  <h3 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
                    <span className="size-6 rounded-md bg-muted text-foreground flex items-center justify-center text-xs font-mono font-bold">1</span>
                    Booking & Payment
                  </h3>
                  <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-8">
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">1.1 Deposits</h4>
                      <p>
                        A non-refundable deposit of <strong>10% of the total tour price</strong> is required at the time of booking to secure your reservation, hold accommodations, and reserve licensed guide and private transport allocations.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">1.2 Final Payment</h4>
                      <p>
                        Full balance payment must be completed no later than <strong>30 days before the tour start date</strong>. For reservations confirmed less than 30 days prior to departure, full payment is required immediately upon booking.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">1.3 Failure to Pay</h4>
                      <p>
                        Failure to complete payment in full by the due date may result in immediate cancellation of your booking without refund of previously paid deposits.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 2 */}
                <div className="space-y-3">
                  <h3 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
                    <span className="size-6 rounded-md bg-muted text-foreground flex items-center justify-center text-xs font-mono font-bold">2</span>
                    Pricing & Inclusions
                  </h3>
                  <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-8">
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">2.1 Price Validity & Currency</h4>
                      <p>
                        All official base prices are quoted in <strong>USD ($)</strong> and are valid at the time of publication. Currency conversions on our website (EUR, GBP, AUD, CAD, NZD) are calculated using live benchmark FX rates via OANDA for traveler convenience. Prices may change prior to booking confirmation due to unexpected statutory tax modifications, major currency fluctuations, or carrier price changes.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">2.2 What is Included</h4>
                      <p>
                        Each tour's inclusions are explicitly specified in the official itinerary and generally include:
                      </p>
                      <ul className="list-disc list-inside mt-1.5 space-y-1 text-xs sm:text-sm pl-2">
                        <li>Boutique, cave, or heritage hotel accommodations as listed</li>
                        <li>Dedicated private AC transportation and professional chauffeurs</li>
                        <li>Licensed, university-educated local tour guides</li>
                        <li>All museum, archaeological site, and national park entrance fees listed</li>
                        <li>Specified daily meals (breakfasts, local lunches, and traditional dinners as noted)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">2.3 What is Not Included</h4>
                      <p>
                        Unless expressly stated otherwise in writing: international flights, mandatory personal comprehensive travel insurance, visa and consular fees, optional hot air ballooning or elective excursions, personal discretionary expenses, alcoholic beverages, and personal tips/gratuities.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 3 */}
                <div className="space-y-3">
                  <h3 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
                    <span className="size-6 rounded-md bg-muted text-foreground flex items-center justify-center text-xs font-mono font-bold">3</span>
                    Cancellations & Refunds
                  </h3>
                  <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-8">
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">3.1 Traveler Cancellation Policy</h4>
                      <p>
                        If you need to cancel your booked tour, cancellation notice must be submitted in writing via email to <strong>info@atlasglobaltours.com</strong>. Refunds are calculated based on the date written notice is received:
                      </p>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div className="rounded-lg border border-border bg-muted/30 p-2.5">
                          <p className="font-bold text-foreground">More than 61 Days</p>
                          <p className="text-emerald-600 font-semibold mt-0.5">Fully Refundable</p>
                          <p className="text-[0.6875rem] text-muted-foreground mt-0.5">Except non-refundable 10% deposit / booking fee</p>
                        </div>
                        <div className="rounded-lg border border-border bg-muted/30 p-2.5">
                          <p className="font-bold text-foreground">30 to 60 Days</p>
                          <p className="text-amber-600 font-semibold mt-0.5">50% Refund</p>
                          <p className="text-[0.6875rem] text-muted-foreground mt-0.5">50% of total tour package cost retained</p>
                        </div>
                        <div className="rounded-lg border border-border bg-muted/30 p-2.5">
                          <p className="font-bold text-foreground">Less than 30 Days</p>
                          <p className="text-rose-600 font-semibold mt-0.5">No Refund (100%)</p>
                          <p className="text-[0.6875rem] text-muted-foreground mt-0.5">100% forfeiture of total package cost</p>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2">
                      <h4 className="font-semibold text-foreground text-sm">3.2 Company Cancellation</h4>
                      <p>
                        AGT Group LLC reserves the right to cancel a tour due to: Force Majeure (extreme weather, political instability, natural disasters), safety concerns, low participant thresholds, or critical supplier disruption. If we cancel a tour, travelers receive either:
                      </p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs pl-2">
                        <li><strong>A full 100% refund</strong> of all monies paid to AGT Group LLC, or</li>
                        <li><strong>Seamless transfer</strong> of 100% of funds to an alternative scheduled departure without administrative penalty fees.</li>
                      </ul>
                      <p className="text-xs text-muted-foreground mt-1.5 italic">
                        AGT Group LLC is not liable for secondary incidental expenses incurred by travelers, including non-refundable flight tickets, visa fees, vaccination expenses, or personal travel gear.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 4 & 5 */}
                <div className="space-y-3">
                  <h3 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
                    <span className="size-6 rounded-md bg-muted text-foreground flex items-center justify-center text-xs font-mono font-bold">4</span>
                    Changes, Amendments & Travel Documents
                  </h3>
                  <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-8">
                    <p>
                      <strong>4.1 Itinerary Modifications:</strong> While every effort is made to operate itineraries exactly as advertised, AGT Group LLC reserves the right to make modifications when necessitated by road closures, museum restoration schedules, adverse weather, or passenger safety. Equivalent or superior alternatives will always be provided.
                    </p>
                    <p>
                      <strong>4.2 Passports & Visas:</strong> Travelers bear sole responsibility for ensuring valid travel documentation. Passports must have at least <strong>six (6) months validity</strong> beyond your intended date of departure. You must verify entry visa requirements for your destination country prior to departure.
                    </p>
                    <p>
                      <strong>4.3 Health & Mobility:</strong> Travelers must advise us at booking of any pre-existing medical conditions, physical mobility limitations, or severe dietary allergies.
                    </p>
                  </div>
                </div>

                {/* Section 6 & 7 */}
                <div className="space-y-3">
                  <h3 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
                    <span className="size-6 rounded-md bg-muted text-foreground flex items-center justify-center text-xs font-mono font-bold">5</span>
                    Insurance, Safety & Conduct
                  </h3>
                  <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-8">
                    <p>
                      <strong>Comprehensive Travel Insurance:</strong> Comprehensive international travel insurance is strongly recommended and may be required on specific active expeditions. Your policy should cover emergency medical care, helicopter/emergency evacuation, trip cancellation, personal baggage loss, and repatriation.
                    </p>
                    <p>
                      <strong>Safety & Traveler Conduct:</strong> Travelers must adhere to safety briefings and instructions issued by licensed tour leaders and local guides. AGT Group LLC reserves the right to terminate participation of any traveler whose conduct is abusive, dangerous, illegal, or compromises the wellbeing and enjoyment of fellow travelers or local communities, without any refund.
                    </p>
                  </div>
                </div>

                {/* Section 8, 9, 10, 11 */}
                <div className="space-y-3">
                  <h3 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
                    <span className="size-6 rounded-md bg-muted text-foreground flex items-center justify-center text-xs font-mono font-bold">6</span>
                    Limitation of Liability & Governing Law
                  </h3>
                  <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-8">
                    <p>
                      <strong>Limitation of Liability:</strong> AGT Group LLC acts as a tour organizer and coordinates services with independent local transport operators, boutique hotels, hoteliers, and licensed guides. AGT Group LLC is not liable for injury, loss, damage, delay, or irregularity arising from acts of God, civil strife, carrier delays, or actions of third-party suppliers.
                    </p>
                    <p>
                      <strong>Complaints Procedure:</strong> Any issue arising during a tour must be reported immediately to your local tour leader so remedial action can be taken on site. Post-journey claims must be submitted in writing within <strong>14 days</strong> of tour conclusion to <code>info@atlasglobaltours.com</code>.
                    </p>
                    <p>
                      <strong>Governing Law & Legal Jurisdiction:</strong> These Terms & Conditions shall be governed by and construed in accordance with the laws of the <strong>State of New Mexico, United States of America</strong>. Any legal dispute or proceeding arising out of or related to these terms shall be brought exclusively in the state or federal courts located in <strong>Bernalillo County, New Mexico, USA</strong>.
                    </p>
                  </div>
                </div>
              </article>
            )}

            {/* 2. PRIVACY POLICY */}
            {activeTab === 'privacy' && (
              <article className="prose prose-neutral max-w-none text-foreground space-y-8">
                <div className="border-b border-border/60 pb-6">
                  <span className="eyebrow text-primary">Data Protection & Privacy</span>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mt-2">
                    Privacy Policy
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3.5" />
                      Last Updated: 10th December 2025
                    </span>
                    <span>•</span>
                    <span>AGT Group LLC</span>
                    <span>•</span>
                    <span>GDPR & UK DPA Compliant</span>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4.5 text-xs sm:text-sm text-foreground/90 leading-relaxed space-y-2">
                  <p className="font-semibold text-primary">Your Privacy Matters to Us</p>
                  <p>
                    This Privacy Policy explains how <strong>AGT Group LLC</strong> ("we", "us", "our", or "the Company") collects, uses, stores, and protects your personal information. By using our website (<code>www.atlasglobaltours.com</code>), booking a tour, or communicating with us, you consent to the data practices described in this policy.
                  </p>
                </div>

                {/* Section 1: Information We Collect */}
                <div className="space-y-3">
                  <h3 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
                    <span className="size-6 rounded-md bg-muted text-foreground flex items-center justify-center text-xs font-mono font-bold">1</span>
                    Information We Collect
                  </h3>
                  <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-8">
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">1.1 Personal Information</h4>
                      <p>
                        Full legal name (as printed on your passport), date of birth, contact details (email address, telephone number, residential address), nationality, passport number and expiry date, and emergency contact details.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">1.2 Booking & Reservation Information</h4>
                      <p>
                        Travel preferences, rooming choices (single supplement, twin share), tour history, and payment transaction metadata. Note: We use certified third-party payment processors (such as Stripe). <strong>We never store raw credit card numbers or CVV codes</strong> on our servers.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">1.3 Technical & Telemetry Information</h4>
                      <p>
                        IP address, browser type, device information, operating system, pages visited, session duration, and cookies.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">1.4 Sensitive Information (Only when strictly necessary)</h4>
                      <p>
                        Medical conditions, physical mobility limitations, or specific dietary requirements provided voluntarily by you to ensure your safety and comfort during travel.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 2: How We Use Your Information */}
                <div className="space-y-3">
                  <h3 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
                    <span className="size-6 rounded-md bg-muted text-foreground flex items-center justify-center text-xs font-mono font-bold">2</span>
                    How We Use Your Information
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground leading-relaxed pl-8">
                    <p>
                      <strong>2.1 Booking & Travel Services:</strong> Processing your reservations, issuing vouchers and flight/train ticketing, coordinating rooming with boutique hotels, providing manifest lists to licensed guides and drivers, and customer support.
                    </p>
                    <p>
                      <strong>2.2 Operational & Legal Compliance:</strong> Ensuring traveler health and safety, managing emergency contacts, maintaining tax records, and complying with local ministry of tourism regulations.
                    </p>
                    <p>
                      <strong>2.3 Marketing Communications:</strong> Sending opt-in travel updates, journal dispatches, and seasonal offers. You can unsubscribe at any time with a single click in any email or by emailing <code>privacy@atlasglobaltours.com</code>.
                    </p>
                  </div>
                </div>

                {/* Section 3: Legal Basis & Sharing */}
                <div className="space-y-3">
                  <h3 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
                    <span className="size-6 rounded-md bg-muted text-foreground flex items-center justify-center text-xs font-mono font-bold">3</span>
                    Legal Basis (GDPR/UK DPA) & Information Sharing
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground leading-relaxed pl-8">
                    <p>
                      If you are located in the European Union or the United Kingdom, we process your personal data under the following lawful bases: <strong>Contract Performance</strong> (necessary to provide your booked tour), <strong>Consent</strong> (for newsletter communications), <strong>Legal Obligations</strong> (tax and safety laws), and <strong>Legitimate Interests</strong> (protecting our legal rights and improving services).
                    </p>
                    <p>
                      We <strong>never sell, rent, or trade</strong> your personal information. We share minimal necessary information only with:
                    </p>
                    <ul className="list-disc list-inside mt-1.5 space-y-1 text-xs sm:text-sm pl-2">
                      <li>Local direct ground suppliers (hotels, licensed guides, private drivers)</li>
                      <li>Encrypted PCI-compliant payment processors</li>
                      <li>Official government authorities and border control when legally mandated</li>
                    </ul>
                  </div>
                </div>

                {/* Section 4: Retention, Security & Your Rights */}
                <div className="space-y-3">
                  <h3 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
                    <span className="size-6 rounded-md bg-muted text-foreground flex items-center justify-center text-xs font-mono font-bold">4</span>
                    Data Retention, Security & Your Rights
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground leading-relaxed pl-8">
                    <p>
                      <strong>Data Retention:</strong> We retain booking and financial transaction data for up to <strong>7 years</strong> in compliance with United States tax and legal requirements. Sensitive medical data is deleted promptly after the tour concludes.
                    </p>
                    <p>
                      <strong>Your Rights:</strong> Under applicable data protection legislation (including GDPR, CCPA, and UK Data Protection Act), you have the right to request access to your personal data, rectify inaccurate data, request erasure ("right to be forgotten"), object to processing, or request data portability.
                    </p>
                    <p>
                      To exercise any of these rights, contact our Data Protection Officer at: <strong>privacy@atlasglobaltours.com</strong>.
                    </p>
                  </div>
                </div>
              </article>
            )}

            {/* 3. MODERN SLAVERY ACT STATEMENT */}
            {activeTab === 'modern-slavery' && (
              <article className="prose prose-neutral max-w-none text-foreground space-y-8">
                <div className="border-b border-border/60 pb-6">
                  <span className="eyebrow text-primary">Human Rights & Ethics</span>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mt-2">
                    Modern Slavery & Human Trafficking Statement
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3.5" />
                      Financial Year 2025/2026 Statement
                    </span>
                    <span>•</span>
                    <span>AGT Group LLC</span>
                    <span>•</span>
                    <span>UK Modern Slavery Act 2015 & International Human Rights Standards</span>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4.5 text-xs sm:text-sm text-foreground/90 leading-relaxed space-y-2">
                  <p className="font-semibold text-primary">Zero Tolerance Stance</p>
                  <p>
                    AGT Group LLC (operating as Atlas Global Tours) maintains an absolute <strong>zero-tolerance policy</strong> toward modern slavery, forced labor, servitude, human trafficking, deceptive recruitment, and child exploitation across our corporate operations and every tier of our worldwide travel supply chain.
                  </p>
                </div>

                {/* Section 1: Scope & Business Structure */}
                <div className="space-y-3">
                  <h3 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
                    <span className="size-6 rounded-md bg-muted text-foreground flex items-center justify-center text-xs font-mono font-bold">1</span>
                    Our Organization & Supply Chain Structure
                  </h3>
                  <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-8">
                    <p>
                      AGT Group LLC is a specialized tour operator based in the United States, operating small-group cultural expeditions and day tours throughout <strong>Türkiye, Central Asia (Georgia, Armenia, Azerbaijan), the Balkans, North Africa (Morocco, Egypt, Tunisia), and the Middle East (Jordan, Oman, UAE)</strong>.
                    </p>
                    <p>
                      Our supply chain encompasses:
                    </p>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-xs sm:text-sm pl-2">
                      <li>Boutique, heritage, and cave hotels and locally owned accommodations</li>
                      <li>Licensed professional tour guides and archaeological specialists</li>
                      <li>Licensed transport companies, coach operators, and professional chauffeurs</li>
                      <li>Local family-run restaurants, artisan craft workshops, and activity providers</li>
                      <li>Luggage handling and ground support teams</li>
                    </ul>
                  </div>
                </div>

                {/* Section 2: Policies on Modern Slavery */}
                <div className="space-y-3">
                  <h3 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
                    <span className="size-6 rounded-md bg-muted text-foreground flex items-center justify-center text-xs font-mono font-bold">2</span>
                    Our Principles & Standards
                  </h3>
                  <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-xl border border-border bg-muted/20 p-3.5">
                        <div className="flex items-center gap-2 text-foreground font-semibold text-xs mb-1">
                          <CheckCircle2 className="size-4 text-emerald-600" />
                          <span>Freely Chosen Employment</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          No forced, bonded, involuntary prison, or indentured labor is tolerated. Workers are free to leave employment upon reasonable notice.
                        </p>
                      </div>
                      <div className="rounded-xl border border-border bg-muted/20 p-3.5">
                        <div className="flex items-center gap-2 text-foreground font-semibold text-xs mb-1">
                          <CheckCircle2 className="size-4 text-emerald-600" />
                          <span>No Identity Withholding</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Passports, identification cards, travel documents, and work permits must never be confiscated, withheld, or retained by employers or contractors.
                        </p>
                      </div>
                      <div className="rounded-xl border border-border bg-muted/20 p-3.5">
                        <div className="flex items-center gap-2 text-foreground font-semibold text-xs mb-1">
                          <CheckCircle2 className="size-4 text-emerald-600" />
                          <span>Fair Living Wages</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          All personnel across our journeys—from licensed guides to drivers and hotel crews—must be compensated at or above genuine local living wages.
                        </p>
                      </div>
                      <div className="rounded-xl border border-border bg-muted/20 p-3.5">
                        <div className="flex items-center gap-2 text-foreground font-semibold text-xs mb-1">
                          <CheckCircle2 className="size-4 text-emerald-600" />
                          <span>Strict Child Protection</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Zero employment of children below the statutory minimum legal age. Strict adherence to UNICEF and ECPAT child safety protocols in tourism.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Due Diligence & Audits */}
                <div className="space-y-3">
                  <h3 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
                    <span className="size-6 rounded-md bg-muted text-foreground flex items-center justify-center text-xs font-mono font-bold">3</span>
                    Due Diligence & Supply Chain Oversight
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground leading-relaxed pl-8">
                    <p>
                      Because we are a direct tour operator rather than an anonymous reseller, our operational team directly visits hotels, inspects driver facilities, and evaluates partner employment terms. We maintain a Supplier Code of Conduct which every contracted partner must sign and uphold.
                    </p>
                    <p>
                      We conduct ongoing monitoring to ensure:
                    </p>
                    <ul className="list-disc list-inside mt-1.5 space-y-1 text-xs sm:text-sm pl-2">
                      <li>Driver shift limits and statutory rest periods are observed strictly to eliminate fatigue and exploitation.</li>
                      <li>No recruitment fees or debt-bonding schemes are charged to migrant or seasonal hospitality staff.</li>
                      <li>Safe, hygienic working conditions and access to fresh drinking water are provided on all tour operations.</li>
                    </ul>
                  </div>
                </div>

                {/* Section 4: Whistleblowing */}
                <div className="space-y-3">
                  <h3 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
                    <span className="size-6 rounded-md bg-muted text-foreground flex items-center justify-center text-xs font-mono font-bold">4</span>
                    Confidential Whistleblowing & Reporting
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground leading-relaxed pl-8">
                    <p>
                      Any employee, guide, contractor, traveler, or member of the public who suspects or observes any modern slavery, human exploitation, or labor violation is urged to report it immediately. Reports are treated with complete confidentiality, investigated promptly by AGT Group LLC executive management, and protected against any retaliation.
                    </p>
                    <div className="rounded-xl border border-border bg-card p-4 mt-2">
                      <p className="text-xs font-bold text-foreground uppercase tracking-wider">Confidential Ethics Channel</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Email: <strong className="text-foreground">compliance@atlasglobaltours.com</strong> or phone: <strong className="text-foreground">+1 505 581 67 07</strong>
                      </p>
                      <p className="text-[0.6875rem] text-muted-foreground mt-1">
                        AGT Group LLC, 1209 Mountain Road Pl NE Ste N, Albuquerque, NM 87110, USA.
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            )}

            {/* 4. SUSTAINABLE TOURISM */}
            {activeTab === 'sustainable-tourism' && (
              <article className="prose prose-neutral max-w-none text-foreground space-y-8">
                <div className="border-b border-border/60 pb-6">
                  <span className="eyebrow text-primary">Environmental Stewardship</span>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mt-2">
                    Responsible & Sustainable Tourism
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <Leaf className="size-3.5 text-emerald-600" />
                      AGT Group LLC Environmental Commitment
                    </span>
                    <span>•</span>
                    <span>Atlas Global Tours</span>
                    <span>•</span>
                    <span>Leaving a Positive Footprint</span>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4.5 text-xs sm:text-sm text-foreground/90 leading-relaxed space-y-2">
                  <p className="font-semibold text-primary">Our Philosophy</p>
                  <p>
                    At AGT Group LLC, we believe travel should enrich the traveler and protect the world we explore. Our Responsible & Sustainable Travel philosophy is built on <strong>care, respect, and long-term impact</strong>—ensuring every journey leaves a positive footprint on both the environment and the host communities that welcome us.
                  </p>
                </div>

                {/* 7 Core Pillars of Sustainable Tourism */}
                <div className="space-y-6 pt-2">
                  <h3 className="text-lg font-display font-bold text-foreground">
                    Our 7 Core Sustainability Pillars
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Pillar 1 */}
                    <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-2">
                      <div className="flex items-center gap-2.5 text-primary">
                        <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-xs font-mono">1</div>
                        <h4 className="font-display font-bold text-base text-foreground">Protecting Nature & Cultural Heritage</h4>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        We design experiences that honor and preserve the delicate sites we visit. We follow strict conservation guidelines in UNESCO World Heritage areas (such as Göreme National Park, Pamukkale travertine terraces, Ephesus, and Petra), stay strictly on designated trails, avoid fragile or restricted zones, and encourage responsible interactions with wildlife and ecosystems.
                      </p>
                    </div>

                    {/* Pillar 2 */}
                    <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-2">
                      <div className="flex items-center gap-2.5 text-primary">
                        <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-xs font-mono">2</div>
                        <h4 className="font-display font-bold text-base text-foreground">Supporting Local Communities</h4>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Every destination benefits when tourism is fair and community-centered. We actively work with local guides, drivers, and small family-run businesses; eat at family-owned locantas rather than international conglomerates; and highlight authentic cultural traditions, not staged or exploitative tourist shows.
                      </p>
                    </div>

                    {/* Pillar 3 */}
                    <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-2">
                      <div className="flex items-center gap-2.5 text-primary">
                        <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-xs font-mono">3</div>
                        <h4 className="font-display font-bold text-base text-foreground">Smaller Groups, Lighter Footprint</h4>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Our small-group approach strictly limits departures to an average of 10–12 guests. Smaller groups reduce pressure on historic village streets, cause less environmental erosion, enable respectful cultural dialogues, produce lower carbon emissions per guest, and significantly elevate experience quality.
                      </p>
                    </div>

                    {/* Pillar 4 */}
                    <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-2">
                      <div className="flex items-center gap-2.5 text-primary">
                        <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-xs font-mono">4</div>
                        <h4 className="font-display font-bold text-base text-foreground">Reducing Waste & Eco-Friendly Choices</h4>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        We actively promote reduced waste by minimizing single-use plastic water bottles on all tour vehicles, encouraging reusable traveler flasks, ensuring responsible disposal of waste on trekking trails, and issuing 100% paperless digital travel documents and vouchers.
                      </p>
                    </div>

                    {/* Pillar 5 */}
                    <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-2">
                      <div className="flex items-center gap-2.5 text-primary">
                        <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-xs font-mono">5</div>
                        <h4 className="font-display font-bold text-base text-foreground">Respect for Local Customs & Traditions</h4>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Cultural sustainability is just as vital as environmental care. We brief travelers on local etiquette, respectful dress codes in sacred sanctuaries and mosques, respectful photography consent, and mindful cultural engagement. Travel becomes infinitely richer when approached with humility and respect.
                      </p>
                    </div>

                    {/* Pillar 6 */}
                    <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-2">
                      <div className="flex items-center gap-2.5 text-primary">
                        <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-xs font-mono">6</div>
                        <h4 className="font-display font-bold text-base text-foreground">Partnering with Sustainable Suppliers</h4>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        We prioritize accommodations, transport fleets, and regional activity suppliers who share our ecological ethos—including restored historical cave hotels utilizing geothermal heating, low-emission Euro-6 transport vans, and regional food suppliers using locally sourced farm ingredients.
                      </p>
                    </div>

                    {/* Pillar 7 - Span Full Width */}
                    <div className="md:col-span-2 rounded-xl border border-border bg-card p-5 shadow-xs space-y-2">
                      <div className="flex items-center gap-2.5 text-primary">
                        <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-xs font-mono">7</div>
                        <h4 className="font-display font-bold text-base text-foreground">Continuous Commitment to Improvement</h4>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Responsible travel is not a marketing buzzword—it is our long-term promise. We continually assess the environmental impact of our itineraries, solicit feedback from local community leaders and conservation groups, and upgrade our operational standards each season.
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            )}

            {/* 5. RESPONSIBLE TRAVEL / FAIR TRAVELS */}
            {activeTab === 'responsible-travel' && (
              <article className="prose prose-neutral max-w-none text-foreground space-y-8">
                <div className="border-b border-border/60 pb-6">
                  <span className="eyebrow text-primary">Fair Travel Protocols</span>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mt-2">
                    Fair Travels with AGT Group LLC
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <HeartHandshake className="size-3.5 text-primary" />
                      Fairness, Transparency & Dignity
                    </span>
                    <span>•</span>
                    <span>Atlas Global Tours</span>
                    <span>•</span>
                    <span>Positive Impact, Never Exploitation</span>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4.5 text-xs sm:text-sm text-foreground/90 leading-relaxed space-y-2">
                  <p className="font-semibold text-primary">What "Fair Travels" Means to Us</p>
                  <p>
                    At AGT Group LLC, <strong>"Fair Travels"</strong> means operating in a way that is ethical, responsible, transparent, and respectful—for travelers, local host communities, and the natural environment. We believe that genuine travel should create lasting positive impact, not commercial exploitation.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Item 1 */}
                    <div className="rounded-xl border border-border bg-card p-5 space-y-2">
                      <h4 className="font-display font-bold text-base text-foreground flex items-center gap-2">
                        <span className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">1</span>
                        Fair to Local Communities
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        We ensure money stays within destination communities. By contracting locally based licensed guides, regional drivers, and family-owned boutique hotels, over 70% of ground tour expenditures directly empower host families, artisans, and village markets.
                      </p>
                    </div>

                    {/* Item 2 */}
                    <div className="rounded-xl border border-border bg-card p-5 space-y-2">
                      <h4 className="font-display font-bold text-base text-foreground flex items-center gap-2">
                        <span className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">2</span>
                        Fair Employment Practices
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        We choose partners who pay guides and staff fair, living wages. We enforce reasonable driving shifts, safe equipment, and respectful treatment for all ground personnel. Our crew members are valued partners, not interchangeable commodities.
                      </p>
                    </div>

                    {/* Item 3 */}
                    <div className="rounded-xl border border-border bg-card p-5 space-y-2">
                      <h4 className="font-display font-bold text-base text-foreground flex items-center gap-2">
                        <span className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">3</span>
                        Fair Pricing for Travelers
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        No hidden fees. No surprise surcharges at hotel check-in. No low-quality shortcuts or mandatory commission-based souvenir detours. We price our tours transparently and honestly, delivering true handcrafted value and boutique comfort.
                      </p>
                    </div>

                    {/* Item 4 */}
                    <div className="rounded-xl border border-border bg-card p-5 space-y-2">
                      <h4 className="font-display font-bold text-base text-foreground flex items-center gap-2">
                        <span className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">4</span>
                        Fair to the Environment
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Our tours are designed from the ground up to minimize ecological disturbance: strictly capped small group sizes, reduced waste protocols, trail conservation support, and uncompromising respect for wildlife and cultural monuments.
                      </p>
                    </div>

                    {/* Item 5 */}
                    <div className="rounded-xl border border-border bg-card p-5 space-y-2">
                      <h4 className="font-display font-bold text-base text-foreground flex items-center gap-2">
                        <span className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">5</span>
                        Fair, Honest Communication
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        We promise crystal-clear accuracy regarding what is included, what is excluded, physical pace and terrain difficulty levels, and accommodation standards. Trust is the irreplaceable foundation of great travel.
                      </p>
                    </div>

                    {/* Item 6 */}
                    <div className="rounded-xl border border-border bg-card p-5 space-y-2">
                      <h4 className="font-display font-bold text-base text-foreground flex items-center gap-2">
                        <span className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">6</span>
                        Fair Experiences for Everyone
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        We curate respectful, culturally sensitive journeys that celebrate host traditions and diversity—creating meaningful cross-cultural bridges that benefit travelers and locals alike.
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            )}

            {/* 6. ATLAS CARES */}
            {activeTab === 'atlas-cares' && (
              <article className="prose prose-neutral max-w-none text-foreground space-y-8">
                <div className="border-b border-border/60 pb-6">
                  <span className="eyebrow text-primary">Social Impact & Giving</span>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mt-2">
                    Atlas Cares Initiative
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <Heart className="size-3.5 text-rose-500 fill-rose-500/20" />
                      Community Giveback & Cultural Preservation
                    </span>
                    <span>•</span>
                    <span>Atlas Global Tours & AGT Group LLC</span>
                    <span>•</span>
                    <span>Every Journey Gives Back</span>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4.5 text-xs sm:text-sm text-foreground/90 leading-relaxed space-y-2">
                  <p className="font-semibold text-primary">Our Giving Commitment</p>
                  <p>
                    <strong>Atlas Cares</strong> is our dedicated social responsibility and community impact initiative. We believe that as travelers, we have a profound responsibility to give back to the places and people who open their homes and heritage to us. A portion of revenue from every Atlas Global Tours booking directly supports local social projects, cultural heritage conservation, and wildlife welfare.
                  </p>
                </div>

                {/* Key Atlas Cares Focus Areas */}
                <div className="space-y-6 pt-2">
                  <h3 className="text-lg font-display font-bold text-foreground">
                    Where Atlas Cares Makes an Impact
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Area 1: Artisan Cooperatives & Women's Empowerment */}
                    <div className="rounded-xl border border-border bg-card p-5 space-y-2.5">
                      <div className="flex items-center gap-2 text-primary font-bold text-sm">
                        <Sparkles className="size-4" />
                        <span>Artisan & Women-Led Cooperatives</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        In Avanos, Central Anatolia, and rural Morocco, we partner directly with independent women's weaving and pottery cooperatives. We provide direct financial grants for raw materials, kilns, and fair-trade storefronts, ensuring traditional craftsmanship survives without middlemen markups.
                      </p>
                      <div className="rounded-lg bg-muted/40 p-2.5 text-[0.6875rem] text-muted-foreground font-medium">
                        ✦ 100% of handicraft visit proceeds remain directly with the artisans.
                      </div>
                    </div>

                    {/* Area 2: Heritage & Historic Trail Preservation */}
                    <div className="rounded-xl border border-border bg-card p-5 space-y-2.5">
                      <div className="flex items-center gap-2 text-primary font-bold text-sm">
                        <Compass className="size-4" />
                        <span>Trail & Heritage Conservation</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        We actively sponsor cleanup expeditions and trail waymarking along ancient routes—including the historic Lycian Way in Southwestern Türkiye, fairy chimney footpaths in Cappadocia, and historic Silk Road caravanserai waypoints.
                      </p>
                      <div className="rounded-lg bg-muted/40 p-2.5 text-[0.6875rem] text-muted-foreground font-medium">
                        ✦ Regular guide-led community trail restoration & garbage removal events.
                      </div>
                    </div>

                    {/* Area 3: Animal Welfare Charter */}
                    <div className="rounded-xl border border-border bg-card p-5 space-y-2.5">
                      <div className="flex items-center gap-2 text-primary font-bold text-sm">
                        <Heart className="size-4 text-rose-500" />
                        <span>Ethical Animal Welfare Standards</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        We adhere strictly to international animal welfare guidelines: we never participate in captive animal entertainment or exploitative photo ops. We support veterinary care and vaccination campaigns for community stray animals in destination cities through local animal shelters.
                      </p>
                      <div className="rounded-lg bg-muted/40 p-2.5 text-[0.6875rem] text-muted-foreground font-medium">
                        ✦ Certified animal welfare audits for all optional riding and farm experiences.
                      </div>
                    </div>

                    {/* Area 4: Community Relief & Emergency Support */}
                    <div className="rounded-xl border border-border bg-card p-5 space-y-2.5">
                      <div className="flex items-center gap-2 text-primary font-bold text-sm">
                        <Building className="size-4" />
                        <span>Disaster Relief & Rural Schools</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        In times of crisis—such as the devastating earthquakes in Southeastern Türkiye—Atlas Cares mobilizes emergency supply shipments, shelter aid, and school restoration materials for children in affected rural communities.
                      </p>
                      <div className="rounded-lg bg-muted/40 p-2.5 text-[0.6875rem] text-muted-foreground font-medium">
                        ✦ Direct grassroots allocation with zero administrative deductions.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Traveler Involvement Callout */}
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 space-y-3">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <Users className="size-4.5" />
                    <span>How You Can Participate as an Atlas Traveler</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    When you travel with Atlas Global Tours, you are already an active participant in Atlas Cares! We also offer travelers the opportunity to pack lightweight school supplies or children's books for rural village stops, purchase directly from certified cooperative workshops, and participate in voluntary tree-planting initiatives in our designated conservation zones.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => onNavigate('/contact')}
                      className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
                    >
                      Inquire about our Community Projects
                    </button>
                  </div>
                </div>
              </article>
            )}
          </div>

          {/* Right Sidebar: Quick Contact, Accreditations & FAQ */}
          <aside className="space-y-6">
            {/* Quick Navigation Card */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
              <h3 className="font-display font-bold text-sm text-foreground">
                Document Directory
              </h3>
              <ul className="space-y-1.5 text-xs">
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      type="button"
                      onClick={() => handleTabChange(tab.id, tab.path)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer text-left ${
                        activeTab === tab.id
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <ChevronRight className="size-3 text-muted-foreground/60" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Official Registered Entity Card */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <Building className="size-4" />
                <h3 className="font-display font-bold text-sm text-foreground">
                  Official Entity & Contacts
                </h3>
              </div>
              <div className="space-y-2.5 text-xs text-muted-foreground">
                <div>
                  <span className="font-semibold text-foreground block">Operating Entity:</span>
                  <span>AGT Group LLC</span>
                </div>
                <div>
                  <span className="font-semibold text-foreground block">Headquarters:</span>
                  <span>1209 Mountain Road Pl NE Ste N, Albuquerque, Bernalillo County, NM 87110, USA</span>
                </div>
                <div>
                  <span className="font-semibold text-foreground block">General Inquiries:</span>
                  <a
                    href="mailto:info@atlasglobaltours.com"
                    className="text-primary hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <Mail className="size-3" />
                    info@atlasglobaltours.com
                  </a>
                </div>
                <div>
                  <span className="font-semibold text-foreground block">Phone & WhatsApp:</span>
                  <a
                    href="tel:+15055816707"
                    className="text-foreground hover:text-primary flex items-center gap-1 mt-0.5"
                  >
                    <Phone className="size-3 text-muted-foreground" />
                    +1 505 581 67 07
                  </a>
                </div>
                <div>
                  <span className="font-semibold text-foreground block">Ethics & Compliance:</span>
                  <a
                    href="mailto:compliance@atlasglobaltours.com"
                    className="text-primary hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <Mail className="size-3" />
                    compliance@atlasglobaltours.com
                  </a>
                </div>
              </div>
            </div>

            {/* ASTA & IRS Accreditation Verification */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
              <span className="eyebrow text-primary text-[0.6875rem]">Verified Accreditations</span>
              <div className="flex items-center gap-3 pt-1">
                <a
                  href="https://www.asta.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-white p-2 border border-border hover:border-primary transition-all flex items-center justify-center h-10 shadow-xs cursor-pointer group shrink-0"
                  title="ASTA Active Member"
                >
                  <img
                    src={siteContent.astaLogoUrl || "/logos/asta-logo.png"}
                    alt="ASTA"
                    className="h-6 w-auto object-contain"
                  />
                </a>
                <div
                  className="rounded-lg bg-white p-2 border border-border flex items-center justify-center h-10 shadow-xs shrink-0"
                  title="IRS Compliant Registered US Tour Operator"
                >
                  <img
                    src={siteContent.irsLogoUrl || "/logos/irs-logo.png"}
                    alt="IRS"
                    className="h-6 w-auto object-contain"
                  />
                </div>
              </div>
              <p className="text-[0.6875rem] text-muted-foreground leading-relaxed">
                Atlas Global Tours is registered in good standing under US Federal and New Mexico state laws, in compliance with IRS corporate reporting and ASTA standards.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};
