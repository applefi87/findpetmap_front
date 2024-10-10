<!--註冊框 -->
<template>
  <!-- 雖然我統一用外面控制，但必須要設v-model,就擺著好看 -->
  <q-dialog persistent v-model="registerState">
    <div class="trttt">
      <q-form class="q-gutter-md" @submit.prevent="handleRegister()">
        <q-stepper v-model="step" ref="stepper" color="primary" animated class="aaa" done-color="green">
          <q-step :name="1" :title='t("register")' icon="regidter" :done="step > 1">
            <q-card-section style="font-size:1rem;font-weight:700">
              <div class="text-h5">
                <b>{{ t("registerWellCome_1") }}</b>
              </div>
              <br />
              {{ t("registerWellCome_2") }}<br /><br />
              <div class="text-h">
                {{ t("registerWellCome_3") }}
              </div>
              <br />
              <div class="text-h">
                {{ t("registerWellCome_4") }}
              </div>
            </q-card-section>
          </q-step>
          <!--  -->
          <q-step :name="2" :title="t('verifyEmail')" icon="email" :done="step > 2">
            <q-card-section class="q-pt-none">
              <q-input ref="emailFormatValid" filled v-model="registerForm.email" type="email" :label='t("email")'
                :rules="createI18nRules(rules.createEmailRules, t)" />
              <q-btn dense color="secondary" :loading="mailSending" @click="sendMail()"
                :label="t('sendVerificationCode')">
                <template v-slot:loading>
                  <q-spinner-radio />
                </template>
              </q-btn>
              <q-input filled v-model="registerForm.verificationCode" :label='t("verificationCode")'
                :rules="createI18nRules(rules.createRules, t, 'number', true, 8)" ref="mailCodeValid">
                <template v-slot:before>
                  {{ identifier }}
                </template>
              </q-input>
            </q-card-section>
          </q-step>
          <!--  -->
          <q-step :name="3" :title="t('basicInfo')" icon="settings" :done="step > 3">
            <q-card-section class="q-pt-none">
              <q-input filled v-model="registerForm.account" autocomplete="new-account" :label='t("account")'
                :rules="accountValChange" ref=accountValid />
              <q-input filled v-model="registerForm.password" autocomplete="new-password" :label='t("password")'
                :type="isPwd ? 'password' : 'text'" ref=passwordValid
                :rules="createI18nRules(rules.createPasswordRules, t, 'basic', false)"><template v-slot:append>
                  <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                    @click="isPwd = !isPwd" />
                </template></q-input>
              <q-input filled v-model="registerForm.nickname" :label='t("nickname")' :rules="nicknameValChange"
                ref=nicknameValid />
              <hr />
              <div class="text-h6">{{ t("basicInfoRegister") }}</div>
              <q-input v-model="registerForm.info.name" filled type="text" :label="t('userName')"
                :rules="createI18nRules(rules.createLengthBetweenRule, t, nameMinLength, nameMaxLength)" />
              <q-input v-model="registerForm.info.phone" filled type="text" :label="t('userPhone')"
                :rules="createI18nRules(rules.createLengthBetweenRule, t, phoneMinLength, phoneMaxLength)" />
              <q-input v-model="registerForm.info.lineId" filled type="text" :label="t('userLineId')"
                :rules="createI18nRules(rules.createLengthBetweenRule, t, lineIdMinLength, lineIdMaxLength)" />
              <q-input v-model="registerForm.info.others" filled type="textarea" :label="t('userOthers')"
                :rules="createI18nRules(rules.createLengthBetweenRule, t, othersMinLength, othersMaxLength)" />
            </q-card-section>
          </q-step>
          <template v-slot:navigation>
            <q-stepper-navigation>
              <q-btn v-if="step < 3" @click="nextPage()" color="primary" :label="t('next')" :loading="mailVerifying">
                <template v-slot:loading>
                  <q-spinner-radio />
                </template>
              </q-btn>
              <q-btn v-else type="submit" color="primary" :label="t('register')" :loading="registering" />
              <q-btn v-if="step > 1" flat color="primary" @click="$refs.stepper.previous()" :label="t('previous')"
                class="q-ml-sm" :loading="registering" />
              <q-btn :label='t("close")' color="primary" flat class="q-ml-sm close-register" v-close-popup
                :loading="registering" />
            </q-stepper-navigation>
          </template>
        </q-stepper>
      </q-form>
    </div>
  </q-dialog>
