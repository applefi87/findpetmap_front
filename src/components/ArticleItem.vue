<!-- 文章清單的每一項 -->
<template>
  <q-item class="article-item" clickable v-if="article.user">
    <router-link :to="props.url" custom v-slot="{ navigate, href }">
      <a :href="href" @click="openArticleDetail($event, navigate, article._id)">
        <div class="article-section">
          <div class="article-thumbnail" v-if="article.previewImageFullPath">
            <img
              :src="`https://production-petfinder-private.s3.ap-northeast-1.amazonaws.com/${article.previewImageFullPath}`"
              alt="animal face">
          </div>
          <div class="article-info">
            <div class="article-topic">
              <q-no-ssr>
                <span v-if="users.interfaceLanguage" class="postOn">

                  {{ t('postOn:') + new Intl.DateTimeFormat(users.interfaceLanguage, {
                    dateStyle: 'full', timeStyle:
                      'medium'
                  }).format(new
                    Date(article.createdAt)) }}</span>
              </q-no-ssr>
            </div>
            <div class="article-title">{{ article.title }}</div>
          </div>
        </div>
      </a>
    </router-link>
  </q-item>
</template>

<script setup>
import { useUserStore } from 'src/stores/user'
import { useI18n } from 'vue-i18n'

const users = useUserStore()
const { t } = useI18n({ useScope: 'global' })
const props = defineProps({
  url: String,
  article: Object,
  isAdminView: Boolean
})
const emits = defineEmits(['articleReviewed', "openArticleDetail"]);
//
const openArticleDetail = (event, navigate, _id) => {
  if (!event.ctrlKey) {
    event.preventDefault();
    emits("openArticleDetail", _id)
  } else {
    navigate(event);
  }
}
</script>

<style lang='sass' scoped>
.article-section
  overflow-wrap: break-word
  display: flex
  flex-direction: row-reverse
  flex-grow: 1
  align-items: center

.article-item
  display: flex
  gap: 10px
  padding: 10px 0px 19px
  margin-bottom: 5px
  border-bottom: 1px solid #ccc
  &:hover
    background-color: #f7f7f7
  &>a
    color: inherit
    text-decoration: none
    width: 100%

.article-thumbnail
  width: auto
  max-width: 150px
  height: 100px
  overflow: hidden
  border-radius: 5px
.article-thumbnail img
  min-width: 100%
  max-width: 100%
  min-height: 100%
  max-height: 100%
  object-fit: cover
.article-info
  flex: 1
  display: flex
  flex-direction: column
.article-topic
  font-weight: bold
  font-size: 18px
  color: #333
.article-title
  font-weight: 700
  font-size: 18px
  line-height: 1.2
  margin-bottom: 5px
  overflow: hidden
  text-overflow: ellipsis
  display: -webkit-box
  -webkit-line-clamp: 1
  -webkit-box-orient: vertical
  max-height: 2.4rem

.article-content
  font-size: 16px
  line-height: 1.2
  overflow: hidden
  text-overflow: ellipsis
  display: -webkit-box
  -webkit-line-clamp: 3
  -webkit-box-orient: vertical
@media (max-width: 500px)
  .q-item-section
    overflow-wrap: anywhere
    word-break: break-all
  .article-title
    font-size: 16px
.article-extra-info
  display: flex
  justify-content: space-between
  font-size: 0.9em
  color: #757575
  margin-top: 5px


.article-created-at
  margin-right: 10px

.postOn
  color: rgba(0,0,0,0.5)
  font-size: 0.8rem

</style>
