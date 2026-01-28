import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.absentech.app',
    appName: 'AbsenTech',
    webDir: 'dist', // Mengacu pada hasil build statis Astro
    server: {
        androidScheme: 'https'
    },
    android: {
        allowMixedContent: true,
        captureInput: true
    },
    plugins: {
        CapacitorHttp: {
            enabled: true
        },
        CapacitorUpdater: {
            autoUpdate: false,
            resetWhenUpdate: true,
            updateUrl: 'https://antarixa.qzz.io/ota/version.json'
        }
    }
};

export default config;
