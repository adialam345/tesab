// Camera initialization
export async function initCamera(video: HTMLVideoElement) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn("Camera API not available");
        return false;
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: false
        });
        video.srcObject = stream;
        return true;
    } catch (err) {
        console.error("Error accessing camera:", err);
        return false;
    }
}

// Load face-api models
export async function loadFaceModels() {
    try {
        // @ts-ignore
        await faceapi.nets.tinyFaceDetector.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights');
        // @ts-ignore
        await faceapi.nets.faceRecognitionNet.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights');
        // @ts-ignore
        await faceapi.nets.faceLandmark68Net.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights');
        // @ts-ignore
        await faceapi.nets.faceExpressionNet.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights');
        console.log("Face models loaded");
        return true;
    } catch (e) {
        console.warn("Face API models failed to load", e);
        return false;
    }
}

// Extract face embedding from image
export async function extractFaceEmbedding(imageElement: HTMLImageElement): Promise<number[] | null> {
    try {
        // @ts-ignore
        const detections = await faceapi.detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (detections) {
            return Array.from(detections.descriptor);
        } else {
            console.warn("No face detected");
            return null;
        }
    } catch (e) {
        console.error("Face embedding extraction failed", e);
        return null;
    }
}

// Generate dummy embedding
export function generateDummyEmbedding(): number[] {
    return Array(128).fill(0).map(() => (Math.random() - 0.5) * 0.1);
}
