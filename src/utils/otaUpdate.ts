import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { APP_VERSION, OTA_UPDATE_URL } from './constants';
import { storage } from './storage';

// Key untuk menyimpan pending version (sebelum reload)
const PENDING_VERSION_KEY = 'ota_pending_version';
const CURRENT_VERSION_KEY = 'ota_current_version';

/**
 * Dipanggil saat app pertama kali load untuk:
 * 1. Notify plugin bahwa app ready (mencegah rollback)
 * 2. Konfirmasi pending update jika ada
 */
export async function initOtaSystem() {
    try {
        // Register event listeners untuk debugging
        CapacitorUpdater.addListener('updateAvailable', (info) => {
            console.log('[OTA] Update available event:', info);
        });

        CapacitorUpdater.addListener('downloadComplete', (info) => {
            console.log('[OTA] Download complete event:', info);
        });

        CapacitorUpdater.addListener('updateFailed', (info) => {
            console.error('[OTA] Update failed event:', info);
        });

        CapacitorUpdater.addListener('downloadFailed', (info) => {
            console.error('[OTA] Download failed event:', info);
        });

        // PENTING: Notify app ready untuk mencegah auto-rollback
        await CapacitorUpdater.notifyAppReady();
        console.log('[OTA] App ready notified successfully');

        // Cek apakah ada pending version yang perlu dikonfirmasi
        const pendingVersion = await storage.get(PENDING_VERSION_KEY);
        if (pendingVersion) {
            // Update berhasil! Pindahkan pending ke current
            await storage.set(CURRENT_VERSION_KEY, pendingVersion);
            await storage.remove(PENDING_VERSION_KEY);
            console.log(`[OTA] Update berhasil dikonfirmasi ke v${pendingVersion}`);
        }
    } catch (error: any) {
        console.error('[OTA] Init error:', error);
    }
}

/**
 * Cek dan download update jika tersedia
 */
export async function checkForUpdates() {
    try {
        console.log('[OTA] Checking for updates...');

        const response = await fetch(`${OTA_UPDATE_URL}/version.json?t=${Date.now()}`, {
            cache: 'no-store'
        });

        if (!response.ok) {
            console.error('[OTA] Failed to fetch version.json:', response.status);
            return;
        }

        const serverData = await response.json();
        const serverVersion = serverData.version;

        // Ambil versi tersimpan atau versi asli build
        const storedVersion = await storage.get(CURRENT_VERSION_KEY);
        const currentLocalVersion = storedVersion || APP_VERSION;

        console.log(`[OTA] Status -> Local: ${currentLocalVersion}, Server: ${serverVersion}`);

        if (serverVersion !== currentLocalVersion) {
            const confirmUpdate = confirm(
                `UPDATE TERSEDIA!\n` +
                `Versi Anda: ${currentLocalVersion}\n` +
                `Versi Server: ${serverVersion}\n\n` +
                `Download sekarang? (±2.5MB)`
            );

            if (!confirmUpdate) return;

            try {
                console.log('[OTA] Downloading bundle...');

                const bundle = await CapacitorUpdater.download({
                    url: `${OTA_UPDATE_URL}/dist.zip?t=${Date.now()}`,
                    version: serverVersion,
                });

                console.log('[OTA] Download complete, bundle ID:', bundle.id);

                // Simpan sebagai PENDING version (belum dikonfirmasi)
                // Akan dikonfirmasi di initOtaSystem() setelah reload sukses
                await storage.set(PENDING_VERSION_KEY, serverVersion);

                // Set bundle untuk digunakan
                await CapacitorUpdater.set({ id: bundle.id });

                alert('Pembaruan berhasil diunduh!\nAplikasi akan dimuat ulang...');

                // Reload app dengan bundle baru
                await CapacitorUpdater.reload();

            } catch (dlError: any) {
                console.error('[OTA] Download/Apply error:', dlError);
                // Hapus pending version jika gagal
                await storage.remove(PENDING_VERSION_KEY);
                alert('GAGAL UPDATE:\n' + (dlError.message || JSON.stringify(dlError)));
            }
        } else {
            console.log('[OTA] Already up to date.');
            // Uncomment untuk testing di device:
            // alert(`Aplikasi sudah versi terbaru (v${currentLocalVersion})`);
        }
    } catch (error: any) {
        console.error('[OTA] Error during update check:', error);
    }
}

/**
 * Force reset ke bundle built-in (untuk debugging/rollback manual)
 */
export async function resetToBuiltin() {
    try {
        await CapacitorUpdater.reset();
        await storage.remove(CURRENT_VERSION_KEY);
        await storage.remove(PENDING_VERSION_KEY);
        alert('Reset ke versi bawaan berhasil. Aplikasi akan dimuat ulang.');
        location.reload();
    } catch (error: any) {
        console.error('[OTA] Reset error:', error);
        alert('Gagal reset: ' + error.message);
    }
}

/**
 * Get info bundle yang sedang aktif
 */
export async function getCurrentBundleInfo() {
    try {
        const current = await CapacitorUpdater.current();
        const list = await CapacitorUpdater.list();
        return { current, list };
    } catch (error) {
        console.error('[OTA] Get bundle info error:', error);
        return null;
    }
}
