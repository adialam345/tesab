import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { APP_VERSION, OTA_UPDATE_URL } from './constants';
import { storage } from './storage';

const PENDING_VERSION_KEY = 'ota_pending_version';
const CURRENT_VERSION_KEY = 'ota_current_version';

// Helper untuk cek apakah plugin tersedia
const getUpdater = () => {
    if (typeof window !== 'undefined' && (window as any).Capacitor?.Plugins?.CapacitorUpdater) {
        return CapacitorUpdater;
    }
    return null;
};

export async function initOtaSystem() {
    try {
        const updater = getUpdater();
        if (!updater) {
            console.warn('[OTA] Plugin CapacitorUpdater tidak ditemukan');
            return;
        }

        // Notify app ready (PENTING!)
        await updater.notifyAppReady();
        console.log('[OTA] App ready notified');

        const pendingVersion = await storage.get(PENDING_VERSION_KEY);
        if (pendingVersion) {
            await storage.set(CURRENT_VERSION_KEY, pendingVersion);
            await storage.remove(PENDING_VERSION_KEY);
            console.log(`[OTA] Update confirmed: v${pendingVersion}`);
        }
    } catch (error) {
        console.error('[OTA] Init error:', error);
    }
}

// Reset ke bundle bawaan APK (untuk recovery dari OTA rusak)
export async function resetToBuiltin() {
    try {
        const updater = getUpdater();
        if (!updater) {
            alert('Plugin tidak tersedia');
            return;
        }

        await storage.remove(CURRENT_VERSION_KEY);
        await storage.remove(PENDING_VERSION_KEY);
        await updater.reset();
        alert('Reset berhasil! Aplikasi akan reload ke versi bawaan APK...');
        window.location.reload();
    } catch (error) {
        console.error('[OTA] Reset error:', error);
        alert('Reset gagal: ' + error);
    }
}

export async function checkForUpdates() {
    try {
        const updater = getUpdater();
        if (!updater) return;

        console.log('[OTA] Checking updates...');
        const res = await fetch(`${OTA_UPDATE_URL}/version.json?t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) return;

        const serverData = await res.json();
        const serverVersion = serverData.version;

        const storedVersion = await storage.get(CURRENT_VERSION_KEY);
        const currentLocalVersion = storedVersion || APP_VERSION;

        if (serverVersion !== currentLocalVersion) {
            const confirmUpdate = confirm(`Update v${serverVersion} tersedia! Download?`);
            if (!confirmUpdate) return;

            console.log('[OTA] Downloading...');
            const bundle = await updater.download({
                url: `${OTA_UPDATE_URL}/dist.zip?t=${Date.now()}`,
                version: serverVersion,
            });

            await storage.set(PENDING_VERSION_KEY, serverVersion);
            await updater.set({ id: bundle.id });

            alert('Update sukses! Me-load ulang aplikasi...');
            await updater.reload();
        }
    } catch (error) {
        console.error('[OTA] Update check failed:', error);
    }
}
