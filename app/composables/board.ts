// This composable handles the state and logic related to the ChArUco board.

import {MARKERS} from "~/assets/ts/marker";
import markerData from "~/assets/data/markers.json";

export enum MarkerSet {
    ARUCO = "aruco",
    ARUCO_4X4_1000 = "4x4_1000",
    ARUCO_5X5_1000 = "5x5_1000",
    ARUCO_6X6_1000 = "6x6_1000",
    ARUCO_7X7_1000 = "7x7_1000",
}

export enum PageSize {
    CUSTOM = "Custom",
    A0 = "A0",
    A1 = "A1",
    A2 = "A2",
    A3 = "A3",
    A4 = "A4",
    A5 = "A5"
}

export enum Unit {
    MM = "mm",
    PCT = "%",
}

export enum BoardError {
    MARKER_NOT_ENOUGH = "Not enough markers to fill the board.",
    SVG_CONTAINER_MISSING = "SVG container element not available for rendering.",
    MARKER_MARGIN_TOO_SMALL = "Marker margin is too small, markers may not be detected.",
    MARKER_MARGIN_TOO_LARGE = "Marker margin is too large, checkerboard edges may not be detected.",
    PAGE_MARGIN_TOO_LARGE = "Page margin is too large, no markers can fit on the page.",
    PAGE_MARGIN_TOO_SMALL = "Page margins are very thin and may not print correctly.",
    MARKER_TOO_SMALL = "Markers are small and may not be detected correctly.",
    GRID_TOO_SMALL = "The grid is too small, need at least 2x2.",
}

const DEFAULT_PAGE_SIZE = PageSize.A4;
const DEFAULT_PAGE_WIDTH_MM = 210;
const DEFAULT_PAGE_HEIGHT_MM = 297;
const DEFAULT_PAGE_MARGIN = 10;
const DEFAULT_PAGE_MARGIN_UNIT = Unit.MM;
const DEFAULT_MARKER_SIZE_MM = 20;
const DEFAULT_MARKER_MARGIN = 20;
const DEFAULT_MARKER_MARGIN_UNIT = Unit.PCT;
const DEFAULT_MARKER_SET = MarkerSet.ARUCO_4X4_1000;
const DEFAULT_OUTPUT_PARAMETERS = false;

