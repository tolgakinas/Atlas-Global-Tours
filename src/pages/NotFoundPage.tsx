import React from 'react';
import { Compass } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (path: string) => void;
}

/** Shown for unknown routes. The server returns HTTP 404 for the same paths. */
export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  const go = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <div className="min-h-screen py-20">
      <div className="container-page max-w-xl text-center">
        <Compass className="mx-auto size-10 text-primary" aria-hidden="true" />
        <p className="mt-4 eyebrow text-primary">Error 404</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">
          We couldn't find that page
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          The link may be out of date, or the tour may have moved. Try one of these instead:
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/tours"
            onClick={go('/tours')}
            className="inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Small group tours
          </a>
          <a
            href="/day-tours"
            onClick={go('/day-tours')}
            className="inline-flex items-center rounded-md border border-border px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted"
          >
            Day tours
          </a>
          <a
            href="/"
            onClick={go('/')}
            className="inline-flex items-center rounded-md border border-border px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted"
          >
            Home
          </a>
        </div>
      </div>
    </div>
  );
};
