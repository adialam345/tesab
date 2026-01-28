import { Preferences } from '@capacitor/preferences';

export const storage = {
    async set(key: string, value: string) {
        try {
            await Preferences.set({ key, value });
        } catch (e) {
            localStorage.setItem(key, value);
        }
    },

    async get(key: string): Promise<string | null> {
        try {
            const { value } = await Preferences.get({ key });
            return value || localStorage.getItem(key);
        } catch (e) {
            return localStorage.getItem(key);
        }
    },

    async remove(key: string) {
        try {
            await Preferences.remove({ key });
        } catch (e) {
            localStorage.removeItem(key);
        }
    },

    async clear() {
        try {
            await Preferences.clear();
        } catch (e) {
            localStorage.clear();
        }
    }
};
