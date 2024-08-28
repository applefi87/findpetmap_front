<!-- 忘記密碼>未登入時點燈入畫面有得點 -->
<template>
  <q-page class="flex flex-center">
    <q-card-section v-if="!getTempPWD" class="q-pt-none">
      <h5><b>{{ t("forgetPassword") }}<br>{{ t("forgetPassword_Suggest") }}</b></h5>
      <q-form>
        <q-input ref="accountFormatValid" filled v-model="form.account" :label='t("account")'
          :rules="createI18nRules(rules.createAccountRules, t)" autocomplete="account" />
        <q-input ref="emailFormatValid" filled v-model="form.email" :label='t("email")'
          :rules="createI18nRules(rules.createEmailRules, t)" autocomplete="new-password" />
        <q-btn dense color="primary" :loading="mailSending" @click="handleSendForgetPWDCode()"
          :label='t("sendVerificationCode")'>
          <template v-slot:loading>
            <q-spinner-radio />
          </template>
        </q-btn>

        <q-input filled v-model="form.verificationCode" :label='t("verificationCode")'
          :rules="createI18nRules(rules.createRules, t, verificationCodeMode, true, verificationCodeLength)"
          ref="mailCodeValid"> <template v-slot:before>
            {{ identifier }}
          </template>
        </q-input>
        <q-btn dense color="primary" :loading="mailVerifying" @click="handleResetPWD()" :label='t("verify")'>
          <template v-slot:loading>
            <q-spinner-radio />
          </template>
        </q-btn>
      </q-form>
    </q-card-section>
    <q-card-section v-else class="q-pt-none">
      <h5><b>{{ t("resetPWDSuccess") }}</b></h5>
    </q-card-section>
  </q-page>
</template>

<script setup>
// 忘記密碼:
// 確認有申請>臨時code也有hash過>提供新密碼>自己重設

import { ref, reactive } from 'vue'
import { useUserStore } from 'src/stores/user'
import { useI18n } from 'vue-i18n'
import notify from 'src/utils/notify'
import emailConfigs from 'src/infrastructure/configs/emailConfigs.js'
import { sendForgetPWDCode, resetPWD } from '../../services/user.js';
import anv from 'an-validator';
const { rules, createI18nRules } = anv

const { t } = useI18n({ useScope: 'global' })
const users = useUserStore()
const getTempPWD = ref(false)
const form = reactive({ email: '', account: '', verificationCode: '' })
const emailFormatValid = ref(null)
const accountFormatValid = ref(null)
const mailSending = ref(false)

// ***********rule val區******************************

const identifier = ref(t('identifier'))
const handleSendForgetPWDCode = async () => {
  try {
    if (!(emailFormatValid.value.validate() && accountFormatValid.value.validate())) return
    mailSending.value = true
    const res = await sendForgetPWDCode(form, users.interfaceLanguage)
    if (res.success) {
      identifier.value = res.data.batchId
      await notify(res)
    }
  } catch (error) {
    await notify(error.response.data)
    // console.log(error.response.data)
  } finally {
    mailSending.value = false
  }
}
const type = "forgetPWD"
const verificationCodeLength = emailConfigs[`${type}VerificationCode`].codeRandomLength
const verificationCodeMode = emailConfigs[`${type}VerificationCode`].codeRandomMode

// 驗證email
const mailVerifying = ref(false)
const mailCodeValid = ref(null)
const handleResetPWD = async () => {
  try {
    // console.log('in')
    if (!mailCodeValid.value.validate()) return
    mailVerifying.value = true
    const rep = await resetPWD(form, users.interfaceLanguage)
    await notify(rep)
    if (!rep.success) throw new Error(rep.title)
    getTempPWD.value = true
  } catch (error) {
    // await notify(error.response.data)
    // console.log(error)
  }
  mailVerifying.value = false
}
</script>

<style lang="sass" scoped>
.q-form
  width: 300px
.q-btn
  margin-bottom: 30px
</style>
