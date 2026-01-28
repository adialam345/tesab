import { runCaptureSequence } from './photoProcessor';

let smoothedScore = 0;
let isDetecting = false;
let isAutoCapturing = false;

export function setAutoCapturing(val: boolean) {
    isAutoCapturing = val;
}

export async function updateFaceDetection(ui: any, state: any) {
    if (ui.video.paused || ui.video.ended || state.capturedPhoto !== null || isAutoCapturing || isDetecting) {
        if (state.capturedPhoto !== null) {
            ui.livenessUI?.classList.add('hidden');
        }
        setTimeout(() => updateFaceDetection(ui, state), 100);
        return;
    }

    isDetecting = true;
    try {
        // @ts-ignore
        const detection = await faceapi.detectSingleFace(ui.video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();

        const faceStatusDot = document.getElementById('faceStatusDot');

        if (ui.faceMatch) {
            if (detection) {
                const rawScore = detection.detection.score * 100;
                smoothedScore = smoothedScore + (rawScore - smoothedScore) * 0.15;
                const displayScore = Math.round(smoothedScore);

                ui.faceMatch.textContent = `Harap Senyum (${displayScore}%)`;
                ui.faceMatch.className = 'text-indigo-600 font-extrabold';

                if (faceStatusDot) {
                    faceStatusDot.className = 'w-1.5 h-1.5 rounded-full dot-success animate-pulse-slow';
                }

                if (displayScore >= 70 && !isAutoCapturing) {
                    console.log(`Face detected with score ${displayScore}%. Initiating auto-capture.`);
                    isAutoCapturing = true;
                    ui.livenessUI?.classList.remove('hidden');
                    if (ui.livenessInstruction) {
                        ui.livenessInstruction.innerHTML = `
                            <div class="flex flex-col items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 mb-2 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                                <span class="text-[13px] font-black tracking-widest text-white uppercase">HARAP SENYUM</span>
                            </div>
                        `;
                    }
                    state.isCheckingLiveness = true;
                    runCaptureSequence(ui, state);
                }
            } else {
                smoothedScore = smoothedScore * 0.7;
                if (smoothedScore < 1) smoothedScore = 0;

                ui.livenessUI?.classList.add('hidden');
                ui.faceMatch.textContent = 'Mencari Wajah...';
                ui.faceMatch.className = 'text-slate-400 font-bold';
                if (faceStatusDot) {
                    faceStatusDot.className = 'w-1.5 h-1.5 rounded-full dot-searching animate-pulse-slow';
                }
            }
        }
        if (ui.faceMatchProgress) {
            ui.faceMatchProgress.style.width = detection ? `${Math.round(smoothedScore)}%` : '15%';
        }
    } catch (e: any) {
        console.error(`Face detection error: ${e.message}`);
    } finally {
        isDetecting = false;
        setTimeout(() => updateFaceDetection(ui, state), 100);
    }
}
