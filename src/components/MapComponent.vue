<template>
  <div style="width:80%; height: 80vh; margin:auto; padding: 20px">
    <q-btn @click="search" :label="t('search')" />
    <div id="map" style="height: 100%; width: 900px"></div>
    <q-btn @click="locateHere" :label="t('locateHere')" />
  </div>
  <q-btn v-if="users.token" class="q-my-md circle-float" color="primary" fab round floating icon="add"
    to="/article/create" />
  <q-dialog v-model="articleDialog" :maximized="$q.platform.is.mobile" @before-hide="back2ArticleDetail">
    <q-card style="max-width:820px">
      <q-bar style="background: transparent; position: sticky; top: 0; z-index: 1;">
        <q-space />
        <q-btn dense flat icon="close" v-close-popup @click="handleBackButton" size="lg">
          <q-tooltip>{{ t('close') }}</q-tooltip>
        </q-btn>
      </q-bar>
      <ArticleDetail :articleId="articleId" v-if="articleId" @articleDeleted="articleDeleted"
        @updateArticleList="updateArticleList" @backPage="back2ArticleDetail" />
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from 'src/stores/user'
import "leaflet/dist/leaflet.css";
import * as  articleService from 'src/services/articleService.js';

import ArticleDetail from 'src/components/ArticleDetail.vue';

const { t, locale, availableLocales } = useI18n({ useScope: 'global' });
const users = useUserStore()
let map;
let Leaflet;
const centerMarker = ref(null);
const loadedRegions = ref([]);

const props = defineProps({
  filter: Object
});

function isEqual(obj1, obj2) {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

watch(() => props.filter, async (newFilter, oldFilter) => {
  if (!isEqual(newFilter, oldFilter)) {
    console.log("try clear old data");
    clearOldData();
    await handleMapDrag();
  }
}, { deep: true });
function clearOldData() {
  clearAllMarkers();
  loadedRegions.value = []
  addedArticleIds = new Set();
  markerList = {};
}
function clearAllMarkers() {
  for (const id in markerList) {
    console.log("remove marker", id);
    if (markerList[id]) {
      console.log("have mark");
      markerList[id].remove(); // Remove the marker from the map
      console.log(markerList[id]);
    }
  }
  Object.keys(markerList).forEach(key => delete markerList[key]);
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
    await nextTick()
    Leaflet = await import('leaflet');
    map = Leaflet.map('map').setView([25.0474014, 121.5374556], 13);
    Leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 17,
      minZoom: 12,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    map.on("locationfound", (e) => {
      map.setView(e.latlng, e.accuracy / 2)
    })
    getCurrentPosition();

    map.on('moveend', handleMapDrag);
    centerMarker.value = Leaflet.marker(map.getCenter(), { draggable: false }).addTo(map).bindPopup(t("youAreHere")).openPopup();
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
    centerMarker.value.setLatLng([latitude, longitude]);
    map.setView([latitude, longitude], 15);
  }
}

let addedArticleIds = new Set();
let markerList = {};
async function handleMapDrag() {
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
    const response = await articleService.getArticleByRegion(bottomLeft, topRight, props.filter)
    if (!response.success) return
    const region = response.data.region;
    loadedRegions.value.push(region);
    console.log('Region loaded:', region);
    const articles = response.data.articles;
    console.log(articles.length);
    articles.forEach(article => {
      createArticleMarker(article);
    })
  }
}


function createArticleMarker(article) {
  if (addedArticleIds.has(article._id)) return
  // Generate the HTML for the custom icon
  const iconHtml = `
    <div style="text-align: center;">
      <img src="https://production-petfinder-private.s3.ap-northeast-1.amazonaws.com/${article.previewImage}" class="markerImage" />
      <div style="background-color: white; padding: 2px; border-radius: 3px;">
        ${article.rewardAmount}
      </div>
    </div>
  `;

  // Create the custom icon using Leaflet's divIcon
  const customIcon = L.divIcon({
    html: iconHtml,
    className: '', // Add a custom class if needed for styling
    iconSize: [30, 42], // Adjust size based on your design
    iconAnchor: [15, 42], // The point of the icon which will correspond to the marker's location
    popupAnchor: [0, -42], // The point from which the popup should open relative to the iconAnchor
  });

  // Create the marker with the custom icon
  const marker = L.marker([article.location.coordinates[1], article.location.coordinates[0]], {
    icon: customIcon,
    title: article.lostDistrict,
  }).addTo(map);

  // Attach a click event to the marker
  marker.on('click', () => {
    console.log("id:" + article._id);
    openArticleDetail(article._id);
  });
  markerList[article._id] = marker;
  // Store the article ID in the set to prevent duplication
  addedArticleIds.add(article._id);
  // Optionally return the marker in case you need to do further operations on it
  return marker;
}


const articleDialog = ref(false);
const articleId = ref(null);
function openArticleDetail(id) {
  window.history.pushState({}, '', generateArticleUrl(id))
  articleId.value = id
  articleDialog.value = true;
}

function back2ArticleDetail() {
  articleDialog.value = false;
  window.history.pushState({}, '', generateArticleUrl())
}
function generateArticleUrl(id) {
  if (id) {
    return `/article/${id}`
  } else {
    return "/"
  }
}
// 網址相關
const handleBackButton = (event) => {
  if (articleDialog.value) {
    event.preventDefault();
    back2ArticleDetail()
  } else {
    history.go(-1);
  }
};

function updateArticleList(article) {
  const theArticle = markerList[article._id]
  if (theArticle) {
    delete markerList[article._id]
    addedArticleIds.delete(article._id);

    const formatedArticle = JSON.parse(JSON.stringify(article))
    const previewImage = formatedArticle.images.find(item => item.isPreview)
    console.log("previewImage:", previewImage);
    console.log("previewImage.fullPath:", previewImage.fullPath.replace("original", "preview"));
    formatedArticle.previewImage = previewImage.fullPath.replace("original", "preview")
    createArticleMarker(formatedArticle);
    console.log("MapComponent.vue: updateArticleList formatedArticle", formatedArticle);
  }
}

// Delete related
const articleDeleted = (id) => {
  delete markerList[id]
  back2ArticleDetail()
};

</script>
<style lang='sass'>
.circle-float
  position: fixed
  bottom: 20px
  right: 20px
  width: 60px
  height: 60px
  border-radius: 50%
  display: flex
  justify-content: center
  align-items: center
  z-index: 9999
.markerImage
  width: 80px !important
  height: 80px !important
  border-radius: 40px !important
</style>
