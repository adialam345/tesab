import { CapacitorHttp } from '@capacitor/core';
import { storage } from './storage';

const USER_AGENT = 'Mozilla/5.0 (Linux; Android 13; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
const REFERER = 'https://absensi-kinerja.labuhanbatuselatankab.go.id/absensi';

const isNative = () => {
    return (window as any).Capacitor && (window as any).Capacitor.isNativePlatform();
};

export async function secureFetch(url: string, options: any = {}) {
    // Ambil/Generate Device ID (berlaku untuk Native & Browser)
    // PENTING: JANGAN uppercase! Chrome generate ID lowercase (DEV-75bx1x528dxse6mpmo2de)
    let activeDeviceId = await storage.get('fixed_device_id');
    if (!activeDeviceId || activeDeviceId === "") {
        activeDeviceId = "DEV-" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        await storage.set('fixed_device_id', activeDeviceId);
        console.log('[Device ID Generated]', activeDeviceId);
    }

    if (isNative()) {
        try {
            let bodyData = options.body;
            if (options.body instanceof FormData) {
                bodyData = {};
                options.body.forEach((value: any, key: any) => {
                    (bodyData as any)[key] = value;
                });
            }

            const response = await CapacitorHttp.request({
                url: url,
                method: options.method || 'GET',
                headers: {
                    'User-Agent': USER_AGENT,
                    'Referer': REFERER,
                    'Accept': 'application/json, text/plain, */*',
                    'X-Device-ID': activeDeviceId,
                    ...options.headers,
                    'Content-Type': options.body instanceof FormData ? 'application/x-www-form-urlencoded' : (options.headers['Content-Type'] || 'application/json')
                },
                data: bodyData,
                connectTimeout: 15000,
                readTimeout: 15000
            });

            // Tampilkan Alert jika status bukan 2xx (Eror dari Server)
            if (response.status < 200 || response.status >= 300) {
                const resData = response.data;
                const errorStr = typeof resData === 'object' ? JSON.stringify(resData) : String(resData);

                // DETEKSI OTOMATIS: Cari Device ID di pesan error server
                // Format real: DEV-75bx1x528dxse6mpmo2de (bisa sampai 30 karakter, CASE-SENSITIVE)
                const matchId = errorStr.match(/DEV-[a-z0-9]{4,30}/i);
                if (matchId && matchId[0] !== activeDeviceId) {
                    const expectedId = matchId[0]; // JANGAN uppercase! Simpan apa adanya
                    console.log('[Auto-Correction] Device ID mismatch detected!');
                    console.log('[Auto-Correction] Current:', activeDeviceId);
                    console.log('[Auto-Correction] Expected:', expectedId);
                    await storage.set('fixed_device_id', expectedId);

                    // Jika body adalah JSON string, update juga device_id di dalamnya agar selaras
                    if (typeof options.body === 'string') {
                        try {
                            const bodyObj = JSON.parse(options.body);
                            if (bodyObj.device_id) {
                                bodyObj.device_id = expectedId;
                                options.body = JSON.stringify(bodyObj);
                            }
                        } catch (e) { }
                    }

                    // Retry sekali dengan ID yang benar
                    return await secureFetch(url, options);
                }

                // DETEKSI OTOMATIS: Token Expired / Tidak Valid (401)
                if (response.status === 401) {
                    console.warn('[Session] Token expired or invalid. Redirecting to login...');
                    await storage.remove('access_token');
                    // Tambahkan sedikit delay agar user bisa baca alert jika perlu, 
                    // atau langsung redirect untuk UX yang mulus.
                    alert('Sesi Anda telah berakhir. Silakan login kembali.');
                    window.location.href = 'login.html';
                    return { ok: false, status: 401, json: async () => ({}), text: async () => "" };
                }

                // Parse pesan error dari server agar mudah dibaca
                let friendlyMsg = errorStr;
                try {
                    const parsed = typeof resData === 'object' ? resData : JSON.parse(errorStr);
                    friendlyMsg = parsed.detail || parsed.message || parsed.msg || parsed.error || errorStr;
                } catch (e) { friendlyMsg = errorStr; }

                const errorDetail = `⚠️ Gagal (${response.status})\n\n${friendlyMsg}`;
                console.error('[Server Error]', url, errorStr);
                alert(errorDetail);
            }

            return {
                ok: response.status >= 200 && response.status < 300,
                status: response.status,
                json: async () => response.data,
                text: async () => JSON.stringify(response.data)
            };
        } catch (error: any) {
            // Tampilkan Alert jika Eror Koneksi (HP tidak bisa hubungi Server)
            const connError = `
🚫 KONEKSI GAGAL
URL: ${url}
Pesan: ${error.message}
Detail: ${JSON.stringify(error)}
            `;
            alert(connError);
            throw error;
        }
    }

    // Fallback untuk browser (non-native)
    const browserHeaders = {
        ...(options.headers || {}),
        'X-Device-ID': activeDeviceId || ""
    };

    return fetch(url, { ...options, headers: browserHeaders });
}
