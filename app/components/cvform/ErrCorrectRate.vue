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
    <UBadge color="neutral" label="Error correction rate" size="lg" variant="outline"/>
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
        Rate of allowed erroneous bits respect to the<br>
        error correction capability of the used dictionary.<br>
        -1 ignores the error correction step.
      </template>
      <UButton
          color="neutral"
          icon="i-lucide-circle-question-mark"
          target="_blank"
          to="https://docs.opencv.org/4.13.0/d5/d09/structcv_1_1aruco_1_1RefineParameters.html#ad8bfc8a51e8ce6719bb5f891af64f79d"
          variant="subtle"
      />
    </UTooltip>
  </UFieldGroup>
</template>

<style scoped>

</style>
