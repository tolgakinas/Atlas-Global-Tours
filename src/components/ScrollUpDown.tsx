import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export const ScrollUpDown: React.FC = () => {
  const [scrollPos, setScrollPos] = useState(0);
  const [maxScroll, setMaxScroll] = useState(1000);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPos(window.scrollY);
      setMaxScroll(document.documentElement.scrollHeight - window.innerHeight);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  };

  const isNearTop = scrollPos < 100;
  const isNearBottom = scrollPos >= maxScroll - 100;

  return (
    <aside
      aria-label="Scroll navigation controls"
      className="fixed bottom-6 right-5 z-40 flex flex-col items-center gap-1 rounded-full border border-border/25 bg-background/20 p-1 backdrop-blur-md shadow-xs transition-all duration-300 hover:bg-background/80 hover:border-border/60 hover:shadow-md group"
    >
      {/* Scroll Up Button */}
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top of page"
        title="Scroll to top"
        disabled={isNearTop}
        className={`flex size-8 items-center justify-center rounded-full text-foreground/60 transition-all cursor-pointer hover:bg-primary/15 hover:text-primary ${
          isNearTop ? 'opacity-25 cursor-default' : 'opacity-75 hover:opacity-100 active:scale-95'
        }`}
      >
        <ChevronUp className="size-4" />
      </button>

      {/* Subtle Divider */}
      <div className="h-px w-3.5 bg-border/30 group-hover:bg-border/60 transition-colors" />

      {/* Scroll Down Button */}
      <button
        onClick={scrollToBottom}
        aria-label="Scroll to bottom of page"
        title="Scroll to bottom"
        disabled={isNearBottom}
        className={`flex size-8 items-center justify-center rounded-full text-foreground/60 transition-all cursor-pointer hover:bg-primary/15 hover:text-primary ${
          isNearBottom ? 'opacity-25 cursor-default' : 'opacity-75 hover:opacity-100 active:scale-95'
        }`}
      >
        <ChevronDown className="size-4" />
      </button>
    </aside>
  );
};
