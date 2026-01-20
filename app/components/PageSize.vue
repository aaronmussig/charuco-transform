<script setup lang="ts">
import {usePageWidth, usePageHeight, usePageSize} from "~/composables/state";

const pageWidth = usePageWidth();
const pageHeight = usePageHeight();
const pageSize = usePageSize();

const items = ['Custom', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5'];

watch(pageSize, async (v) => {
  if (v === 'A0') {
    pageWidth.value = 841;
    pageHeight.value = 1189;
  } else if (v === 'A1') {
    pageWidth.value = 594;
    pageHeight.value = 841;
  } else if (v === 'A2') {
    pageWidth.value = 420;
    pageHeight.value = 594;
  } else if (v === 'A4') {
    pageWidth.value = 210;
    pageHeight.value = 297;
  } else if (v === 'A3') {
    pageWidth.value = 297;
    pageHeight.value = 420;
  } else if (v === 'A5') {
    pageWidth.value = 148;
    pageHeight.value = 210;
  }
});
</script>

<template>
<div>
  <UFieldGroup>
    <UBadge color="neutral" label="Page size" size="lg" variant="outline"/>
    <USelect
        v-model="pageSize"
        :items="items"
        class="w-48"
    />
  </UFieldGroup>

</div>
</template>

<style scoped>

</style>