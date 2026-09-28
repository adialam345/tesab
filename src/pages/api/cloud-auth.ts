import type { APIRoute } from 'astro';
import { TARGET_BASE_URL } from '../../utils/constants';

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.formData();
        const username = body.get('username');
        const password = body.get('password');

        // 1. Kirim login ke server asli
        const response = await fetch(`${TARGET_BASE_URL}/api/v1/auth/login/access-token`, {
            method: 'POST',
            body: body,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            }
        });

        const data = await response.json();

        // 2. Jika sukses login, coba ambil Profil untuk mencari Device ID yang terdaftar
        if (response.ok && data.access_token) {
            const profileRes = await fetch(`${TARGET_BASE_URL}/api/v1/auth/test-token`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${data.access_token}`,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });

            if (profileRes.ok) {
                const profileData = await profileRes.json();
                if (profileData.fixed_device_id) {
                    return new Response(JSON.stringify({
                        success: true,
                        capturedId: profileData.fixed_device_id,
                        token: data.access_token,
                        message: 'ID ditemukan di profil akun.'
                    }), { status: 200 });
                }
            }

            return new Response(JSON.stringify({
                success: true,
                token: data.access_token,
                message: 'Berhasil login, tapi ID tidak ditemukan di profil.'
            }), { status: 200 });
        }

        // 3. Jika gagal login, coba tangkap ID dari pesan error (biasanya dibocorkan server)
        const errorStr = JSON.stringify(data);
        const matchId = errorStr.match(/DEV-[A-Z0-9]{4,12}/i);

        return new Response(JSON.stringify({
            success: false,
            message: data.detail || 'Gagal Login. Pastikan NIP & Password benar.',
            capturedId: matchId ? matchId[0] : null
        }), { status: 200 });

    } catch (e: any) {
        return new Response(JSON.stringify({ success: false, message: 'Kesalahan Jaringan: ' + e.message }), { status: 500 });
    }
}