export const useBoard = () => {

    // States
    const pageSize = useState<PageSize>('pageSize', () => DEFAULT_PAGE_SIZE);
    const pageWidthMm = useState<number>('pageWidthMm', () => DEFAULT_PAGE_WIDTH_MM);
    const pageHeightMm = useState<number>('pageHeightMm', () => DEFAULT_PAGE_HEIGHT_MM);

    const pageMargin = useState<number>('pageMargin', () => DEFAULT_PAGE_MARGIN);
    const pageMarginUnit = useState<Unit>('pageMarginUnit', () => DEFAULT_PAGE_MARGIN_UNIT);

    const markerSizeMm = useState<number>('markerSizeMm', () => DEFAULT_MARKER_SIZE_MM);

    const markerMargin = useState<number>('markerMargin', () => DEFAULT_MARKER_MARGIN);
    const markerMarginUnit = useState<Unit>('markerMarginUnit', () => DEFAULT_MARKER_MARGIN_UNIT);

    const markerSet = useState<MarkerSet>('markerSet', () => DEFAULT_MARKER_SET);

    const outputParameters = useState<boolean>('outputParameters', () => DEFAULT_OUTPUT_PARAMETERS);

    const boardErrors = useState<BoardError[]>('boardErrors', () => []);

    // Computed values
    const markerMarginMm = computed<number>(() => {
        if (markerMarginUnit.value === Unit.MM) {
            return markerMargin.value;
        } else {
            // Percentage of marker size
            return (markerMargin.value / 100) * markerSizeMm.value;
        }
    });
    const pageMarginMm = computed<number>(() => {
        if (pageMarginUnit.value === Unit.MM) {
            return pageMargin.value;
        } else {
            // Percentage of the largest dimension
            return (pageMargin.value / 100) * Math.max(pageWidthMm.value, pageHeightMm.value);
        }
    });
    const nRows = computed<number>(() => {
        return Math.floor((pageHeightMm.value - 2 * pageMarginMm.value) / markerSizeMm.value);
    });
    const nCols = computed<number>(() => {
        return Math.floor((pageWidthMm.value - 2 * pageMarginMm.value) / markerSizeMm.value);
    });
    const nMarkers = computed<number>(() => {
        return Math.floor((nRows.value * nCols.value) / 2);
    });
    const gridWidthMm = computed<number>(() => {
        return nCols.value * markerSizeMm.value;
    });
    const gridHeightMm = computed<number>(() => {
        return nRows.value * markerSizeMm.value;
    });
    const maxMarkerCount = computed<number>(() => {
        return Object.keys(markerData[markerSet.value]).length;
    });
    const markerBitsWidth = computed<number>(() => {
        return MARKERS[markerSet.value].width;
    });
    const markerBitsHeight = computed<number>(() => {
        return MARKERS[markerSet.value].height;
    });
    const markerTrueSizeMm = computed<number>(() => {
        return markerSizeMm.value - (2 * markerMarginMm.value);
    });
    const gridStartX = computed<number>(() => {
        return (pageWidthMm.value - gridWidthMm.value) / 2
    });
    const gridStartY = computed<number>(() => {
        return (pageHeightMm.value - gridHeightMm.value) / 2
    });
    const outputParameterString = computed<string>(() => {
        const values = [
            `${MARKERS[markerSet.value].name}`,
        ];
        if (pageSize.value !== PageSize.CUSTOM) {
            values.push(`${pageSize.value}`);
        } else {
            values.push(`Height: ${pageHeightMm.value}mm x Width:${pageWidthMm.value}mm`);
        }
        values.push(`Page margin: ${pageMargin.value}${pageMarginUnit.value}`);
        values.push(`Marker size: ${markerSizeMm.value}mm`);
        values.push(`Marker margin: ${markerMargin.value}${markerMarginUnit.value}`);
        return values.join(' | ');
    });
    const outputSvgName = computed<string>(() => {
        const values = ['ChArUco'];
        values.push(`${MARKERS[markerSet.value].name}`);
        if (pageSize.value !== PageSize.CUSTOM) {
            values.push(`${pageSize.value}`);
        } else {
            values.push(`h${pageHeightMm.value}mm-w${pageWidthMm.value}mm`);
        }
        values.push(`page-margin-${pageMargin.value}${pageMarginUnit.value === Unit.MM ? 'mm' : 'pct'}`);
        values.push(`marker-size-${markerSizeMm.value}mm`);
        values.push(`marker-margin-${markerMargin.value}${markerMarginUnit.value === Unit.MM ? 'mm' : 'pct'}`);
        const out = values.join('_');
        return out.replace(/\s+/g, '-');
    });
    const urlParams = computed<URLSearchParams>(() => {
        const params = new URLSearchParams();
        params.set('dictionary', markerSet.value);
        if (pageSize.value !== PageSize.CUSTOM) {
            params.set('page', pageSize.value);
        } else {
            params.set('width', pageWidthMm.value.toString());
            params.set('height', pageHeightMm.value.toString());
        }
        params.set('page_margin', pageMargin.value.toString());
        params.set('page_margin_unit', pageMarginUnit.value === Unit.MM ? 'mm' : 'pct');
        params.set('marker_size', markerSizeMm.value.toString());
        params.set('marker_margin', markerMargin.value.toString());
        params.set('marker_margin_unit', markerMarginUnit.value === Unit.MM ? 'mm' : 'pct');
        params.set('include_parameters', outputParameters.value ? 'true' : 'false');
        return params;
    });

    // Methods
    const resetToDefaults = () => {
        pageSize.value = DEFAULT_PAGE_SIZE;
        // pageWidthMm.value = DEFAULT_PAGE_WIDTH_MM;  // handled by watch on pageSize
        // pageHeightMm.value = DEFAULT_PAGE_HEIGHT_MM;  // handled by watch on pageSize
        pageMargin.value = DEFAULT_PAGE_MARGIN;
        pageMarginUnit.value = DEFAULT_PAGE_MARGIN_UNIT;
        markerSizeMm.value = DEFAULT_MARKER_SIZE_MM;
        markerMargin.value = DEFAULT_MARKER_MARGIN;
        markerMarginUnit.value = DEFAULT_MARKER_MARGIN_UNIT;
        markerSet.value = DEFAULT_MARKER_SET;
        outputParameters.value = DEFAULT_OUTPUT_PARAMETERS;
    };

    const addError = (error: BoardError) => {
        if (!boardErrors.value.includes(error)) {
            boardErrors.value.push(error);
        }
    }
    const removeError = (error: BoardError) => {
        boardErrors.value = boardErrors.value.filter(e => e !== error);
    }
    const resetErrors = () => {
        boardErrors.value = [];
    }
    const setFromUrlParams = (params: URLSearchParams) => {
        const dictionary = params.get('dictionary');
        if (dictionary != null && Object.keys(MARKERS).includes(dictionary)) {
            markerSet.value = dictionary as MarkerSet;
        }

        const page = params.get('page');
        if (page != null) {
            if (Object.values(PageSize).includes(page as PageSize) && page as PageSize !== PageSize.CUSTOM) {
                pageSize.value = page as PageSize;
            }
        }

        const width = params.get('width');
        if (width != null) {
            const newWidth = parseFloat(width);
            if (!isNaN(newWidth) && newWidth > 0) {
                pageWidthMm.value = newWidth;
                pageSize.value = PageSize.CUSTOM;
            }
        }
        const height = params.get('height');
        if (height != null) {
            const newHeight = parseFloat(height);
            if (!isNaN(newHeight) && newHeight > 0) {
                pageHeightMm.value = newHeight;
                pageSize.value = PageSize.CUSTOM;
            }
        }

        const page_margin = params.get('page_margin');
        const page_margin_unit = params.get('page_margin_unit');
        if (page_margin != null && page_margin_unit != null) {
            const pm = parseFloat(page_margin);
            if (!isNaN(pm) && pm >= 0 && (page_margin_unit === 'mm' || page_margin_unit === 'pct')) {
                pageMargin.value = pm;
                if (page_margin_unit === 'mm') {
                    pageMarginUnit.value = Unit.MM;
                } else {
                    pageMarginUnit.value = Unit.PCT;
                }
            }
        }

        const marker_size = params.get('marker_size');
        if (marker_size != null) {
            const ms = parseFloat(marker_size);
            if (!isNaN(ms) && ms > 0) {
                markerSizeMm.value = ms;
            }
        }

        const marker_margin = params.get('marker_margin');
        const marker_margin_unit = params.get('marker_margin_unit');
        if (marker_margin != null && marker_margin_unit != null) {
            const mmg = parseFloat(marker_margin);
            if (!isNaN(mmg) && mmg >= 0 && (marker_margin_unit === 'mm' || marker_margin_unit === 'pct')) {
                markerMargin.value = mmg;
                if (marker_margin_unit === 'mm') {
                    markerMarginUnit.value = Unit.MM;
                } else {
                    markerMarginUnit.value = Unit.PCT;
                }
            }
        }

        const include_parameters = params.get('include_parameters');
        if (include_parameters != null) {
            outputParameters.value = include_parameters === 'true';
        }
    }

    // Effects
    watch(pageSize, (newSize) => {
        if (newSize === PageSize.A0) {
            pageWidthMm.value = 841;
            pageHeightMm.value = 1189;
        } else if (newSize === PageSize.A1) {
            pageWidthMm.value = 594;
            pageHeightMm.value = 841;
        } else if (newSize === PageSize.A2) {
            pageWidthMm.value = 420;
            pageHeightMm.value = 594;
        } else if (newSize === PageSize.A3) {
            pageWidthMm.value = 297;
            pageHeightMm.value = 420;
        } else if (newSize === PageSize.A4) {
            pageWidthMm.value = 210;
            pageHeightMm.value = 297;
        } else if (newSize === PageSize.A5) {
            pageWidthMm.value = 148;
            pageHeightMm.value = 210;
        }
    });

    // Generating watch errors that may result from configuration changes
    // Specific errors are handled in the input field(s)
    // If the page margin appears too small it may not print correctly
    watch([gridStartX, gridStartY], () => {
        if (gridStartX.value < 5 || gridStartY.value < 5) {
            addError(BoardError.PAGE_MARGIN_TOO_SMALL);
        } else {
            removeError(BoardError.PAGE_MARGIN_TOO_SMALL);
        }
    });

    // If the marker margin is too small markers may not be detected
    watch([markerMarginMm, markerSizeMm], () => {
        const markerMarginRatio = (markerSizeMm.value - markerMarginMm.value) / markerSizeMm.value;
        console.log('ratio: ' + markerMarginRatio);
        if (markerMarginRatio > 0.8) {
            addError(BoardError.MARKER_MARGIN_TOO_LARGE);
        } else {
            removeError(BoardError.MARKER_MARGIN_TOO_LARGE);
        }
        if (markerMarginRatio < 0.7) {
            addError(BoardError.MARKER_MARGIN_TOO_SMALL);
        } else {
            removeError(BoardError.MARKER_MARGIN_TOO_SMALL);
        }
    });
    watch(markerSizeMm, () => {
        if (markerSizeMm.value < 10) {
            addError(BoardError.MARKER_TOO_SMALL);
        } else {
            removeError(BoardError.MARKER_TOO_SMALL);
        }
    });
    watch([nRows, nCols], () => {
        if (nRows.value < 2 || nCols.value < 2) {
            addError(BoardError.GRID_TOO_SMALL);
        } else {
            removeError(BoardError.GRID_TOO_SMALL);
        }
    });
    watch([nRows, nCols, maxMarkerCount], () => {
        if (nMarkers.value > maxMarkerCount.value) {
            addError(BoardError.MARKER_NOT_ENOUGH);
        } else {
            removeError(BoardError.MARKER_NOT_ENOUGH);
        }
    });

    // Output
    return {
        // States
        pageSize,
        pageWidthMm,
        pageHeightMm,
        pageMargin,
        pageMarginUnit,
        markerSizeMm,
        markerMargin,
        markerMarginUnit,
        markerSet,
        outputParameters,
        boardErrors,
        // Computed
        markerMarginMm,
        pageMarginMm,
        nRows,
        nCols,
        nMarkers,
        gridWidthMm,
        gridHeightMm,
        maxMarkerCount,
        markerTrueSizeMm,
        markerBitsWidth,
        markerBitsHeight,
        outputParameterString,
        gridStartX,
        gridStartY,
        outputSvgName,
        urlParams,
        // Methods
        resetToDefaults,
        addError,
        removeError,
        resetErrors,
        setFromUrlParams,
    }
}