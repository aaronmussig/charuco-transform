<script lang="ts" setup>
import { useBoard} from "~/composables/board";
import {isNumber} from "~/assets/ts/common";
import {useProcessor} from "~/composables/processor";

const boardConfig = useBoard();
const markerSize = boardConfig.markerSizeMm;
const boardWidthMm = boardConfig.pageWidthMm;
const boardHeightMm = boardConfig.pageHeightMm;

const processor = useProcessor();
const nUploadedFiles = processor.nUploadedFiles;

const inputForm = ref(markerSize.value);
const isValid = ref(true);

// If the model changes externally, update the value
watch(markerSize, (newValue) => {
  inputForm.value = newValue;
});

// Validate that the value is a number
watch(inputForm, (v: string) => {
  // Check if it is a number
  if (!isNumber(v)) {
    isValid.value = false;
    return;
  }

  // Cast to a number
  const cast = Number(v);

  // Check if less than or equal to zero
  if (cast <= 0) {
    isValid.value = false;
    return;
  }

  // Check if too large
  if (cast * 2 >= boardWidthMm.value || cast * 2 >= boardHeightMm.value) {
    isValid.value = false;
    return;
  }

  // All good
  markerSize.value = cast
  isValid.value = true;
});

function maybeReset() {
  if (!isValid.value) {
    inputForm.value = markerSize.value;
    isValid.value = true;
  }
}
</script>

<template>
  <UFieldGroup>
    <UBadge color="neutral" label="Marker size" size="lg" variant="outline" class="fieldGroupBadge" />
    <UInput
        v-model="inputForm"
        :color="isValid ? 'primary' : 'error'"
        :highlight="!isValid"
        type="number"
        @blur="maybeReset"
        :disabled="nUploadedFiles > 0"
    />
    <UBadge color="neutral" label="mm" size="lg" variant="outline" class="min-w-20" />
  </UFieldGroup>
</template>

<style scoped>

</style>