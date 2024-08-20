<!-- 沒任何想法，預計是首頁，目前沒有用到 -->
<template>
  <q-page>
    <q-no-ssr>
      <q-banner>
        <div class="row items-center">
          <div class="col-auto">
            <q-avatar size="64px">
              <!-- <img src="./assets/logo.png" alt="Logo" /> -->
            </q-avatar>
          </div>
          <div class="col">
            <div class="text-h5">
              {{ t('validation.lengthMatch', { length: 999 }) }}Welcome to My Knowledge Hub
            </div>
            <div class="text-subtitle2">
              Share your knowledge and learn from others
            </div>
          </div>
        </div>
      </q-banner>
      <q-btn @click="search" label="Search" />
      <div id="map" style="height: 600px; width: 100%"></div>
    </q-no-ssr>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Geolocation } from '@capacitor/geolocation'
import { useI18n } from 'vue-i18n'
import "leaflet/dist/leaflet.css";
const { t, locale, availableLocales } = useI18n({ useScope: 'global' });
let map;
let Leaflet

const centerMarker = ref(null);

const position = ref('determining...')
function getCurrentPosition() {
  Geolocation.getCurrentPosition().then(newPosition => {
    const { latitude, longitude } = newPosition.coords;
    position.value = `Lat: ${latitude}, Lng: ${longitude}`;
    if (map) {
      map.setView([latitude, longitude], 13);
      if (!map.marker) {
        map.marker = Leaflet.marker([latitude, longitude]).addTo(map);
      } else {
        map.marker.setLatLng([latitude, longitude]);
      }
    }
  })
}

onMounted(async () => {
  console.log('Current Locale:', locale.value);
  console.log('Available Locales:', availableLocales);

  // Check if the current language file is loaded correctly
  console.log('Translation for key "account":', t('account'));
  const isServerSide = process.env.SERVER
  if (!isServerSide) {
    Leaflet = await import('leaflet');
    map = Leaflet.map('map').setView([25.0474014, 121.5374556], 13);
    Leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 15,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    map.on("locationfound", (e) => {
      console.log("locationfound");
      map.setView(e.latlng, e.accuracy / 2)
    })
    getCurrentPosition();
    centerMarker.value = L.marker(map.getCenter(), { draggable: false }).addTo(map).bindPopup('A pretty CSS3 popup.<br> Easily customizable.').openPopup();

    map.on('move', () => {
      centerMarker.value.setLatLng(map.getCenter());
    });

    centerMarker.value = L.marker(map.getCenter(), { draggable: false }).addTo(map);
  }
})

// Clean up the map instance on unmount
onBeforeUnmount(() => {
  if (map) {
    map.remove();
  }
});

// Search function to log the center and bounds
const search = () => {
  const center = map.getCenter();
  console.log('Center Coordinates: ', center);

  const bounds = map.getBounds();
  const bottomLeft = bounds.getSouthWest();
  const topRight = bounds.getNorthEast();

  console.log('Bottom-Left Coordinates: ', bottomLeft);
  console.log('Top-Right Coordinates: ', topRight);
};

</script>

<style></style>
