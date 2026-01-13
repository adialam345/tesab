import type { APIRoute } from 'astro';

import { getTargetUrl, TARGET_BASE_URL } from '../../utils/proxy';

const USER_AGENT = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0.1 Mobile/15E148 Safari/604.1';

export const POST: APIRoute = async ({ request }) => {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ detail: 'No authorization header' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log(`[test-token] Requesting to: ${getTargetUrl('/api/v1/auth/test-token')}`);
        console.log(`[test-token] Auth Header: ${authHeader?.substring(0, 20)}...`);

        const response = await fetch(getTargetUrl('/api/v1/auth/test-token'), {
            method: 'POST',
            headers: {
                'User-Agent': USER_AGENT,
                'Authorization': authHeader,
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'Origin': TARGET_BASE_URL,
                'Referer': `${TARGET_BASE_URL}/login`
            },
            body: JSON.stringify({})
        });

        console.log(`[test-token] Response Status: ${response.status}`);
        const text = await response.text();
        console.log(`[test-token] Response Body Preview: ${text.substring(0, 200)}...`);

        if (!response.ok) {
            console.error(`[test-token] Error Response: ${text}`);
            return new Response(text, { status: response.status });
        }

        const data = JSON.parse(text);
        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error: any) {
        console.error(`[test-token] Exception:`, error);
        return new Response(JSON.stringify({ detail: error.message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
};
