<!-- 文章包含搜尋的一整包，只要有文章清單基本都會從這使用 -->
<template>
  <div style="width:80%; margin:auto; padding: 20px">
    <SearchLanguagesBar @search="handleSearchArticle" />
    <q-infinite-scroll @load="handleGetNextArticles" :offset="50" :debounce="1000" v-if="articleList.length > 0">
      <ArticleItem v-for="( article, index ) in  articleList " :key="index" :article="article"
        :isAdminView="props.isAdminView" @articleReviewed="removeReviewedArticles"
        @openArticleDetail="openArticleDetail" :url=generateArticleUrl(article._id) />
      <template v-slot:loading>
        <div class="row justify-center q-my-md">
          <q-spinner-dots color="primary" size="40px" />
        </div>
      </template>
    </q-infinite-scroll>
    <div class="q-pa-md" v-else>
      <div class="text-h6">{{ t('noArticles') }}</div>
    </div>
  </div>
  <q-dialog v-model="articleDialog" :maximized="$q.platform.is.mobile" @before-hide="back2ArticleDetail">
    <q-card style="max-width:820px;width:820px">
      <q-bar style="background: transparent; position: sticky; top: 0; z-index: 1;">
        <q-space />
        <q-btn dense flat icon="close" v-close-popup @click="handleBackButton" size="lg">
          <q-tooltip>{{ t('close') }}</q-tooltip>
        </q-btn>
      </q-bar>
      <ArticleDetail :articleId="articleId" v-if="articleId" @articleDeleted="articleDeleted"
        @updateArticleList="updateArticleList" />
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, provide, onServerPrefetch, onBeforeMount } from 'vue';
import { useI18n } from 'vue-i18n'
import SearchLanguagesBar from 'src/components/SearchLanguagesBar.vue';
import ArticleDetail from 'src/components/ArticleDetail.vue';
import ArticleItem from './ArticleItem.vue';
import { useUserStore } from 'stores/user';
import { useSSRStore } from 'src/stores/ssr.js'
import { getArticleList } from 'src/services/article.js';

import notify from 'src/utils/notify.js';
const { t } = useI18n({ useScope: 'global' })
const users = useUserStore();
const ssrs = useSSRStore()

const props = defineProps({
  parentBoard: String,
  isAdminView: Boolean
});


// 這樣onmounted才有得搜
let searchLanguages = users.searchLanguages

let skip = 0;
const limit = 20;
let noRemainArticles = false;

const articleList = ref([]);
const articleDialog = ref(false);
const articleId = ref(null);

onServerPrefetch(async () => {
  const articles = await searchArticle();
  init(articles)
  ssrs.articleListWithSearch_articles = articles
})
onBeforeMount(async () => {
  clientHandleDatas()
})
async function clientHandleDatas() {
  let articles
  if (ssrs.articleListWithSearch_articles) {
    articles = ssrs.articleListWithSearch_articles
    ssrs.articleListWithSearch_articles = undefined
  } else {
    const newDatas = await searchArticle();
    if (!newDatas) return notify(t('noFoundArticle'))
    articles = newDatas
  }
  init(articles)
}
onMounted(() => {
  window.addEventListener('popstate', handleBackButton);
});
onBeforeUnmount(() => {
  window.removeEventListener('popstate', handleBackButton);
});




async function init(articles) {
  if (articles?.articleList?.length > 0) {
    articleList.value = articles.articleList;
    skip = articles.articleList.length;
  }
}

// search related
async function searchArticle() {
  try {
    const { data } = await getArticleList(
      {
        parentBoard: props.parentBoard
      },
      searchLanguages,
      0,
      limit
    );
    return data
  } catch (error) {
    console.log(error);
    await notify(error);
  }
}
async function handleSearchArticle(childSearchLanguages) {
  searchLanguages = childSearchLanguages;
  noRemainArticles = false
  const articles = await searchArticle();
  init(articles)
}
function updateArticleList(article) {
  const theArticle = articleList.value.findIndex(a => a._id.toString() === article._id)
  if (theArticle) {
    theArticle.title = article.title
    theArticle.content = article.content
    theArticle.previewContent = article.previewContent
    theArticle.thumbnail = article.thumbnail
  }
}

async function handleGetNextArticles(index, done) {
  try {
    if (noRemainArticles) return;
    const { data } = await getArticleList(
      {
        parentBoard: props.parentBoard,
        state: props.isAdminView ? 1 : undefined
      },
      searchLanguages,
      skip,
      limit
    );
    if (data.articleList.length > 0) {
      articleList.value.push(...data.articleList);
      skip += data.articleList.length;
    } else {
      noRemainArticles = true;
    }
  } catch (error) {
    console.log(error);
    await notify(error);
  } finally {
    done();
  }
}

// Delete related
const articleDeleted = (id) => {
  articleId.value = null
  const deletedIndex = articleList.value.findIndex(article => article._id === id);
  if (deletedIndex !== -1) {
    articleList.value.splice(deletedIndex, 1);
  }
  back2ArticleDetail()
};

// 網址相關
const handleBackButton = (event) => {
  if (articleDialog.value) {
    event.preventDefault();
    back2ArticleDetail()
  } else {
    history.go(-1);
  }
};

const generateArticleUrl = (id) => {
  let result
  if (props.parentBoard) {
    result = `/board/`
    if (id) {
      result += `${props.parentBoard}?articleId=${id}`
    }
  } else {
    result = `/article/`
    if (id) {
      result += `${id}`
    }
  }
  return result;
}

function back2ArticleDetail() {
  articleDialog.value = false;
  window.history.pushState({}, '', generateArticleUrl())
}

function openArticleDetail(id) {
  window.history.pushState({}, '', generateArticleUrl(id))
  articleId.value = id
  articleDialog.value = true;
}

provide('articleId', articleId);
</script>
