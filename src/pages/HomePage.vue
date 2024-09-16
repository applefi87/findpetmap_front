<template>
  <q-page style="display: flex; flex-direction: column;">
    <div class="filter-area q-pa-md">
      <LazyArticleFilter @updateFilter="handleUpdateFilter" />
    </div>
    <div class="map-area q-pa-md q-gutter-y-sm">
      <Map :filter="filter" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, defineAsyncComponent } from 'vue';
import Map from 'components/MapComponent.vue';
const LazyArticleFilter = defineAsyncComponent(() => import('components/ArticleFilter.vue'));

const filter = ref({});

const handleUpdateFilter = (newFilter) => {
  filter.value = { ...newFilter }; // Spread operator ensures a new object
};
</script>

<style scoped>
.filter-area {
  height: 50px;
  /* Minimize the size of the button */
  flex-shrink: 0;
  /* Prevents it from shrinking further */
  display: flex;
  justify-content: center;
  align-items: center;
}

.map-area {
  flex-grow: 1;
  /* The map will take up the remaining space */
  overflow: hidden;
  /* Prevent overflow */
}
</style>
