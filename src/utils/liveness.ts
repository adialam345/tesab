export interface LivenessState {
    step: number;
    progress: number;
    instruction: string;
    isChecking: boolean;
    startTime: number;
}

export function updateLivenessProgress(elapsed: number): { progress: number, instruction: string, nextStep: boolean } {
    const stepDuration = 2000;
    const currentStep = Math.floor(elapsed / stepDuration) + 1;
    let progress = 0;
    let instruction = "";
    let nextStep = false;

    if (currentStep === 1) {
        instruction = "Tengok Kiri ⬅️";
        progress = Math.min((elapsed / stepDuration) * 33, 33);
    } else if (currentStep === 2) {
        instruction = "Tengok Kanan ➡️";
        progress = 33 + Math.min(((elapsed - stepDuration) / stepDuration) * 33, 33);
    } else if (currentStep === 3) {
        instruction = "Tersenyum 😊";
        progress = 66 + Math.min(((elapsed - stepDuration * 2) / stepDuration) * 34, 34);
    } else if (currentStep >= 4) {
        progress = 100;
        instruction = "Verifikasi Selesai ✓";
        nextStep = true;
    }

    return { progress, instruction, nextStep };
}
