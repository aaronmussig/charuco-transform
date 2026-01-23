import exifr from 'exifr';

export interface ImageMetadata {
    FocalLength?: number;
    Make?: string;
    Model?: string;
    ExifImageWidth?: number;
    ExifImageHeight?: number;
    FocalLengthIn35mmFormat?: number;
}

export async function getCameraMetadata(file: File): Promise<ImageMetadata | null> {
    try {
        // We specifically want FocalLength and the Model/Make
        const metadata = await exifr.parse(file, [
            'FocalLength',
            'FocalLengthIn35mmFormat',
            'Make',
            'Model',
            'ExifImageWidth',
            'ExifImageHeight',
        ]);
        console.log('Metadata extracted:', metadata);
        return metadata;
    } catch (e) {
        console.warn('No EXIF data found', e);
        return null;
    }
}
