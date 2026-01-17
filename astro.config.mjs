// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import AstroPWA from '@vite-pwa/astro';

// Mode Statis agar aplikasi bisa berjalan 100% mandiri di dalam APK tanpa VPS
export default defineConfig({
    output: 'static',

    integrations: [
        AstroPWA({
            registerType: 'autoUpdate',
            workbox: {
                navigateFallback: '/index.html',
                globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,gif,webp,woff,woff2,ttf,eot}'],
            },
            devOptions: {
                enabled: true
            }
        })
    ],

    vite: {
        plugins: [tailwindcss()]
    }
});