<template>
  <q-layout>
    <q-page-container>
      <q-no-ssr>
        <q-page>
          <div class="text-h2">{{ t('404NotFound') }}</div>
          <div class="text-body-1">{{ t('pageNotExist') }}</div>
        </q-page>
      </q-no-ssr>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })
const router = useRouter()

// Define methods
const redirectToHomePage = () => {
  router.push("/")
}

// Redirect to home page after 5 seconds
onMounted(() => {
  setTimeout(() => {
    redirectToHomePage()
  }, 600)
})
</script>

<style lang="sass" scoped>
q-container
  height: 100%
  display: flex
  flex-direction: column
  justify-content: center
  align-items: center
</style>
