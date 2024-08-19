<!-- 沒任何想法，預計是首頁，目前沒有用到 -->
<template>
  <q-page>
    <q-banner>
      <div class="row items-center">
        <div class="col-auto">
          <q-avatar size="64px">
            <!-- <img src="./assets/logo.png" alt="Logo" /> -->
          </q-avatar>
        </div>
        <div class="col">
          <div class="text-h5">{{ t('validation.lengthMatch', { length: 999 }) }}Welcome to My Knowledge Hub</div>
          <div class="text-subtitle2">Share your knowledge and learn from others</div>
        </div>
      </div>
    </q-banner>
    <div id="map" style="height: 400px;"></div>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Geolocation } from '@capacitor/geolocation'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar';

const $q = useQuasar();

const { t } = useI18n({ useScope: 'global' })

// const searchTerm = ref('')

const position = ref('determining...')
function getCurrentPosition() {
  Geolocation.getCurrentPosition().then(newPosition => {
    console.log('Current', newPosition)
    position.value = newPosition
  })
}
onMounted(async () => {
  if ($q.platform.is.client) {
    const leaflet = await import('leaflet');
    console.log('Leaflet loaded:', leaflet);

    const map = leaflet.map('map').setView([51.505, -0.09], 13);
    console.log('Map initialized:', map);

    leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    console.log('Tile layer added');
    // Add a marker
    leaflet.marker([51.505, -0.09]).addTo(map)
      .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
      .openPopup();
    getCurrentPosition();
  }
})
</script>

<style>
@import "leaflet/dist/leaflet.css";
</style>
