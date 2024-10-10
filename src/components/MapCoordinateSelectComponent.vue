<template>
  <div style="display: flex; flex-direction: row;">
    <q-btn @click="toggleMap" :label="isMapOpen ? t('closeMap') : t('openMap')" class="q-mb-md" />

    <q-dialog v-model="isMapOpen" @show="initializeMap" @hide="destroyMap">
      <q-card style="width: 100%; height: 95vh; max-height: 95vh; display: flex; flex-direction: column;">
        <q-card-section style="flex-grow: 1;">
          <div style="position: relative; height: 100%;">
            <q-btn @click="closeMap" :label="t('close')" class="absolute-top-right q-mr-md q-mt-md" flat round
              icon="close" />
            <div id="mapSelect" style="height: 100%; width: 100%;"></div>
          </div>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn @click="locateHere" :label="t('locateHere')" />
          <q-btn @click="setCoordinates" :label="t('setCoordinates')" />
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
import { useI18n } from 'vue-i18n';
import an_validator from 'an-validator';
const { rules, createI18nRules } = an_validator;

const { t } = useI18n({ useScope: 'global' });

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

const internalCoordinatesString = ref(internalCoordinates.value?.join(',') || '');

const centerMarker = ref(null);
const isMapOpen = ref(false);

const toggleMap = () => {
  isMapOpen.value = !isMapOpen.value;
};

const closeMap = () => {
  isMapOpen.value = false;
};

let map;
const initializeMap = async () => {
  await nextTick();
  if (!map) {
    const leafletJs = document.createElement('script');
    leafletJs.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
    leafletJs.onload = () => {
      const L = window.L;
      map = L.map('mapSelect').setView(internalCoordinates.value || [25.0474014, 121.5374556], 15);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        minZoom: 8,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      if (!internalCoordinates.value) {
        map.on('locationfound', (e) => {
          if (!internalCoordinates.value) {
            map.setView(e.latlng, e.accuracy / 2);
          }
        });
        getCurrentPosition();
      }

      // Add click event listener to the map
      map.on('click', handleMapClick);

      // If there are existing coordinates, place a marker
      if (internalCoordinates.value) {
        centerMarker.value = L.marker(internalCoordinates.value, { draggable: false }).addTo(map);
      }
    };
    const leafletCss = document.createElement('link');
    leafletCss.rel = 'stylesheet';
    leafletCss.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
    document.head.appendChild(leafletCss);
    document.body.appendChild(leafletJs);
  } else {
    map.invalidateSize();
    map.setView(map.getCenter(), map.getZoom());
  }
};

const destroyMap = () => {
  if (map) {
    map.off('click', handleMapClick);
    map.remove();
    map = null;
  }
};

const locateHere = () => {
  getCurrentPosition();
};

const setCoordinates = () => {
  if (centerMarker.value) {
    const latlng = centerMarker.value.getLatLng();
    internalCoordinates.value = [parseFloat(latlng.lat.toFixed(8)), parseFloat(latlng.lng.toFixed(8))];
    emit('update:modelValue', JSON.stringify(internalCoordinates.value));
    internalCoordinatesString.value = internalCoordinates.value.join(',');
  }
  closeMap();
};

const getCurrentPosition = () => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(getCurrentPositionSuccessHandler, () => { }, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });
  } else {
    alert('Your device or browser does not support geolocation.');
  }
};

onBeforeUnmount(() => {
  destroyMap();
});

function getCurrentPositionSuccessHandler(newPosition) {
  const { latitude, longitude } = newPosition.coords;
  if (map) {
    map.setView([latitude, longitude], 13);
    if (centerMarker.value) {
      centerMarker.value.setLatLng([latitude, longitude]);
    } else {
      centerMarker.value = L.marker([latitude, longitude], { draggable: false }).addTo(map);
    }
  }
}

function handleMapClick(e) {
  const { latlng } = e;
  if (centerMarker.value) {
    centerMarker.value.setLatLng(latlng);
  } else {
    centerMarker.value = L.marker(latlng, { draggable: false }).addTo(map);
  }
}
</script>
