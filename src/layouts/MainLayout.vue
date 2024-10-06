<template>
  <q-layout view="hHh lpR fff" style="max-height: 100vh; display: flex;">
    <AppHeader @toggle-left-drawer="toggleLeftDrawer" />
    <q-drawer v-model="leftDrawer" side="left" :overlay="leftDrawerOverlay" bordered elevated :breakpoint="768"
      style="height: 100%; display: flex; flex-direction: column;">
      <q-scroll-area class="fit">
        <q-list>
          <!-- Static Items (Visible for all users) -->
          <q-item clickable v-close-popup @click="openAboutUs">
            <q-item-section>{{ t('aboutUs') }}</q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-select v-model="locale" @update:model-value="handleChangeInterfaceLang" :options="languageOptions"
                :label="t('language')" borderless emit-value map-options padding="none" />
            </q-item-section>
          </q-item>

          <!-- Dynamic Items (Visible only if user is logged in) -->
          <q-item v-for="(item, index) in filteredDrawerItems" :key="index" clickable v-ripple
            @click="handleAction(item)">
            <q-item-section avatar>
              <q-icon :name="item.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ t(item.label) }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container style="flex-grow: 1;">
      <router-view />
    </q-page-container>

    <!-- Include AboutUsDialog -->
    <AboutUsDialog v-model="aboutUsOpen" />
  </q-layout>
</template>


<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useUserStore } from 'src/stores/user';
import { logout } from '../services/user.js';
import AppHeader from 'components/AppHeader.vue';
import notify from 'src/utils/notify';
import AboutUsDialog from 'src/components/AboutUsDialog.vue';
import { languageOptions } from 'src/infrastructure/configs/languageOptions.js';
import { normalCookieOptions } from 'src/utils/getCookieOption.js';
import { useQuasar } from 'quasar';

const users = useUserStore();
const { t, locale } = useI18n({ useScope: 'global' });
const $q = useQuasar();

const leftDrawer = ref(false);
const leftDrawerOverlay = ref(true);
const toggleLeftDrawer = () => {
  leftDrawer.value = !leftDrawer.value;
};

const openAboutUs = () => {
  aboutUsOpen.value = true;
  leftDrawer.value = false;
};

const router = useRouter();

const drawerItems = [
  { label: 'userInfo', route: '/me', icon: 'contact_page' },
  { label: 'myArticle', route: '/me/article', icon: 'contact_page' },
  // { label: 'setting', route: '/me/setting', icon: 'settings' },
  { label: 'logout', route: '', icon: 'logout', action: handleLogout },
];
const filteredDrawerItems = computed(() => {
  return users.token ? drawerItems : [];
});

async function handleLogout() {
  try {
    await logout();
  } catch (error) {
    // Handle error if necessary
  } finally {
    users.clearLocalStorageAndCookie();
    await notify({ success: true, message: { title: t('logoutSuccess') } });
    router.go(0);
  }
}

const handleAction = (item) => {
  if (item.route) {
    router.push(item.route);
    leftDrawer.value = false;
  } else if (item.action) {
    item.action();
  }
};

const aboutUsOpen = ref(false);

async function handleChangeInterfaceLang(value) {
  try {
    $q.cookies.set('interfaceLanguage', value, normalCookieOptions);
  } catch (error) {
    console.log(error);
  } finally {
    users.interfaceLanguage = value;
    leftDrawer.value = false; // Close the drawer
  }
}
</script>
