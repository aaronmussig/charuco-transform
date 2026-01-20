<script lang="ts" setup>
import type {SelectItem} from '@nuxt/ui'
import {PageSize, useBoard} from "~/composables/board";
import {useProcessor} from "~/composables/processor";

const processor = useProcessor();
const nUploadedFiles = processor.nUploadedFiles;

const boardConfig = useBoard();
const pageSize = boardConfig.pageSize;

const items: SelectItem[] = [
  {label: 'Custom', value: PageSize.CUSTOM},
  {label: 'A0', value: PageSize.A0},
  {label: 'A1', value: PageSize.A1},
  {label: 'A2', value: PageSize.A2},
  {label: 'A3', value: PageSize.A3},
  {label: 'A4', value: PageSize.A4},
  {label: 'A5', value: PageSize.A5},
];
</script>

<template>
  <UFieldGroup class="w-full">
    <UBadge color="neutral" label="Page size" size="lg" variant="outline" class="fieldGroupBadge" />
    <USelect
        v-model="pageSize"
        :items="items"
        :disabled="nUploadedFiles > 0"
        class="w-full"
    />
  </UFieldGroup>
</template>

<style scoped>

</style>