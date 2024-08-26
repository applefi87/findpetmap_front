<template>
  <q-page class="q-pa-md">
    <div class="column">
      <q-no-ssr>
        <div class="filter-area q-pa-md">
          <ArticleFilter @updateFilter="handleUpdateFilter" />
        </div>
        <div class="map-area q-pa-md q-gutter-y-sm">
          <Map :filter="filter" />
        </div>
      </q-no-ssr>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';

import Map from 'components/MapComponent.vue'
import ArticleFilter from 'components/ArticleFilter.vue'
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
