import { APP_VERSION } from './constants';
import { Capacitor } from '@capacitor/core';

const UPDATE_CHECK_URL = 'https://aiyslkzvbzznfavpllwo.supabase.co/storage/v1/object/public/updates/version.json';

interface VersionInfo {
    version: string;
    apk_url?: string;
    changelog?: string;
}

export async function checkForAppUpdate(): Promise<VersionInfo | null> {
    try {
        if (Capacitor.getPlatform() !== 'android') return null;

        const response = await fetch(`${UPDATE_CHECK_URL}?t=${Date.now()}`, {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });

        if (!response.ok) return null;

        const serverInfo: VersionInfo = await response.json();

        // Cek jika versi server berbeda dengan versi sekarang
        if (serverInfo.version && serverInfo.version !== APP_VERSION) {
            console.log(`[Updater] New version detected: ${serverInfo.version}`);
            return serverInfo;
        }

        return null;
    } catch (error) {
        console.error('[Updater] Check failed:', error);
        return null;
    }
}

/**
 * Tampilkan Modal Force Update Profesional (Tidak Bisa Ditutup)
 */
export function showUpdateModal(versionInfo: VersionInfo): void {
    const modalId = 'pro-update-modal';
    if (document.getElementById(modalId)) return;

    const changelog = versionInfo.changelog || 'Peningkatan performa dan optimasi sistem.';
    const apkUrl = versionInfo.apk_url;
    if (!apkUrl) return;

    // Create Modal HTML
    const modalHtml = `
        <div id="${modalId}" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15, 23, 42, 0.85);backdrop-filter:blur(10px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:24px;opacity:0;transition:opacity 0.4s ease-out;font-family: 'Plus Jakarta Sans', sans-serif;">
            <div style="background:white;width:100%;max-width:400px;border-radius:32px;overflow:hidden;box-shadow:0 30px 60px -12px rgba(0,0,0,0.4);transform:scale(0.9);transition:transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);">
                <!-- Header -->
                <div style="background:linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);padding:40px 24px;text-align:center;">
                    <div style="background:rgba(255,255,255,0.2);width:72px;height:72px;border-radius:24px;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;backdrop-filter:blur(8px);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    </div>
                    <h2 style="color:white;margin:0;font-size:24px;font-weight:800;letter-spacing:-0.03em;">Wajib Update!</h2>
                    <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;font-weight:600;">Versi Baru v${versionInfo.version} Tersedia</p>
                </div>

                <!-- Body -->
                <div style="padding:24px 32px 32px;">
                    <div style="display:flex;gap:16px;margin-bottom:24px;">
                        <div style="flex:1;background:#f8fafc;padding:14px;border-radius:18px;text-align:center;border:1px solid #f1f5f9;">
                            <span style="display:block;font-size:10px;color:#94a3b8;font-weight:800;text-transform:uppercase;margin-bottom:4px;">Lama</span>
                            <span style="font-size:15px;color:#475569;font-weight:700;">v${APP_VERSION}</span>
                        </div>
                        <div style="flex:1;background:#eef2ff;padding:14px;border-radius:18px;text-align:center;border:1px solid #e0e7ff;">
                            <span style="display:block;font-size:10px;color:#6366f1;font-weight:800;text-transform:uppercase;margin-bottom:4px;">Baru</span>
                            <span style="font-size:15px;color:#4f46e5;font-weight:700;">v${versionInfo.version}</span>
                        </div>
                    </div>

                    <div style="margin-bottom:32px;">
                        <h3 style="font-size:12px;color:#94a3b8;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px;">Pembaruan Penting:</h3>
                        <div style="font-size:15px;color:#475569;line-height:1.6;font-weight:500;max-height:120px;overflow-y:auto;">
                            · ${changelog}
                        </div>
                    </div>

                    <button id="btn-update-now" style="width:100%;padding:20px;background:linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);color:white;border:none;border-radius:20px;font-size:16px;font-weight:800;cursor:pointer;transition:all 0.3s;box-shadow:0 12px 24px -6px rgba(79, 70, 229, 0.5);display:flex;align-items:center;justify-content:center;gap:12px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        Update Sekarang
                    </button>
                    <p style="text-align:center;font-size:11px;color:#94a3b8;margin:16px 0 0;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">Akses dibatasi sebelum aplikasi diperbarui</p>
                </div>
            </div>
        </div>
    `;

    // Append to body
    const div = document.createElement('div');
    div.innerHTML = modalHtml;
    document.body.appendChild(div);

    // Trigger animations
    const overlay = document.getElementById(modalId);
    const box = overlay?.firstElementChild as HTMLElement;

    requestAnimationFrame(() => {
        if (overlay) overlay.style.opacity = '1';
        if (box) box.style.transform = 'scale(1)';
    });

    // Handle Button Click
    document.getElementById('btn-update-now')?.addEventListener('click', () => {
        window.open(apkUrl, '_blank');

        const btn = document.getElementById('btn-update-now');
        if (btn) {
            btn.innerHTML = '<span>📥 Sedang Mengunduh...</span>';
            btn.style.background = '#10b981';
            btn.style.boxShadow = '0 12px 24px -6px rgba(16, 185, 129, 0.5)';
            btn.style.pointerEvents = 'none';
        }
    });

    // Prevent closing via background click or back button (simple way)
    // The lack of close/later button makes it mandatory
}

export async function initAppUpdater(): Promise<void> {
    const updateInfo = await checkForAppUpdate();
    if (updateInfo) {
        setTimeout(() => showUpdateModal(updateInfo), 2000);
    }
}
