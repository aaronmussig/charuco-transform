<script lang="ts" setup>
import {PageSize, useBoard} from "~/composables/board";
import {isNumber} from "~/assets/ts/common";
import {useProcessor} from "~/composables/processor";

const boardConfig = useBoard();
const pageWidthMm = boardConfig.pageWidthMm;
const pageSize = boardConfig.pageSize;

const inputForm = ref(pageWidthMm.value);
const isValid = ref(true);

const processor = useProcessor();
const nUploadedFiles = processor.nUploadedFiles;

// If the model changes externally, update the value
watch(pageWidthMm, (v) => {
  inputForm.value = v;
});

// Validate that the value is a number
watch(inputForm, (v: string) => {
  if (!isNumber(v)) {
    isValid.value = false;
    return;
  }
  const cast = Number(v);
  if (cast <= 0) {
    isValid.value = false;
    return;
  }
  pageWidthMm.value = cast
  isValid.value = true;
});
</script>

<template>
  <UFieldGroup class="w-full" v-show="pageSize === PageSize.CUSTOM">
    <UBadge color="neutral" label="Page width" size="lg" variant="outline" class="fieldGroupBadge"/>
    <UInput
        v-model="inputForm"
        :color="isValid ? 'primary' : 'error'"
        :highlight="!isValid"
        type="number"
        :disabled="nUploadedFiles > 0"
    />
    <UBadge color="neutral" label="mm" size="lg" variant="outline" class="min-w-20" />
  </UFieldGroup>
</template>

<style scoped>

</style>