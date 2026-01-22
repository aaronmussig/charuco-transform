<script lang="ts" setup>
import {useBoard} from "~/composables/board";
import {calculateNativePxPerMm, selectOpenCvMarkers} from "~/assets/ts/opencv";
import {useProcessor} from "~/composables/processor";

const {isReady, cv} = useOpenCV();

const boardConfig = useBoard();
const processor = useProcessor();


const pageWidth = boardConfig.pageWidthMm;
const pageHeight = boardConfig.pageHeightMm;
const pageMargin = boardConfig.pageMarginMm;
const markerSize = boardConfig.markerSizeMm;
const markerSet = boardConfig.markerSet;
const nCols = boardConfig.nCols;
const nRows = boardConfig.nRows;
const nMarkers = boardConfig.nMarkers;
const markerTrueSize = boardConfig.markerTrueSizeMm;

const uploadedFiles = processor.uploadedFiles;

// const showCvMarkerOutput = useShowCvMarkerOutput();

const canvasRef = ref();

const processedImages = ref<string[]>([]);

const showDebugInfo = ref(true);

async function processLogic() {

  console.log('process files');

  // Load OpenCV
  const opencv = cv()
  if (!opencv) {
    // TODO: Handle error.
    console.error('OpenCV is not ready yet.');
    return;
  }

  // Convert the marker set into the expected enum value
  console.log('Getting marker set')
  const openCvMarkerSet = selectOpenCvMarkers(opencv, markerSet.value, nMarkers.value);
  if (openCvMarkerSet === null) {
    console.error('Invalid marker set selected.');
    return;
  }
  console.log('Set dictionary')
  const dictionary = opencv.getPredefinedDictionary(openCvMarkerSet);

  // TODO: Memory management
  console.log('Creating board')
  const board = new opencv.aruco_CharucoBoard(
      {width: nCols.value, height: nRows.value},
      markerSize.value,
      markerTrueSize.value,
      dictionary,
      new opencv.Mat()
  );

  // create the detector
  console.log('Creating detector')
  const minRepDistance = 10.0;
  const errorCorrectionRate = 3.0;
  const checkAllOrders = true;

  const charucoParams = new opencv.aruco_CharucoParameters();
  const detectorParams = new opencv.aruco_DetectorParameters();

  // https://docs.opencv.org/4.x/d›5/d09/structcv_1_1aruco_1_1RefineParameters.html
  const refineParams = new opencv.aruco_RefineParameters(minRepDistance, errorCorrectionRate, checkAllOrders);
  const detector = new opencv.aruco_CharucoDetector(board, charucoParams, detectorParams, refineParams);


  for (const file of uploadedFiles.value) {

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      // 1. Safety Check: Ensure image has dimensions
      if (img.width === 0 || img.height === 0) {
        console.error("Image has no dimensions.")
        return
      }

      try {
        // 2. Use a temporary canvas to bypass browser decoding quirks
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = img.width
        tempCanvas.height = img.height
        const ctx = tempCanvas.getContext('2d')

        if (!ctx) throw new Error("Could not get canvas context")
        ctx.drawImage(img, 0, 0)

        // 3. Read from the canvas instead of the <img> tag
        const srcImage = opencv.imread(tempCanvas)
        const dstImage = new opencv.Mat()

        // Convert image
        // https://docs.opencv.org/3.4/d8/d01/group__imgproc__color__conversions.html
        opencv.cvtColor(srcImage, dstImage, opencv.COLOR_BGRA2BGR)

        const charucoCorners = new opencv.Mat();
        const charucoIds = new opencv.Mat();
        const markerCorners = new opencv.MatVector();
        const markerIds = new opencv.Mat();

        // https://docs.opencv.org/4.13.0/d9/df5/classcv_1_1aruco_1_1CharucoDetector.html#aacbea601612a3a0feaa45ebb7fb255fd
        detector.detectBoard(dstImage, charucoCorners, charucoIds, markerCorners, markerIds)

        // If debugging, show the detected IDs and corners
        if (showDebugInfo.value) {
          const colour = new opencv.Scalar(255, 100, 0);

          // https://docs.opencv.org/4.x/de/d67/group__objdetect__aruco.html#ga2ad34b0f277edebb6a132d3069ed2909
          opencv.drawDetectedMarkers(dstImage, markerCorners, markerIds, colour);

          // https://docs.opencv.org/4.x/de/d67/group__objdetect__aruco.html#ga7225eee644190f791e1583c499b7ab10
          opencv.drawDetectedCornersCharuco(dstImage, charucoCorners, charucoIds, colour);
        }

        // Only do it if we have data
        if (charucoCorners.rows >= 4) {

          const pxPerMm = calculateNativePxPerMm(charucoIds, charucoCorners, markerSize.value);
          console.log(`Detected marker size in pixels: ${pxPerMm}px per mm`);

          // 1. Determine Output Dimensions
          const scale = 100; // Pixels per board unit
          // const outW = (nCols.value ) * scale;
          // const outH = (nRows.value ) * scale;

          // use this to keep page margins
          // const dpiScale = 3.78; // px per mm (approx 96 DPI)
          const outW = Math.round(nCols.value * markerSize.value * pxPerMm);
          const outH = Math.round(nRows.value * markerSize.value * pxPerMm);
          console.log(`Output dimensions: ${outW} x ${outH}`);

          // 2. Map detected IDs to their Ideal 2D grid positions
          // Corner ID 0 is (0,0), ID (nCols-2) is Top Right, etc.
          let srcPointsArray = [];
          let dstPointsArray = [];

          // We iterate through detected IDs and map them to their theoretical X,Y
          for (let i = 0; i < charucoIds.rows; i++) {
            const id = charucoIds.data32S[i];
            const row = Math.floor(id / (nCols.value - 1));
            const col = id % (nCols.value - 1);

            // Source: The pixel coordinates detected by OpenCV
            srcPointsArray.push(charucoCorners.data32F[i * 2], charucoCorners.data32F[i * 2 + 1]);

            // // Destination: The "perfect" coordinates in our new image
            // dstPointsArray.push(col * scale, row * scale);
            // dstPointsArray.push((col + 1) * scale, (row + 1) * scale);

            // or use below to keep page margins

            // Destination: Physical location on page (in mm) converted to pixels
            // Intersection (0,0) is at (Margin + 1st Marker Width, Margin + 1st Marker Height)
            // const physicalX_mm = pageMargin.value + ((col + 1) * markerSize.value);
            // const physicalY_mm = pageMargin.value + ((row + 1) * markerSize.value);
            // dstPointsArray.push(physicalX_mm * pxPerMm, physicalY_mm * pxPerMm);
            //
            // dstPointsArray.push(physicalX_mm * dpiScale, physicalY_mm * dpiScale);

            // Destination: Map to the grid.
            // Corner ID 0 is the intersection of the first and second square.
            // Therefore, its coordinate is (1 * markerSize, 1 * markerSize).
            const gridX_mm = (col + 1) * markerSize.value;
            const gridY_mm = (row + 1) * markerSize.value;

            dstPointsArray.push(gridX_mm * pxPerMm, gridY_mm * pxPerMm);

          }

          console.log('the pts array src')
          console.log(srcPointsArray);

          console.log('the pts array dst')
          console.log(dstPointsArray);

          // 3. Create Mats for FindHomography
          const srcMat = opencv.matFromArray(charucoIds.rows, 1, opencv.CV_32FC2, srcPointsArray);
          const dstMat = opencv.matFromArray(charucoIds.rows, 1, opencv.CV_32FC2, dstPointsArray);
          console.log('matricies made')

          // 4. Calculate Homography
          const mask = new opencv.Mat();
          // https://docs.opencv.org/4.x/d9/d0c/group__calib3d.html#ga4abc2ece9fab9398f2e560d53c8c9780
          const H = opencv.findHomography(srcMat, dstMat, opencv.RANSAC, 3, mask);
          console.log('homography found');

          // 5. Warp the Image
          const flattened = new opencv.Mat();
          const dsize = new opencv.Size(outW, outH);
          opencv.warpPerspective(dstImage, flattened, H, dsize, opencv.INTER_LINEAR, opencv.BORDER_CONSTANT, new opencv.Scalar());

          // Display warped result
          // opencv.imshow(canvasRef.value, flattened);
          const outCanvas = document.createElement('canvas');
          opencv.imshow(outCanvas, flattened);

          // Convert Canvas to Blob
          outCanvas.toBlob((blob) => {
            if (blob) {
              // Create a local URL pointing to the Blob object in memory
              const url = URL.createObjectURL(blob);
              processedImages.value.push(url);
            }
          }, 'image/png');

          // Cleanup from this loop
          H.delete();
          charucoCorners.delete();
          charucoIds.delete();
          markerCorners.delete();
          markerIds.delete();
          srcMat.delete();
          dstMat.delete();
          mask.delete();
          flattened.delete();

        }

        // 4. Cleanup
        srcImage.delete();
        dstImage.delete();
        // mask.delete();
        // flattened.delete();


      } catch (err) {
        console.error("OpenCV Error:", err)
      } finally {
        URL.revokeObjectURL(img.src)
      }
    }
    //
    // console.log(img);
    //
    // console.log('Processing file:', file.name);
    // const src = opencv.imread(img);
    // console.log('Image size:', src.cols, 'x', src.rows);
    // // Add your file processing logic here
    //
    // // Cleanup
    // src.delete()


  }


  // const boardImage = new opencv.Mat();
  //
  // // Convert the page dimensions from mm to pixels
  // const pageWidthPx = Math.round((pageWidth.value / 25.4) * 72);
  // const pageHeightPx = Math.round((pageHeight.value / 25.4) * 72);
  // const marginPx = Math.round((pageMargin.value / 25.4) * 72);
  //
  //
  // // https://docs.opencv.org/4.x/d4/db2/classcv_1_1aruco_1_1Board.html#a25b6823cad11256f1043bfd0e51b7c14
  // board.generateImage({width: pageWidthPx, height: pageHeightPx}, boardImage, marginPx, 1);
  // opencv.imshow(canvasRef.value, boardImage);

}


