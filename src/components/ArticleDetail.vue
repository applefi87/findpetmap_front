<!-- 文章詳情，裡面包了許多元件，像留言區 留言清單 編輯文章的浮動式窗 -->
<template>
  <div class="q-mt-md" style="width:90vw">
    <q-card v-if="article">
      <q-card-section>
        <Carousel :images="article.images" />
        <q-no-ssr>
          <div class="text-subtitle2 q-mt-sm row justify-between ">
            <div>
              <q-btn-dropdown v-if="article.isSelf" v-model="optionState" icon="more_horiz" flat round>
                <q-list>
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
              <q-btn @click="shareArticle(article._id, t)" icon="share" flat round />
            </div>
          </div>
        </q-no-ssr>
        <q-card>
          <q-card-section>
            <q-item-label class="q-mt-sm"><strong>{{ t('articleTitle') }}:</strong> {{ article.title }}</q-item-label>
            <q-item-label class="q-mt-sm"><strong>{{ t('petType') }}:</strong> {{ article.petType }}</q-item-label>
            <q-item-label class="q-mt-sm"><strong>{{ t('breed') }}:</strong> {{ article.breed }}</q-item-label>
            <q-item-label class="q-mt-sm"><strong>{{ t('color') }}:</strong> {{ article.color }}</q-item-label>
            <q-item-label class="q-mt-sm">
              <strong>{{ t('gender') }}:</strong>
              {{ getTranslatedLabelByOption(article.gender, genderOptions) }}
            </q-item-label>
            <q-item-label class="q-mt-sm">
              <strong>{{ t('size') }}:</strong>
              {{ getTranslatedLabelByOption(article.size, sizeOptions) }}
            </q-item-label>
            <q-item-label class="q-mt-sm"><strong>{{ t('age') }}:</strong> {{ article.age }}</q-item-label>
            <q-item-label class="q-mt-sm"><strong>{{ t('hasMicrochip') }}:</strong>
              {{ article.hasMicrochip ? t('yes') : t('no') }}
            </q-item-label>
            <q-item-label class="q-mt-sm"><strong>{{ t('lostDate') }}:</strong>
              <q-no-ssr>
                {{ new Intl.DateTimeFormat(users.interfaceLanguage, { dateStyle: 'full' }).format(new
      Date(article.lostDate)) }}
              </q-no-ssr>
            </q-item-label>
            <q-item-label class="q-mt-sm"><strong>{{ t('lostCity') }}:</strong>
              {{ cityCodeToNameMap[article.lostCityCode] }}
            </q-item-label>
            <q-item-label class="q-mt-sm"><strong>{{ t('lostDistrict') }}:</strong>
              {{ article.lostDistrict }}
            </q-item-label>
            <q-item-label class="q-mt-sm"><strong>{{ t('rewardAmount') }}:</strong>
              {{ article.hasReward ? `${article.rewardAmount}` : t('noReward') }}
            </q-item-label>
            <hr />
            <q-item-label class="q-mt-sm"><strong>{{ t('userPhone') }}:</strong> {{ article.user.info.phone
              }}</q-item-label>
            <q-item-label class="q-mt-sm"><strong>{{ t('userName') }}:</strong> {{ article.user.info.name
              }}</q-item-label>
            <q-item-label class="q-mt-sm"><strong>{{ t('userLineId') }}:</strong> {{ article.user.info.lineId
              }}</q-item-label>
            <q-item-label class="q-mt-sm"><strong>{{ t('userOthers') }}:</strong> {{ article.user.info.others
              }}</q-item-label>
          </q-card-section>
          <q-no-ssr>
            <div class="text-caption q-mt-sm" style="color: gray;">
              {{ new Intl.DateTimeFormat(users.interfaceLanguage, { dateStyle: 'full', timeStyle: 'medium' }).format(new
      Date(article.createdAt)) }}
            </div>
          </q-no-ssr>
        </q-card>
      </q-card-section>
      <q-card-section>
        <q-input v-model="article.content" readonly filled type="textarea" :label="t('articleContent')" />
      </q-card-section>
    </q-card>
    <q-no-ssr>
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
          <LazyArticleUpdateComponent :article="article" @articleUpdate="handleArticleUpdated"
            @close="editDialog = false" />
        </q-card>
      </q-dialog>
    </q-no-ssr>
  </div>
