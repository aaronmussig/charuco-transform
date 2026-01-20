<script lang="ts" setup>
import PageSetup from "~/components/PageSetup.vue";
import PagePreview from "~/components/PagePreview.vue";
import ImageProcessor from "~/components/ImageProcessor.vue";
import {useBoard} from "~/composables/board";
import OpenCvImage from "~/components/OpenCvImage.vue";
import {useProcessor} from "~/composables/processor";

const boardConfig = useBoard();
const processor = useProcessor();

const urlParams = boardConfig.urlParams;
const setFromUrlParams = boardConfig.setFromUrlParams;
const gridWidthMm = boardConfig.gridWidthMm;
const gridHeightMm = boardConfig.gridHeightMm;

const uploadedFiles = processor.uploadedFiles;
const nUploadedFiles = processor.nUploadedFiles;
const downloadFilesAsZip = processor.downloadProcessedFilesAsZip;

const isDownloading = ref(false);
async function downloadProcessedFiles() {
  isDownloading.value = true;
  try {
    await downloadFilesAsZip();
  } finally {
    isDownloading.value = false;
  }
}

// Update the URL as parameters change
watch(urlParams, (newParams) => {
  const queryString = new URLSearchParams(newParams).toString();
  const newUrl = `${window.location.pathname}?${queryString}`;
  window.history.replaceState({}, '', newUrl);
}, {deep: true});

// On component mount, read URL parameters and set board configuration
onMounted(() => {
  const urlSearchParams = new URLSearchParams(window.location.search);
  setFromUrlParams(urlSearchParams);
});

</script>

<template>
  <UContainer class="py-10">

    <!-- First row -->
    <div>
      <h1 class="mb-4 theme-h1">ChArUco Board Generator & Correction</h1>
    </div>

    <!-- Second row -->
    <div class="flex gap-10 mt-10">

      <!-- Left -->
      <UCard
          class="w-2/3"
          variant="subtle"
      >
        <template #header>
          <h2 class="theme-h2">
            1. Generate ChArUco Board
          </h2>
        </template>

        <div class="flex gap-5">
          <PageSetup class="w-1/2"/>
          <PagePreview class="w-1/2"/>
        </div>


      </UCard>

      <!-- Right -->
      <UCard
          class="w-1/3 "
          variant="subtle"
      >
        <template #header>
          <h2 class="theme-h2">
            2. Upload board photos
          </h2>
        </template>

        <ImageProcessor/>
      </UCard>

    </div>

    <!-- Third row -->
    <div v-if="nUploadedFiles > 0">

      <UCard
          class="mt-10"
          variant="subtle"
      >
        <template #header>
          <div class="flex">
            <h2 class="theme-h2">
              3. Download results
            </h2>
            <UButton
                class="ml-auto mr-0"
                label="Download images"
                color="primary"
                icon="i-lucide-download-cloud"
                :loading="isDownloading"
                :disabled="isDownloading"
                @click="downloadProcessedFiles"
            />
          </div>
        </template>

        <div class="mb-5 text-sm">
          Resulting images have been cropped to a width of {{ gridWidthMm }}mm, and height of {{ gridHeightMm }}mm around the detected board.
        </div>

        <template v-for="(_, index) in uploadedFiles" :key="index">
          <OpenCvImage
              :index="index"
          />
          <USeparator v-if="index + 1 < nUploadedFiles" class="my-5"/>
        </template>

      </UCard>
    </div>


  </UContainer>
</template>

<style scoped>

</style>