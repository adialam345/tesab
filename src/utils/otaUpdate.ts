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
            const confirmUpdate = confirm(`UPDATE TERSEDIA!\nVersi Anda: ${currentLocalVersion}\nVersi Server: ${serverVersion}\n\nDownload update sekarang? (2.5MB)`);

            if (!confirmUpdate) {
                console.log('[OTA] User cancelled update');
                return;
            }

            console.log('[OTA] Starting download from:', `${OTA_UPDATE_URL}/dist.zip`);

            try {
                // Set timeout untuk download (30 detik)
                const downloadPromise = CapacitorUpdater.download({
                    url: `${OTA_UPDATE_URL}/dist.zip?t=${Date.now()}`,
                    version: serverVersion,
                });

                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Download timeout setelah 30 detik')), 30000);
                });

                const update = await Promise.race([downloadPromise, timeoutPromise]) as any;

                console.log('[OTA] Download success! Bundle ID:', update.id);

                await CapacitorUpdater.set(update);
                await storage.set('ota_current_version', serverVersion);

                alert(`UPDATE SUKSES!\nAplikasi diperbarui ke v${serverVersion}.\nMemuat ulang...`);
                window.location.reload();
            } catch (dlError: any) {
                console.error('[OTA] Download Error:', dlError);
                const errorMsg = dlError.message || dlError.toString() || 'Unknown error';
                alert(`DOWNLOAD GAGAL!\n\nError: ${errorMsg}\n\nCoba:\n1. Pastikan internet stabil\n2. Restart aplikasi\n3. Atau install APK baru`);
            }
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
