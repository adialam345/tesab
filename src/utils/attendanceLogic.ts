import { getRandomOffset, submitCheckIn, submitCheckOut, submitBreakIn, submitBreakOut } from './location';

export function updateButtonStates(ui: any, state: any) {
    console.log('Updating button states...', {
        targetLoc: !!state.targetLocation,
        photo: !!state.capturedPhoto,
        hasCheckIn: state.hasCheckedIn,
        hasCheckOut: state.hasCheckedOut,
        hasBreakOut: state.hasBreakOut,
        hasBreakIn: state.hasBreakIn
    });

    if (!state.targetLocation || !state.capturedPhoto) {
        ui.checkInBtn.disabled = true;
        ui.breakInBtn.disabled = true;
        ui.breakOutBtn.disabled = true;
        return;
    }

    // 1. Check In / Out Button Logic
    if (state.hasCheckedIn && state.hasCheckedOut) {
        ui.checkInBtn.disabled = true;
        ui.checkInBtn.textContent = 'Sudah Absen Hari Ini';
        ui.checkInBtn.className = ui.checkInBtn.className.replace('bg-rose-600', 'bg-slate-400');
    } else if (state.hasCheckedIn) {
        ui.checkInBtn.disabled = false;
        ui.checkInBtn.textContent = 'Kirim Check-Out';
        ui.checkInBtn.classList.replace('bg-indigo-600', 'bg-rose-600');
    } else {
        ui.checkInBtn.disabled = false;
        ui.checkInBtn.textContent = 'Kirim Absensi';
        if (ui.checkInBtn.classList.contains('bg-rose-600')) {
            ui.checkInBtn.classList.replace('bg-rose-600', 'bg-indigo-600');
        }
    }

    // 2. Break Buttons Logic
    if (state.hasCheckedIn && !state.hasCheckedOut) {
        if (!state.hasBreakOut) {
            ui.breakOutBtn.disabled = false;
            ui.breakInBtn.disabled = true;
        } else if (!state.hasBreakIn) {
            ui.breakOutBtn.disabled = true;
            ui.breakInBtn.disabled = false;
        } else {
            ui.breakOutBtn.disabled = true;
            ui.breakInBtn.disabled = true;
            ui.breakOutBtn.textContent = 'Selesai Istirahat';
            ui.breakInBtn.textContent = 'Selesai Istirahat';
        }
    } else {
        ui.breakInBtn.disabled = true;
        ui.breakOutBtn.disabled = true;
    }
}

export async function handleAttendanceSubmission(type: 'check-in' | 'check-out' | 'break-in' | 'break-out', ui: any, state: any, USER_AGENT: string) {
    if (!state.targetLocation || !state.capturedPhoto || !ui.checkInStatus || !state.token) {
        console.log(`[${type}] Prerequisites not met. Aborting.`);
        return;
    }

    let finalLat = state.simulatedLocation?.lat;
    let finalLng = state.simulatedLocation?.lng;

    if (!finalLat || !finalLng) {
        const offset = getRandomOffset(10, state.targetLocation.latitude);
        finalLat = state.targetLocation.latitude + offset.deltaLat;
        finalLng = state.targetLocation.longitude + offset.deltaLng;
    }

    const btnMap = {
        'check-in': ui.checkInBtn,
        'check-out': ui.checkInBtn,
        'break-in': ui.breakInBtn,
        'break-out': ui.breakOutBtn
    };
    const currentBtn = btnMap[type];

    ui.checkInBtn.disabled = true;
    ui.breakInBtn.disabled = true;
    ui.breakOutBtn.disabled = true;

    currentBtn.textContent = 'Mengirim...';

    ui.checkInStatus.classList.remove('hidden');
    ui.checkInStatus.className = 'status-message info-text';

    const payload = {
        lat: finalLat,
        lng: finalLng,
        device_id: USER_AGENT,
        photo_base64: state.capturedPhoto,
        face_embedding: state.faceEmbedding,
        is_mock_location: false,
        location_accuracy: 8.5 + Math.random() * 1.5
    };

    let result: any;
    switch (type) {
        case 'check-in': result = await submitCheckIn(state.token, payload); break;
        case 'check-out': result = await submitCheckOut(state.token, payload); break;
        case 'break-in': result = await submitBreakIn(state.token, payload); break;
        case 'break-out': result = await submitBreakOut(state.token, payload); break;
    }

    ui.checkInStatus.innerHTML = result.ok
        ? `<strong>✅ ${type.toUpperCase().replace('-', ' ')} Berhasil Disimpan</strong>`
        : `<strong>❌ Gagal Mengirim (${result.status})</strong>`;
    ui.checkInStatus.className = `status-message mt-4 ${result.ok ? 'success-text' : 'error-text'}`;

    const jsonRequestPre = document.getElementById('jsonRequest');
    const jsonResponsePre = document.getElementById('jsonResponse');
    const debugContainer = document.getElementById('jsonDebugContainer');

    if (debugContainer) {
        if (jsonRequestPre) {
            const displayPayload = { ...payload, photo_base64: payload.photo_base64.substring(0, 50) + '...' };
            jsonRequestPre.textContent = JSON.stringify(displayPayload, null, 2);
        }
        if (jsonResponsePre) {
            jsonResponsePre.textContent = JSON.stringify(result.data || { error: 'No data returned' }, null, 2);
        }
        debugContainer.classList.remove('hidden');
    }

    if (!result.ok) {
        updateButtonStates(ui, state);
        currentBtn.textContent = 'Coba Lagi';
    } else {
        const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        if (type === 'check-in') {
            state.hasCheckedIn = true;
            const inTimeEl = document.getElementById('clockInTime');
            const inPhotoEl = document.getElementById('clockInPhoto') as HTMLImageElement;
            const inPhotoPlaceholder = document.getElementById('clockInPhotoPlaceholder');
            if (inTimeEl) inTimeEl.textContent = now;
            if (inPhotoEl && state.capturedPhoto) {
                inPhotoEl.src = state.capturedPhoto;
                inPhotoEl.classList.remove('hidden');
                inPhotoPlaceholder?.classList.add('hidden');
            }
        }
        if (type === 'check-out') {
            state.hasCheckedOut = true;
            const outTimeEl = document.getElementById('clockOutTime');
            const outPhotoEl = document.getElementById('clockOutPhoto') as HTMLImageElement;
            const outPhotoPlaceholder = document.getElementById('clockOutPhotoPlaceholder');
            if (outTimeEl) outTimeEl.textContent = now;
            if (outPhotoEl && state.capturedPhoto) {
                outPhotoEl.src = state.capturedPhoto;
                outPhotoEl.classList.remove('hidden');
                outPhotoPlaceholder?.classList.add('hidden');
            }
        }
        if (type === 'break-out') {
            state.hasBreakOut = true;
            const breakOutEl = document.getElementById('breakOutTime');
            if (breakOutEl) breakOutEl.textContent = now;
        }
        if (type === 'break-in') {
            state.hasBreakIn = true;
            const breakInEl = document.getElementById('breakInTime');
            if (breakInEl) breakInEl.textContent = now;
        }

        updateButtonStates(ui, state);
        currentBtn.textContent = 'Selesai';
    }
}
