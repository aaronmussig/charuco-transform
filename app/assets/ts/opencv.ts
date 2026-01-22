import {MarkerSet} from "~/composables/board";


export function createOpenCvMatMapsFromChArUcoDetection(opencv: any, charucoIds: any, charucoCorners: any, nCols: number, markerSize: number, pxPerMm: number) {
    // Map detected IDs to their Ideal 2D grid positions
    // Corner ID 0 is (0,0), ID (nCols-2) is Top Right, etc.
    const srcPointsArray = [];
    const dstPointsArray = [];

    // We iterate through detected IDs and map them to their theoretical X,Y
    for (let i = 0; i < charucoIds.rows; i++) {
        const id = charucoIds.data32S[i];
        const row = Math.floor(id / (nCols - 1));
        const col = id % (nCols - 1);

        // Source: The pixel coordinates detected by OpenCV
        srcPointsArray.push(charucoCorners.data32F[i * 2], charucoCorners.data32F[i * 2 + 1]);

        const gridX_mm = (col + 1) * markerSize;
        const gridY_mm = (row + 1) * markerSize;

        dstPointsArray.push(gridX_mm * pxPerMm, gridY_mm * pxPerMm);
    }

    // 3. Create Mats for FindHomography
    const srcMat = opencv.matFromArray(charucoIds.rows, 1, opencv.CV_32FC2, srcPointsArray);
    const dstMat = opencv.matFromArray(charucoIds.rows, 1, opencv.CV_32FC2, dstPointsArray);
    return [srcMat, dstMat];
}

export async function readFileToOpenCv(opencv: any, file: File, dstImage: any): Promise<boolean> {
    return new Promise((resolve) => {
        // Create an in-memory image
        const img = new Image();
        img.src = URL.createObjectURL(file);

        // Wait until the image is ready
        img.onload = () => {

            // If the image has no dimensions, return null
            if (img.width === 0 || img.height === 0) {
                console.error("Image has no dimensions.");
                resolve(false);
            }

            // Create a canvas to draw the image
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;
            // Draw the image to the canvas
            const ctx = tempCanvas.getContext('2d');
            if (!ctx) {
                console.error("Could not get canvas context.");
                resolve(false);
            } else {
                ctx.drawImage(img, 0, 0)

                // Read from the canvas into OpenCV
                const srcImage = opencv.imread(tempCanvas)

                try {
                    // https://docs.opencv.org/4.13.0/d8/d01/group__imgproc__color__conversions.html
                    opencv.cvtColor(srcImage, dstImage, opencv.COLOR_BGRA2BGR)
                    resolve(true);
                } catch (e) {
                    console.error("Error converting image color:", e);
                    resolve(false);
                } finally {
                    srcImage.delete();
                    URL.revokeObjectURL(img.src);
                }
            }
        }

        // Handle image loading errors
        img.onerror = () => {
            console.error("Failed to load image.");
            URL.revokeObjectURL(img.src);
            resolve(false);
        };
    });
}

export async function convertOpenCvImgToBlob(opencv: any, cvImage: any): Promise<string | null> {
    return new Promise((resolve) => {
        try {
            const outCanvas = document.createElement('canvas');
            opencv.imshow(outCanvas, cvImage);

            // Convert Canvas to Blob
            outCanvas.toBlob((blob) => {
                if (blob) {
                    // Create a local URL pointing to the Blob object in memory
                    resolve(URL.createObjectURL(blob));
                } else {
                    console.error("Canvas toBlob conversion failed.");
                    resolve(null);
                }
            }, 'image/png');
        } catch (error) {
            console.error("OpenCV imshow error:", error);
            resolve(null);
        }
    });
}


export function selectOpenCvMarkers(opencv: any, markerSet: MarkerSet, nMarkers: number): any {
    if (markerSet === MarkerSet.ARUCO) {
        return opencv.DICT_ARUCO_ORIGINAL;
    }
    if (markerSet === MarkerSet.ARUCO_4X4_1000) {
        if (nMarkers <= 50) {
            return opencv.DICT_4X4_50;
        }
        if (nMarkers <= 100) {
            return opencv.DICT_4X4_100;
        }
        if (nMarkers <= 250) {
            return opencv.DICT_4X4_250;
        }
        return opencv.DICT_4X4_1000;
    }
    if (markerSet === MarkerSet.ARUCO_5X5_1000) {
        if (nMarkers <= 50) {
            return opencv.DICT_5X5_50;
        }
        if (nMarkers <= 100) {
            return opencv.DICT_5X5_100;
        }
        if (nMarkers <= 250) {
            return opencv.DICT_5X5_250;
        }
        return opencv.DICT_5X5_1000;
    }
    if (markerSet === MarkerSet.ARUCO_6X6_1000) {
        if (nMarkers <= 50) {
            return opencv.DICT_6X6_50;
        }
        if (nMarkers <= 100) {
            return opencv.DICT_6X6_100;
        }
        if (nMarkers <= 250) {
            return opencv.DICT_6X6_250;
        }
        return opencv.DICT_6X6_1000;
    }
    if (markerSet === MarkerSet.ARUCO_7X7_1000) {
        if (nMarkers <= 50) {
            return opencv.DICT_7X7_50;
        }
        if (nMarkers <= 100) {
            return opencv.DICT_7X7_100;
        }
        if (nMarkers <= 250) {
            return opencv.DICT_7X7_250;
        }
        return opencv.DICT_7X7_1000;
    }
    return null;
}


export function calculateNativePxPerMm(charucoIds: any, charucoCorners: any, markerSize: number): number {

    // Calculate average pixel distance between corners to find the natural scale
    let totalDist = 0;
    let count = 0;

    // Simple heuristic: distance between horizontal neighbors
    for (let i = 0; i < charucoIds.rows - 1; i++) {
        // Check if the next ID is the horizontal neighbor
        if (charucoIds.data32S[i + 1] === charucoIds.data32S[i] + 1) {
            const dx = charucoCorners.data32F[(i + 1) * 2] - charucoCorners.data32F[i * 2];
            const dy = charucoCorners.data32F[(i + 1) * 2 + 1] - charucoCorners.data32F[i * 2 + 1];
            totalDist += Math.sqrt(dx * dx + dy * dy);
            count++;
        }
    }

    // Pixels per mm = (Average pixels between corners) / (Physical distance between corners)
    return count > 0 ? (totalDist / count) / markerSize : 3.78;
}

