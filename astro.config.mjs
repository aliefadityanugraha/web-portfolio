// @ts-check
import mdx from "@astrojs/mdx";
import solidJs from "@astrojs/solid-js";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkToc from "remark-toc";
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  output: "server",
  adapter: vercel({}),
  site: "https://aliefaditya.cloud/",
  image: {
    domains: ["miro.medium.com"],
  },

  markdown: {
    gfm: true,
    shikiConfig: {
      theme: "tokyo-night",
    },
    remarkPlugins: [remarkToc, remarkGfm],
    rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
  },
  integrations: [solidJs({ devtools: true }), mdx()],
  vite: {
    plugins: [tailwindcss()],
    css: {
      transformer: "lightningcss",
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            "solid-vendor": ["solid-js"],
            "ui-vendor": ["@kobalte/core", "embla-carousel-solid"],
            "utils-vendor": ["html2canvas", "jspdf"],
          },
        },
        external: ['bcryptjs', 'jsonwebtoken']
      },
    },
  },
});
