<template>
  <div style="width:80%; height: 80vh; margin:auto; padding: 20px">
    <q-btn @click="search" label="Search" />
    <div id="map" style="height: 100%; width: 900px"></div>
    <q-btn @click="locateHere" label="Locate Here" />
  </div>
  <q-dialog v-model="articleDialog" :maximized="$q.platform.is.mobile" @before-hide="back2ArticleDetail">
    <q-card style="max-width:820px">
      <q-bar style="background: transparent; position: sticky; top: 0; z-index: 1;">
        <q-space />
        <q-btn dense flat icon="close" v-close-popup @click="handleBackButton" size="lg">
          <q-tooltip>{{ t('close') }}</q-tooltip>
        </q-btn>
      </q-bar>
      <ArticleDetail :articleId="articleId" v-if="articleId" @articleDeleted="articleDeleted"
        @updateArticleList="updateArticleList" />
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import "leaflet/dist/leaflet.css";
import * as  articleService from 'src/services/articleService.js';
import ArticleDetail from 'src/components/ArticleDetail.vue';

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
      map.setView(e.latlng, e.accuracy / 2)
    })
    getCurrentPosition();

    map.on('moveend', handleMapDrag);

    centerMarker.value = Leaflet.marker(map.getCenter(), { draggable: false }).addTo(map).bindPopup('A pretty CSS3 popup.<br> Easily customizable.').openPopup();
    let isUpdatingMarker = false;
    map.on('move', (event) => {
      if (!isUpdatingMarker) {
        isUpdatingMarker = true;
        centerMarker.value.setLatLng(event.target.getCenter());
        isUpdatingMarker = false;
      }
    });
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
    const response = await articleService.getArticleByRegion(bottomLeft, topRight)
    if (!response.success) return
    const region = response.data.region;
    loadedRegions.value.push(region);
    console.log('Region loaded:', region);
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
        // 後台傳來統一先經再緯度，但leaflet 事先緯再經度
        const marker = L.marker([article.location.coordinates[1], article.location.coordinates[0]], {
          icon: customIcon,
          title: article.lostDistrict,
        }).addTo(map);

        marker.on('click', () => {
          console.log("id:" + article._id);
          openArticleDetail(article._id)
        });

        // Store the article ID in the set to prevent duplication
        addedArticleIds.add(article._id);
      }
    })
  }
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
  let result
  result = `/article/`
  if (id) {
    result += `${id}`
  }
  return result;
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
  const theArticle = articleList.value.findIndex(a => a._id.toString() === article._id)
  if (theArticle) {
    theArticle.title = article.title
    theArticle.content = article.content
    theArticle.previewContent = article.previewContent
    theArticle.thumbnail = article.thumbnail
  }
}

// Delete related
const articleDeleted = (id) => {
  articleId.value = null
  const deletedIndex = articleList.value.findIndex(article => article._id === id);
  if (deletedIndex !== -1) {
    articleList.value.splice(deletedIndex, 1);
  }
  back2ArticleDetail()
};

</script>
