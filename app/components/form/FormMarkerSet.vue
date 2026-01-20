<script lang="ts" setup>
import type {SelectItem} from '@nuxt/ui'
import {MarkerSet, useBoard} from "~/composables/board";
import {useProcessor} from "~/composables/processor";

const boardConfig = useBoard();
const markerSet = boardConfig.markerSet;

const processor = useProcessor();
const nUploadedFiles = processor.nUploadedFiles;

const items: SelectItem[] = [
  {label: 'Original ArUco (1024)', value: MarkerSet.ARUCO},
  {label: 'ArUco 4x4 (1000)', value: MarkerSet.ARUCO_4X4_1000},
  {label: 'ArUco 5x5 (1000)', value: MarkerSet.ARUCO_5X5_1000},
  {label: 'ArUco 6x6 (1000)', value: MarkerSet.ARUCO_6X6_1000},
  {label: 'ArUco 7x7 (1000)', value: MarkerSet.ARUCO_7X7_1000},
];

</script>

<template>
  <UFieldGroup class="w-full">
    <UBadge
        color="neutral"
        label="Dictionary"
        size="lg"
        variant="outline"
        class="fieldGroupBadge"
    />
    <USelect
        v-model="markerSet"
        :items="items"
        class="w-full"
        :disabled="nUploadedFiles > 0"
    />
  </UFieldGroup>
</template>

<style scoped>

</style>