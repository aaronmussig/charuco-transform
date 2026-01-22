<script lang="ts" setup>
import {useBoard} from "~/composables/board";
import {
  calculateNativePxPerMm,
  convertOpenCvImgToBlob,
  createOpenCvMatMapsFromChArUcoDetection,
  readFileToOpenCv,
  selectOpenCvMarkers
} from "~/assets/ts/opencv";
import MinRepDist from "~/components/cvform/MinRepDist.vue";
import ErrCorrectRate from "~/components/cvform/ErrCorrectRate.vue";
import CheckAllOrdersForm from "~/components/cvform/CheckAllOrdersForm.vue";
import {useProcessor} from "~/composables/processor";

const props = defineProps({
  index: {
    type: Number,
    required: true
  }
});

const {isReady, cv} = useOpenCV();

const boardConfig = useBoard();
const processor = useProcessor();
const uploadedFiles = processor.uploadedFiles;

const file = computed(() => uploadedFiles.value[props.index]);

const markerSize = boardConfig.markerSizeMm;
const markerSet = boardConfig.markerSet;
const nCols = boardConfig.nCols;
const nRows = boardConfig.nRows;
const nMarkers = boardConfig.nMarkers;
const markerTrueSize = boardConfig.markerTrueSizeMm;

const showDebugInfo = ref(false);
const processedImage = ref<string | null>(null);
const originalImage = ref<string | null>(null);
const isImageLoading = ref(false);

const minRepDistance = ref(10.0);
const errorCorrectionRate = ref(3.0);
const checkAllOrders = ref(true);

const allProcessedImages = processor.processedFiles;

const outputMessages = ref<string[]>([]);

// Re-add the processed image if present and uploadedFiles changes
watch(uploadedFiles, () => {
  if (processedImage.value != null) {
    allProcessedImages.value.set(props.index, processedImage.value);
  }
});

async function processImageWrapper() {
  try {
    isImageLoading.value = true;
    processedImage.value = null;
    outputMessages.value = [];
    allProcessedImages.value.delete(props.index);
    await processImage();
  } catch (e) {
    outputMessages.value.push(`${e}`);
    console.error(`Got error: ${e}`)
  } finally {
    isImageLoading.value = false;
  }
}

async function processImage() {

  // Abort if file is undefined
  if (file.value == null) {
    console.error('No file provided to process.');
    outputMessages.value.push('No file provided to process.');
    return;
  }

  // Load OpenCV
  const opencv = cv()
  if (!opencv || !isReady.value) {
    // TODO: Handle error.
    console.error('OpenCV is not ready yet.');
    outputMessages.value.push('Unable to load OpenCV.');
    return;
  }

  console.log('Creating OpenCV matrices');
  const boardTmpMat = new opencv.Mat();
  const dstImage = new opencv.Mat()
  const charucoCorners = new opencv.Mat();
  const charucoIds = new opencv.Mat();
  const markerCorners = new opencv.MatVector();
  const markerIds = new opencv.Mat();
  const mask = new opencv.Mat();
  const flattened = new opencv.Mat();

  try {

    // Convert the marker set into the expected enum value
    console.log('Getting marker set')
    const openCvMarkerSet = selectOpenCvMarkers(opencv, markerSet.value, nMarkers.value);
    if (openCvMarkerSet === null) {
      outputMessages.value.push('Invalid marker set detected.');
      console.error('Invalid marker set selected.');
      return;
    }
    console.log('Set dictionary')
    const dictionary = opencv.getPredefinedDictionary(openCvMarkerSet);

    console.log('Creating board')
    const board = new opencv.aruco_CharucoBoard(
        {width: nCols.value, height: nRows.value},
        markerSize.value,
        markerTrueSize.value,
        dictionary,
        boardTmpMat
    );

    // Read the uploaded file into an OpenCV Mat
    if (!await readFileToOpenCv(opencv, file.value, dstImage)) {
      console.error("Could not read file to OpenCV Mat")
      outputMessages.value.push('Unable to read file and convert to OpenCV matrix.');
      return
    }

    // create the detector
    console.log('Creating detector')

    // https://docs.opencv.org/4.13.0/df/d01/structcv_1_1aruco_1_1CharucoParameters.html
    const charucoParams = new opencv.aruco_CharucoParameters();

    // https://docs.opencv.org/4.13.0/d1/dcd/structcv_1_1aruco_1_1DetectorParameters.html
    const detectorParams = new opencv.aruco_DetectorParameters();

    // https://docs.opencv.org/4.13.0/d5/d09/structcv_1_1aruco_1_1RefineParameters.html
    const refineParams = new opencv.aruco_RefineParameters(minRepDistance.value, errorCorrectionRate.value, checkAllOrders.value);

    // https://docs.opencv.org/4.13.0/d9/df5/classcv_1_1aruco_1_1CharucoDetector.html
    const detector = new opencv.aruco_CharucoDetector(board, charucoParams, detectorParams, refineParams);

    // https://docs.opencv.org/4.13.0/d9/df5/classcv_1_1aruco_1_1CharucoDetector.html#aacbea601612a3a0feaa45ebb7fb255fd
    console.log('Detecting board')
    detector.detectBoard(dstImage, charucoCorners, charucoIds, markerCorners, markerIds)

    // If debugging, show the detected IDs and corners
    if (showDebugInfo.value) {
      const colour = new opencv.Scalar(255, 100, 0);

      // https://docs.opencv.org/4.x/de/d67/group__objdetect__aruco.html#ga2ad34b0f277edebb6a132d3069ed2909
      console.log('Drawing detected markers')
      opencv.drawDetectedMarkers(dstImage, markerCorners, markerIds, colour);

      // https://docs.opencv.org/4.x/de/d67/group__objdetect__aruco.html#ga7225eee644190f791e1583c499b7ab10
      console.log('Drawing detected charuco corners')
      opencv.drawDetectedCornersCharuco(dstImage, charucoCorners, charucoIds, colour);
    }

    // Only do it if we have data
    if (charucoCorners.rows >= 4) {

      console.log('We have enough rows')

      const pxPerMm = Math.ceil(calculateNativePxPerMm(charucoIds, charucoCorners, markerSize.value));

      console.log(`Detected marker size in pixels: ${pxPerMm}px per mm`);

      const outW = nCols.value * markerSize.value * pxPerMm;
      const outH = nRows.value * markerSize.value * pxPerMm;
      console.log(`Output dimensions: ${outW} x ${outH}`);


      // Map detected IDs to their source position
      const [srcMat, dstMat] = createOpenCvMatMapsFromChArUcoDetection(
          opencv, charucoIds, charucoCorners, nCols.value, markerSize.value, pxPerMm
      );
      console.log('matricies made')

      try {

        // 4. Calculate Homography
        // https://docs.opencv.org/4.13.0/d9/d0c/group__calib3d.html#ga4abc2ece9fab9398f2e560d53c8c9780
        const H = opencv.findHomography(srcMat, dstMat, opencv.RANSAC, 3, mask);
        console.log('homography found');

        try {
          // 5. Warp the Image
          const dsize = new opencv.Size(outW, outH);
          // https://docs.opencv.org/4.13.0/da/d54/group__imgproc__transform.html#gaf73673a7e8e18ec6963e3774e6a94b87
          opencv.warpPerspective(dstImage, flattened, H, dsize, opencv.INTER_LINEAR, opencv.BORDER_CONSTANT, new opencv.Scalar());

          // Save the warped image
          processedImage.value = await convertOpenCvImgToBlob(opencv, flattened);

          // Check if its null
          if (processedImage.value == null) {
            outputMessages.value.push('Unable to convert processed image to displayable format.');
            console.error('Processed image conversion returned null.');
            return;
          } else {
            allProcessedImages.value.set(props.index, processedImage.value);
          }

          // Done.
        } finally {
          H.delete();
        }

      } finally {
        srcMat.delete();
        dstMat.delete();
      }

    }

    // Not enough corners
    else {
      outputMessages.value.push('Not enough corners detected to process image.');
    }

  } finally {
    boardTmpMat.delete();
    dstImage.delete();
    charucoCorners.delete();
    charucoIds.delete();
    markerCorners.delete();
    markerIds.delete();
    mask.delete();
    flattened.delete();
  }
}

