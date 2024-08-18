<!-- 編輯文章的介面 -->
<template>
  <q-form id="articleEdit" @submit.prevent="handleEditArticle">
    <q-input v-model="articleForm.title" :label="t('articleTitle')" type="text"
      :rules="createI18nRules(rules.createLengthBetweenRule, t, 5, 100)" />
    <article-editor v-model="articleForm.content" :content="props.article.content" @input="updateArticleContent" />
    {{ t('editorObj.characterCount', { textLength, htmlLength }) }}
    <q-btn type="submit" class="q-mt-md" :label="t('save')" :loading="isEditing" color="primary" />
  </q-form>
</template>

<script setup>
import ArticleEditor from 'src/components/ArticleEditor.vue';
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { rules, createI18nRules } from 'an-validator';
import { editArticle } from 'src/services/article.js';
import notify from 'src/utils/notify.js'

const props = defineProps({
  article: {
    type: Object,
    required: true,
  },
})

const isEditing = ref(false)
const textLength = ref(0)
const htmlLength = ref(0)
const textLimit = 10000
const textMin = 10
const htmlLimit = 30000
async function updateArticleContent(value) {
  if (contentLimitAvailable(value)) {
    articleForm.content = value
  }
}
async function contentLimitAvailable(value) {
  htmlLength.value = value.length
  if (htmlLength.value > htmlLimit) {
    await notify(t("articleObj.HTMLTooLong", { length: htmlLimit }))
    return false
  }
  textLength.value = stripHtml(value).length
  if (textLength.value > textLimit) {
    await notify(t("article.TextTooLong", { length: textLimit }))
    return false
  }
  return true
}

function stripHtml(html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

const emit = defineEmits(['articleUpdated'])

const { t } = useI18n({ useScope: 'global' })
const articleForm = reactive({
  title: "",
  content: '',
});

onMounted(async function init() {
  // const { data } = await getArticleForEdit(props.articleId)
  articleForm.title = props.article.title
  articleForm.content = props.article.content
})

const handleEditArticle = async () => {
  isEditing.value = true
  try {
    if (textLength.value < textMin) {
      return await notify(t("articleObj.TextTooShort", { length: textMin }))
    }
    if (await contentLimitAvailable(articleForm.content)) {
      const res = await editArticle(props.article._id, articleForm);
      if (res.success) {
        await notify({ success: true, message: t('articleEdited'), duration: 0.7 })
        emit('articleUpdated', res)
      }
    }
  } catch (error) {
    await notify(error);
  } finally {
    isEditing.value = false
  }
};

</script>

<style lang='sass' scoped>
#articleEdit.q-form
  margin: 0

</style>
