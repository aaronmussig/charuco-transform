<script lang="ts" setup>
import type {StepperItem} from '@nuxt/ui';


const items: StepperItem[] = [
  {slot: 'generate' as const, title: 'Generate', description: ''},
  {slot: 'print' as const, title: 'Print', description: ''},
  {slot: 'upload' as const, title: 'Upload', description: ''},
];


const stepper = useTemplateRef('stepper');

</script>

<template>
  <UModal
      :close="{
      color: 'primary',
      variant: 'outline',
      class: 'rounded-full'
    }"
      :ui="{content: 'w-[calc(100vw-2rem)] max-w-2/3', title: 'text-xl'}"
      scrollable
      title="About the tool"
  >
    <UButton
        icon="i-lucide-help-circle"
        size="lg"
    />

    <template #body>

      <div class="space-y-5">
        <p>
          <b>You must use the same ChArUco board parameters when uploading photos</b> or it will not work.
          <br>
          Parameters are saved in the file name, and in the URL, so it is recommended to save a bookmark,
          or write the parameters on the rear of the page.
        </p>
        <p>
          To learn more about ChArUco boards please visit the
          <ULink href="https://docs.opencv.org/3.4/df/d4a/tutorial_charuco_detection.html" target="_blank">
            OpenCV documentation
          </ULink>
          .
        </p>
      </div>

      <USeparator class="my-10"/>


      <div class="w-full">

        <UStepper ref="stepper" :items="items">

          <template #generate>
            <div class="flex">
              <img alt="Tutorial parameter selection" class="mx-auto max-w-2/3" src="~/assets/img/tutorial-step-1.png"/>
            </div>
          </template>

          <template #print>
            <div>
              Note: Your print settings may be different but the key points are to keep the scale at 100% and
              disable any page scaling options.
            </div>
            <div class="flex mt-3">
              <img alt="Tutorial print" class="mx-auto max-w-2/3" src="~/assets/img/tutorial-step-2.png"/>
            </div>
          </template>

          <template #upload>
            <div class="flex mt-3">
              <img alt="Tutorial upload" class="mx-auto max-w-2/3" src="~/assets/img/tutorial-step-3.png"/>
            </div>
          </template>

        </UStepper>


        <div class="flex gap-2 justify-between mt-4">
          <UButton
              :disabled="!stepper?.hasPrev"
              leading-icon="i-lucide-arrow-left"
              @click="stepper?.prev()"
          >
            Prev
          </UButton>

          <UButton
              :disabled="!stepper?.hasNext"
              trailing-icon="i-lucide-arrow-right"
              @click="stepper?.next()"
          >
            Next
          </UButton>
        </div>


      </div>


    </template>
  </UModal>
</template>

<style scoped>

</style>