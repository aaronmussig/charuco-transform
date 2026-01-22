<script lang="ts" setup>
import {Unit, UNIT_OPTIONS, useBoard} from "~/composables/board";
import {useProcessor} from "~/composables/processor";
import {useNumericInput} from "~/composables/form";

const processor = useProcessor();
const nUploadedFiles = processor.nUploadedFiles;

const boardConfig = useBoard();
const markerMargin = boardConfig.markerMargin;
const markerMarginUnit = boardConfig.markerMarginUnit;
const markerSizeMm = boardConfig.markerSizeMm;

const validationFn = (value: number): boolean => {
  if (value < 0) {
    return false;
  }
  // If the margin results in markers being too small
  if (markerMarginUnit.value === Unit.MM) {
    if (markerSizeMm.value - (2 * value) <= 0) {
      return false;
    }
  } else if (value >= 50) {
    isValid.value = false;
    return false;
  }
  return true;
}

const numericInput = useNumericInput(markerMargin, validationFn);

const isValid = numericInput.isValid;
const inputForm = numericInput.inputForm;
const maybeReset = numericInput.maybeReset;
</script>

<template>
  <UFieldGroup class="w-full">
    <UBadge class="fieldGroupBadge" color="neutral" label="Marker margin" size="lg" variant="outline"/>
    <UInput
        v-model="inputForm"
        :color="isValid ? 'primary' : 'error'"
        :disabled="nUploadedFiles > 0"
        :highlight="!isValid"
        type="number"
        @blur="maybeReset"
    />
    <USelect
        v-model="markerMarginUnit"
        :disabled="nUploadedFiles > 0"
        :items="UNIT_OPTIONS"
        class="min-w-20"
    />
  </UFieldGroup>
</template>

<style scoped>

</style>