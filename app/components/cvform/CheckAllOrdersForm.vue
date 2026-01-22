<script lang="ts" setup>
const model = defineModel<boolean>();
</script>

<template>
  <div class="flex">
    <UCheckbox v-model="model" label="Check all orders"/>
    <UTooltip
        :content="{align: 'start', side: 'right', sideOffset: 8}"
        :delay-duration="0"
        :ui="{content: 'px-4 py-10'}"
    >
      <template #content>
        Consider the four possible corner orders in the rejectedCorners array.<br>
        If it set to false, only the provided corner order is considered.
      </template>
      <UButton
          color="neutral"
          class="ml-auto"
          icon="i-lucide-circle-question-mark"
          target="_blank"
          to="https://docs.opencv.org/4.13.0/d5/d09/structcv_1_1aruco_1_1RefineParameters.html#aae500a000c9b61e4772e755d783d639c"
          variant="subtle"
      />
    </UTooltip>
  </div>
</template>

<style scoped>

</style>