import { CapacitorHttp } from '@capacitor/core';

// Helper deteksi APK
const isNative = () => {
    return (window as any).Capacitor && (window as any).Capacitor.isNativePlatform();
};

export async function secureFetch(url: string, options: any = {}) {
    if (isNative()) {
        try {
            console.log('[Native] Requesting:', url);

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
                    ...options.headers,
                    'Content-Type': options.body instanceof FormData ? 'application/x-www-form-urlencoded' : 'application/json'
                },
                data: bodyData,
                connectTimeout: 15000,
                readTimeout: 15000
            });

            if (response.status < 200 || response.status >= 300) {
                console.error('[Native Error Response]', response);
            }

            return {
                ok: response.status >= 200 && response.status < 300,
                status: response.status,
                json: async () => response.data,
                text: async () => JSON.stringify(response.data)
            };
        } catch (error: any) {
            // Menampilkan detail error yang sangat mendalam
            const errorMsg = `
🚫 DETAIL ERROR KONEKSI:
-----------------------
Target: ${url}
Pesan: ${error.message || 'Tidak ada pesan'}
Kode Error: ${error.code || 'N/A'}
Detail: ${JSON.stringify(error)}

Saran: Periksa sinyal internet atau apakah server sedang down.
            `;
            alert(errorMsg);
            throw error;
        }
    }

    return fetch(url, options);
}
