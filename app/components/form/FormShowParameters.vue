<script lang="ts" setup>
import {useBoard} from "~/composables/board";
import {useProcessor} from "~/composables/processor";

const boardConfig = useBoard();
const outputParameters = boardConfig.outputParameters;

const processor = useProcessor();
const nUploadedFiles = processor.nUploadedFiles;
</script>

<template>
  <UCheckbox
      v-model="outputParameters"
      :disabled="nUploadedFiles > 0"
      label="Include parameters in page margin"
  />
</template>

<style scoped>

</style>