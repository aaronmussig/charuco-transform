export function isNumber(value: any): boolean {
    if (value == null) return false;
    if (value === '') return false;
    try {
        const cast = Number(value);
        return isFinite(cast);
    } catch (e) {
        return false;
    }
}

export function getSafeFontSize(text: string, maxWidth: number, maxHeight: number): number {
    const L = text.length;
    const fontSizeWidth = maxWidth / (L * 0.8);
    const fontSizeHeight = maxHeight * 0.8;
    return Math.floor(Math.min(fontSizeWidth, fontSizeHeight));
}
