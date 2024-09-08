<template>
  <q-carousel v-model="slide" v-model:fullscreen="fullscreen" transition-prev="scale" transition-next="scale" swipeable
    animated control-color="white" padding arrows height="300px" width="90%" infinite thumbnails
    class="bg-primary text-white shadow-1 rounded-borders">
    <q-carousel-slide v-for="(image, index) in images" :key="index" :name="index + 1" class="carousel-image"
      :img-src="`https://production-petfinder-private.s3.ap-northeast-1.amazonaws.com/${image.fullPath}`"
      lazy-loading />
    <template v-slot:control>
      <q-carousel-control position="bottom-right" :offset="[18, 18]">
        <q-btn push round dense color="white" text-color="primary" :icon="fullscreen ? 'fullscreen_exit' : 'fullscreen'"
          @click="fullscreen = !fullscreen" />
      </q-carousel-control>
    </template>
  </q-carousel>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  images: Array
});

const slide = ref(1);
const fullscreen = ref(false);
</script>

<style lang="sass" scoped>
.carousel-image
  width: 100%
  height: 100%
  background-size: contain  /* Ensures the image fits inside without cropping */
  background-position: center  /* Centers the image */
  background-repeat: no-repeat  /* Prevents the image from repeating */

</style>
