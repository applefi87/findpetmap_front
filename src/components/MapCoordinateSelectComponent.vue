<template>
  <div>
    <q-btn @click="toggleMap" :label="isMapOpen ? t('closeMap') : t('openMap')" class="q-mb-md" />
    <div v-show="isMapOpen" class="q-mb-md">
      <q-item>
        <q-no-ssr>
          <q-btn @click="locateHere" :label="t('locateHere')" />
          <div id="map" style="height: 400px; width: 100%;"></div>
          <q-btn @click="setCoordinates" :label="t('setCoordinates')" class="q-mt-md" />
        </q-no-ssr>
      </q-item>
    </div>
    <div v-if="!isMapOpen">
      <q-input v-model="coordinates" :label="t('selectedCoordinates')"
        :rules="createI18nRules(rules.createMustInputRules, t)" readonly />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onBeforeUnmount } from 'vue'
import anv from 'an-validator';
import { useI18n } from 'vue-i18n'
import "leaflet/dist/leaflet.css";
const { rules, createI18nRules } = anv
const { t } = useI18n({ useScope: 'global' });

let map;
let Leaflet;
const centerMarker = ref(null);
const coordinates = ref("");
const isMapOpen = ref(false);

const toggleMap = async () => {
  isMapOpen.value = !isMapOpen.value;

  if (isMapOpen.value) {
    await nextTick(); // Ensure the DOM is updated
    if (!map) {
      // Initialize the map only once
      Leaflet = await import('leaflet');
      map = Leaflet.map('map').setView([25.0474014, 121.5374556], 13);
      Leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 16,
        minZoom: 8,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      centerMarker.value = Leaflet.marker(map.getCenter(), { draggable: false }).addTo(map);
      map.on('moveend', handleMapDrag);
      getCurrentPosition();
    } else {
      map.invalidateSize();
    }
  }
};
const invalidMap = () => {
  map.invalidateSize();
}
const locateHere = () => {
  getCurrentPosition();
}

const setCoordinates = () => {
  coordinates.value = `${map.getCenter().lat.toFixed(6)}, ${map.getCenter().lng.toFixed(6)}`;
  toggleMap();
}

const getCurrentPosition = () => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(getCurrentPositionSuccessHandler, (err) => { }, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });
  } else {
    alert("Your device or browser does not support geolocation.");
  }
}

onMounted(async () => {
  // const isServerSide = process.env.SERVER
  // if (!isServerSide) {
  //   Leaflet = await import('leaflet');
  //   map = Leaflet.map('map').setView([25.0474014, 121.5374556], 13);
  //   Leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //     maxZoom: 16,
  //     minZoom: 8,
  //     attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  //   }).addTo(map);

  //   centerMarker.value = Leaflet.marker(map.getCenter(), { draggable: false }).addTo(map);
  //   map.on('moveend', handleMapDrag);
  //   getCurrentPosition();
  // }
})

onBeforeUnmount(() => {
  if (map) {
    map.remove();
  }
});

function getCurrentPositionSuccessHandler(newPosition) {
  const { latitude, longitude } = newPosition.coords;
  if (map) {
    map.setView([latitude, longitude], 13);
    centerMarker.value.setLatLng([latitude, longitude]);
  }
}

async function handleMapDrag() {
  if (centerMarker.value) {
    centerMarker.value.setLatLng(map.getCenter());
  }
}
</script>
