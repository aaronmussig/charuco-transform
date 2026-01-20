<script lang="ts" setup>
import {Unit, useBoard, BoardError} from "~/composables/board";
import {isNumber} from "~/assets/ts/common";
import type {SelectItem} from "@nuxt/ui";
import {useProcessor} from "~/composables/processor";

const boardConfig = useBoard();
const pageMargin = boardConfig.pageMargin;
const pageMarginUnit = boardConfig.pageMarginUnit;
const pageWidthMm = boardConfig.pageWidthMm;
const pageHeightMm = boardConfig.pageHeightMm;

const processor = useProcessor();
const nUploadedFiles = processor.nUploadedFiles;

const inputForm = ref(pageMargin.value);
const isValid = ref(true);

const items: SelectItem[] = ref([
  {label: 'mm', value: Unit.MM},
  {label: '%', value: Unit.PCT}
]);

// If the model changes externally, update the value
watch(pageMargin, (v) => {
  inputForm.value = v;
});

// Validate that the value is a number
watch(inputForm, (v: string) => {
  // Not a number
  if (!isNumber(v)) {
    isValid.value = false;
    return;
  }
  // Convert to number
  const cast = Number(v);

  // Do not allow less than 0
  if (cast < 0) {
    isValid.value = false;
    return;
  }

  // Do not allow margins larger than page size
  if (pageMarginUnit.value === Unit.MM) {
    if (cast * 2 >= pageWidthMm.value || cast * 2 >= pageHeightMm.value) {
      isValid.value = false;
      return;
    }
  } else {
    if (cast >= 50) {
      isValid.value = false;
      return;
    }
  }

  // All good, set the value
  pageMargin.value = cast
  isValid.value = true;
});

function maybeReset() {
  if (!isValid.value) {
    inputForm.value = pageMargin.value;
    isValid.value = true;
  }
}
</script>

<template>
  <UFieldGroup class="w-full">
    <UBadge color="neutral" label="Page margin" size="lg" variant="outline" class="fieldGroupBadge" />
    <UInput
        v-model="inputForm"
        :color="isValid ? 'primary' : 'error'"
        :highlight="!isValid"
        type="number"
        @blur="maybeReset"
        :disabled="nUploadedFiles > 0"
    />
    <USelect
        v-model="pageMarginUnit"
        :items="items"
        class="min-w-20"
        :disabled="nUploadedFiles > 0"
    />
  </UFieldGroup>
</template>

<style scoped>

</style>