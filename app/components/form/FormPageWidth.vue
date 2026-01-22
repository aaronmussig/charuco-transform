<script lang="ts" setup>
import {PageSize, useBoard} from "~/composables/board";
import {useProcessor} from "~/composables/processor";
import {useNumericInput} from "~/composables/form";

const boardConfig = useBoard();
const pageWidthMm = boardConfig.pageWidthMm;
const pageSize = boardConfig.pageSize;

const processor = useProcessor();
const nUploadedFiles = processor.nUploadedFiles;

const validationFn = (value: number): boolean => {
  if (value <= 0) {
    return false;
  }
  return true;
}

const numericInput = useNumericInput(pageWidthMm, validationFn);
const isValid = numericInput.isValid;
const inputForm = numericInput.inputForm;
const maybeReset = numericInput.maybeReset;
</script>

<template>
  <UFieldGroup v-show="pageSize === PageSize.CUSTOM" class="w-full">
    <UBadge class="fieldGroupBadge" color="neutral" label="Page width" size="lg" variant="outline"/>
    <UInput
        v-model="inputForm"
        :color="isValid ? 'primary' : 'error'"
        :disabled="nUploadedFiles > 0"
        :highlight="!isValid"
        type="number"
    />
    <UBadge class="min-w-20" color="neutral" label="mm" size="lg" variant="outline"/>
  </UFieldGroup>
</template>

<style scoped>

</style>