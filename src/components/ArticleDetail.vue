<!-- 文章詳情，裡面包了許多元件，像留言區 留言清單 編輯文章的浮動式窗 -->
<template>
  <div class="q-mt-md" v-if="article?.parentBoard">
    <q-card>
      <q-card-section>
        <div class="text-subtitle2 q-mt-sm row justify-between ">
          <div>
            <q-avatar size="50px" v-if="article.privacy === '1' && article.user.profileImage?.url"><img
                :src="article.user.profileImage.url" /> </q-avatar>
            {{ article.privacy === '1' ? article.user.nickname : t('anonymous') }} - {{ article.user.score }}
            <div v-for="(badge, index) in article.user.badges" :key="index" class="badge">
              <img class="badge-image" :src="`./badges/${badge}.png`" :alt="t(badge)" :title="t(badge)" />
            </div>
          </div>
          <div>
            <q-btn-dropdown v-if="!onlyView" v-model="optionState" icon="more_horiz" flat round>
              <q-list v-if="article.isSelf">
                <q-item clickable v-close-popup @click="openDeleteDialog">
                  <q-item-section avatar>
                    <q-avatar icon="delete" color="negative" text-color="white" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ t('delete') }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="openEditDialog">
                  <q-item-section avatar>
                    <q-avatar icon="edit" color="primary" text-color="white" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ t('edit') }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item v-if="article.isSelf && article.state !== 1">
                  <q-item-section>
                    <q-item-label v-if="article.state === 2">{{ t('applicationRecordExists') }}</q-item-label>
                    <q-item-label v-if="article.state === 3">{{ t('alreadyCreateBoard') }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
            <q-btn @click="shareArticle(article.parentBoard._id, article._id, t)" icon="share" flat round />
          </div>
        </div>
        <div class="text-h5 q-my-xs">{{ article.title }}</div>
        <div class="text-subtitle2 q-mt-sm">{{ t("articleTopic") + ":" +
    getName(article.parentBoard?.name, users)
          }}
        </div>
        <q-no-ssr>
          <div class="text-caption q-mt-sm " style="color: gray;">
            • {{ date.formatDate(article.createdAt, 'YYYY/MM/DD h:mm:ss A') }}
          </div>
        </q-no-ssr>
      </q-card-section>

      <q-card-section>
        <div v-html="article.content"></div>
      </q-card-section>
    </q-card>
    <q-dialog v-model="deleteDialog">
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm">{{ t('deleteInform') }}</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('cancel')" color="primary" v-close-popup />
          <q-btn flat :label="t('delete')" color="negative" v-close-popup @click="handleDeleteArticle" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="editDialog" persistent :maximized="$q.platform.is.mobile">
      <q-card>
        <q-bar style="background: transparent;">
          <q-space />
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip>{{ t('close') }}</q-tooltip>
          </q-btn>
        </q-bar>
        <q-card-section style="padding-top: 0;">
          <ArticleEdit :article="article" @articleUpdated="handleArticleUpdated" @close="editDialog = false" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onBeforeMount, provide, nextTick, watch, onServerPrefetch } from 'vue'
import { date, useMeta } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from 'src/stores/user'
import { useSSRStore } from 'src/stores/ssr.js'
import ArticleEdit from 'src/pages/article/ArticleEditPage.vue';
import { getArticleDetail, deleteArticle } from 'src/services/article.js';
import { shareArticle } from '../utils/shareLink.js'
import notify from 'src/utils/notify.js'
import getName from 'src/utils/getNames.js'
import { validAllBoardNamesInput } from 'src/utils/validator/validBoardNames.js'


const { t } = useI18n({ useScope: 'global' })
const users = useUserStore()
const ssrs = useSSRStore()
const article = ref(null);
const router = useRouter()
const route = useRoute()
// const commentForm = ref("");
const optionState = ref(false)
const ratingForm = ref({ rate: 0, edited: false })
const deleteDialog = ref(false);
const editDialog = ref(false);

