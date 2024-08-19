<template>
  <q-layout view="hHh lpR fff">
    <AppHeader @toggle-left-drawer="toggleLeftDrawer" />
    <q-drawer v-model='leftDrawer' side="left" :overlay="leftDrawerOverlay" persistent bordered elevated
      :breakpoint="768" style="height: 100% ;display:flex;flex-direction: column">
      <q-scroll-area class="fit">
        <q-list padding>
          <q-item class="custom-item" v-for="(item, index) in drawerItems" :key="index" clickable v-ripple
            @click="navigateTo(item)">
            <q-item-section>
              <!-- <q-item-label class="custom-label">{{ t(item.label) }}</q-item-label> -->
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from 'components/AppHeader.vue';
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })

const leftDrawer = ref(false);
const leftDrawerOverlay = ref(true)
const toggleLeftDrawer = () => {
  leftDrawer.value = !leftDrawer.value;
};
const router = useRouter()
const drawerItems = [
  { label: 'articleList', route: 'article' },
  { label: 'boardList', route: 'board' },
]

const navigateTo = (item) => {
  if (item.route) {
    router.push("/" + item.route)
    leftDrawer.value = false
  }
}

</script>

<style lang="sass" scoped>
/* Global styles */
body
  font-family: 'Roboto', sans-serif
  font-size: 14px
  color: #333

/* Quasar overrides */
.q-card
  margin-top: 10px

.q-page-container
  padding-top: 10px
  height: 100vh

/* Custom styles */
.custom-item
  background-color: #f5f5f5
  border-radius: 5px
  margin: 10px 0

.custom-label
  color: #333
  font-weight: 500
</style>
