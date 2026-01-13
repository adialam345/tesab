import type { APIRoute } from 'astro';
import { getTargetUrl, TARGET_BASE_URL } from '../../utils/proxy';

const USER_AGENT = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36';

export const GET: APIRoute = async ({ request }) => {
    try {
        const authHeader = request.headers.get('Authorization');

        if (!authHeader) {
            return new Response(JSON.stringify({ detail: 'Missing Authorization header' }), { status: 401 });
        }

        const response = await fetch(getTargetUrl('/api/v1/opd/locations/my'), {
            method: 'GET',
            headers: {
                'User-Agent': USER_AGENT,
                'Authorization': authHeader,
                'Accept': 'application/json, text/plain, */*',
                'Referer': `${TARGET_BASE_URL}/absensi`,
                'sec-ch-ua-platform': '"Android"',
                'sec-ch-ua-mobile': '?1',
                'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"'
            },
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
