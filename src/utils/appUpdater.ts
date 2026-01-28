import { APP_VERSION } from './constants';
import { Capacitor } from '@capacitor/core';

const UPDATE_CHECK_URL = 'https://antarixa.qzz.io/ota/version.json';

interface VersionInfo {
    version: string;
    apk_url?: string;
    changelog?: string;
}

/**
 * Cek apakah ada update tersedia
 */
export async function checkForAppUpdate(): Promise<VersionInfo | null> {
    try {
        // Hanya jalan di Android
        if (Capacitor.getPlatform() !== 'android') {
            console.log('[AppUpdater] Not running on Android');
            return null;
        }

        console.log(`[AppUpdater] Current version: ${APP_VERSION}`);

        const response = await fetch(`${UPDATE_CHECK_URL}?t=${Date.now()}`, {
            cache: 'no-store'
        });

        if (!response.ok) {
            console.error('[AppUpdater] Failed to fetch version info');
            return null;
        }

        const serverInfo: VersionInfo = await response.json();
        console.log(`[AppUpdater] Server version: ${serverInfo.version}`);

        // Bandingkan versi
        if (serverInfo.version !== APP_VERSION) {
            return serverInfo;
        }

        return null;
    } catch (error) {
        console.error('[AppUpdater] Check failed:', error);
        return null;
    }
}

/**
 * Download APK baru
 */
export async function downloadUpdate(apkUrl: string): Promise<void> {
    try {
        console.log('[AppUpdater] Opening download:', apkUrl);

        // Buka link download di browser eksternal
        // Android akan otomatis handle download APK
        window.open(apkUrl, '_system');

        // Informasikan user
        setTimeout(() => {
            alert('APK sedang diunduh. Setelah selesai, buka file APK dari notifikasi atau folder Downloads untuk install.');
        }, 1000);

    } catch (error) {
        console.error('[AppUpdater] Download failed:', error);
        alert('Gagal membuka link download. Silakan download manual dari: ' + apkUrl);
    }
}

/**
 * Tampilkan dialog update
 */
export async function promptUpdate(versionInfo: VersionInfo): Promise<void> {
    const changelog = versionInfo.changelog || 'Perbaikan bug dan peningkatan performa';
    const apkUrl = versionInfo.apk_url || 'https://antarixa.qzz.io/ota/app-release.apk';

    const message = `🎉 Update Tersedia!\n\nVersi Baru: ${versionInfo.version}\nVersi Saat Ini: ${APP_VERSION}\n\n📝 ${changelog}\n\nDownload update sekarang?`;

    if (confirm(message)) {
        await downloadUpdate(apkUrl);
    }
}

/**
 * Auto-check update saat app dibuka
 */
export async function initAppUpdater(): Promise<void> {
    try {
        const updateInfo = await checkForAppUpdate();

        if (updateInfo) {
            console.log('[AppUpdater] Update available:', updateInfo);
            // Tampilkan notifikasi setelah 2 detik
            setTimeout(() => {
                promptUpdate(updateInfo);
            }, 2000);
        } else {
            console.log('[AppUpdater] App is up to date');
        }
    } catch (error) {
        console.error('[AppUpdater] Init failed:', error);
    }
}
