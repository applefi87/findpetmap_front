<!-- 編輯個人偏好設定，目前還沒開放改性別/自我介紹等 -->
<template>
  <q-page class="q-pa-md">
    <q-toolbar>
      <q-toolbar-title>{{ t('editUserInfo') }}</q-toolbar-title>
    </q-toolbar>
    <div class="text-subtitle2 q-mt-sm">
      <q-no-ssr>
        <q-avatar size="100px" v-if="users.profileImageUrl"><img :src="users.profileImageUrl" /> </q-avatar>
      </q-no-ssr>
    </div>
    <q-btn to="/me/editProfile" :label="t('editProfileImage')" outline color="primary" />
    <q-form @submit.prevent="handleEditUserInfo">
      <q-select v-model="userInfo.interfaceLanguage" :options="refLanguageOptions" :label="t('interfaceLanguage')" />
      <q-btn type="submit" class="q-mt-md" :label="t('save')" />
    </q-form>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import notify from 'src/utils/notify.js'
import { useI18n } from 'vue-i18n';
import { getMyInfo, editInfo } from 'src/services/user.js';
import { languageOptions } from 'src/infrastructure/configs/languageOptions.js'
import { useUserStore } from 'stores/user';
import { languagesListstr2Obj } from "src/utils/languageListTool.js"
const users = useUserStore();
const { locale, t } = useI18n({ useScope: 'global' })

const userInfo = ref({
  gender: "",
  // living: '',
  // job: '',
  // interest: '',
  // others: '',
  interfaceLanguage: [],
});

const refLanguageOptions = ref(languageOptions);
(async function initGetMyInfo() {
  try {
    const res = await getMyInfo()
    if (res.success) {
      userInfo.value.gender = res.data.gender
      // userInfo.value.living = res.data.living
      // userInfo.value.job = res.data.job
      // userInfo.value.interest = res.data.interest
      // userInfo.value.others = res.data.others
      userInfo.value.interfaceLanguage = refLanguageOptions.value.find(langObj => langObj.value === res.data.interfaceLanguage)
    }
  } catch (error) {
    await notify(error);
  }
})()


const handleEditUserInfo = async () => {
  try {
    const res = await editInfo(userInfo.value)
    if (res.success) {
      users.updateLanguages(res.data)
      locale.value = res.data.interfaceLanguage
      await notify(res);
    }
  } catch (error) {
    console.log(error);
    await notify(error);
  }
};

</script>
