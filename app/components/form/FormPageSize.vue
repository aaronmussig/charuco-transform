<script lang="ts" setup>
import {PAGE_SIZE_OPTIONS, useBoard} from "~/composables/board";
import {useProcessor} from "~/composables/processor";

const processor = useProcessor();
const nUploadedFiles = processor.nUploadedFiles;

const boardConfig = useBoard();
const pageSize = boardConfig.pageSize;
</script>

<template>
  <UFieldGroup class="w-full">
    <UBadge class="fieldGroupBadge" color="neutral" label="Page size" size="lg" variant="outline"/>
    <USelect
        v-model="pageSize"
        :disabled="nUploadedFiles > 0"
        :items="PAGE_SIZE_OPTIONS"
        class="w-full"
    />
  </UFieldGroup>
</template>

<style scoped>

</style>