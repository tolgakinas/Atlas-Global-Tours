import React, { useMemo } from 'react';
import { isSafeHttpUrl } from '../utils/journalPosts';

interface SafeArticleContentProps {
  content: string;
  format?: 'html' | 'plain';
  onNavigate?: (path: string) => void;
}

const ALLOWED_TAGS = new Set([
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'br',
  'hr',
  'ul',
  'ol',
  'li',
  'blockquote',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'del',
  'mark',
  'small',
  'sub',
  'sup',
  'a',
  'img',
  'figure',
  'figcaption',
  'table',
  'thead',
  'tbody',
  'tfoot',
  'tr',
  'th',
  'td',
  'code',
  'pre',
  'div',
  'span',
  'section',
  'article',
  'dl',
  'dt',
  'dd',
]);

const SKIP_SUBTREE_TAGS = new Set([
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'noscript',
  'form',
  'input',
  'button',
  'textarea',
  'select',
  'svg',
  'math',
]);

function resolveInternalPath(href: string): string | null {
  const trimmed = href.trim();
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    if (
      parsed.hostname === 'atlasglobaltours.com' ||
      parsed.hostname === 'www.atlasglobaltours.com'
    ) {
      return parsed.pathname + parsed.search;
    }
  } catch {
    return null;
  }
  return null;
}

function renderDomNode(
  node: ChildNode,
  key: string,
  onNavigate?: (path: string) => void
): React.ReactNode {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();

  if (SKIP_SUBTREE_TAGS.has(tag)) {
    return null;
  }

  const children = Array.from(el.childNodes)
    .map((child, idx) => renderDomNode(child, `${key}-${idx}`, onNavigate))
    .filter((child) => child !== null && child !== undefined && child !== '');

  if (!ALLOWED_TAGS.has(tag)) {
    return children.length > 0 ? <React.Fragment key={key}>{children}</React.Fragment> : null;
  }

  switch (tag) {
    case 'h1':
    case 'h2':
      return (
        <h2
          key={key}
          className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-10 mb-4 leading-snug tracking-tight"
        >
          {children}
        </h2>
      );
    case 'h3':
      return (
        <h3
          key={key}
          className="font-display text-xl sm:text-2xl font-bold text-foreground mt-8 mb-3 leading-snug"
        >
          {children}
        </h3>
      );
    case 'h4':
    case 'h5':
    case 'h6':
      return (
        <h4
          key={key}
          className="font-display text-lg font-bold text-foreground mt-6 mb-2 leading-snug"
        >
          {children}
        </h4>
      );
    case 'p':
      if (children.length === 0) return null;
      return (
        <p key={key} className="text-base text-foreground/90 leading-relaxed my-4">
          {children}
        </p>
      );
    case 'br':
      return <br key={key} />;
    case 'hr':
      return <hr key={key} className="my-8 border-border" />;
    case 'ul':
      return (
        <ul key={key} className="list-disc pl-6 my-5 space-y-2 text-foreground/90">
          {children}
        </ul>
      );
    case 'ol':
      return (
        <ol key={key} className="list-decimal pl-6 my-5 space-y-2 text-foreground/90">
          {children}
        </ol>
      );
    case 'li':
      return (
        <li key={key} className="leading-relaxed">
          {children}
        </li>
      );
    case 'blockquote':
      return (
        <blockquote
          key={key}
          className="my-6 border-l-4 border-primary bg-paper/70 px-5 py-4 rounded-r-xl italic text-foreground/85"
        >
          {children}
        </blockquote>
      );
    case 'strong':
    case 'b':
      return (
        <strong key={key} className="font-semibold text-foreground">
          {children}
        </strong>
      );
    case 'em':
    case 'i':
      return (
        <em key={key} className="italic">
          {children}
        </em>
      );
    case 'u':
      return (
        <u key={key} className="underline underline-offset-2">
          {children}
        </u>
      );
    case 's':
    case 'del':
      return <del key={key}>{children}</del>;
    case 'mark':
      return (
        <mark key={key} className="rounded bg-primary/15 px-1 text-foreground">
          {children}
        </mark>
      );
    case 'code':
      return (
        <code key={key} className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
          {children}
        </code>
      );
    case 'pre':
      return (
        <pre key={key} className="my-5 overflow-x-auto rounded-xl border border-border bg-muted p-4 text-xs font-mono">
          {children}
        </pre>
      );
    case 'a': {
      const href = (el.getAttribute('href') || '').trim();
      const internal = resolveInternalPath(href);
      if (internal && onNavigate) {
        // Map known Atlas Global Tours routes or open cleanly
        const mappedPath = internal.startsWith('/tours') || internal.startsWith('/blog') || internal.startsWith('/contact')
          ? internal
          : null;
        if (mappedPath) {
          return (
            <button
              key={key}
              type="button"
              onClick={() => onNavigate(mappedPath)}
              className="text-primary font-medium underline underline-offset-2 hover:text-primary/80 cursor-pointer text-left inline"
            >
              {children}
            </button>
          );
        }
      }
      if (!isSafeHttpUrl(href)) {
        return <span key={key}>{children}</span>;
      }
      return (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary font-medium underline underline-offset-2 hover:text-primary/80 transition-colors"
        >
          {children}
        </a>
      );
    }
    case 'img': {
      const src = (el.getAttribute('src') || '').trim();
      if (!isSafeHttpUrl(src)) return null;
      const alt = (el.getAttribute('alt') || 'Travel journal photograph').trim();
      return (
        <img
          key={key}
          src={src}
          alt={alt}
          loading="lazy"
          className="my-6 w-full rounded-xl border border-border object-cover shadow-sm"
        />
      );
    }
    case 'figure':
      return (
        <figure key={key} className="my-7">
          {children}
        </figure>
      );
    case 'figcaption':
      return (
        <figcaption key={key} className="mt-2 text-center text-xs text-muted-foreground italic">
          {children}
        </figcaption>
      );
    case 'table':
      return (
        <div key={key} className="my-6 overflow-x-auto rounded-xl border border-border">
          <table className="w-full border-collapse text-sm text-left">{children}</table>
        </div>
      );
    case 'thead':
      return (
        <thead key={key} className="bg-muted/60 text-xs uppercase tracking-wider text-foreground">
          {children}
        </thead>
      );
    case 'tbody':
      return (
        <tbody key={key} className="divide-y divide-border bg-card">
          {children}
        </tbody>
      );
    case 'tfoot':
      return <tfoot key={key}>{children}</tfoot>;
    case 'tr':
      return <tr key={key}>{children}</tr>;
    case 'th':
      return (
        <th key={key} className="px-4 py-2.5 font-semibold text-foreground border-b border-border">
          {children}
        </th>
      );
    case 'td':
      return (
        <td key={key} className="px-4 py-2.5 text-foreground/85 align-top">
          {children}
        </td>
      );
    case 'div':
    case 'section':
    case 'article':
      return children.length > 0 ? (
        <div key={key} className="space-y-4">
          {children}
        </div>
      ) : null;
    case 'span':
      return <span key={key}>{children}</span>;
    case 'dl':
      return (
        <dl key={key} className="my-5 space-y-2">
          {children}
        </dl>
      );
    case 'dt':
      return (
        <dt key={key} className="font-semibold text-foreground mt-3">
          {children}
        </dt>
      );
    case 'dd':
      return (
        <dd key={key} className="pl-4 text-foreground/85">
          {children}
        </dd>
      );
    default:
      return <React.Fragment key={key}>{children}</React.Fragment>;
  }
}

