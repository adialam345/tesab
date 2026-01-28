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
            const confirmUpdate = confirm(`UPDATE TERSEDIA!\nVersi Anda: ${currentLocalVersion}\nVersi Server: ${serverVersion}\n\nDownload? (2.5MB)`);

            if (!confirmUpdate) return;

            try {
                console.log('[OTA] Downloading...');
                const bundle = await CapacitorUpdater.download({
                    url: `${OTA_UPDATE_URL}/dist.zip?t=${Date.now()}`,
                    version: serverVersion,
                });

                console.log('[OTA] Download complete, applying bundle:', bundle.id);

                // Simpan versi baru ke storage
                await storage.set('ota_current_version', serverVersion);

                // Set update menggunakan ID bundle khusus
                await CapacitorUpdater.set({ id: bundle.id });

                alert('Pembaruan Berhasil! Aplikasi akan memuat ulang.');

                // Gunakan reload bawaan plugin yang lebih stabil
                await CapacitorUpdater.reload();
            } catch (dlError: any) {
                console.error('[OTA] Error:', dlError);
                alert('GAGAL UPDATE: ' + (dlError.message || JSON.stringify(dlError)));
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
