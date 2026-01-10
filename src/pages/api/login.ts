import type { APIRoute } from 'astro';

const BASE_URL = 'https://absensi-kinerja.labuhanbatuselatankab.go.id';
const USER_AGENT = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36';

export const POST: APIRoute = async ({ request }) => {
    try {
        const formData = await request.formData();

        const response = await fetch(`${BASE_URL}/api/v1/auth/login/access-token`, {
            method: 'POST',
            headers: {
                'User-Agent': USER_AGENT,
                'Origin': BASE_URL,
                'Referer': `${BASE_URL}/login`,
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'id-ID,id;q=0.9',
                'sec-ch-ua-platform': '"Android"',
                'sec-ch-ua-mobile': '?1',
                'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"'
            },
            body: formData,
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
