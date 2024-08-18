<!-- 新增文章的介面 -->
<template>
  <q-page class="q-pa-md">
    <q-form @submit.prevent="handleAddArticle" style="width:100%">
      <q-input v-model="articleForm.title" :label="t('articleTitle')" type="text"
        :rules="createI18nRules(rules.createLengthBetweenRule, t, 5, 100)" />
      <article-editor v-model="articleForm.content" @input="updateArticleContent" />
      {{ t('editorObj.characterCount', { textLength, htmlLength }) }}
      <q-btn type="submit" class="q-mt-md" :label="t('submit')" :loading="isAdding" />
    </q-form>
  </q-page>
</template>

<script setup>
import ArticleEditor from 'src/components/ArticleEditor.vue';
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { rules, createI18nRules } from 'an-validator';
import { useRouter } from 'vue-router'
import { useUserStore } from 'stores/user';
import { addArticle } from 'src/services/article.js';
import { languagesListstr2Obj } from 'src/utils/languageListTool.js';
import notify from 'src/utils/notify.js'

const router = useRouter()
const users = useUserStore();
const { t } = useI18n({ useScope: 'global' })

const isAdding = ref(false)
const articleForm = reactive({
  title: "",
  content: '',
  language: languagesListstr2Obj(users.publishLanguages)[0],
  privacy: "1"
})

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
    await notify(t("articleObj.TextTooLong", { length: textLimit }))
    return false
  }
  return true
}


function stripHtml(html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}


const handleAddArticle = async () => {
  try {
    isAdding.value = true
    if (textLength.value < textMin) {
      return await notify(t("articleObj.TextTooShort", { length: textMin }))
    }
    if (await contentLimitAvailable(articleForm.content)) {
      const res = await addArticle(articleForm);
      await notify(res);
      if (res.success) {
        router.go(-1)
        return;
      }
    }
  } catch (error) {
    await notify(error);
  } finally {
    isAdding.value = false
  }
};

</script>

<style lang='sass' scoped>
.q-page
  display: flex
  flex-direction: column
  align-items: center

.q-form
  margin: 20px
  max-width: 800px


.q-btn
  margin-top: 20px
</style>
