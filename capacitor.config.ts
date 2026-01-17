import type { CapacitorConfig } from '@capacitor/cli';


const config: CapacitorConfig = {
    appId: 'com.absentech.app',
    appName: 'AbsenTech',
    webDir: 'dist/client',
    server: {
        // Ganti dengan URL VPS Anda agar WebView langsung memuat website tersebut
        url: 'https://tesab.my.id',
        cleartext: true,
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
    }
};


export default config;
