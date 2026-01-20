<script lang="ts" setup>
import {Unit, useBoard} from "~/composables/board";
import {isNumber} from "~/assets/ts/common";
import type {SelectItem} from "@nuxt/ui";
import {useProcessor} from "~/composables/processor";

const processor = useProcessor();
const nUploadedFiles = processor.nUploadedFiles;

const boardConfig = useBoard();
const markerMargin = boardConfig.markerMargin;
const markerMarginUnit = boardConfig.markerMarginUnit;

const markerSizeMm = boardConfig.markerSizeMm;

const inputForm = ref(markerMargin.value);
const isValid = ref(true);

const items: SelectItem[] = ref([
  {label: 'mm', value: Unit.MM},
  {label: '%', value: Unit.PCT}
]);

// If the model changes externally, update the value
watch(markerMargin, (newValue) => {
  inputForm.value = newValue;
});

// Validate that the value is a number
watch(inputForm, (newValue: string) => {
  // Check if its a number
  if (!isNumber(newValue)) {
    isValid.value = false;
    return;
  }
  // Cast to a number
  const cast = Number(newValue);

  // Check if less than zero
  if (cast < 0) {
    isValid.value = false;
    return;
  }

  // If the margin results in markers being too small
  if (markerMarginUnit.value === Unit.MM) {
    if (markerSizeMm.value - (2 * cast) <= 0) {
      isValid.value = false;
      return;
    }
  } else {
    if (cast >= 50) {
      isValid.value = false;
      return;
    }
  }

  // All good
  markerMargin.value = cast
  isValid.value = true;
});

function maybeReset() {
  if (!isValid.value) {
    inputForm.value = markerMargin.value;
    isValid.value = true;
  }
}
</script>

<template>
  <UFieldGroup class="w-full">
    <UBadge color="neutral" label="Marker margin" size="lg" variant="outline" class="fieldGroupBadge" />
    <UInput
        v-model="inputForm"
        :color="isValid ? 'primary' : 'error'"
        :highlight="!isValid"
        type="number"
        @blur="maybeReset"
        :disabled="nUploadedFiles > 0"
    />
    <USelect
        v-model="markerMarginUnit"
        :items="items"
        class="min-w-20"
        :disabled="nUploadedFiles > 0"
    />
  </UFieldGroup>
</template>

<style scoped>

</style>