export const SafeArticleContent: React.FC<SafeArticleContentProps> = ({
  content,
  format,
  onNavigate,
}) => {
  const looksLikeHtml =
    format === 'html' || (format !== 'plain' && /<[a-z][\s\S]*>/i.test(content));

  const parsedNodes = useMemo(() => {
    if (!looksLikeHtml || typeof window === 'undefined' || typeof DOMParser === 'undefined') {
      return null;
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    return Array.from(doc.body.childNodes).map((node, idx) =>
      renderDomNode(node, `art-${idx}`, onNavigate)
    );
  }, [content, looksLikeHtml, onNavigate]);

  if (looksLikeHtml && parsedNodes) {
    return <div className="max-w-none">{parsedNodes}</div>;
  }

  // Plain-text markdown-lite fallback for local editorial posts
  return (
    <div className="max-w-none text-base text-foreground/90 leading-relaxed space-y-5">
      {content.split('\n\n').map((paragraph, index) => {
        if (paragraph.startsWith('- ')) {
          const items = paragraph.split('\n- ');
          return (
            <ul key={index} className="list-disc pl-6 space-y-2">
              {items.map((item, idx) => (
                <li key={idx}>{item.replace(/^- /, '')}</li>
              ))}
            </ul>
          );
        }
        return <p key={index}>{paragraph}</p>;
      })}
    </div>
  );
};
