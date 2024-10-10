<template>
  <q-page class="q-pa-md">
    <q-toolbar>
      <q-toolbar-title>{{ t('editUserInfo') }}</q-toolbar-title>
    </q-toolbar>
    <q-form @submit.prevent="handleUpdateUserInfo">
      <!-- User Info Fields -->
      <q-input v-model="userForm.info.name" filled type="text" :label="t('userName')"
        :rules="createI18nRules(rules.createLengthBetweenRule, t, nameMinLength, nameMaxLength)" />
      <q-input v-model="userForm.info.phone" filled type="text" :label="t('userPhone')"
        :rules="createI18nRules(rules.createLengthBetweenRule, t, phoneMinLength, phoneMaxLength)" />
      <q-input v-model="userForm.info.lineId" filled type="text" :label="t('userLineId')"
        :rules="createI18nRules(rules.createLengthBetweenRule, t, lineIdMinLength, lineIdMaxLength)" />
      <q-input v-model="userForm.info.others" filled type="textarea" :label="t('userOthers')"
        :rules="createI18nRules(rules.createLengthBetweenRule, t, othersMinLength, othersMaxLength)" />

      <!-- Password Field and Change Password Button -->
      <div class="row items-center q-mt-md">
        <div class="col-auto">
          <q-btn to="/me/changePWD" :label="t('changePassword')" outline color="primary" />
        </div>
      </div>

      <!-- Save Button -->
      <q-btn type="submit" class="q-mt-md" :label="t('save')" :loading="updating" />
    </q-form>
  </q-page>
</template>

<script setup>
import { ref, reactive } from 'vue';
import notify from 'src/utils/notify.js';
import { useI18n } from 'vue-i18n';
import { getMyInfo, updateInfo } from 'src/services/user.js';
import userConfigs from 'src/infrastructure/configs/userConfigs.js';
import an_validator from 'an-validator';

const { rules, createI18nRules } = an_validator;
const { t } = useI18n({ useScope: 'global' });

// Validation Lengths from Config
const nameMinLength = userConfigs.name.minLength;
const nameMaxLength = userConfigs.name.maxLength;
const phoneMinLength = userConfigs.phone.minLength;
const phoneMaxLength = userConfigs.phone.maxLength;
const lineIdMinLength = userConfigs.lineId.minLength;
const lineIdMaxLength = userConfigs.lineId.maxLength;
const othersMinLength = userConfigs.others.minLength;
const othersMaxLength = userConfigs.others.maxLength;


const userForm = reactive({
  info: {
    name: '',
    phone: '',
    lineId: '',
    others: '',
  },
});

const updating = ref(false);

// Fetch User Info on Component Mount
(async function initGetMyInfo() {
  try {
    const res = await getMyInfo();
    if (res.success) {
      userForm.info.name = res.data.info.name;
      userForm.info.phone = res.data.info.phone;
      userForm.info.lineId = res.data.info.lineId;
      userForm.info.others = res.data.info.others;
    }
  } catch (error) {
    await notify(error);
  }
})();

// Handle User Info Update
const handleUpdateUserInfo = async () => {
  try {
    updating.value = true;
    const res = await updateInfo(userForm);
    if (res.success) {
      await notify(res);
    }
  } catch (error) {
    console.error(error);
    await notify(error);
  } finally {
    updating.value = false;
  }
};
</script>
