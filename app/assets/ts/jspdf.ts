import {jsPDF} from "jspdf";
import 'svg2pdf.js';

export function convertSvgToPdf(width: number, height: number, svgEle: Element, fileName: string) {

    const doc = new jsPDF({
        unit: "mm",
        format: [height, width],
        compress: false,
        putOnlyUsedFonts: false,
    });

    doc.svg(svgEle, {x: 0, y: 0, width, height})
        .then(() => {
            doc.save(fileName)
        });
}
