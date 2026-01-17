import { CapacitorHttp } from '@capacitor/core';

// Helper deteksi APK
const isNative = () => {
    return (window as any).Capacitor && (window as any).Capacitor.isNativePlatform();
};

export async function secureFetch(url: string, options: any = {}) {
    if (isNative()) {
        console.log('[Native] Bypassing CORS for:', url);

        // Konversi FormData ke Object jika ada (CapacitorHttp butuh Object)
        let bodyData = options.body;
        if (options.body instanceof FormData) {
            bodyData = {};
            options.body.forEach((value: any, key: any) => {
                (bodyData as any)[key] = value;
            });
        }


        try {
            const response = await CapacitorHttp.request({
                url: url,
                method: options.method || 'GET',
                headers: {
                    ...options.headers,
                    'Content-Type': options.body instanceof FormData ? 'application/x-www-form-urlencoded' : 'application/json'
                },
                data: bodyData
            });

            return {
                ok: response.status >= 200 && response.status < 300,
                status: response.status,
                json: async () => response.data,
                text: async () => JSON.stringify(response.data)
            };
        } catch (error) {
            console.error('[Native Error]', error);
            throw error;
        }
    }

    // Jika di browser biasa, pakai fetch standar (Akan kena CORS kecuali pakai ekstensi)
    return fetch(url, options);
}
