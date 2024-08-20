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
      <q-btn @click="locateHere" label="locateHere" />
    </q-no-ssr>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import "leaflet/dist/leaflet.css";
const { t, locale, availableLocales } = useI18n({ useScope: 'global' });
let map;
let Leaflet

const centerMarker = ref(null);

const position = ref('determining...')
function getCurrentPosition() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(getCurrentPositionSuccessHandler, (err) => { }, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });
  } else {
    alert("你的裝置或瀏覽器不支援定位功能");
  }
  // Geolocation.getCurrentPosition().then(newPosition => {

  // })
}

const locateHere = () => {
  getCurrentPosition();
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
      maxZoom: 16,
      minZoom: 13,
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
  // Calculate width (distance between left and right)
  const width = calculateDistance(
    bottomLeft.lat,
    bottomLeft.lng,
    bottomLeft.lat, // Same latitude for horizontal distance
    topRight.lng
  );

  // Calculate height (distance between top and bottom)
  const height = calculateDistance(
    bottomLeft.lat,
    bottomLeft.lng,
    topRight.lat,  // Same longitude for vertical distance
    bottomLeft.lng
  );

  console.log(`Width (Left-Right Distance): ${width.toFixed(2)} km`);
  console.log(`Height (Top-Bottom Distance): ${height.toFixed(2)} km`);
};
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

function getCurrentPositionSuccessHandler(newPosition) {
  const { latitude, longitude } = newPosition.coords;
  if (map) {
    map.setView([latitude, longitude], 13);
    if (!map.marker) {
      map.marker = Leaflet.marker([latitude, longitude]).addTo(map);
    } else {
      map.marker.setLatLng([latitude, longitude]);
    }
  }
}

</script>

<style></style>
