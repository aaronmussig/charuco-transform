<script lang="ts" setup>
import {isNumber} from "~/assets/ts/common";

const model = defineModel({required: true});
const props = defineProps({
  label: {
    type: String,
    required: true
  },
  allowZero: {
    type: Boolean,
    required: false,
    default: false
  },
});

const value = ref<number>(model.value);
const isValid = ref(true);

// If the model changes externally, update the value
watch(model, (newValue) => {
  if (value.value !== newValue) {
    value.value = newValue;
  }
});

// Validate that the value is a number
watch(value, (newValue: string) => {
  if (!isNumber(newValue)) {
    isValid.value = false;
    return;
  }
  const cast = Number(newValue);
  if (cast < 0 || (!props.allowZero && cast === 0)) {
    isValid.value = false;
    return;
  }
  model.value = cast
  isValid.value = true;
});

</script>

<template>
  <div>
    <UFormField
    orientation="horizontal"
    :label="label"
    >
      <UInput
          v-model="value"
          :color="isValid ? 'primary' : 'error'"
          :highlight="!isValid"
          type="number"
      />
    </UFormField>
  </div>

</template>

<style scoped>

</style>