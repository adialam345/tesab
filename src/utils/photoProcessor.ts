import { extractFaceEmbedding, generateDummyEmbedding } from './camera';
import { updateButtonStates } from './attendanceLogic';

export async function processPhoto(dataUrl: string, ui: any, state: any) {
    console.log('Processing photo...');
    state.capturedPhoto = dataUrl;
    ui.photo.src = dataUrl;
    ui.video.classList.add('hidden');
    ui.photo.classList.remove('hidden');
    ui.captureBtn?.classList.add('hidden');
    ui.galleryBtn?.classList.add('hidden');
    ui.retakeBtn?.classList.remove('hidden');

    state.faceEmbedding = await extractFaceEmbedding(ui.photo) || generateDummyEmbedding();
    console.log('Extracted face embedding.');

    updateButtonStates(ui, state);

    if (ui.checkInStatus) {
        ui.checkInStatus.innerHTML = '<strong>✅ Foto Berhasil Diambil</strong>';
        ui.checkInStatus.className = 'status-message success-text mt-4';
        ui.checkInStatus.classList.remove('hidden');
        console.log('Photo processing complete, status updated.');
    }
}

export async function runCaptureSequence(ui: any, state: any) {
    if (!state.isCheckingLiveness) return;
    console.log('Starting liveness capture sequence.');

    if (ui.livenessInstruction) {
        ui.livenessInstruction.innerHTML = `
            <div class="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 mb-2 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                <span class="text-[13px] font-black tracking-widest text-white uppercase">HARAP SENYUM</span>
            </div>
        `;
    }
    if (ui.livenessProgress) ui.livenessProgress.style.width = `100%`;

    setTimeout(async () => {
        state.isCheckingLiveness = false;
        const videoWidth = ui.video.videoWidth;
        const videoHeight = ui.video.videoHeight;
        const size = Math.min(videoWidth, videoHeight);
        const x = (videoWidth - size) / 2;
        const y = (videoHeight - size) / 2;

        ui.canvas.width = 229;
        ui.canvas.height = 229;
        const ctx = ui.canvas.getContext('2d');

        if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(ui.video, x, y, size, size, 0, 0, 229, 229);
        }
        console.log('Liveness capture complete. Processing photo from video stream.');
        await processPhoto(ui.canvas.toDataURL('image/jpeg', 0.8), ui, state);
        ui.livenessUI?.classList.add('hidden');
    }, 200);
}
