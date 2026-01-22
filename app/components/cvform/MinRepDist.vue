<script lang="ts" setup>
import {useNumericInput} from "~/composables/form";

const model = defineModel<number>();

const numericInput = useNumericInput(model);

const isValid = numericInput.isValid;
const inputForm = numericInput.inputForm;
const maybeReset = numericInput.maybeReset;
</script>

<template>
  <UFieldGroup class="">
    <UBadge color="neutral" label="Min. Rep distance" size="lg" variant="outline"/>
    <UInput
        v-model="inputForm"
        :color="isValid ? 'primary' : 'error'"
        :highlight="!isValid"
        type="number"
        @blur="maybeReset"
    />
    <UTooltip
        :content="{align: 'start', side: 'right', sideOffset: 8}"
        :delay-duration="0"
        :ui="{content: 'px-4 py-10'}"
    >
      <template #content>
        Minimum distance between the corners of the rejected candidate and<br>
        the reprojected marker in order to consider it as a correspondence.
      </template>
      <UButton
          color="neutral"
          icon="i-lucide-circle-question-mark"
          target="_blank"
          to="https://docs.opencv.org/4.13.0/d5/d09/structcv_1_1aruco_1_1RefineParameters.html#a0e5a0079a09f5b29d5b2d8224db63b7f"
          variant="subtle"
      />
    </UTooltip>
  </UFieldGroup>
</template>

<style scoped>

</style>