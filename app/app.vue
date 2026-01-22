<script setup lang="ts">
const desc = "Generate printable ChArUco boards for camera calibration and upload photos of the printed boards for automatic perspective correction and cropping.";

useSeoMeta({
  title: "ChArUco Transform",
  ogTitle: "CharUco Board Generator & Correction",
  description: desc,
  ogDescription: desc,
})
</script>

<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>
