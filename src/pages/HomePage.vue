<template>
  <q-page class="q-pa-md">
    <q-no-ssr>
      <div class="filter-area q-pa-md">
        <LazyArticleFilter @updateFilter="handleUpdateFilter" />
      </div>
      <div class="map-area q-pa-md q-gutter-y-sm">
        <LazyMap :filter="filter" />
      </div>
    </q-no-ssr>
  </q-page>
</template>

<script setup>
import { ref, defineAsyncComponent } from 'vue';
const LazyMap = defineAsyncComponent(() => import('components/MapComponent.vue'));
const LazyArticleFilter = defineAsyncComponent(() => import('components/ArticleFilter.vue'));

const filter = ref({});

const handleUpdateFilter = (newFilter) => {
  console.log("handleUpdateFilter:", newFilter);
  filter.value = { ...newFilter }; // Spread operator ensures a new object
};
</script>


<style scoped>
.filter-area {
  flex: 1;
}

.map-area {
  flex: 2;
}
</style>
