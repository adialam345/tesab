import { CapacitorHttp } from '@capacitor/core';

const USER_AGENT = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36';
const REFERER = 'https://absensi-kinerja.labuhanbatuselatankab.go.id/absensi';

const isNative = () => {
    return (window as any).Capacitor && (window as any).Capacitor.isNativePlatform();
};

export async function secureFetch(url: string, options: any = {}) {
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
                    ...options.headers,
                    'Content-Type': options.body instanceof FormData ? 'application/x-www-form-urlencoded' : (options.headers['Content-Type'] || 'application/json')
                },
                data: bodyData,
                connectTimeout: 15000,
                readTimeout: 15000
            });

            // Tampilkan Alert jika status bukan 2xx (Eror dari Server)
            if (response.status < 200 || response.status >= 300) {
                const errorDetail = `
⚠️ SERVER ERROR (${response.status})
URL: ${url}
Respon: ${typeof response.data === 'object' ? JSON.stringify(response.data) : response.data}
                `;
                console.error('[Server Error Detail]', errorDetail);
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

    return fetch(url, options);
}
