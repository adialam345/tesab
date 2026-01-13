import type { APIRoute } from 'astro';
import { getTargetUrl, TARGET_BASE_URL } from '../../utils/proxy';

const USER_AGENT = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36';

const ALLOWED_NIPS = [
    '197912312008012013',
    '197608162019052001',
    '197911292008012011',
    '198104162011012006',
    '198602122017042006',
    '198411092017042005',
    '199310282019032012',
    '198804032017042006',
    '198501052010012031',
    '198212032010012025',
    '198501272017042005',
    '198505252017042016',
    '198601112011012005',
    '197410052008012006',
    '198005292009032008',
    '198705052011011010',
    '198912112022032006',
    '197710282007012002',
    '198506052024212035',
    '197107031993032002',
    '199401232022032005',
    '199510302022032008',
    '199609132022032015',
    '199303052022032007',
    '199804042022032011',
    '198302232025212038',
    '196912111991032003'
];

export const POST: APIRoute = async ({ request }) => {
    try {
        const formData = await request.formData();
        const username = formData.get('username')?.toString().replace(/\s/g, '') || '';

        // Whitelist Check
        if (!ALLOWED_NIPS.includes(username)) {
            return new Response(JSON.stringify({
                detail: 'Akses Ditolak: NIP Anda tidak terdaftar dalam sistem khusus ini.'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const response = await fetch(getTargetUrl('/api/v1/auth/login/access-token'), {
            method: 'POST',
            headers: {
                'User-Agent': USER_AGENT,
                'Origin': TARGET_BASE_URL,
                'Referer': `${TARGET_BASE_URL}/login`,
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
