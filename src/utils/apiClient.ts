import { CapacitorHttp } from '@capacitor/core';

// Helper untuk deteksi apakah sedang di dalam APK
const isNative = () => {
    return (window as any).Capacitor && (window as any).Capacitor.isNativePlatform();
};

export async function secureFetch(url: string, options: any = {}) {
    if (isNative()) {
        console.log('[NativeFetch] Using CapacitorHttp to bypass CORS');
        try {
            const response = await CapacitorHttp.request({
                url: url,
                method: options.method || 'GET',
                headers: options.headers || {},
                data: options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined,
                params: options.params || {}
            });

            // Convert Capacitor response to fetch-like response
            return {
                ok: response.status >= 200 && response.status < 300,
                status: response.status,
                json: async () => response.data,
                text: async () => JSON.stringify(response.data)
            };
        } catch (error) {
            console.error('[NativeFetch] Error:', error);
            throw error;
        }
    }

    // Default to browser fetch
    return fetch(url, options);
}
