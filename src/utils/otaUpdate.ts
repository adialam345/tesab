import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { APP_VERSION, OTA_UPDATE_URL } from './constants';
import { storage } from './storage';

export async function checkForUpdates() {
    try {
        console.log('[OTA] Checking for updates...');

        // 1. Fetch version.json dari VPS Anda
        const response = await fetch(`${OTA_UPDATE_URL}/version.json`, {
            cache: 'no-store'
        });

        if (!response.ok) {
            console.log('[OTA] No version.json found on server.');
            return;
        }

        const serverData = await response.json();
        const serverVersion = serverData.version;

        // 2. Bandingkan versi
        // Kita simpan versi saat ini di storage agar bisa dilacak setelah update OTA
        const currentLocalVersion = await storage.get('ota_current_version') || APP_VERSION;

        console.log(`[OTA] Local: ${currentLocalVersion}, Server: ${serverVersion}`);

        if (serverVersion !== currentLocalVersion) {
            console.log('[OTA] New version available! Downloading...');

            // 3. Download ZIP dari VPS
            const update = await CapacitorUpdater.download({
                url: `${OTA_UPDATE_URL}/dist.zip`,
                version: serverVersion,
            });

            console.log('[OTA] Download complete. Applying update...');

            // 4. Terapkan update
            await CapacitorUpdater.set(update);

            // Simpan version baru ke storage
            await storage.set('ota_current_version', serverVersion);

            console.log('[OTA] Update applied. Reloading app...');

            // Opsional: Beritahu user sebelum reload
            // alert('Aplikasi telah diperbarui ke versi baru!');
            window.location.reload();
        } else {
            console.log('[OTA] App is up to date.');
        }
    } catch (error) {
        console.error('[OTA] Error checking for updates:', error);
    }
}
