<script lang="ts" setup>
import {isNumber} from "~/assets/ts/common";

const model = defineModel<number>();

const isValid = ref(true);
const inputForm = ref(model.value);

// Validate that the value is a number
watch(inputForm, (v: string) => {
  if (!isNumber(v)) {
    isValid.value = false;
    return;
  }
  const cast = parseFloat(v);
  if (isNaN(cast)) {
    isValid.value = false;
    return;
  }
  isValid.value = true;
  model.value = cast;
});

function maybeReset() {
  if (!isValid.value) {
    inputForm.value = model.value;
    isValid.value = true;
  }
}
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
        :content="{align: 'left', side: 'right', sideOffset: 8}"
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