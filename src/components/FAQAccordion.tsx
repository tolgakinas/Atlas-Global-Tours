import React, { useState, useId } from 'react';
import { ChevronDown, HelpCircle, MessageSquare, Phone, Mail, Search, Check } from 'lucide-react';

export interface FAQItem {
  id?: string;
  question: string;
  answer: string | React.ReactNode;
  category?: 'Booking & Pricing' | 'Itinerary & Pace' | 'Rooming & Lodging' | 'Arrival & Logistics' | 'General';
}

interface FAQAccordionProps {
  items: FAQItem[];
  title?: string;
  subtitle?: string;
  badge?: string;
  allowMultiple?: boolean;
  defaultOpenIndex?: number | null;
  showContactCTA?: boolean;
  onOpenInquiry?: () => void;
  className?: string;
}

export const FAQAccordion: React.FC<FAQAccordionProps> = ({
  items,
  title = 'Frequently Asked Questions',
  subtitle = 'Everything you need to know about preparing for your journey, group dynamics, rooming, and on-ground logistics.',
  badge = 'Traveler Inquiries',
  allowMultiple = false,
  defaultOpenIndex = 0,
  showContactCTA = true,
  onOpenInquiry,
  className = '',
}) => {
  const componentId = useId();
  const [openIndices, setOpenIndices] = useState<number[]>(() => {
    if (defaultOpenIndex !== null && defaultOpenIndex !== undefined && defaultOpenIndex >= 0) {
      return [defaultOpenIndex];
    }
    return [0]; // default first item open
  });

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract unique categories
  const categories = React.useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [items]);

  // Filter items
  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (typeof item.answer === 'string' &&
          item.answer.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [items, activeCategory, searchQuery]);

  const toggleItem = (index: number) => {
    setOpenIndices((prev) => {
      if (allowMultiple) {
        return prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index];
      }
      return prev.includes(index) ? [] : [index];
    });
  };

  return (
    <section aria-labelledby={`${componentId}-heading`} className={`mt-14 ${className}`}>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-border pb-4">
        <div>
          {badge && (
            <p className="eyebrow text-primary flex items-center gap-1.5 mb-1">
              <HelpCircle className="size-3.5" />
              <span>{badge}</span>
            </p>
          )}
          <h2
            id={`${componentId}-heading`}
            className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight"
          >
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Search Filter for FAQs */}
        {items.length > 4 && (
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions..."
              className="w-full rounded-lg border border-input bg-background pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        )}
      </div>

      {/* Category Tabs (if multiple categories available) */}
      {categories.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-1.5 border-b border-border/60 pb-3">
          <button
            type="button"
            onClick={() => setActiveCategory('All')}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
              activeCategory === 'All'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            All Questions ({items.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Accordion List */}
      <div className="divide-y divide-border rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No questions matching "{searchQuery}". Try a different keyword or contact our specialists.
          </div>
        ) : (
          filteredItems.map((item, idx) => {
            const isOpen = openIndices.includes(idx);
            const itemId = `${componentId}-item-${idx}`;
            const buttonId = `${componentId}-btn-${idx}`;

            return (
              <div
                key={item.id || idx}
                className={`transition-colors ${
                  isOpen ? 'bg-muted/15' : 'hover:bg-muted/20'
                }`}
              >
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={itemId}
                    onClick={() => toggleItem(idx)}
                    className="flex w-full items-center justify-between gap-4 p-4 sm:p-5 text-left cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs font-mono">
                        Q
                      </span>
                      <span className="text-sm font-semibold text-foreground leading-snug">
                        {item.question}
                      </span>
                    </span>

                    <span
                      className={`flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-background transition-transform duration-200 ${
                        isOpen ? 'rotate-180 bg-primary/10 text-primary border-primary/30' : 'text-muted-foreground'
                      }`}
                    >
                      <ChevronDown className="size-3.5" />
                    </span>
                  </button>
                </h3>

                {isOpen && (
                  <div
                    id={itemId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="px-4 pb-5 pt-1 sm:px-5 sm:pb-6 pl-13 sm:pl-14 text-xs sm:text-sm text-foreground/80 leading-relaxed space-y-2 border-t border-border/30"
                  >
                    {typeof item.answer === 'string' ? (
                      <p className="whitespace-pre-line">{item.answer}</p>
                    ) : (
                      item.answer
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Helpful Contact Banner */}
      {showContactCTA && (
        <div className="mt-6 rounded-xl border border-border bg-muted/25 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
              <MessageSquare className="size-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-foreground">
                Have a specific question not covered here?
              </h4>
              <p className="text-[0.72rem] text-muted-foreground mt-0.5">
                Our local Istanbul operations team and Seattle advisors are happy to customize dates or assist.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {onOpenInquiry && (
              <button
                type="button"
                onClick={onOpenInquiry}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
              >
                Ask a Specialist
              </button>
            )}
            <a
              href="mailto:contact@atlasglobaltours.com"
              className="rounded-lg border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <Mail className="size-3.5 text-muted-foreground" />
              <span>Email Us</span>
            </a>
          </div>
        </div>
      )}
    </section>
  );
};
