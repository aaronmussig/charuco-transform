<script lang="ts" setup>
import {Unit, UNIT_OPTIONS, useBoard} from "~/composables/board";
import {useProcessor} from "~/composables/processor";
import {useNumericInput} from "~/composables/form";

const boardConfig = useBoard();
const pageMargin = boardConfig.pageMargin;
const pageMarginUnit = boardConfig.pageMarginUnit;
const pageWidthMm = boardConfig.pageWidthMm;
const pageHeightMm = boardConfig.pageHeightMm;

const processor = useProcessor();
const nUploadedFiles = processor.nUploadedFiles;

const validationFn = (value: number): boolean => {
  if (pageMarginUnit.value === Unit.MM) {
    if (value * 2 >= pageWidthMm.value || value * 2 >= pageHeightMm.value) {
      return false;
    }
  } else if (value >= 50) {
    return false;
  }
  return true;
}

const numericInput = useNumericInput(pageMargin, validationFn);

const isValid = numericInput.isValid;
const inputForm = numericInput.inputForm;
const maybeReset = numericInput.maybeReset;
</script>

<template>
  <UFieldGroup class="w-full">
    <UBadge class="fieldGroupBadge" color="neutral" label="Page margin" size="lg" variant="outline"/>
    <UInput
        v-model="inputForm"
        :color="isValid ? 'primary' : 'error'"
        :disabled="nUploadedFiles > 0"
        :highlight="!isValid"
        type="number"
        @blur="maybeReset"
    />
    <USelect
        v-model="pageMarginUnit"
        :disabled="nUploadedFiles > 0"
        :items="UNIT_OPTIONS"
        class="min-w-20"
    />
  </UFieldGroup>
</template>

<style scoped>

</style>