import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { APP_VERSION, OTA_UPDATE_URL } from './constants';
import { storage } from './storage';

export async function checkForUpdates() {
    try {
        console.log('[OTA] Checking for updates...');

        const response = await fetch(`${OTA_UPDATE_URL}/version.json?t=${Date.now()}`, {
            cache: 'no-store'
        });

        if (!response.ok) {
            console.error('[OTA] Failed to fetch version.json');
            return;
        }

        const serverData = await response.json();
        const serverVersion = serverData.version;

        // Ambil versi tersimpan atau versi asli build
        const storedVersion = await storage.get('ota_current_version');
        const currentLocalVersion = storedVersion || APP_VERSION;

        console.log(`[OTA] Status -> Local: ${currentLocalVersion}, Server: ${serverVersion}`);

        if (serverVersion !== currentLocalVersion) {
            // Tampilkan Alert agar user tahu update terdeteksi
            alert(`UPDATE TERSEDIA!\nVersi Anda: ${currentLocalVersion}\nVersi Server: ${serverVersion}\n\nKlik OK untuk memperbarui...`);

            const update = await CapacitorUpdater.download({
                url: `${OTA_UPDATE_URL}/dist.zip?t=${Date.now()}`,
                version: serverVersion,
            });

            console.log('[OTA] Download success, applying bundle:', update.id);

            await CapacitorUpdater.set(update);
            await storage.set('ota_current_version', serverVersion);

            alert(`UPDATE SELESAI!\nAplikasi diperbarui ke v${serverVersion}.\nMemuat ulang sekarang...`);
            window.location.reload();
        } else {
            console.log('[OTA] Already up to date.');
            // Jika mau ngetes di HP, nyalakan alert di bawah:
            // alert(`Aplikasi sudah up-to-date (v${currentLocalVersion})`);
        }
    } catch (error: any) {
        console.error('[OTA] Error during update check:', error);
        // alert(`OTA Error: ${error.message}`);
    }
}
