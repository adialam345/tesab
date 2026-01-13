import type { APIRoute } from 'astro';
import { getTargetUrl } from '../../utils/proxy';

export const GET: APIRoute = async () => {
    try {
        // Kita tembak cdn-cgi/trace melalui worker yang terpilih secara acak
        const target = getTargetUrl('/cdn-cgi/trace');

        const response = await fetch(target, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
            }
        });

        const text = await response.text();

        // Cari baris yang mengandung ip= dan colo=
        const ipMatch = text.match(/ip=([^\n]+)/);
        const coloMatch = text.match(/colo=([^\n]+)/);
        const ip = ipMatch ? ipMatch[1] : 'Unknown';
        const location = coloMatch ? coloMatch[1] : 'Unknown';

        return new Response(JSON.stringify({
            ip_addr: ip,
            via: `Node: ${location} | Melalui: ${target.split('/')[2]}`,
            status: 'Success'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({
            error: error.message,
            detail: 'Gagal mengecek IP melalui Proxy. Pastikan daftar Worker sudah benar di src/utils/proxy.ts.'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
