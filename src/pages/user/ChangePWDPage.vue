<!-- 改密碼頁面 -->
<template>
  <q-page class="flex flex-center">
    <q-form>
      <q-card-section v-if="!pwdChanged" class="q-pt-none">
        <q-input filled v-model="form.password" :label='t("password")' :hint='t("validation.lowerCaseAlphaNum")'
          :type="isPwd ? 'password' : 'text'" :rules="createI18nRules(rules.createPasswordRules, t, 'basic', false)"
          autocomplete="new-password"><template v-slot:append>
            <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd" />
          </template></q-input>
        <q-input filled v-model="form.newPWD" :label='t("newPWD")' :hint='t("validation.lowerCaseAlphaNum")'
          :type="isPwd ? 'password' : 'text'" :rules="createI18nRules(rules.createPasswordRules, t, 'basic', false)"
          autocomplete="new-password"><template v-slot:append>
            <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd" />
          </template></q-input>
        <q-btn dense color="primary" :loading="pwdVerifying" @click="handleChangePWD()" :label="t('verify')">
          <template v-slot:loading>
            <q-spinner-radio />
          </template>
        </q-btn>
      </q-card-section>
      <q-card-section v-else class="q-pt-none">
        <p>{{ account + t('hello') }}</p>
        <p>{{ t('changePWDSuccessfully') }}</p>
      </q-card-section>
    </q-form>
  </q-page>
</template>

<script setup>

import { ref, reactive } from 'vue'
import notify from 'src/utils/notify'
import { useUserStore } from 'src/stores/user'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { changePWD } from '../../services/user.js';
import { rules, createI18nRules } from 'an-validator';

const router = useRouter()
const { t } = useI18n({ useScope: 'global' })
const pwdChanged = ref(false)
const pwdVerifying = ref(false)
const isPwd = ref(true)
const users = useUserStore()
const form = reactive({ password: '', newPWD: '' })
const account = ref('')


const handleChangePWD = async () => {
  try {
    if (form.password === form.newPWD) return notify(t('changePWDSame'))
    pwdVerifying.value = true
    const res = await changePWD(form)
    await notify(res)
    // 印象要這樣取最新的，淡忘記理由 之後測試否必要
    // 似乎是別的程式會直接改，這時users 要重用才會是最新的
    // const users = useUserStore()
    if (res.success || !users.token) {
      users.clearLocalStorageAndCookie();
      router.go(0)
    }
    pwdVerifying.value = false
  } catch (error) {
    console.log("handleChangePWD-error:" + error);
    await notify(error)
    pwdVerifying.value = false
    // console.log(error.response.data)
  }
}
const init = () => {
  if (!users.token) router.push('/')
}
init()
</script>
<style lang="sass" scoped>
.q-input
  width: 300px
  max-width: 80vw !important
  margin-bottom: 30px
</style>
