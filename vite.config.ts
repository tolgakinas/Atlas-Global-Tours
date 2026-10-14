import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';

function tourSeoPlugin(): Plugin {
  return {
    name: 'tour-seo-meta-injector',
    transformIndexHtml(html, ctx) {
      const url = ctx.originalUrl || ctx.path || '';
      const match = url.match(/^\/tours\/([a-zA-Z0-9_-]+)/);
      if (!match) return html;

      const slug = match[1];
      try {
        const seoMapPath = path.resolve(__dirname, 'src/data/toursSeoMap.json');
        if (!fs.existsSync(seoMapPath)) return html;
        const seoMap = JSON.parse(fs.readFileSync(seoMapPath, 'utf-8'));
        const tour = seoMap[slug];
        if (!tour) return html;

        const title = `${tour.title} | Atlas Global Tours`;
        let desc = (tour.summary || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        if (desc.length > 158) {
          desc = desc.slice(0, 155).trim() + '...';
        } else if (!desc) {
          desc = `Small group boutique journey "${tour.title}" worldwide with licensed local guides.`;
        }
        const image = tour.hero_image || 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=80';

        let res = html;
        res = res.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
        res = res.replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${desc}" />`);
        res = res.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${title}" />`);
        res = res.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${desc}" />`);
        res = res.replace(/<meta property="og:image" content=".*?" \/>/, `<meta property="og:image" content="${image}" />`);
        res = res.replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${title}" />`);
        res = res.replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${desc}" />`);
        res = res.replace(/<meta name="twitter:image" content=".*?" \/>/, `<meta name="twitter:image" content="${image}" />`);
        return res;
      } catch {
        return html;
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), tourSeoPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
