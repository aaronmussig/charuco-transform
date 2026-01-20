<script lang="ts" setup>
import FormPageSize from "~/components/form/FormPageSize.vue";
import FormPageHeight from "~/components/form/FormPageHeight.vue";
import FormPageMargin from "~/components/form/FormPageMargin.vue";
import FormMarkerSize from "~/components/form/FormMarkerSize.vue";
import FormShowParameters from "~/components/form/FormShowParameters.vue";

import {useBoard} from "~/composables/board";
import {useProcessor} from "~/composables/processor";

const boardConfig = useBoard();
const processor = useProcessor();

const boardErrors = boardConfig.boardErrors;
const resetToDefaults = boardConfig.resetToDefaults;
const resetUploadedFiles = processor.resetUploadedFiles;

function handleReset() {
  resetToDefaults();
  resetUploadedFiles();
}


</script>

<template>

  <div class="space-y-3">

    <FormMarkerSet/>
    <FormPageSize/>
    <FormPageHeight/>
    <FormPageWidth/>
    <FormPageMargin/>
    <FormMarkerSize/>
    <FormMarkerMargin/>
    <FormShowParameters/>

    <UAlert
        v-if="boardErrors && boardErrors.length > 0"
        :ui="{icon: 'size-5'}"
        color="warning"
        icon="i-lucide-triangle-alert"
        title="Suboptimal configuration"
        variant="subtle"
    >
      <template #description>
        <ul class="list-disc list-inside">
          <li v-for="(value, index) in boardErrors">
            {{ value }}
          </li>
        </ul>
      </template>
    </UAlert>

    <UButton
        class="flex mt-10 w-full justify-center"
        icon="i-lucide-undo"
        label="Reset"
        type="button"
        @click="handleReset"
    />

  </div>
</template>

<style scoped>

</style>