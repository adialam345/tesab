import { CapacitorHttp } from '@capacitor/core';

// Helper deteksi APK
const isNative = () => {
    return (window as any).Capacitor && (window as any).Capacitor.isNativePlatform();
};

export async function secureFetch(url: string, options: any = {}) {
    if (isNative()) {
        try {
            console.log('[Native] Request to:', url);

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
                connectTimeout: 10000, // 10 detik timeout
                readTimeout: 10000
            });

            console.log('[Native] Response status:', response.status);

            return {
                ok: response.status >= 200 && response.status < 300,
                status: response.status,
                json: async () => response.data,
                text: async () => JSON.stringify(response.data)
            };
        } catch (error) {
            alert('Native Request Error: ' + JSON.stringify(error));
            console.error('[Native Error]', error);
            throw error;
        }
    }

    return fetch(url, options);
}
