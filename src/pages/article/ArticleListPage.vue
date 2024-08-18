<!-- 文章清單的外框 -->
<template>
  <q-page class="q-pa-md">
    <ArticleListWithSearch />
    <!-- Add article button -->
    <q-btn v-if="users.token" class="q-my-md circle-float" color="primary" fab round floating icon="add"
      to="/article/add" />
    <q-btn v-else class="q-my-md circle-float" color="primary" fab round floating icon="add"
      @click="users.loginDisplayState = true" />
  </q-page>
</template>

<script setup>
import { useUserStore } from 'src/stores/user'
import ArticleListWithSearch from 'src/components/ArticleListWithSearch.vue';
const users = useUserStore()
</script>

<style lang='sass' scoped>
.text-h6
  font-size: 18px
  font-weight: bold
.circle-float
  position: fixed
  bottom: 20px
  right: 20px
  width: 60px
  height: 60px
  border-radius: 50%
  display: flex
  justify-content: center
  align-items: center
</style>
