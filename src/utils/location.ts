import { TARGET_BASE_URL } from './constants';

// Randomize coordinates within a radius
export function getRandomOffset(radiusMeters: number, latitude: number) {
    const r = radiusMeters * Math.sqrt(Math.random());
    const theta = Math.random() * 2 * Math.PI;

    // 1 degree latitude ~= 111,111 meters
    const deltaLat = (r * Math.cos(theta)) / 111111;
    // 1 degree longitude ~= 111,111 * cos(lat) meters
    const deltaLng = (r * Math.sin(theta)) / (111111 * Math.cos(latitude * Math.PI / 180));

    return { deltaLat, deltaLng };
}

// Fetch location from API
export async function fetchLocation(token: string) {
    try {
        console.log('[fetchLocation] Fetching location data direct...');
        const response = await fetch(`${TARGET_BASE_URL}/api/v1/attendance/presents/last`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            console.error(`[fetchLocation] Error: ${response.status} ${response.statusText}`);
            return null;
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching location:", error);
        return null;
    }
}

// Submit check-in
export async function submitCheckIn(token: string, payload: any) {
    try {
        const response = await fetch(`${TARGET_BASE_URL}/api/v1/attendance/presents/check-in`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        return { ok: response.ok, status: response.status, data };
    } catch (error) {
        return { ok: false, error: String(error) };
    }
}

// Submit check-out
export async function submitCheckOut(token: string, payload: any) {
    try {
        const response = await fetch(`${TARGET_BASE_URL}/api/v1/attendance/presents/check-out`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        return { ok: response.ok, status: response.status, data };
    } catch (error) {
        return { ok: false, error: String(error) };
    }
}

