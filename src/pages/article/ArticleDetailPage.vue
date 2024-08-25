<!-- 文章詳情的外框，當用網址導向文章就會長這樣 -->
<template>
  <q-page class="q-pa-md">
    <q-toolbar>
      <q-btn flat icon="arrow_back" round @click="goBack" />
    </q-toolbar>
    <articleDetail :articleId="articleId" v-if="articleId" @backPage="goBack" @articleDeleted="articleDeleted" />
  </q-page>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import articleDetail from '../../components/ArticleDetail.vue'

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

<style lang='sass' scoped>
.q-page
  display: flex
  flex-direction: column
  align-items: center

.q-form
  margin: 20px
  max-width: 600px

.q-input__label
  font-size: 16px
  font-weight: 500
  color: #424242

.q-input__underline:before
  border-color: #424242

.q-input__underline:after
  border-color: #5e5e5e

.q-input__details
  color: #5e5e5e
  font-size: 14px

.q-card
  max-width: 600px
  margin-top: 20px

.markdown-preview
  padding: 20px

.q-btn
  margin-top: 20px
</style>
