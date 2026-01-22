export interface MarkerInfo {
    name: string,
    width: number,
    height: number,
    quantity: number
}

export const MARKERS: Record<string, MarkerInfo> = {
    "aruco": {name: "Original ArUco", width: 5, height: 5, quantity: 1024},
    "4x4_1000": {name: "ArUco 4x4", width: 4, height: 4, quantity: 1000},
    "5x5_1000": {name: "ArUco 5x5", width: 5, height: 5, quantity: 1000},
    "6x6_1000": {name: "ArUco 6x6", width: 6, height: 6, quantity: 1000},
    "7x7_1000": {name: "ArUco 7x7", width: 7, height: 7, quantity: 1000},
    // "mip_36h12": {name: "MIP_36h12", width: 6, height: 6, quantity: 250},
    // "april_16h5": {name: "AprilTag 16h5", width: 4, height: 4, quantity: 30},
    // "april_25h9": {name: "AprilTag 25h9", width: 5, height: 5, quantity: 35},
    // "april_36h10": {name: "AprilTag 36h10", width: 6, height: 6, quantity: 2320},
    // "april_36h11": {name: "AprilTag 36h11", width: 6, height: 6, quantity: 587},
}

export function generatePixelArrayFromBits(bytes: number[], height: number, width: number): number[] {
    // Convert the bytes encoding from the json marker file to 1d array of bits
    // https://chev.me/arucogen/
    const bits = [];
    const bitsCount = height * width;
    for (const byte of bytes) {
        const start = bitsCount - bits.length;
        for (let i = Math.min(7, start - 1); i >= 0; i--) {
            bits.push((byte >> i) & 1)
        }
    }
    return bits;
}

export function generateSvgFromPixelArray(bits: number[], height: number, width: number, topLeftX: number, topLeftY: number, scale: number): HTMLElement[] {
    const elements = [];

    // Create the border + background
    elements.push(generateSvgBlackRect(topLeftX, topLeftY, (width + 2) * scale, (height + 2) * scale));

    // Generate the white pixels
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            const white = bits[i * height + j];
            if (!white) continue;

            const pixel = document.createElement('rect');
            pixel.setAttribute('width', `${scale}`);
            pixel.setAttribute('height', `${scale}`);
            pixel.setAttribute('x', `${(j + 1) * scale + topLeftX}`);
            pixel.setAttribute('y', `${(i + 1) * scale + topLeftY}`);
            pixel.setAttribute('fill', 'white');

            if ((j < width - 1) && (bits[i * height + j + 1])) {
                pixel.setAttribute('width', `${1.5 * scale}`);
            }
            elements.push(pixel);

            if ((i < height - 1) && (bits[(i + 1) * height + j])) {
                const pixel2 = document.createElement('rect');
                pixel2.setAttribute('width', `${scale}`);
                pixel2.setAttribute('height', `${1.5 * scale}`);
                pixel2.setAttribute('x', `${(j + 1) * scale + topLeftX}`);
                pixel2.setAttribute('y', `${(i + 1) * scale + topLeftY}`);
                pixel2.setAttribute('fill', 'white');
                elements.push(pixel2);
            }
        }
    }
    return elements;
}

export function generateSvgBlackRect(topLeftX: number, topLeftY: number, width: number, height: number): HTMLElement {
    const rect = document.createElement('rect');
    rect.setAttribute('x', `${topLeftX}`);
    rect.setAttribute('y', `${topLeftY}`);
    rect.setAttribute('width', `${width}`);
    rect.setAttribute('height', `${height}`);
    rect.setAttribute('fill', 'black');
    return rect;
}
