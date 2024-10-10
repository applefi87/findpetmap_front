<!-- 文章清單的外框 -->
<template>
  <q-page class="q-pa-md">
    <q-no-ssr>
      <ArticleListWithSearch />
    </q-no-ssr>
    <!-- Add article button -->
    <q-btn class="q-my-md circle-float" color="primary" fab round floating icon="add" to="/article/create" />
  </q-page>
</template>

<script setup>
import ArticleListWithSearch from 'src/components/ArticleListWithSearch.vue';
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