onMounted(() => {
  // Check if file is defined
  if (file.value == null) {
    outputMessages.value.push('File was not defined, this is a software error!');
    return;
  }
  originalImage.value = URL.createObjectURL(file.value);
  processImageWrapper();
});

</script>

<template>
  <div class="flex gap-x-5 h-72 bg-slate-700 p-10 rounded-lg items-stretch w-full">

    <!-- First column -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="text-sm font-bold mb-2 truncate">
        {{ file?.name }}
      </div>

      <UModal v-if="originalImage != null">
        <UButton class="w-full h-full object-contain" color="neutral" label="Open" variant="ghost">
          <img
              :src="originalImage"
              alt="Original image."
              class="w-full h-full object-contain"
          />
        </UButton>
        <template #content>
          <img
              :src="originalImage"
              alt="Original image."
              class="w-full h-full object-contain"
          />
        </template>
      </UModal>
    </div>

    <USeparator
        icon="i-lucide-chevron-right"
        orientation="vertical"
    />

    <!-- Second column -->
    <div class="flex-1 flex flex-col justify-center px-2">

      <MinRepDist v-model="minRepDistance"/>
      <ErrCorrectRate v-model="errorCorrectionRate" class="mt-2"/>
      <CheckAllOrdersForm v-model="checkAllOrders" class="mt-2"/>
      <UCheckbox v-model="showDebugInfo" class="mt-2" label="Show detected markers"/>

      <UButton
          :disabled="isImageLoading"
          :loading="isImageLoading"
          class="w-full justify-center mt-5"
          icon="i-lucide-settings"
          label="Re-process"
          type="button"
          @click="processImageWrapper"
      />

    </div>

    <USeparator
        class="mx-auto"
        icon="i-lucide-chevron-right"
        orientation="vertical"
    />

    <!-- Third column -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- The processed image -->
      <UModal v-if="processedImage != null">
        <UButton class="w-full h-full object-contain" color="neutral" label="Open" variant="ghost">
          <img
              :src="processedImage"
              alt="Loading processed image..."
              class="w-full h-full object-contain"
          />
        </UButton>
        <template #content>
          <img
              :src="processedImage"
              alt="Loading processed image..."
              class="w-full h-full object-contain"
          />
        </template>
      </UModal>


      <!-- Loading indicator -->
      <USkeleton
          v-if="processedImage == null && isImageLoading"
          class="flex max-w-full w-full h-full max-h-full items-center justify-center hover:cursor-wait"
      >
        Loading...
      </USkeleton>

      <!-- Display any errors -->
      <UAlert
          v-if="outputMessages.length > 0"
          :ui="{icon: 'size-5'}"
          color="error"
          icon="i-lucide-triangle-alert"
          title="Errors detected"
          variant="subtle"
      >
        <template #description>
          <ul class="list-disc list-inside">
            <li v-for="(value, index) in outputMessages" :key="index">
              {{ value }}
            </li>
          </ul>
        </template>
      </UAlert>
    </div>


  </div>
</template>

<style scoped>

</style>