import {jsPDF} from "jspdf";
import 'svg2pdf.js';

export function convertSvgToPdf(width: number, height: number, svgEle: HTMLElement, fileName: string) {

    const doc = new jsPDF({
        unit: "mm",
        format: [height, width],
        compressPdf: false,
        putOnlyUsedFonts: false,
    });

    doc.svg(svgEle, {x: 0, y: 0, width, height})
        .then(() => {
            doc.save(fileName)
        });
}