</template>

<script setup>
import { ref, onBeforeMount, watch, onServerPrefetch, defineAsyncComponent } from 'vue'
import Carousel from 'components/CarouselComponent.vue'
import { useMeta } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useUserStore } from 'src/stores/user'
import { useSSRStore } from 'src/stores/ssr.js'
import * as articleService from 'src/services/articleService.js';
import { cityCodeToNameMap } from 'src/infrastructure/configs/cityConfigs.js';
import { shareArticle } from '../utils/shareLink.js'
import { sizeLabelValueOptions, genderLabelValueOptions } from 'src/utils/updateSelectOptions.js'
import notify from 'src/utils/notify.js'

const LazyArticleUpdateComponent = defineAsyncComponent(() =>
  import('src/components/ArticleUpdate.vue')
);

const { t } = useI18n({ useScope: 'global' })
const users = useUserStore()
const ssrs = useSSRStore()
const article = ref(null);

// const commentForm = ref("");
const optionState = ref(false)
const deleteDialog = ref(false);
const editDialog = ref(false);

const slide = ref(1)
const fullscreen = ref(false)

const props = defineProps({
  onlyView: Boolean,
  articleId: String,
});

function openDeleteDialog() {
  deleteDialog.value = true;
}
function openEditDialog() {
  editDialog.value = true;
}

const sizeOptions = sizeLabelValueOptions
const genderOptions = genderLabelValueOptions

const getTranslatedLabelByOption = (value, options) => {
  const option = options.find(opt => opt.value === value);
  return option ? t(option.label) : '';
};

const emit = defineEmits(['articleDeleted', "updateArticleList", "backPage"])

async function handleDeleteArticle() {
  try {
    const rep = await articleService.deleteArticle(props.articleId);
    if (rep.success) {
      notify(t('deleted'))
      emit('articleDeleted', props.articleId);
    }
  } catch (error) {
    await notify(error);
  }
}
// 雖然也可以重整頁面，但考量部分情境是彈出視窗的articleDetail, 編輯頁面連地圖也要重載入，還是不要重整
async function handleArticleUpdated() {
  editDialog.value = false
  const newDatas = await fetchAndInit()
  emit('updateArticleList', newDatas.article);
}

async function fetchAndInit() {
  const newDatas = await fetchArticle()
  if (!newDatas) {
    await notify(t('noFoundArticle'))
    emit('backPage');
    return
  }
  init(newDatas)
  return newDatas
}


// meta在後端沒效 但可以給meta
useMeta(() => {
  return {
    title: article.value?.title,
    meta: {
      description: {
        name: 'description',
        content: `遺失寵物地圖協尋網 - ${article.value?.title}`
      },
      // keywords: { name: 'keywords', content: 'Quasar website' },
    },
    ogTitle: {
      property: 'og:title',
      template(ogTitle) {
        return `${ogTitle} - 遺失寵物地圖協尋網`;
      }
    }
  };
});

// 初始頁面相關
onServerPrefetch(async () => {
  // TODO ssr 遇到沒有頁面，要怎麼處理，但應該是把錯誤內容留給前端重顯示一次
  const datas = await fetchArticle()
  if (!datas) { return }
  ssrs.articleDetailPage_datas = datas
  init(datas)
})
onBeforeMount(async () => {
  await clientHandleDatas()
})

async function fetchArticle() {
  try {
    const { data } = await articleService.getArticleDetail(props.articleId)
    return JSON.parse(JSON.stringify(data))
  } catch (error) {
    return null
  }
}

async function clientHandleDatas() {
  // 如果是ssr 取出來的內容，直接使用，不然前端取
  if (ssrs.articleDetailPage_datas) {
    let datas = ssrs.articleDetailPage_datas
    delete ssrs.articleDetailPage_datas
    init(datas)
    // console.log("have ssrs.article");
  } else {
    console.log("clientHandleDatas");
    // console.log("no ssrs.article");
    await fetchAndInit()
  }
}

watch(() => props.articleId, async () => {
  await fetchAndInit()
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
