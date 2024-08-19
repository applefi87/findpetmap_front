<!--註冊框 -->
<template>
  <!-- 雖然我統一用外面控制，但必須要設v-model,就擺著好看 -->
  <q-dialog persistent v-model="registerState">
    <div class="trttt">
      <q-form class="q-gutter-md" @submit.prevent="handleRegister()">
        <q-stepper v-model="step" ref="stepper" color="primary" animated class="aaa" done-color="green">
          <q-step :name="1" :title='t("register")' icon="regidter" :done="step > 1">
            <q-card-section style="font-size:1rem;font-weight:700">
              {{ t("registerWellCome_1") }}<br />
              {{ t("registerWellCome_2") }}<br /><br />
              <div class="text-h">{{ t("registerWellCome_3") }}</div>
              <br />
              <div class="text-h">{{ t("registerWellCome_4") }}</div>
            </q-card-section>
            <!-- <p class="text-h6">1.可選匿名 <br>2.評價依照課程名保存，更好查閱 <br>3.好的評價置頂 <br>4.評價越受歡迎，帳號分數越高</p> -->
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
                :rules="createI18nRules(rules.createRules, t, 'basic', true, 8)" ref="mailCodeValid">
                <template v-slot:before>
                  {{ identifierDisplay }}
                </template>
              </q-input>
            </q-card-section>
          </q-step>
          <!--  -->
          <q-step :name="3" :title="t('basicinfo')" icon="settings" :done="step > 3">
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
              <!-- :hint="t('nicknameRules')" -->
              <p class="gender">{{ t('gender') }}</p>
              <div class="q-gutter-sm">
                <q-radio v-model="registerForm.gender" val='male' :label='t("male")' />
                <q-radio v-model="registerForm.gender" val='female' :label='t("female")' />
                <q-radio v-model="registerForm.gender" val='others' :label='t("others")' />
              </div>
            </q-card-section>
          </q-step>
          <template v-slot:navigation>
            <q-stepper-navigation>
              <q-btn v-if="step < 3" @click="nextPage()" color="primary" :label="t('next')" :loading="mailVerifying">
                <template v-slot:loading>
                  <q-spinner-radio />
                </template>
              </q-btn>
              <q-btn v-else type="submit" color="primary" :label="t('register')" />
              <q-btn v-if="step > 1" flat color="primary" @click="$refs.stepper.previous()" :label="t('previous')"
                class="q-ml-sm" />
              <q-btn :label='t("close")' color="primary" flat class="q-ml-sm close-register" v-close-popup />
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
import notify from 'src/utils/notify.js'
import avValidator from 'an-validator';

const { rules, createI18nRules } = avValidator
const users = useUserStore();
const registerState = inject('registerState');
const emit = defineEmits(['register-success']);
// const { t } = useI18n();
const t = key => key
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

// Reactive object
const registerForm = reactive({
  email: '',
  verificationCode: '',
  account: '',
  password: '',
  nickname: '',
  gender: 'male',
  role: 'user'
});
const identifier = computed(() => t('identifier'))
const identifierDisplay = ref(identifier.value)

const sendMail = async () => {
  try {
    if (!emailFormatValid.value.validate()) return;
    mailSending.value = true;
    const rep = await sendRegisterVerificationCode(registerForm.email, mustSchool, users.interfaceLanguage);
    await notify(rep);
    // console.log(rep.data.batchId);
    identifierDisplay.value = rep.data.batchId
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
const handleRegister = async () => {
  try {
    const rep = await register(registerForm);
    await notify(rep);
    if (rep.success) {
      registerForm.email = '';
      registerForm.verificationCode = '';
      registerForm.account = '';
      registerForm.password = '';
      registerForm.nickname = '';
      registerForm.gender = '0';
      step.value = 1;
      emit('register-success');
      return;
    }
    // Handle account and nickname validation errors
    // (Add the accountVal and nicknameVal arrays if they are defined somewhere else in your code)
    if (rep.data.accountUnavailable) {
      accountValChange.value[2] = val => val !== rep.data.account || rep.message.title;
    } else {
      accountValChange.value[2] = val => true || '';
    }
    if (rep.nicknameUnavailable) {
      nicknameValChange.value[2] = val => val !== rep.nickname || rep.message.title;
    } else {
      nicknameValChange.value[2] = val => true || '';
    }
    accountValid.value.validate();
    nicknameValid.value.validate();
  } catch (error) {
    await notify(error);
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
  &:deep(.q-stepper__nav)
    position: absolute
    bottom: 0
  &:deep(.q-field)
    margin-top: 0.6rem
.q-stepper__nav
  width: 100%
</style>
