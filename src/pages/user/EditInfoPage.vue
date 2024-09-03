<!-- 編輯個人偏好設定，目前還沒開放改性別/自我介紹等 -->
<template>
  <q-page class="q-pa-md">
    <q-toolbar>
      <q-toolbar-title>{{ t('editUserInfo') }}</q-toolbar-title>
    </q-toolbar>
    <q-form @submit.prevent="handleUpdateUserInfo">
      <q-input v-model="userForm.info.name" filled type="text" :label="t('userName')"
        :rules="createI18nRules(rules.createLengthBetweenRule, t, nameMinLength, nameMaxLength)" />
      <q-input v-model="userForm.info.phone" filled type="text" :label="t('userPhone')"
        :rules="createI18nRules(rules.createLengthBetweenRule, t, phoneMinLength, phoneMaxLength)" />
      <q-input v-model="userForm.info.lineId" filled type="text" :label="t('userLineId')"
        :rules="createI18nRules(rules.createLengthBetweenRule, t, lineIdMinLength, lineIdMaxLength)" />
      <q-input v-model="userForm.info.others" filled type="textarea" :label="t('userOthers')"
        :rules="createI18nRules(rules.createLengthBetweenRule, t, othersMinLength, othersMaxLength)" />
      <q-btn type="submit" class="q-mt-md" :label="t('save')" :loading="updating" />
    </q-form>
  </q-page>
</template>

<script setup>
import { ref, reactive } from 'vue';
import notify from 'src/utils/notify.js'
import { useI18n } from 'vue-i18n';
import { getMyInfo, updateInfo } from 'src/services/user.js';
import { useUserStore } from 'stores/user';
import userConfigs from 'src/infrastructure/configs/userConfigs.js';
import anValidator from 'an-validator';

const { rules, createI18nRules } = anValidator
const nameMinLength = userConfigs.name.minLength;
const nameMaxLength = userConfigs.name.maxLength;
const phoneMinLength = userConfigs.phone.minLength;
const phoneMaxLength = userConfigs.phone.maxLength;
const lineIdMinLength = userConfigs.lineId.minLength;
const lineIdMaxLength = userConfigs.lineId.maxLength;
const othersMinLength = userConfigs.others.minLength;
const othersMaxLength = userConfigs.others.maxLength;

const users = useUserStore();
const { locale, t } = useI18n({ useScope: 'global' })

const userForm = reactive({
  nickname: '',
  info: {
    name: '',
    phone: '',
    lineId: '',
    others: ''
  }
});

(async function initGetMyInfo() {
  try {
    const res = await getMyInfo()
    if (res.success) {
      userForm.info.name = res.data.info.name
      userForm.info.phone = res.data.info.phone
      userForm.info.lineId = res.data.info.lineId
      userForm.info.others = res.data.info.others
    }
  } catch (error) {
    await notify(error);
  }
})()

const updating = ref(false);
const handleUpdateUserInfo = async () => {
  try {
    updating.value = true
    const res = await updateInfo(userForm)
    if (res.success) {
      // users.updateLanguages(res.data)
      // locale.value = res.data.interfaceLanguage
      await notify(res);
    }
  } catch (error) {
    console.log(error);
    await notify(error);
  } finally {
    updating.value = false
  }
};

</script>
