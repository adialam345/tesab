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
            manifest: {
                name: 'AbsenTech',
                short_name: 'AbsenTech',
                description: 'Aplikasi Absensi Pintar dengan IP User Asli',
                start_url: '/',
                display: 'standalone',
                background_color: '#ffffff',
                theme_color: '#4f46e5',
                icons: [
                    {
                        src: 'icon-192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'icon-512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            },
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