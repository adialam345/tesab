import type { APIRoute } from 'astro';

const BASE_URL = 'https://absensi-kinerja.labuhanbatuselatankab.go.id';
const USER_AGENT = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0.1 Mobile/15E148 Safari/604.1';

export const GET: APIRoute = async ({ request }) => {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ detail: 'No authorization header' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const response = await fetch(`${BASE_URL}/api/v1/attendance/today`, {
            method: 'GET',
            headers: {
                'User-Agent': USER_AGENT,
                'Authorization': authHeader,
                'Accept': 'application/json, text/plain, */*',
                'Origin': BASE_URL,
                'Referer': `${BASE_URL}/dashboard`
            }
        });

        const data = await response.json();
        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ detail: error.message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
};
