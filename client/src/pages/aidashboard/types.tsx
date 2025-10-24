export type Segmenter = {
    segmentPeople: (
        input: ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
        config?: { multiSegmentation: boolean; segmentBodyParts: boolean }
    ) => Promise<unknown[]>; // library returns an array of segments
};

export interface BodyDimensions {
    bodyType: 'full' | 'half' | 'upper' | 'lower';
    detectedParts: string[];
    confidence: number; // heuristic, 0..1 (NOT real biometrics)
    aspectRatio: number; // width / height of the cropped box
    estimatedHeight?: number; // pixels, cropped bounding box
    estimatedWidth?: number; // pixels, cropped bounding box
}