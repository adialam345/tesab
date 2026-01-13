import type { APIRoute } from 'astro';
import { getTargetUrl, TARGET_BASE_URL } from '../../utils/proxy';

const USER_AGENT = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0.1 Mobile/15E148 Safari/604.1';

export const POST: APIRoute = async ({ request }) => {
    try {
        const authHeader = request.headers.get('Authorization');
        const body = await request.json();

        if (!authHeader) {
            return new Response(JSON.stringify({ detail: 'Missing Authorization header' }), { status: 401 });
        }

        const response = await fetch(getTargetUrl('/api/v1/attendance/check-in'), {
            method: 'POST',
            headers: {
                'User-Agent': USER_AGENT,
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/plain, */*',
                'Origin': TARGET_BASE_URL,
                'Referer': `${TARGET_BASE_URL}/absensi`
            },
            body: JSON.stringify(body),
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
