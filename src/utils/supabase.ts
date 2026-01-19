import { SUPABASE_URL, SUPABASE_KEY } from './constants';

export async function supabaseRequest(path: string, options: any = {}) {
    const url = `${SUPABASE_URL}/rest/v1/${path}`;

    const headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        ...options.headers
    };

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (!response.ok) {
        const error = await response.json();
        console.error('Supabase Error:', error);
        throw new Error(error.message || 'Supabase request failed');
    }

    return response.json();
}

export const nipService = {
    async getAll() {
        try {
            const data = await supabaseRequest('allowed_nips?select=nip');
            return data.map((item: any) => item.nip);
        } catch (e) {
            console.error('Failed to fetch NIPs from Supabase:', e);
            // Fallback to local storage if supabase fails
            const local = localStorage.getItem('allowed_nips');
            return local ? JSON.parse(local) : [];
        }
    },

    async add(nip: string) {
        return supabaseRequest('allowed_nips', {
            method: 'POST',
            body: JSON.stringify({ nip })
        });
    },

    async remove(nip: string) {
        return supabaseRequest(`allowed_nips?nip=eq.${nip}`, {
            method: 'DELETE'
        });
    }
};
