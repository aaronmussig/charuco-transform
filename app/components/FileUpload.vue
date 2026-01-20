<script lang="ts" setup>

const {isReady, cv} = useOpenCV()

// TODO: use isReady

const value = ref(null as File[] | null);

async function processFiles() {

  // Load OpenCV
  const opencv = cv()
  if (!opencv) {
    // TODO: Handle error.
    console.error('OpenCV is not ready yet.');
    return;
  }

  if (value.value) {
    for (const file of value.value) {

      const img = new Image()
      img.src = URL.createObjectURL(file)

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
          const src = opencv.imread(tempCanvas)
          const dst = new opencv.Mat()

          // Convert to grayscale
          opencv.cvtColor(src, dst, opencv.COLOR_RGBA2GRAY)

          // Create the dictionary
          const dictionary = opencv.getPredefinedDictionary(opencv.DICT_4X4_100)




          // if (outputCanvas.value) {
          //   opencv.imshow(outputCanvas.value, dst)
          // }

          // 4. Cleanup
          src.delete()
          dst.delete()
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
  }
}

</script>

<template>
  <div>

    <div>

      <UFileUpload
          v-model="value"
          accept="image/*"
          class="w-96 min-h-48"
          description="PNG, JPG or GIF."
          icon="i-lucide-image"
          label="Drop your image here"
          multiple
          size="xl"
      />

    </div>

    <UButton
        color="neutral"
        icon="i-lucide-plus"
        variant="outline"
        @click="processFiles"
    >
      Process Files
    </UButton>

    <div>
      {{ value }}
    </div>
  </div>
</template>

<style scoped>

</style>