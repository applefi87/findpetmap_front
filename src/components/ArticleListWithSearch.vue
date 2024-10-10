<!-- 文章包含搜尋的一整包，只要有文章清單基本都會從這使用 -->
<template>
  <div style="width:80%; margin:auto; padding: 20px">
    <ArticleItem v-for="( article, index ) in articleList " :key="index" :article="article"
      @openArticleDetail="openArticleDetail" :url=generateArticleUrl(article._id) />
    <div v-if="articleList.length === 0" class="no-article q-pa-md text-center text-grey-7">
      {{ t('noAnyArticle') }}
    </div>
  </div>
  <ArticleDialog v-if="articleId" :articleId="articleId" :isDialogVisible="isDialogVisible"
    @update:isDialogVisible="isDialogVisible = $event" @articleDeleted="articleDeleted"
    @updateArticleList="updateArticleList" @backPage="handleBackButton" />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, provide, onBeforeMount } from 'vue';
import { useI18n } from 'vue-i18n'
import ArticleItem from './ArticleItem.vue';
import ArticleDialog from 'components/ArticleDialog.vue';
import { getMyArticle } from 'src/services/articleService.js';
import notify from 'src/utils/notify.js';

const { t } = useI18n({ useScope: 'global' })

let skip = 0;
const limit = 20;

const articleList = ref([]);
const articleDialog = ref(false);
const articleId = ref(null);

onBeforeMount(async () => {
  let articleList
  const newArticleList = await searchArticle();
  if (!newArticleList) return notify(t('noFoundArticle'))
  articleList = newArticleList
  init(articleList)
})

onMounted(() => {
  window.addEventListener('popstate', handleBackButton);
});
onBeforeUnmount(() => {
  window.removeEventListener('popstate', handleBackButton);
});




async function init(reqArticleList) {
  if (reqArticleList.length > 0) {
    articleList.value = reqArticleList;
    skip = reqArticleList.length;
  }
}

// search related
async function searchArticle() {
  try {
    const { data } = await getMyArticle(
      {},
      0,
      limit
    );
    return data || []
  } catch (error) {
    console.log(error);
    await notify(error);
  }
}

function updateArticleList(article) {
  const theArticleIndex = articleList.value.findIndex(a => a._id.toString() === article._id)
  if (theArticleIndex === -1) return
  articleList.value[theArticleIndex] = article
}

// Delete related
const articleDeleted = (id) => {
  articleId.value = null
  const deletedIndex = articleList.value.findIndex(article => article._id === id);
  if (deletedIndex !== -1) {
    articleList.value.splice(deletedIndex, 1);
  }
  leftArticleDetail()
};

// 網址相關
const handleBackButton = (event) => {
  leftArticleDetail()
};


const isDialogVisible = ref(false);
function openArticleDetail(id) {
  window.history.pushState({}, '', generateArticleUrl(id))
  articleId.value = id
  isDialogVisible.value = true;
}

const generateArticleUrl = (id) => {
  let result = `/article/`
  if (id) {
    result += `${id}`
  } else {
    return "/me/article"
  }
  return result;
}

function leftArticleDetail() {
  articleDialog.value = false;
  window.history.pushState({}, '', generateArticleUrl())
}

provide('articleId', articleId);
</script>
