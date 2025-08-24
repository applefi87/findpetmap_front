<!-- 文章詳情的外框，當用網址導向文章就會長這樣 -->
<template>
  <q-page class="q-pa-md bg-surface">
    <q-toolbar class="bg-primary text-white elev-2 rounded-b-lg q-pl-md q-pr-md">
      <q-btn flat round icon="arrow_back" class="text-white" :label="t('back')" @click="goBack" />
    </q-toolbar>
    <articleDetail
      :articleId="articleId"
      v-if="articleId"
      @backPage="goBack"
      @articleDeleted="articleDeleted"
      class="rounded-lg elev-2 bg-surface q-pa-md"
    />
  </q-page>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import articleDetail from '../../components/ArticleDetail.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })

const route = useRoute()
const router = useRouter()
const articleId = route.params.id

function goBack() {
  const [navEntry] = performance.getEntriesByType('navigation');
  if (navEntry && navEntry.type === 'back_forward') {
    router.go(-1);
  } else {
    router.push('/');
  }
}


const articleDeleted = (id) => {
  goBack()
};

</script>

<style scoped>
</style>
