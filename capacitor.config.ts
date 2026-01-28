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
        }
        // CapacitorUpdater DISABLED - OTA tidak kompatibel dengan setup ini
        // Gunakan build APK baru untuk setiap update
    }
};

export default config;
