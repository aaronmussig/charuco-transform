<script lang="ts" setup>
import {generatePixelArrayFromBits, generateSvgBlackRect, generateSvgFromPixelArray} from "~/assets/ts/marker";
import markerData from '~/assets/data/markers.json'
import {BoardError, useBoard} from "~/composables/board";
import {convertSvgToPdf} from "~/assets/ts/jspdf";

const svgContainer = ref<HTMLElement | null>(null);

// Extract the parameters from the state
const boardConfig = useBoard();
const nRows = boardConfig.nRows;
const nCols = boardConfig.nCols;
const markerSizeMm = boardConfig.markerSizeMm;
const pageWidthMm = boardConfig.pageWidthMm;
const pageHeightMm = boardConfig.pageHeightMm;
const pageMarginMm = boardConfig.pageMarginMm;
const markerMarginMm = boardConfig.markerMarginMm;
const markerSetVal = boardConfig.markerSet;
const outputParams = boardConfig.outputParameters;
const outputParameterString = boardConfig.outputParameterString;
const maxMarkers = boardConfig.maxMarkerCount;
const markerBitsHeight = boardConfig.markerBitsHeight;
const markerBitsWidth = boardConfig.markerBitsWidth;
const gridStartY = boardConfig.gridStartY;
const gridStartX = boardConfig.gridStartX;
const outputSvgName = boardConfig.outputSvgName;

const addError = boardConfig.addError;
const removeError = boardConfig.removeError;

// Generate the grid when any of the parameters change
watch([markerSizeMm, pageWidthMm, pageHeightMm, pageMarginMm, markerMarginMm, markerSetVal, outputParams], () => {
  generateGrid();
});


async function generateGrid() {

  // Abort if the SVG container is not present
  if (!svgContainer.value) {
    console.log("SVG container not present.");
    addError(BoardError.SVG_CONTAINER_MISSING);
    return;
  } else {
    removeError(BoardError.SVG_CONTAINER_MISSING);
  }

  // Create the SVG element
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${pageWidthMm.value} ${pageHeightMm.value}`);
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('shape-rendering', 'crispEdges');
  svg.setAttribute('width', '100%');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.setAttribute('style', 'background-color: white;');

  // Compute the grid start position to center it on the page
  const markerScale = (markerSizeMm.value - markerMarginMm.value * 2) / (markerBitsWidth.value + 2);

  // Create each of the grids
  let markerId = 0;
  for (let rowId = 0; rowId < nRows.value; rowId++) {
    for (let colId = 0; colId < nCols.value; colId++) {

      // Compute the top left coordinate for this marker.
      // We want to make sure that it is equidistant from the page margins
      const topLeftX = colId * markerSizeMm.value + gridStartX.value;
      const topLeftY = rowId * markerSizeMm.value + gridStartY.value;

      // Create black square
      if ((rowId % 2 === 0 && colId % 2 === 0) || (rowId % 2 === 1 && colId % 2 === 1)) {
        svg.appendChild(generateSvgBlackRect(topLeftX, topLeftY, markerSizeMm.value, markerSizeMm.value));
      }

      // Create marker
      else {

        // Do not create the marker if it would exceed the number of markers available
        if (markerId >= maxMarkers.value) {
          continue;
        }

        // Adjust the topLeftX and topLeftY value to account for the margin
        const adjustedTopLeftX = topLeftX + markerMarginMm.value;
        const adjustedTopLeftY = topLeftY + markerMarginMm.value;

        const markerBits = markerData[markerSetVal.value][markerId];
        const pixelArr = generatePixelArrayFromBits(markerBits, markerBitsHeight.value, markerBitsWidth.value);
        const svgElements = generateSvgFromPixelArray(
            pixelArr, markerBitsHeight.value, markerBitsWidth.value, adjustedTopLeftX, adjustedTopLeftY, markerScale
        );
        for (const ele of svgElements) {
          svg.appendChild(ele);
        }
        markerId++;
      }
    }
  }

  // Write the parameters within the largest possible margin
  if (outputParams.value) {
    const textEle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textEle.setAttribute('text-anchor', 'middle');
    textEle.setAttribute('fill', 'red');
    textEle.textContent = outputParameterString.value;

    // Write at the bottom
    if (pageHeightMm.value >= pageWidthMm.value) {
      const maxFontWidth = pageWidthMm.value - pageMarginMm.value * 2;
      const fontSize = Math.min(maxFontWidth / (outputParameterString.value.length * 0.8), 8);
      textEle.setAttribute('font-size', `${fontSize}pt`);

      textEle.setAttribute('x', `${pageWidthMm.value / 2}`);
      textEle.setAttribute('y', `${pageHeightMm.value - pageMarginMm.value}`);
    }
    // Write at the side
    else {
      const maxFontWidth = pageHeightMm.value - pageMarginMm.value * 2;
      const fontSize = Math.min(maxFontWidth / (outputParameterString.value.length * 0.8), 8);
      textEle.setAttribute('font-size', `${fontSize}pt`);

      textEle.setAttribute('x', `${pageWidthMm.value - pageMarginMm.value}`);
      textEle.setAttribute('y', `${pageHeightMm.value / 2}`);
      textEle.setAttribute('transform', `rotate(-90, ${pageWidthMm.value - pageMarginMm.value / 2}, ${pageHeightMm.value / 2})`);
    }
    svg.appendChild(textEle);
  }

  // Finally, add the SVG to the container
  svgContainer.value.innerHTML = svg.outerHTML;
}

function downloadPdf() {
  if (!svgContainer.value) {
    return;
  }
  const svgData = svgContainer.value.innerHTML;

  // Inject the correct height and width attributes (using a copy)
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgData, 'image/svg+xml');
  const svgDataElem = doc.getElementsByTagName('svg')[0];
  if (!svgDataElem) {
    return;
  }
  svgDataElem.setAttribute('height', `${pageHeightMm.value}mm`);
  svgDataElem.setAttribute('width', `${pageWidthMm.value}mm`);
  convertSvgToPdf(pageWidthMm.value, pageHeightMm.value, svgDataElem, `${outputSvgName.value}.pdf`);
}


function downloadSvg() {
  if (!svgContainer.value) {
    return;
  }
  const svgData = svgContainer.value.innerHTML;

  // Inject the correct height and width attributes
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgData, 'image/svg+xml');
  const svgDataElem = doc.getElementsByTagName('svg')[0];
  if (!svgDataElem) {
    return;
  }
  svgDataElem.setAttribute('height', `${pageHeightMm.value}mm`);
  svgDataElem.setAttribute('width', `${pageWidthMm.value}mm`);

  const serializer = new XMLSerializer();
  const finalSvgData = serializer.serializeToString(svgDataElem);

  const blob = new Blob([finalSvgData], {type: 'image/svg+xml'});
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${outputSvgName.value}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

onMounted(() => {
  generateGrid();
});

</script>

<template>
  <div class="max-w-72">

    <div class="max-h-[50vh] overflow-scroll">
      <div
          ref="svgContainer"
          class="mx-auto"
      ></div>
    </div>

    <div class="flex">
      <UButton
          class="hover:cursor-pointer ml-auto mr-0 w-full justify-center rounded-tl-none rounded-tr-none"
          icon="i-lucide-download"
          label="Download"
          @click="downloadPdf"
      />
    </div>

  </div>

</template>

<style scoped>
</style>