</template>

<script setup>
// Imports and initializations
import { ref, reactive, inject, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from 'stores/user';
import { sendRegisterVerificationCode, verifyCode } from 'src/services/email.js';
import { register } from 'src/services/user.js';
import userConfigs from 'src/infrastructure/configs/userConfigs.js';
import notify from 'src/utils/notify.js'
import an_validator from 'an-validator';
const { rules, createI18nRules } = an_validator

const nameMinLength = userConfigs.name.minLength;
const nameMaxLength = userConfigs.name.maxLength;
const phoneMinLength = userConfigs.phone.minLength;
const phoneMaxLength = userConfigs.phone.maxLength;
const lineIdMinLength = userConfigs.lineId.minLength;
const lineIdMaxLength = userConfigs.lineId.maxLength;
const othersMinLength = userConfigs.others.minLength;
const othersMaxLength = userConfigs.others.maxLength;

const users = useUserStore();
const registerState = inject('registerState');
const emit = defineEmits(['register-success']);
const { t } = useI18n();
// Refs
const mustSchool = false;
const isPwd = ref(true);
const accountValid = ref(null);
const passwordValid = ref(null);
const nicknameValid = ref(null);
const emailFormatValid = ref(null);
const mailSending = ref(false);
const mailVerifying = ref(false);
const mailCodeValid = ref(null);
const step = ref(1);
const stepper = ref(null);

const registerForm = reactive({
  email: '',
  verificationCode: '',
  account: '',
  password: '',
  nickname: '',
  gender: 'male',
  info: {
    name: '',
    phone: '',
    lineId: '',
    others: ''
  }
});
const newIdentifier = ref(null)
const identifier = computed(() => newIdentifier.value ? newIdentifier.value : t('identifier'))

const sendMail = async () => {
  try {
    if (!emailFormatValid.value.validate()) return;
    mailSending.value = true;
    const rep = await sendRegisterVerificationCode(registerForm.email, mustSchool, users.interfaceLanguage);
    newIdentifier.value = rep.data.batchId
    await notify(rep);
  } catch (error) {
    await notify(error);
  } finally {
    mailSending.value = false;
  }
};

const nextPage = async () => {
  try {
    if (step.value === 2) {
      if (!(mailCodeValid.value.validate() && emailFormatValid.value.validate())) return;
      mailVerifying.value = true;
      const rep = await verifyCode(registerForm.email, registerForm.verificationCode);
      await notify(rep);
      if (rep.success) { step.value++ } else { return }
    }
    stepper.value.next();
  } catch (error) {
    console.log(error);
    await notify(error);
  } finally {
    mailVerifying.value = false;
  }
};

const accountValChange = ref(createI18nRules(rules.createAccountRules, t))
const nicknameValChange = ref(createI18nRules(rules.createNicknameRules, t, 4, 10))
const registering = ref(false);
const handleRegister = async () => {
  try {
    registering.value = true;
    const rep = await register(registerForm);
    if (rep.success) {
      await notify(rep);
      registerForm.email = '';
      registerForm.verificationCode = '';
      registerForm.account = '';
      registerForm.password = '';
      registerForm.nickname = '';
      registerForm.gender = '0';
      registerForm.info = {}
      step.value = 1;
      emit('register-success');
      return;
    }
    if (rep.data.accountUnavailable) {
      accountValChange.value[2] = val => val !== rep.data.accountUnavailable || rep.message;
    } else {
      accountValChange.value[2] = val => true || '';
    }
    if (rep.data.nicknameUnavailable) {
      nicknameValChange.value[2] = val => val !== rep.data.nicknameUnavailable || rep.message;
    } else {
      nicknameValChange.value[2] = val => true || '';
    }
    accountValid.value.validate();
    nicknameValid.value.validate();
  } catch (error) {
    await notify(error);
  } finally {
    registering.value = false;
  }
};

</script>

<style lang="sass" scoped>
.gender
  margin-bottom: 0
  font-size: 0.8rem
.q-stepper
  width: 500px
  height: 600px
  position: relative
  overflow: scroll
  &:deep(.q-field)
    margin-top: 0.6rem
.q-stepper__nav
  width: 100%
</style>
