
// Default values for states
export const PAGE_DEFAULT = 'A4';
export const PAGE_WIDTH_MM = 210;
export const PAGE_HEIGHT_MM = 297;
export const PAGE_MARGIN_MM = 10;
export const MARKER_SIZE_MM = 20;

export const MARKER_MARGIN_MM = 10;
export const MARKER_MARGIN_UNIT = 'mm';
export const MARKER_SET = "4x4_1000";


export const usePageSize = () => useState<string>('pageSize1', () => PAGE_DEFAULT);
export const usePageWidth = () => useState<number>('pageWidthMm1', () => PAGE_WIDTH_MM);
export const usePageHeight = () => useState<number>('pageHeightMm1', () => PAGE_HEIGHT_MM);
export const usePageMargin = () => useState<number>('pageMarginMm1', () => PAGE_MARGIN_MM);
export const useMarkerSize = () => useState<number>('markerSizeMm1', () => MARKER_SIZE_MM);
export const useMarkerMargin = () => useState<number>('markerMarginMm1', () => MARKER_MARGIN_MM);
export const useMarkerMarginUnit = () => useState<string>('markerMarginUnit1', () => MARKER_MARGIN_UNIT);
export const useMarkerSet = () => useState<string>('markerSet1', () => MARKER_SET);
export const useShowCvMarkerOutput = () => useState<boolean>('showCvMarkerOutput1', () => true);
export const useIncludeParamsInOutput = () => useState<boolean>('includeParamsInOutput1', () => true);

export const warnMarkersNotEnough = () => useState<boolean>('warnMarkersNotEnough1', () => false);
export const warnMarkerMarginTooSmall = () => useState<boolean>('warnMarkerMarginTooSmall1', () => false);
export const warnMarkerMarginTooBig = () => useState<boolean>('warnMarkerMarginTooBig1', () => false);


