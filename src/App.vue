<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script setup>
import { useSSRContext } from 'vue';
import { useUserStore } from 'src/stores/user'
import { updateDataToLocalStorageAndCookie, doesCookieExist } from 'src/utils/updateLocalStorageCookies.js'
import { useI18n } from 'vue-i18n'
const users = useUserStore()
const { locale, t } = useI18n({ useScope: 'global' })


// 初次進頁面,沒有設定偏好選項,部分邏輯異常
// 統一在這就一次性加工 (server只能放vue檔,放render.js無法放進store)
try {
  if (import.meta.env.SSR) {
    const ssrContext = useSSRContext()
    // interfaceLanguage //render.js 把req的偏好語言判斷完,所以一定有資料
    users.interfaceLanguage = ssrContext.interfaceLanguage;
    locale.value = users.interfaceLanguage
    // searchLanguages//render.js 把req的偏好語言判斷完,所以一定有資料
    users.searchLanguages = ssrContext.searchLanguages
    users.publishLanguages = ssrContext.publishLanguages
    // token 必須用這個,不然當undefined導致前端直接接手時pinia自動忽略產生localstorage,進而導致token在store有但ls沒有,後續程式復值改不到Ls
    users.token = ssrContext.token || ""
  } else {
    // token不用從後端傳回前端以免汙染
    const backendInterfaceLanguage = users.interfaceLanguage
    locale.value = backendInterfaceLanguage
    const backendSearchLanguages = JSON.parse(JSON.stringify(users.searchLanguages))
    const backendPublishLanguages = JSON.parse(JSON.stringify(users.publishLanguages))
    // If any match then not regular state so need to reset all as server rendered preference.
    if (!localStorage.getItem("users") || !doesCookieExist("interfaceLanguage") || !doesCookieExist("searchLanguages") || !doesCookieExist("publishLanguages") || (doesCookieExist("token") && !users.token) || (!doesCookieExist("token") && users.token)) {
      console.log("Welcome to KnowForum first time! Setting preference for you in localStorage & Cookie~");
      users.clearLocalStorageAndCookie()
      updateDataToLocalStorageAndCookie("interfaceLanguage", backendInterfaceLanguage);
      updateDataToLocalStorageAndCookie("searchLanguages", backendSearchLanguages);
      updateDataToLocalStorageAndCookie("publishLanguages", backendPublishLanguages)
    }
  }
} catch (error) {
  console.log(error);
}

</script>
