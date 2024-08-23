<template>
  <div style="display: flex; flex-direction: row;">
    <q-btn @click="toggleMap" :label="isMapOpen ? t('closeMap') : t('openMap')" class="q-mb-md" />

    <q-dialog v-model="isMapOpen" @show="initializeMap" @hide="destroyMap">
      <q-card>
        <q-card-section>
          <div style="position: relative;">
            <q-btn @click="closeMap" :label="t('close')" class="absolute-top-right q-mr-md q-mt-md" flat round
              icon="close" />
            <br />
            <div id="map" style="height: 80vh; width: 90%; margin: 0 auto;"></div>
          </div>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn @click="locateHere" :label="t('locateHere')" />
          <q-btn @click="setCoordinates" :label="t('setCoordinates')" class="q-mt-md" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <div v-if="!isMapOpen">
      <q-input v-model="internalCoordinatesString" :label="t('selectedCoordinates')"
        :rules="createI18nRules(rules.createMustInputRules, t)" readonly />
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onBeforeUnmount } from 'vue';
import anv from 'an-validator';
import { useI18n } from 'vue-i18n';
import "leaflet/dist/leaflet.css";

const { rules, createI18nRules } = anv;
const { t } = useI18n({ useScope: 'global' });

// Props and emit for v-model
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue']);


const internalCoordinates = ref(function () {
  try {
    return props.modelValue ? JSON.parse(props.modelValue) : null;
  } catch (e) {
    return null;
  }
}());
const internalCoordinatesString = ref(internalCoordinates.value?.join(','));

let map;
let Leaflet;
const centerMarker = ref(null);
const isMapOpen = ref(false);

const toggleMap = () => {
  isMapOpen.value = !isMapOpen.value;
};

const closeMap = () => {
  isMapOpen.value = false;
};

const initializeMap = async () => {
  await nextTick(); // Ensure the DOM is updated
  if (!map) {
    Leaflet = await import('leaflet');
    map = Leaflet.map('map').setView(internalCoordinates.value || [25.0474014, 121.5374556], 13);
    Leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 8,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    if (!internalCoordinates.value) {
      map.on("locationfound", (e) => {
        if (!internalCoordinates.value) {
          map.setView(e.latlng, e.accuracy / 2)
        }
      })
      getCurrentPosition();
    }

    map.on('moveend', handleMapDrag);

    centerMarker.value = Leaflet.marker(map.getCenter(), { draggable: false }).addTo(map);
    let isUpdatingMarker = false;
    map.on('move', (event) => {
      if (!isUpdatingMarker) {
        isUpdatingMarker = true;
        centerMarker.value.setLatLng(event.target.getCenter());
        isUpdatingMarker = false;
      }
    });
  } else {
    map.invalidateSize(); // Recalculate map size
    map.setView(map.getCenter(), map.getZoom()); // Re-center the map
  }
};

const destroyMap = () => {
  if (map) {
    map.off('moveend', handleMapDrag);
    map.remove(); // Remove map instance
    map = null; // Clean up the map object
  }
};

const locateHere = () => {
  getCurrentPosition();
};

const setCoordinates = () => {
  internalCoordinates.value = [parseFloat(map.getCenter().lat.toFixed(8)), parseFloat(map.getCenter().lng.toFixed(8))];
  console.log("setCoordinates:", internalCoordinates.value);
  console.log("setCoordinates type:", typeof internalCoordinates.value);
  const result = JSON.stringify(internalCoordinates.value)
  console.log("setCoordinates result:", result);
  console.log("setCoordinates type:", typeof result);
  emit('update:modelValue', JSON.stringify(internalCoordinates.value));
  internalCoordinatesString.value = internalCoordinates.value.join(',');
  closeMap();
};

const getCurrentPosition = () => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(getCurrentPositionSuccessHandler, () => { }, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });
  } else {
    alert("Your device or browser does not support geolocation.");
  }
};

onBeforeUnmount(() => {
  destroyMap(); // Ensure map is destroyed when the component unmounts
});

function getCurrentPositionSuccessHandler(newPosition) {
  const { latitude, longitude } = newPosition.coords;
  if (map) {
    map.setView([latitude, longitude], 13);
    centerMarker.value.setLatLng([latitude, longitude]);
  }
}

function handleMapDrag() {
  if (centerMarker.value) {
    centerMarker.value.setLatLng(map.getCenter());
  }
}

</script>
