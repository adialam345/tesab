import { storage } from './storage';
import { getRandomOffset, submitCheckIn, submitCheckOut, submitBreakIn, submitBreakOut } from './location';

function setBtnText(btn: HTMLButtonElement, textSpan: HTMLElement | null, text: string) {
    if (textSpan) {
        textSpan.textContent = text;
    } else {
        btn.textContent = text;
    }
}

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

    // Default: disable everything
    ui.checkInBtn.disabled = true;
    ui.breakInBtn.disabled = true;
    ui.breakOutBtn.disabled = true;

    if (!state.hasCheckedIn) {
        // Step 1: Check In
        ui.checkInBtn.disabled = false;
        setBtnText(ui.checkInBtn, ui.checkInBtnText, 'Masuk Kerja');
        ui.checkInBtn.classList.remove('bg-rose-600', 'bg-slate-400');
        ui.checkInBtn.classList.add('bg-indigo-600');

        setBtnText(ui.breakOutBtn, ui.breakOutBtnText, 'Mulai Istirahat');
        setBtnText(ui.breakInBtn, ui.breakInBtnText, 'Selesai Istirahat');
    } else if (!state.hasCheckedOut) {
        // Step 2-4: Flexible Check-Out or Breaks
        ui.checkInBtn.disabled = false;
        setBtnText(ui.checkInBtn, ui.checkInBtnText, 'Pulang Kerja');
        ui.checkInBtn.classList.remove('bg-indigo-600', 'bg-slate-400');
        ui.checkInBtn.classList.add('bg-rose-600');

        // Break Out is available if not yet done
        if (!state.hasBreakOut) {
            ui.breakOutBtn.disabled = false;
            setBtnText(ui.breakOutBtn, ui.breakOutBtnText, 'Mulai Istirahat');
        } else {
            setBtnText(ui.breakOutBtn, ui.breakOutBtnText, 'Sudah Istirahat');
            ui.breakOutBtn.disabled = true;
        }

        // Break In is available if Break Out is done but Break In is not
        if (state.hasBreakOut && !state.hasBreakIn) {
            ui.breakInBtn.disabled = false;
            setBtnText(ui.breakInBtn, ui.breakInBtnText, 'Kembali Kerja');
        } else if (state.hasBreakIn) {
            setBtnText(ui.breakInBtn, ui.breakInBtnText, 'Sudah Kembali');
            ui.breakInBtn.disabled = true;
        } else {
            setBtnText(ui.breakInBtn, ui.breakInBtnText, 'Selesai Istirahat');
            ui.breakInBtn.disabled = true;
        }
    } else {
        // Final state: All Done
        ui.checkInBtn.disabled = true;
        setBtnText(ui.checkInBtn, ui.checkInBtnText, 'Sudah Absen Hari Ini');
        ui.checkInBtn.classList.remove('bg-indigo-600', 'bg-rose-600');
        ui.checkInBtn.classList.add('bg-slate-400');

        setBtnText(ui.breakOutBtn, ui.breakOutBtnText, 'Selesai');
        setBtnText(ui.breakInBtn, ui.breakInBtnText, 'Selesai');
    }
}

export async function handleAttendanceSubmission(type: 'check-in' | 'check-out' | 'break-in' | 'break-out', ui: any, state: any, deviceId?: string) {
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
    const textSpanMap = {
        'check-in': ui.checkInBtnText,
        'check-out': ui.checkInBtnText,
        'break-in': ui.breakInBtnText,
        'break-out': ui.breakOutBtnText
    };

    const currentBtn = btnMap[type];
    const currentTextSpan = textSpanMap[type];

    ui.checkInBtn.disabled = true;
    ui.breakInBtn.disabled = true;
    ui.breakOutBtn.disabled = true;

    setBtnText(currentBtn, currentTextSpan, 'Mengirim...');

    ui.checkInStatus.classList.remove('hidden');
    ui.checkInStatus.className = 'status-message info-text';

    const realDeviceId = await storage.get('fixed_device_id') || deviceId || "";

    const payload = {
        lat: finalLat,
        lng: finalLng,
        device_id: realDeviceId,
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
        setBtnText(currentBtn, currentTextSpan, 'Coba Lagi');
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
        setBtnText(currentBtn, currentTextSpan, 'Selesai');
    }
}
