// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';
import AstroPWA from '@vite-pwa/astro';

// https://astro.build/config
export default defineConfig({
    output: 'server',

    adapter: node({
        mode: 'standalone'
    }),

    server: {
        host: true
    },

    integrations: [
        AstroPWA({
            registerType: 'autoUpdate',
            workbox: {
                navigateFallback: '/',
                globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,gif,webp,woff,woff2,ttf,eot}'],
            },
            devOptions: {
                enabled: true,
                navigateFallbackAllowlist: [/^\//]
            }
        })
    ],


    vite: {
        plugins: [tailwindcss()]
    }
});