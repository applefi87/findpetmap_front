<!-- 最上面那條(不含註冊框) -->
<template>
  <q-header elevated class="bg-primary text-white">
    <q-toolbar>
      <q-btn padding="none" flat dense round icon="menu" aria-label="Menu" @click="toggleDrawer" />
      <router-link to="/" class="logo-link flex items-center q-ml-sm">
        <!-- Logo is hidden on small screens (below 'md') -->
        <div class="logo-container q-hidden-xs q-hidden-sm">
          <img src="https://img.icons8.com/ios/100/FFFFFF/storytelling.png" alt="Logo" />
        </div>
        <span class="title-text q-ml-sm title-button">{{ t('petFinder') }}</span>
      </router-link>

      <q-space />

      <q-no-ssr>
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
import { login } from '../services/user.js';
import registerDialog from 'src/components/AppHeaderRegisterDialog.vue'
import { normalCookieOptions } from 'src/utils/getCookieOption.js'
import an_validator from 'an-validator';
const { rules, createI18nRules } = an_validator

const route = useRoute()
const router = useRouter()
const $q = useQuasar()


const users = useUserStore()
const { t } = useI18n({ useScope: 'global' })
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
      // Manually call the beforeEnter guard
      // 比如忘記密碼是不該登入還在的，但又不想登入強制重載入，可以這樣寫
      const currentRoute = router.currentRoute.value;
      const route = findRouteByPath(router.options.routes, currentRoute.path);
      const guard = route?.beforeEnter;
      if (guard) {
        guard(currentRoute, router.currentRoute.value, (redirect) => {
          if (redirect) {
            router.push(redirect);
          }
        });
      }
    }
    // 管理員登入頁面,登入就變一般頁面
    if (route.path === "/adminLogin") {
      router.push("/")
    }
  } catch (error) {
    await notify(error);
  }
}
function findRouteByPath(routes, path, preRoute = "") {
  for (const route of routes) {
    if (preRoute + route.path === path) return route;
    if (route.children) {
      const childRoute = findRouteByPath(route.children, path, route.path);
      if (childRoute) return childRoute;
    }
  }
  return null;
}

provide("registerState", registerState)
</script>

<style lang=sass scoped>
.logo-container img
  height: 2rem

.search-container input
  width: 100%
  max-width: 300px
.langSelect
  width: 120px
  &:deep() *
    // color: white

.title-button
  font-size: 20px
  color: white
</style>