async function processFiles() {

  if (uploadedFiles.value) {
    await processLogic();
  }
}

async function generateCharuco() {

  console.log('generate');

  // Load OpenCV
  const opencv = cv()
  if (!opencv) {
    // TODO: Handle error.
    console.error('OpenCV is not ready yet.');
    return;
  }
  console.log(opencv.aruco_CharucoBoard);

  // Convert the marker set into the expected enum value
  const openCvMarkerSet = selectOpenCvMarkers(opencv, markerSet.value, nMarkers.value);
  if (openCvMarkerSet === null) {
    console.error('Invalid marker set selected.');
    return;
  }

  const dictionary = opencv.getPredefinedDictionary(openCvMarkerSet);


  console.log(dictionary);
  console.log('dict ^^')

  // TODO: Memory management

  const defunct = new opencv.Mat();
  const boardSize = {width: nCols.value, height: nRows.value};
  const board = new opencv.aruco_CharucoBoard(boardSize, markerSize.value, markerTrueSize, dictionary, defunct);

  const boardImage = new opencv.Mat();

  // Convert the page dimensions from mm to pixels
  const pageWidthPx = Math.round((pageWidth.value / 25.4) * 72);
  const pageHeightPx = Math.round((pageHeight.value / 25.4) * 72);
  const marginPx = Math.round((pageMargin.value / 25.4) * 72);


  // https://docs.opencv.org/4.x/d4/db2/classcv_1_1aruco_1_1Board.html#a25b6823cad11256f1043bfd0e51b7c14
  board.generateImage({width: pageWidthPx, height: pageHeightPx}, boardImage, marginPx, 1);
  opencv.imshow(canvasRef.value, boardImage);

}

</script>

<template>
  <div>
    <UFileUpload
        v-model="uploadedFiles"
        accept="image/*"
        class="w-full min-h-40"
        description="PNG, JPG or GIF."
        icon="i-lucide-image"
        label="Drop your image here"
        multiple
        size="xl"
    />

<!--    <UButton-->
<!--        type="button"-->
<!--        icon="i-lucide-settings"-->
<!--        label="Upload files"-->
<!--        class="w-full justify-center mt-10"-->
<!--        @click="processFiles"-->
<!--    />-->

    <template v-for="img in processedImages" :key="img">
      <img :src="img"/>
    </template>

    <canvas ref="canvasRef"></canvas>

  </div>
</template>

<style scoped>

</style>