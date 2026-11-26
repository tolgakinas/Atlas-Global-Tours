import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Globe,
  KeyRound,
  Loader2,
  Lock,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import type { JournalPostSummary } from '../utils/journalPosts';

interface AdminSoroJournalPanelProps {
  onBanner: (msg: string) => void;
  onPreviewPost?: (slug: string) => void;
}

interface AuthStatus {
  configuredViaEnv: boolean;
  claimed: boolean;
  needsFirstRunSetup: boolean;
}

interface JournalAdminStatus {
  soroConfigured: boolean;
  siteUrl: string;
  verifyEndpoint: string;
  publishEndpoint: string;
  totalPosts: number;
  soroCount: number;
  wordpressCount: number;
  draftCount: number;
  lastSyncedAt: string | null;
  posts: JournalPostSummary[];
}

export const AdminSoroJournalPanel: React.FC<AdminSoroJournalPanelProps> = ({
  onBanner,
  onPreviewPost,
}) => {
  // Admin Bearer token held strictly in React state memory (never localStorage)
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [confirmPasscodeInput, setConfirmPasscodeInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const [status, setStatus] = useState<JournalAdminStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAuthStatus = useCallback(async () => {
    setAuthLoading(true);
    try {
      const res = await fetch('/api/admin/auth/status');
      const data = await res.json();
      if (res.ok && data.ok) {
        setAuthStatus({
          configuredViaEnv: Boolean(data.configuredViaEnv),
          claimed: Boolean(data.claimed),
          needsFirstRunSetup: Boolean(data.needsFirstRunSetup),
        });
      }
    } catch {
      setAuthError('Unable to reach server authentication endpoint.');
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuthStatus();
  }, [fetchAuthStatus]);

  const fetchJournalStatus = useCallback(async (token: string) => {
    setLoadingStatus(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/journal/status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        setAdminToken(null);
        setAuthError('Admin session expired. Please unlock again.');
        return;
      }
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMsg(data.error || 'Could not load Soro & Journal sync status.');
        return;
      }
      setStatus(data as JournalAdminStatus);
    } catch {
      setErrorMsg('Unable to reach Journal sync service.');
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    if (adminToken) {
      fetchJournalStatus(adminToken);
    }
  }, [adminToken, fetchJournalStatus]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const clean = passcodeInput.trim();
    if (!clean) {
      setAuthError('Please enter your admin passcode.');
      return;
    }
    if (authStatus?.needsFirstRunSetup) {
      if (clean.length < 6) {
        setAuthError('Admin passcode must be at least 6 characters.');
        return;
      }
      if (clean !== confirmPasscodeInput.trim()) {
        setAuthError('Passcodes do not match.');
        return;
      }
    }

    setAuthSubmitting(true);
    try {
      const endpoint = authStatus?.needsFirstRunSetup
        ? '/api/admin/auth/claim'
        : '/api/admin/auth/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: clean }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok || !data.token) {
        setAuthError(data.error || 'Authentication failed.');
        return;
      }
      setAdminToken(data.token as string);
      setPasscodeInput('');
      setConfirmPasscodeInput('');
      setAuthStatus((prev) =>
        prev ? { ...prev, claimed: true, needsFirstRunSetup: false } : prev
      );
    } catch {
      setAuthError('Network error while verifying passcode.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleSyncNow = async () => {
    if (!adminToken || syncing) return;
    setSyncing(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/journal/sync', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status === 401) {
        setAdminToken(null);
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setErrorMsg(data.error || 'WordPress sync failed.');
        return;
      }
      onBanner(
        `Synced ${data.total} journal articles (${data.imported} new, ${data.updated} updated)`
      );
      await fetchJournalStatus(adminToken);
    } catch {
      setErrorMsg('Unable to sync articles from WordPress right now.');
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteSyncedPost = async (post: JournalPostSummary) => {
    if (!adminToken) return;
    setDeletingId(post.id);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/journal/posts/${encodeURIComponent(post.id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status === 401) {
        setAdminToken(null);
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setErrorMsg(data.error || 'Could not delete article.');
        return;
      }
      onBanner(`Removed "${post.title}" from synced journal`);
      await fetchJournalStatus(adminToken);
    } catch {
      setErrorMsg('Network error deleting article.');
    } finally {
      setDeletingId(null);
    }
  };

  const copyValue = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(key);
      window.setTimeout(() => setCopiedField(null), 1800);
    } catch {
      // clipboard unavailable
    }
  };

  if (authLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 flex items-center gap-3 text-xs text-muted-foreground">
        <Loader2 className="size-4 animate-spin text-primary" />
        <span>Checking Soro Journal connector status...</span>
      </div>
    );
  }

  if (!adminToken) {
    return (
      <div className="rounded-xl border border-primary/25 bg-card p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Sparkles className="size-3.5" />
              <span>Soro Auto-Publish & WordPress Journal Sync</span>
            </div>
            <h4 className="font-display text-base font-bold text-foreground">
              {authStatus?.needsFirstRunSetup
                ? 'Set Admin Passcode to Manage Soro & Journal Sync'
                : 'Unlock Soro Connector & Live WordPress Sync'}
            </h4>
            <p className="text-xs text-muted-foreground">
              {authStatus?.needsFirstRunSetup
                ? 'Create your admin passcode (shared with Promo Codes) to trigger WordPress syncs and view your Soro auto-publish endpoints.'
                : 'Enter your admin passcode to manage synced Soro articles, trigger manual syncs, or view webhook endpoints.'}
            </p>
          </div>
          <Lock className="size-5 text-primary shrink-0 hidden sm:block" />
        </div>

        <form onSubmit={handleUnlock} className="mt-4 flex flex-col sm:flex-row gap-2.5 max-w-xl">
          <input
            type="password"
            value={passcodeInput}
            onChange={(e) => setPasscodeInput(e.target.value)}
            placeholder={
              authStatus?.needsFirstRunSetup ? 'Create passcode (6+ chars)' : 'Enter admin passcode'
            }
            className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {authStatus?.needsFirstRunSetup && (
            <input
              type="password"
              value={confirmPasscodeInput}
              onChange={(e) => setConfirmPasscodeInput(e.target.value)}
              placeholder="Confirm passcode"
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          )}
          <button
            type="submit"
            disabled={authSubmitting}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 cursor-pointer shrink-0"
          >
            {authSubmitting ? <Loader2 className="size-3.5 animate-spin" /> : <KeyRound className="size-3.5" />}
            <span>{authStatus?.needsFirstRunSetup ? 'Set Passcode' : 'Unlock'}</span>
          </button>
        </form>

        {authError && (
          <p className="mt-2.5 text-xs text-destructive flex items-center gap-1.5">
            <AlertCircle className="size-3.5 shrink-0" />
            <span>{authError}</span>
          </p>
        )}
      </div>
    );
  }

  const filteredSynced = (status?.posts || []).filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
  });

  return (
    <div className="rounded-xl border border-primary/25 bg-card p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <Sparkles className="size-3.5" />
            <span>Soro Auto-Publish & Live Journal Sync</span>
          </div>
          <h4 className="mt-1 font-display text-lg font-bold text-foreground">
            Connected to WordPress Archive & Soro Push API
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Existing posts import from <span className="font-mono">atlasglobaltours.com</span>, and future Soro posts publish straight to this app via <span className="font-mono">/wp-json/soro/v1/publish</span>.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSyncNow}
          disabled={syncing}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer shadow-xs shrink-0"
        >
          <RefreshCw className={`size-3.5 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Syncing Posts...' : 'Sync Published Posts Now'}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-xs text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Status KPIs */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-background p-3.5">
          <span className="text-[0.68rem] uppercase tracking-wider text-muted-foreground font-semibold">
            Live Journal Posts
          </span>
          <p className="mt-1 font-display text-2xl font-bold text-foreground">
            {loadingStatus ? '—' : status?.totalPosts ?? 0}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background p-3.5">
          <span className="text-[0.68rem] uppercase tracking-wider text-muted-foreground font-semibold">
            WordPress Imported
          </span>
          <p className="mt-1 font-display text-2xl font-bold text-foreground">
            {loadingStatus ? '—' : status?.wordpressCount ?? 0}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background p-3.5">
          <span className="text-[0.68rem] uppercase tracking-wider text-muted-foreground font-semibold">
            Direct Soro Pushed
          </span>
          <p className="mt-1 font-display text-2xl font-bold text-primary">
            {loadingStatus ? '—' : status?.soroCount ?? 0}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background p-3.5">
          <span className="text-[0.68rem] uppercase tracking-wider text-muted-foreground font-semibold">
            Soro Push Key
          </span>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs font-bold">
            {status?.soroConfigured ? (
              <>
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span className="text-emerald-700 dark:text-emerald-400">Active (Secrets)</span>
              </>
            ) : (
              <>
                <AlertCircle className="size-4 text-amber-600 shrink-0" />
                <span className="text-amber-700 dark:text-amber-400">Add SORO_API_KEY</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Soro Connection Endpoints Box */}
      {status && (
        <div className="rounded-lg border border-border bg-paper/60 p-4 space-y-2.5 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Globe className="size-3.5 text-primary" />
              Soro Auto-Publish Connection Details
            </span>
            {status.lastSyncedAt && (
              <span className="text-[0.68rem] text-muted-foreground">
                Last synced: {new Date(status.lastSyncedAt).toLocaleString()}
              </span>
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2">
              <div className="min-w-0">
                <span className="block text-[0.65rem] text-muted-foreground uppercase font-semibold">
                  Site URL (for Soro WordPress Integration)
                </span>
                <span className="font-mono text-[0.72rem] text-foreground truncate block">
                  {status.siteUrl}
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyValue('siteUrl', status.siteUrl)}
                className="p-1.5 rounded border border-border hover:bg-muted cursor-pointer shrink-0"
                title="Copy Site URL"
              >
                {copiedField === 'siteUrl' ? (
                  <Check className="size-3.5 text-emerald-600" />
                ) : (
                  <Copy className="size-3.5 text-muted-foreground" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2">
              <div className="min-w-0">
                <span className="block text-[0.65rem] text-muted-foreground uppercase font-semibold">
                  Soro Publish Endpoint
                </span>
                <span className="font-mono text-[0.72rem] text-foreground truncate block">
                  {status.publishEndpoint}
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyValue('publishEndpoint', status.publishEndpoint)}
                className="p-1.5 rounded border border-border hover:bg-muted cursor-pointer shrink-0"
                title="Copy Publish Endpoint"
              >
                {copiedField === 'publishEndpoint' ? (
                  <Check className="size-3.5 text-emerald-600" />
                ) : (
                  <Copy className="size-3.5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          {!status.soroConfigured && (
            <p className="text-[0.72rem] text-amber-800 dark:text-amber-300">
              To receive future posts directly from Soro, add <span className="font-mono font-bold">SORO_API_KEY</span> in <strong>Settings → Secrets</strong> with your Soro connector key, then point Soro to this app&apos;s domain.
            </p>
          )}
        </div>
      )}

      {/* Searchable Synced Articles Preview List */}
      {status && status.posts.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Synced & Soro Articles ({filteredSynced.length})
            </h5>
            <div className="relative w-full sm:w-64">
              <Search className="size-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter synced articles..."
                className="w-full rounded-md border border-input bg-background pl-8 pr-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border rounded-lg border border-border bg-background">
            {filteredSynced.slice(0, 50).map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground truncate">{post.title}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[0.62rem] font-bold uppercase shrink-0 ${
                        post.source === 'soro'
                          ? 'bg-primary/15 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {post.source}
                    </span>
                  </div>
                  <span className="text-[0.68rem] text-muted-foreground font-mono">
                    /blog/{post.slug} · {new Date(post.published_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {onPreviewPost && (
                    <button
                      type="button"
                      onClick={() => onPreviewPost(post.slug)}
                      className="inline-flex items-center gap-1 rounded border border-border bg-card px-2 py-1 text-[0.68rem] font-semibold text-foreground hover:bg-muted cursor-pointer"
                    >
                      <span>View</span>
                      <ExternalLink className="size-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={deletingId === post.id}
                    onClick={() => handleDeleteSyncedPost(post)}
                    className="p-1.5 text-muted-foreground hover:text-destructive disabled:opacity-40 cursor-pointer"
                    title="Delete synced post"
                  >
                    {deletingId === post.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
          {filteredSynced.length > 50 && (
            <p className="text-[0.68rem] text-muted-foreground">
              Showing first 50 of {filteredSynced.length} matching articles. Use search above to narrow results.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
