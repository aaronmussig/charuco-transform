<script lang="ts" setup>
import {useBoard} from "~/composables/board";
import {useProcessor} from "~/composables/processor";
import {useNumericInput} from "~/composables/form";

const boardConfig = useBoard();
const markerSize = boardConfig.markerSizeMm;
const boardWidthMm = boardConfig.pageWidthMm;
const boardHeightMm = boardConfig.pageHeightMm;

const processor = useProcessor();
const nUploadedFiles = processor.nUploadedFiles;

const validationFn = (value: number): boolean => {
  if (value <= 0) {
    return false;
  }
  // Check if too large
  if (value * 2 >= boardWidthMm.value || value * 2 >= boardHeightMm.value) {
    return false;
  }
  return true;
}

const numericInput = useNumericInput(markerSize, validationFn);

const isValid = numericInput.isValid;
const inputForm = numericInput.inputForm;
const maybeReset = numericInput.maybeReset;
</script>

<template>
  <UFieldGroup>
    <UBadge class="fieldGroupBadge" color="neutral" label="Marker size" size="lg" variant="outline"/>
    <UInput
        v-model="inputForm"
        :color="isValid ? 'primary' : 'error'"
        :disabled="nUploadedFiles > 0"
        :highlight="!isValid"
        type="number"
        @blur="maybeReset"
    />
    <UBadge class="min-w-20" color="neutral" label="mm" size="lg" variant="outline"/>
  </UFieldGroup>
</template>

<style scoped>

</style>