const props = defineProps({
  onlyView: Boolean,
  articleId: String,
  commentId: String,
  replyId: String,
});

function openDeleteDialog() {
  deleteDialog.value = true;
}
function openEditDialog() {
  editDialog.value = true;
}

const emit = defineEmits(['articleDeleted', "updateArticleList"])

async function handleDeleteArticle() {
  try {
    const rep = await deleteArticle(props.articleId);
    if (rep.success) {
      notify({ success: true, message: t('deleted') })
      emit('articleDeleted', props.articleId);
    }
  } catch (error) {
    await notify(error);
  }
}

function handleArticleUpdated(rep) {
  article.value.title = rep.data.title
  article.value.content = rep.data.content
  article.value.previewContent = rep.data.previewContent
  article.value.thumbnail = rep.data.thumbnail
  editDialog.value = false
  emit('updateArticleList', { _id: article.value._id, ...rep.data });
}
let skip = 0;
const limit = 10

// meta
const metaData = () => {
  return {
    title: article.value?.title,
    // titleTemplate: title => `${title} - My Website`,
    meta: {
      description: { name: 'description', content: getName(article.value?.parentBoard?.name) + ":" + article.value?.previewContent },
      // ...other meta tags
    },
    // keywords: { name: 'keywords', content: 'Quasar website' },
    // note: for Open Graph type metadata you will need to use SSR, to ensure page is rendered by the server
    ogTitle: {
      property: 'og:title',
      // optional; similar to titleTemplate, but allows templating with other meta properties
      template(ogTitle) {
        return `${ogTitle} - My Website`
      }
    }
  };
}
// meta在後端沒效 但可以給meta
useMeta(metaData);


// 初始頁面相關
onServerPrefetch(async () => {
  const datas = await fetchArticle()
  ssrs.articleDetailPage_datas = datas
  init(datas)
})
onBeforeMount(async () => {
  clientHandleDatas()
  window.addEventListener('beforeunload', function (event) {
  });
})

async function fetchArticle() {
  try {
    const { data } = await getArticleDetail(props.articleId, skip,
      limit,
      {
        commentId: route.query.commentId,
        replyId: route.query.replyId,
      })
    return JSON.parse(JSON.stringify(data))
  } catch (error) {
    return null
  }
}

async function clientHandleDatas() {
  let datas
  if (ssrs.articleDetailPage_datas) {
    datas = ssrs.articleDetailPage_datas
    ssrs.articleDetailPage_datas = undefined
    // console.log("have ssrs.article");
  } else {
    // console.log("no ssrs.article");
    const newDatas = await fetchArticle()
    if (!newDatas) return notify(t('noFoundArticle'))
    datas = newDatas
  }
  init(datas)
}

watch(() => props.articleId, async () => {
  const newDatas = await fetchArticle()
  if (!newDatas) return notify(t('noFoundArticle'))
  init(newDatas)
})

async function init(datas) {
  try {
    article.value = datas.article
  } catch (error) {
    // 沒有找到特定留言/回復都在後端加工好了
    // console.log(error);
    await notify(error);
  }
}
function scroll2Target(id) {
  if (!import.meta.env.SSR) {
    nextTick(() => {
      const element = document.getElementById(`c-${id}`);
      if (element) {
        setTimeout(() => { element.scrollIntoView({ behavior: "smooth", block: "start" }); }, 800)
      }
    })
  }
}

// 觸發同個網址,只有reply不同時,會自動下滑
watch(() => route.query.commentId, () => {
  // console.log("commentId changed:" + route.query.commentId);
  scroll2Target(route.query.commentId)
}, {
  deep: true
})
</script>

<style lang='sass' scoped>
.q-page
  display: flex
  flex-direction: column
  align-items: center

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
  max-width: 800px
  margin-top: 20px

.markdown-preview
  padding: 20px

.q-btn
  margin-top: 20px
.badge-image
  max-width: 50px
  max-height: 50px

</style>
