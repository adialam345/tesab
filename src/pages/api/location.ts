import type { APIRoute } from 'astro';
import { getTargetUrl, TARGET_BASE_URL } from '../../utils/proxy';

const USER_AGENT = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0.1 Mobile/15E148 Safari/604.1';

export const GET: APIRoute = async ({ request }) => {
    try {
        const authHeader = request.headers.get('Authorization');

        if (!authHeader) {
            return new Response(JSON.stringify({ detail: 'Missing Authorization header' }), { status: 401 });
        }

        console.log(`[location] Requesting to: ${getTargetUrl('/api/v1/opd/locations/my')}`);
        console.log(`[location] Auth Header: ${authHeader?.substring(0, 20)}...`);

        const response = await fetch(getTargetUrl('/api/v1/opd/locations/my'), {
            method: 'GET',
            headers: {
                'User-Agent': USER_AGENT,
                'Authorization': authHeader,
                'Accept': 'application/json, text/plain, */*',
                'Origin': TARGET_BASE_URL,
                'Referer': `${TARGET_BASE_URL}/absensi`,
                'Accept-Language': 'id-ID,id;q=0.9',
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty'
            },
        });

        console.log(`[location] Response Status: ${response.status}`);
        const text = await response.text();
        console.log(`[location] Response Body Preview: ${text.substring(0, 200)}...`);

        if (!response.ok) {
            console.error(`[location] Error Response: ${text}`);
            return new Response(text, { status: response.status });
        }

        let data = JSON.parse(text);

        // Handle array response (ambil lokasi pertama)
        if (Array.isArray(data)) {
            console.log(`[location] Response is array type with length ${data.length}, taking first item.`);
            data = data.length > 0 ? data[0] : null;
        }

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
