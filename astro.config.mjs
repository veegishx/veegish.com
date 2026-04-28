// @ts-check

import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import vercel from "@astrojs/vercel";
import { defineConfig } from "astro/config";
import wikiLinkPlugin from "@flowershow/remark-wiki-link";

export default defineConfig({
    adapter: vercel(),
    integrations: [react(), mdx()],
    vite: {
        plugins: [tailwindcss()],
    },
    image: {
        service: {
            entrypoint: "astro/assets/services/sharp",
        },
    },
    markdown: {
        remarkPlugins: [
            [wikiLinkPlugin],
        ],
    },
});
