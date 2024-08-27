<!-- 最上面那條(不含註冊框) -->
<template>
  <q-header elevated class="bg-primary text-white app-header">
    <q-toolbar>
      <q-btn padding="none" flat dense round icon="menu" aria-label="Menu" @click="toggleDrawer" style />
      <div class="logo-container" v-if="!$q.platform.is.mobile">
        <router-link to="/">
          <img src="https://img.icons8.com/ios/100/FFFFFF/storytelling.png" alt="Logo"></router-link>
      </div>
      <q-toolbar-title style="padding:0"><q-btn to="/" :label="t('KnowForum')" color="primary" unelevated no-caps
          size="lg" /></q-toolbar-title>
      <div class="search-container">
        <q-icon name="search" @click="router.push('/board')" style="font-size: 2em;margin-right: 5px;" />
        <!-- <input type="text" placeholder="Search..." /> -->
      </div>
      <q-select class="langSelect" v-model="locale" @update:model-value="handlechangeInterfaceLang"
        :options="languageOptions" :label='t("language")' borderless emit-value map-options style="width:100px"
        padding="none" />
      <q-no-ssr>
        <!-- <q-btn-dropdown v-if="users.token" class="info " dense flat :label='t("userInfo")' no-caps> -->
        <q-btn-dropdown v-if="users.token" class="info " dense flat no-caps hide-dropdown-icon>
          <div class="row no-wrap q-pa-sm">
            <q-btn icon="contact_page" :label='t("userInfo")' color="primary" flat class="q-ml-sm" to="/me" />
          </div>
          <div class="row no-wrap q-pa-sm">
            <q-btn icon="settings" :label='t("setting")' color="primary" flat class="q-ml-sm" to="/me/setting" />
          </div>
          <div class="row no-wrap q-pa-sm">
            <q-btn icon="logout" :label='t("logout")' color="primary c-w" @click="handleLogout" flat class="q-ml-sm"
              no-caps />
          </div>
          <b>{{ t('contactUs:') }}</b>
          <br>
          <b>applefi87@gmail.com</b>
        </q-btn-dropdown>
        <q-btn-dropdown v-if="!users.token" class="login" padding="none" dense flat :label='t("login")'
          v-model="users.loginDisplayState" hide-dropdown-icon>
          <div class="row no-wrap q-pa-md">
            <div class="column">
              <q-form @submit.prevent="handleLogin" class="q-gutter-xs loginBox">
                <q-input filled v-model="loginForm.account" :label='t("account")' lazy-rules
                  :rules="createI18nRules(rules.createAccountRules, t)" autocomplete="username" />
                <q-input filled v-model="loginForm.password" :label='t("password")' lazy-rules
                  :rules="createI18nRules(rules.createPasswordRules, t, 'basic', false)"
                  :type="isPwd ? 'password' : 'text'" autocomplete="password">
                  <template v-slot:append>
                    <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                      @click="isPwd = !isPwd" />
                  </template>
                </q-input>
                <div>
                  <div style="height:40px">
                    <q-btn :label="t('forgetPWD')" type="submit" color="primary" class="f-r" flat to="/forgetPWD" />
                  </div>
                  <q-btn :label='t("login")' type="submit" color="primary" />
                  <q-btn :label='t("register")' color="primary" flat class="q-ml-sm" @click="registerState = true" />
                </div>
              </q-form>
            </div>
          </div>
        </q-btn-dropdown>
      </q-no-ssr>
    </q-toolbar>
  </q-header>
  <registerDialog @register-success="onRegisterSuccess"></registerDialog>
</template>

<script setup>
import { ref, reactive, provide } from 'vue';
import { useUserStore } from 'src/stores/user'
import notify from 'src/utils/notify'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import avValidator from 'an-validator';
import { login, logout } from '../services/user.js';
import registerDialog from 'src/components/AppHeaderRegisterDialog.vue'
import { languageOptions } from 'src/infrastructure/configs/languageOptions.js'
const { rules, createI18nRules } = avValidator
const route = useRoute()
const router = useRouter()
const $q = useQuasar()


const users = useUserStore()
const { locale } = useI18n({ useScope: 'global' })
const t = key => key
//
const isPwd = ref(true)
const registerState = ref(false)
const emit = defineEmits(['toggle-left-drawer']);

function toggleDrawer() {
  emit('toggle-left-drawer');
}

function onRegisterSuccess() {
  users.loginDisplayState = false
  registerState.value = false
}
// 不用notify 因為即使出錯就算了

async function handlechangeInterfaceLang(value) {
  try {
    $q.cookies.set('interfaceLanguage', value, { expires: 365, path: '/', sameSite: 'Lax' })
    // $q.cookies.set('interfaceLanguage', locale.value, { expires: 365, sameSite: 'Lax', httpOnly: true, secure: true })
  } catch (error) {
    console.log(error)
  } finally {
    users.interfaceLanguage = locale.value
  }
}

// ****************登陸****
const loginForm = reactive({ account: "", password: "" })
async function handleLogin() {
  try {
    // 判斷方法待決定
    if (route.path === "/adminLogin") {
      loginForm.role = "admin"
    }
    const res = await login(loginForm);
    if (res.success) {
      users.updateUser(res.data)
      await notify(res);
      loginForm.account = ""
      loginForm.password = ""
    }
    // 管理員登入頁面,登入就變一般頁面
    if (route.path === "/adminLogin") {
      router.push("/")
    }
  } catch (error) {
    await notify(error);
  }
}

const handleLogout = async () => {
  try {
    await logout();
  } catch (error) {
  } finally {
    // At final for apiauth can remove jwt
    // Not at appheader for after post then must quickly remove data. not wait after notify.
    const users = useUserStore();
    users.clearLocalStorageAndCookie();

    await notify({ message: { title: t("logoutSuccess") } });
    router.go(0)
  }
}

provide("registerState", registerState)
</script>

<style lang=sass scoped>
.app-header
  display: flex
  justify-content: space-between
  align-items: center
  padding: 5px

.logo-container img
  height: 2rem

.search-container input
  width: 100%
  max-width: 300px
.langSelect
  width: 120px
  &:deep() *
    color: white
</style>
