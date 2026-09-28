import { SUPABASE_URL, SUPABASE_KEY } from './constants';
import { storage } from './storage';

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
            const local = await storage.get('allowed_nips');
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
    },

    async getSettings() {
        try {
            const data = await supabaseRequest('app_settings?select=key,value');
            const settings: any = {};
            data.forEach((item: any) => {
                settings[item.key] = item.value;
            });
            return settings;
        } catch (e) {
            console.error('Failed to fetch settings:', e);
            return null;
        }
    }
};

export const sessionService = {
    async save(sessionData: { nip: string, device_id: string, token: string, full_name?: string }) {
        try {
            // Menggunakan upsert (update if exists by nip)
            return await supabaseRequest('user_sessions?on_conflict=nip', {
                method: 'POST',
                headers: {
                    'Prefer': 'resolution=merge-duplicates'
                },
                body: JSON.stringify({
                    ...sessionData,
                    updated_at: new Date().toISOString()
                })
            });
        } catch (e) {
            console.error('Failed to save session to Supabase:', e);
        }
    },

    async getByNip(nip: string) {
        try {
            const data = await supabaseRequest(`user_sessions?nip=eq.${nip}&select=*`);
            return data[0] || null;
        } catch (e) {
            console.error('Failed to get session from Supabase:', e);
            return null;
        }
    }
};

export const adminService = {
    async getAll() {
        try {
            const data = await supabaseRequest('office_admins?select=nip');
            return data.map((item: any) => item.nip);
        } catch (e) {
            console.error('Failed to fetch Admins from Supabase:', e);
            return [];
        }
    },

    async add(nip: string) {
        return supabaseRequest('office_admins', {
            method: 'POST',
            body: JSON.stringify({ nip })
        });
    },

    async remove(nip: string) {
        return supabaseRequest(`office_admins?nip=eq.${nip}`, {
            method: 'DELETE'
        });
    },

    async isAdmin(nip: string) {
        try {
            const admins = await this.getAll();
            return admins.includes(nip);
        } catch (e) {
            return false;
        }
    }
};


