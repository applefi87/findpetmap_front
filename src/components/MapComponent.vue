<template>
  <q-item>
    <q-no-ssr>
      <q-btn @click="search" label="Search" />
      <div id="map" style="height: 100%; width: 900px"></div>
      <q-btn @click="locateHere" label="Locate Here" />
    </q-no-ssr>
  </q-item>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import "leaflet/dist/leaflet.css";
import { apiCallToPostRegion } from 'src/services/mapService'; // Placeholder for your API service

const { t, locale, availableLocales } = useI18n({ useScope: 'global' });
let map;
let Leaflet;
const centerMarker = ref(null);
const loadedRegions = ref([]);

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
      minZoom: 8,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    map.on("locationfound", (e) => {
      console.log("locationfound");
      map.setView(e.latlng, e.accuracy / 2)
    })
    getCurrentPosition();
    centerMarker.value = Leaflet.marker(map.getCenter(), { draggable: false }).addTo(map).bindPopup('A pretty CSS3 popup.<br> Easily customizable.').openPopup();
    map.on('moveend', handleMapDrag);
    centerMarker.value = Leaflet.marker(map.getCenter(), { draggable: false }).addTo(map);
  }
})

// Clean up the map instance on unmount
onBeforeUnmount(() => {
  if (map) {
    map.remove();
  }
});

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

// Function to calculate distance between two points
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

// Handle the map dragging event
// Set to store already added article IDs
const addedArticleIds = new Set();

function handleMapDrag() {
  const bounds = map.getBounds();
  const bottomLeft = bounds.getSouthWest();
  const topRight = bounds.getNorthEast();

  // Check if the current bounds are within the already loaded regions
  const isRegionAlreadyLoaded = loadedRegions.value.some(region => {
    return (
      bottomLeft.lat >= region.bottomLeft.lat &&
      bottomLeft.lng >= region.bottomLeft.lng &&
      topRight.lat <= region.topRight.lat &&
      topRight.lng <= region.topRight.lng
    );
  });

  if (!isRegionAlreadyLoaded) {
    // Post to the API if the region hasn't been loaded yet
    apiCallToPostRegion(bottomLeft, topRight)
      .then((response) => {
        if (!response.success) return
        // Save the region returned by the API to the loadedRegions array
        const region = response.data.region;
        loadedRegions.value.push(region);
        console.log('Region loaded:', region);

        // Add the articles' points to the map as markers
        const articles = response.data.articles;
        console.log(articles.length);
        articles.forEach(article => {
          if (!addedArticleIds.has(article._id)) {
            const iconHtml = `
            <div style="text-align: center;">
              <img src="https://img.icons8.com/?size=100&id=j2EzyY8lgLyo&format=png&color=000000" style="width: 30px; height: 30px;" />
              <div style="background-color: white; padding: 2px; border-radius: 3px;">
                ${article.rewardAmount}
              </div>
            </div>
          `;

            const customIcon = L.divIcon({
              html: iconHtml,
              className: '', // Add a custom class if needed for styling
              iconSize: [30, 42], // Adjust size based on your design
              iconAnchor: [15, 42], // The point of the icon which will correspond to the marker's location
              popupAnchor: [0, -42], // The point from which the popup should open relative to the iconAnchor
            });

            const marker = L.marker([article.location.coordinates[1], article.location.coordinates[0]], {
              icon: customIcon,
              title: article.lostDistrict,
            }).addTo(map);

            marker.on('click', () => {
              console.log("id:" + article._id);
            });

            // Store the article ID in the set to prevent duplication
            addedArticleIds.add(article._id);
          }
        });
      })
      .catch((error) => {
        console.error('Error posting region data:', error);
      });
  }
}
</script>
