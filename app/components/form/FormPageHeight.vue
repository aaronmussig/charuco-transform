<script lang="ts" setup>
import {PageSize, useBoard} from "~/composables/board";
import {useProcessor} from "~/composables/processor";
import {useNumericInput} from "~/composables/form";

const processor = useProcessor();
const nUploadedFiles = processor.nUploadedFiles;

const boardConfig = useBoard();
const pageHeightMm = boardConfig.pageHeightMm;
const pageSize = boardConfig.pageSize;

const validationFn = (value: number): boolean => {
  if (value <= 0) {
    return false;
  }
  return true;
}

const numericInput = useNumericInput(pageHeightMm, validationFn);

const isValid = numericInput.isValid;
const inputForm = numericInput.inputForm;
const maybeReset = numericInput.maybeReset;
</script>

<template>
  <UFieldGroup v-show="pageSize === PageSize.CUSTOM" class="w-full">
    <UBadge class="fieldGroupBadge" color="neutral" label="Page height" size="lg" variant="outline"/>
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