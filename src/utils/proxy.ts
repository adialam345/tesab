export const TARGET_BASE_URL = 'https://absensi-kinerja.labuhanbatuselatankab.go.id';

// Daftar 16 Cloudflare Workers Anda
export const CLOUDFLARE_WORKERS: string[] = [];

export function getTargetUrl(path: string) {
    if (CLOUDFLARE_WORKERS.length === 0) return `${TARGET_BASE_URL}${path}`;

    // Memilih worker secara acak
    const randomWorker = CLOUDFLARE_WORKERS[Math.floor(Math.random() * CLOUDFLARE_WORKERS.length)];
    const baseUrl = randomWorker.replace(/\/$/, '');
    return `${baseUrl}${path}`;
}
