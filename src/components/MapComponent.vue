<template>
  <div style="display: flex; flex-direction: column; height: 100%; ">
    <q-no-ssr style="flex-grow: 1;">
      <div id="map"></div>
    </q-no-ssr>
    <q-btn @click="locateHere" :label="t('locateHere')" style="align-self: center; margin-top: 10px; flex-shrink: 0;" />
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
      <LazyArticleDetailExtended v-if="articleId" :articleId="articleId" @articleDeleted="articleDeleted"
        @updateArticleList="updateArticleList" @backPage="back2ArticleDetail" />
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick, defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from 'src/stores/user'
import * as  articleService from 'src/services/articleService.js';

const LazyArticleDetailExtended = defineAsyncComponent(() =>
  import('components/ArticleDetail.vue')
);
const { t } = useI18n({ useScope: 'global' });
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
    if (markerList[id]) {
      markerList[id].remove();
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

onMounted(() => {
  const isServerSide = process.env.SERVER
  if (!isServerSide) {

    // Step 1: Create the link element for Leaflet's CSS
    const leafletCss = document.createElement('link');
    leafletCss.rel = 'stylesheet';
    leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    leafletCss.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    leafletCss.crossOrigin = 'anonymous';
    // Step 2: Append the CSS to the document's head
    document.head.appendChild(leafletCss);

    // Step 3: Wait for the CSS to fully load before appending the JS file
    leafletCss.onload = () => {
      console.log("leafletCss.onload");
      const leafletJs = document.createElement('script');
      leafletJs.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      leafletJs.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      leafletJs.crossOrigin = 'anonymous';
      document.body.appendChild(leafletJs);

      leafletJs.onload = () => {
        console.log("leafletJs.onload");
        const L = window.L;
        nextTick(() => {
          console.log("nextTick");
          map = L.map('map').setView([25.0474014, 121.5374556], 13);
          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 17,
            minZoom: 12,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          }).addTo(map);

          map.on("locationfound", (e) => {
            map.setView(e.latlng, e.accuracy / 2)
          })
          getCurrentPosition();

          map.on('moveend', handleMapDrag);
          centerMarker.value = L.marker(map.getCenter(), { draggable: false }).addTo(map).bindPopup(t("youAreHere")).openPopup();
        })
      }
    };
    leafletCss.onerror = () => {
      console.error("Failed to load Leaflet CSS.");
    };
  } else {
    map.invalidateSize(); // Recalculate map size
    map.setView(map.getCenter(), map.getZoom()); // Re-center the map
  }
})

// Clean up the map instance on unmount
onBeforeUnmount(() => {
  if (map) {
    map.remove();
  }
});

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
    // console.log('Region loaded:', region);
    const articles = response.data.articles;
    // console.log(articles.length);
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
  if (clearMarkerById(article._id)) {
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
  clearMarkerById(id)
  back2ArticleDetail()
};
function clearMarkerById(id) {
  const theArticle = markerList[id]
  if (!!theArticle) {
    console.log("remove marker", id);
    map.removeLayer(theArticle)
    delete markerList[id]
    addedArticleIds.delete(id);
    return true
  }
}
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
