<!-- 新增文章的介面 -->
<template>
  <q-page class="q-pa-md">
    <q-form @submit.prevent="handleCreatArticle" style="width:100%">
      <q-select v-model="articleForm.petType" :options="articleConfigs.petType" :label="t('petType')"
        :rules="createI18nRules(rules.createMustInputRules, t)" @update:model-value="updateColorOptions" />
      <q-select v-model="articleForm.color" :options="colorOptions" :label="t('color')"
        :rules="createI18nRules(rules.createMustInputRules, t)" />

      <q-checkbox v-model="articleForm.hasMicrochip" :label="t('hasMicrochip')" /><br />
      <q-checkbox v-model="articleForm.hasReward" :label="t('hasReward')" @update:model-value="updateRewardAmount" />
      <q-input v-model.number="articleForm.rewardAmount" :label="t('rewardAmount')" type="number"
        :rules="[val => (val >= 0) || t('rewardAmountMustBePositive')]" :disable="!articleForm.hasReward" />

      <div class="q-pa-md" style="max-width: 300px">
        <q-input filled v-model="articleForm.lostDate" mask="date" :rules="['date']" :label="t('lostDate')">
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy ref="datePicker" cover transition-show="scale" transition-hide="scale">
                <q-date v-model="articleForm.lostDate" @update:model-value="() => { datePicker.hide() }">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>

      <q-select v-model="articleForm.lostCityCode" :options="cityOptions" :label="t('lostCityCode')"
        @update:model-value="updateDistrictOptions" :rules="createI18nRules(rules.createMustInputRules, t)" emit-value
        map-options />

      <q-select v-model="articleForm.lostDistrict" :options="districtOptions" :label="t('lostDistrict')"
        :rules="createI18nRules(rules.createMustInputRules, t)" :disable="!articleForm.lostCityCode" />
      <MapSelectorComponent />
      <q-input v-model="articleForm.content" filled type="textarea"
        :rules="createI18nRules(rules.createLengthBetweenRule, t, contentMinLength, contentMaxLength)"
        :label="t('articleContent')" />

      <q-btn type="submit" class="q-mt-md" :label="t('submit')" :loading="isCreating" />
    </q-form>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { rules, createI18nRules } from 'an-validator';
import { useRouter } from 'vue-router'
import notify from 'src/utils/notify.js'
// import { useUserStore } from 'stores/user';
import { cityCodeToNameMap, cityCodeToAreaList } from 'src/infrastructure/configs/cityConfigs.js';
import articleConfigs from 'src/infrastructure/configs/articleConfigs.js';
import * as  articleService from 'src/services/articleService.js';
import MapSelectorComponent from 'components/MapCoordinateSelectComponent.vue'; // Import your new component

const router = useRouter()
// const users = useUserStore();
const { t } = useI18n({ useScope: 'global' })
const datePicker = ref(null)

const articleForm = reactive({
  petType: '',
  color: '',
  hasMicrochip: false,
  hasReward: false,
  rewardAmount: 0,
  lostDate: '',
  lostCityCode: '',
  lostDistrict: '',
  coordinates: '',
  content: '',
})

const updateRewardAmount = (value) => {
  if (!value) {
    articleForm.rewardAmount = 0;
  }
}

const colorOptions = ref([]);
const updateColorOptions = (petType) => {
  articleForm.color = ""
  if (petType === '貓') {
    colorOptions.value = articleConfigs.catColorEnum;
  } else if (petType === '狗') {
    colorOptions.value = articleConfigs.dogColorEnum;
  } else {
    colorOptions.value = [];
  }
};

const cityOptions = computed(() => {
  return Object.keys(cityCodeToNameMap).map(code => ({
    label: cityCodeToNameMap[code],
    value: code
  }));
});
const districtOptions = ref([]);
const updateDistrictOptions = (cityCode) => {
  articleForm.lostDistrict = '';
  districtOptions.value = cityCodeToAreaList[cityCode]?.map(district => district) || [];
};
const contentMinLength = articleConfigs.content.minLength
const contentMaxLength = articleConfigs.content.maxLength

const isCreating = ref(false)
const handleCreatArticle = async () => {
  try {
    isCreating.value = true
    const res = await articleService.createArticle(articleForm);
    await notify(res);
    if (res.success) {
      router.go(-1)
    }
  } catch (error) {
    await notify(error);
  } finally {
    isCreating.value = false
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
