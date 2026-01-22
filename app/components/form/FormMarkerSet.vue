<script lang="ts" setup>
import {MARKER_SET_OPTIONS, useBoard} from "~/composables/board";
import {useProcessor} from "~/composables/processor";

const boardConfig = useBoard();
const markerSet = boardConfig.markerSet;

const processor = useProcessor();
const nUploadedFiles = processor.nUploadedFiles;
</script>

<template>
  <UFieldGroup class="w-full">
    <UBadge
        class="fieldGroupBadge"
        color="neutral"
        label="Dictionary"
        size="lg"
        variant="outline"
    />
    <USelect
        v-model="markerSet"
        :disabled="nUploadedFiles > 0"
        :items="MARKER_SET_OPTIONS"
        class="w-full"
    />
  </UFieldGroup>
</template>

<style scoped>

</style>