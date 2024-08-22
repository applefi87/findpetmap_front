<!-- 新增文章的介面 -->
<template>
  <q-page class="q-pa-md">
    <q-form @submit.prevent="handleAddArticle" style="width:100%">
      <q-input v-model="articleForm.title" :label="t('articleTitle')" type="text"
        :rules="createI18nRules(rules.createLengthBetweenRule, t, 5, 100)" />

      <q-select v-model="articleForm.petType" :options="localOptions" :label="t('articlePetType')"
        :rules="createI18nRules(rules.createMustInputRules, t)" />
      <q-select v-model="articleForm.color" :options="localOptions" :label="t('articleColor')"
        :rules="createI18nRules(rules.createMustInputRules, t)" />

      <!-- Boolean Check for hasReward -->
      <q-checkbox v-model="articleForm.hasMicrochip" :label="t('hasMicrochip')" />
      <!-- Boolean Check for hasReward -->
      <q-checkbox v-model="articleForm.hasReward" :label="t('hasReward')" />

      <!-- Number Input for rewardAmount -->
      <q-input v-model.number="articleForm.rewardAmount" :label="t('rewardAmount')" type="number"
        :rules="[val => (val >= 0) || t('rewardAmountMustBePositive')]" :disable="!articleForm.hasReward" />

      <!-- Date Picker for lostDate -->
      <q-input v-model="articleForm.lostDate" :label="t('lostDate')">
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-date v-model="articleForm.lostDate" />
          </q-icon>
        </template>
      </q-input>

      <!-- Select for lostCityCode -->
      <q-select v-model="articleForm.lostCityCode" :options="cityOptions" :label="t('lostCityCode')"
        @update:model-value="updateDistrictOptions" :rules="createI18nRules(rules.createMustInputRules, t)" />

      <!-- Select for lostDistrict -->
      <q-select v-model="articleForm.lostDistrict" :options="districtOptions" :label="t('lostDistrict')"
        :rules="createI18nRules(rules.createMustInputRules, t)" :disable="!articleForm.lostCityCode" />

      <article-editor v-model="articleForm.content" @input="updateArticleContent" />
      {{ t('editorObj.characterCount', { textLength, htmlLength }) }}
      <q-btn type="submit" class="q-mt-md" :label="t('submit')" :loading="isAdding" />
    </q-form>
  </q-page>
</template>

<script setup>
import ArticleEditor from 'src/components/ArticleEditor.vue';
import { ref, reactive, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { rules, createI18nRules } from 'an-validator';
import { useRouter } from 'vue-router'
import { useUserStore } from 'stores/user';
import { cityCodeToNameMap, cityCodeToAreaList } from 'src/infrastructure/configs/cityConfigs.js';
import { addArticle } from 'src/services/article.js';
import { languagesListstr2Obj } from 'src/utils/languageListTool.js';
import notify from 'src/utils/notify.js'

const router = useRouter()
const users = useUserStore();
const { t } = useI18n({ useScope: 'global' })

const isAdding = ref(false)
const articleForm = reactive({
  lostCityCode: '',
  lostDistrict: '',
  content: '',
})

// Convert cityCodeToNameMap to array of options
const cityOptions = computed(() => {
  return Object.keys(cityCodeToNameMap).map(code => ({
    label: cityCodeToNameMap[code],
    value: code
  }));
});

// District options will update based on selected city
const districtOptions = ref([]);

// Function to update district options when a city is selected
const updateDistrictOptions = (cityCode) => {
  articleForm.value.lostDistrict = ''; // Reset district selection
  districtOptions.value = cityCodeToAreaList[cityCode]?.map(district => ({
    label: district,
    value: district
  })) || [];
};

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
      }
    }
  } catch (error) {
    await notify(error);
  } finally {
    isAdding.value = false
  }
};

watch(articleForm.hasReward, (newVal) => {
  if (!newVal) {
    this.articleForm.rewardAmount = 0;
  }
}
)

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
