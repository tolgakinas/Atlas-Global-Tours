import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Eye,
  Code
} from 'lucide-react';
import { Tour } from '../data/toursData';
import { getTourSeoData } from '../utils/tourSeo';
import { FacebookIcon, LinkedInIcon, XIcon } from './Footer';

interface ShareTourModalProps {
  tour: Tour;
  isOpen: boolean;
  onClose: () => void;
  ratingStats?: { averageRating: number; totalReviews: number };
}

// WhatsApp Branded Icon
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'size-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.886-9.886 9.886m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

export const ShareTourModal: React.FC<ShareTourModalProps> = ({
  tour,
  isOpen,
  onClose,
  ratingStats,
}) => {
  const [copied, setCopied] = useState(false);
  const [previewTab, setPreviewTab] = useState<'card' | 'tags'>('card');
  const seoData = getTourSeoData(tour, ratingStats);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(seoData.pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: seoData.title,
          text: seoData.description,
          url: seoData.pageUrl,
        });
      } catch {
        // User cancelled share
      }
    }
  };

  const shareText = encodeURIComponent(`${tour.title} — Small Group Journey by Atlas Global Tours`);
  const shareUrl = encodeURIComponent(seoData.pageUrl);

  const twitterUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}&via=atlasglobaltours`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
  const whatsAppUrl = `https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="eyebrow text-primary">Social Card & Share</span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-600 dark:text-emerald-400">
                OG & Twitter Card Active
              </span>
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mt-1">
              Share "{tour.title}"
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Optimized preview image, title, and description are configured for this tour.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5">
          {/* Direct Share Channels */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Share To Platform
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Twitter / X */}
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/30 hover:bg-black hover:border-black hover:text-white p-2.5 text-xs font-semibold transition-all group cursor-pointer shadow-2xs"
                title="Share on Twitter / X"
              >
                <XIcon className="size-3.5 group-hover:text-white" />
                <span>Twitter / X</span>
              </a>

              {/* LinkedIn */}
              <a
                href={linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/30 hover:bg-[#0A66C2] hover:border-[#0A66C2] hover:text-white p-2.5 text-xs font-semibold transition-all group cursor-pointer shadow-2xs"
                title="Share on LinkedIn"
              >
                <LinkedInIcon className="size-3.5 group-hover:text-white" />
                <span>LinkedIn</span>
              </a>

              {/* Facebook */}
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/30 hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white p-2.5 text-xs font-semibold transition-all group cursor-pointer shadow-2xs"
                title="Share on Facebook"
              >
                <FacebookIcon className="size-3.5 group-hover:text-white" />
                <span>Facebook</span>
              </a>

              {/* WhatsApp */}
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/30 hover:bg-[#25D366] hover:border-[#25D366] hover:text-white p-2.5 text-xs font-semibold transition-all group cursor-pointer shadow-2xs"
                title="Share via WhatsApp"
              >
                <WhatsAppIcon className="size-3.5 group-hover:text-white" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Copy Link Input Bar */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Tour Link (Canonical)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={seoData.pageUrl}
                className="flex-1 rounded-lg border border-input bg-muted/50 px-3 py-2 text-xs font-mono text-foreground focus:outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="size-3.5 text-white" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
                  title="Open system share sheet"
                >
                  <Share2 className="size-3.5" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              )}
            </div>
          </div>

          {/* Card Preview Toggle Tabs */}
          <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
                <Sparkles className="size-3.5 text-primary" />
                <span>Social Share Card Preview</span>
              </div>
              <div className="flex rounded-md bg-muted p-0.5 text-[0.68rem] font-semibold">
                <button
                  type="button"
                  onClick={() => setPreviewTab('card')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
                    previewTab === 'card'
                      ? 'bg-card text-foreground shadow-2xs font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Eye className="size-3" />
                  Visual Card
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('tags')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
                    previewTab === 'tags'
                      ? 'bg-card text-foreground shadow-2xs font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Code className="size-3" />
                  Meta Tags
                </button>
              </div>
            </div>

            {previewTab === 'card' ? (
              /* Simulated Twitter Summary Large Image / OpenGraph Card */
              <div className="rounded-xl overflow-hidden border border-border bg-card shadow-md transition-all hover:border-primary/40">
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-ink">
                  <img
                    src={seoData.imageUrl}
                    alt={tour.title}
                    className="size-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 rounded-md bg-ink/80 backdrop-blur-xs px-2.5 py-1 text-[0.65rem] font-bold text-white tracking-wide border border-white/10 uppercase">
                    Atlas Global Tours · Small Group
                  </div>
                </div>
                <div className="p-3.5 space-y-1.5">
                  <span className="text-[0.65rem] font-mono uppercase tracking-wider text-muted-foreground block">
                    atlasglobaltours.com
                  </span>
                  <h4 className="font-display text-sm font-bold text-foreground leading-snug line-clamp-1">
                    {seoData.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {seoData.description}
                  </p>
                </div>
              </div>
            ) : (
              /* Raw Meta Tag Inspector */
              <div className="rounded-lg bg-neutral-950 p-3 font-mono text-[0.68rem] text-neutral-300 overflow-x-auto space-y-1 border border-neutral-800">
                <div className="text-emerald-400 font-bold">&lt;!-- OpenGraph Social Meta Tags --&gt;</div>
                <div>&lt;meta property="og:type" content="website" /&gt;</div>
                <div>&lt;meta property="og:site_name" content="Atlas Global Tours" /&gt;</div>
                <div className="text-amber-300">&lt;meta property="og:title" content="{seoData.title}" /&gt;</div>
                <div className="text-sky-300">&lt;meta property="og:description" content="{seoData.description}" /&gt;</div>
                <div className="text-pink-300">&lt;meta property="og:image" content="{seoData.imageUrl}" /&gt;</div>
                <div>&lt;meta property="og:url" content="{seoData.pageUrl}" /&gt;</div>
                <div className="pt-1 text-emerald-400 font-bold">&lt;!-- Twitter / X Card Meta Tags --&gt;</div>
                <div>&lt;meta name="twitter:card" content="summary_large_image" /&gt;</div>
                <div>&lt;meta name="twitter:site" content="@atlasglobaltours" /&gt;</div>
                <div className="text-amber-300">&lt;meta name="twitter:title" content="{seoData.title}" /&gt;</div>
                <div className="text-sky-300">&lt;meta name="twitter:description" content="{seoData.description}" /&gt;</div>
                <div className="text-pink-300">&lt;meta name="twitter:image" content="{seoData.imageUrl}" /&gt;</div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border pt-4 flex items-center justify-between">
          <span className="text-[0.68rem] text-muted-foreground">
            Meta tags live-injected into document head for crawlers & link previews
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-muted px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
