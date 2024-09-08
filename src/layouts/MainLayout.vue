<template>
  <q-layout view="hHh lpR fff">
    <q-no-ssr>
      <LazyAppHeader @toggle-left-drawer="toggleLeftDrawer" />
      <q-drawer v-model='leftDrawer' side="left" :overlay="leftDrawerOverlay" persistent bordered elevated
        :breakpoint="768" style="height: 100% ;display:flex;flex-direction: column">
        <q-scroll-area class="fit">
          <q-list padding>
            <q-item class="custom-item" v-for="(item, index) in drawerItems" :key="index" clickable v-ripple
              @click="handleAction(item)">
              <q-item-section avatar>
                <q-icon :name="item.icon" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="custom-label">{{ t(item.label) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <!-- <b>{{ t('contactUs:') }}</b>
          <br>
          <b>applefi87@gmail.com</b> -->
        </q-scroll-area>
      </q-drawer>
    </q-no-ssr>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from 'src/stores/user'
import { logout } from '../services/user.js';
import notify from 'src/utils/notify'

const LazyAppHeader = defineAsyncComponent(() =>
  import('components/AppHeader.vue')
);

const { t } = useI18n()

const leftDrawer = ref(false);
const leftDrawerOverlay = ref(true)
const toggleLeftDrawer = () => {
  leftDrawer.value = !leftDrawer.value;
};
const router = useRouter()
const drawerItems = [
  { label: "userInfo", route: '/me', icon: 'contact_page' },
  // { label: "setting", route: '/me/setting', icon: 'settings' },
  { label: "logout", route: '', icon: 'logout', action: handleLogout },
]

async function handleLogout() {
  try {
    await logout();
  } catch (error) {
  } finally {
    // At final for apiauth can remove jwt
    // Not at appheader for after post then must quickly remove data. not wait after notify.
    const users = useUserStore();
    users.clearLocalStorageAndCookie();
    await notify({ success: true, message: { title: t("logoutSuccess") } });
    router.go(0)
  }
}

const handleAction = (item) => {
  if (item.route) {
    router.push(item.route)
    leftDrawer.value = false
  } else if (item.action) {
    item.action()
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
</style>
