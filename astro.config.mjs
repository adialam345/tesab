// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
// import AstroPWA from '@vite-pwa/astro'; // DISABLED: Conflicts with Capacitor Updater OTA

// Mode Statis agar aplikasi bisa berjalan 100% mandiri di dalam APK tanpa VPS
export default defineConfig({
    output: 'static',
    build: {
        format: 'file'
    },

    integrations: [
        // PWA DISABLED untuk kompatibilitas OTA
        // Service Worker mengacaukan path resolution di Capacitor Updater
        // AstroPWA({
        //     registerType: 'autoUpdate',
        //     workbox: {
        //         navigateFallback: '/index.html',
        //         globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,gif,webp,woff,woff2,ttf,eot}'],
        //     },
        //     devOptions: {
        //         enabled: true
        //     }
        // })
    ],

    vite: {
        plugins: [tailwindcss()]
    }
});