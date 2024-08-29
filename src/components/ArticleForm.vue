<!-- 新增文章的介面 -->
<template>
  <q-form @submit.prevent="handleSubmit" style="width:100%">
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
            <q-popup-proxy ref="datePickerRef" cover transition-show="scale" transition-hide="scale">
              <q-date v-model="articleForm.lostDate" @update:model-value="() => { datePickerRef.hide() }">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup :label="t('close')" color="primary" flat />
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
    <MapSelectorComponent v-model="articleForm.coordinates" />

    <q-input v-model="articleForm.content" filled type="textarea"
      :rules="createI18nRules(rules.createLengthBetweenRule, t, contentMinLength, contentMaxLength)"
      :label="t('articleContent')" />
    <!--  -->
    <div class="q-mt-md">
      <q-uploader v-if="images.length < 3" ref="uploaderRef" accept="image/*" @added="onFileAdded"
        :label="t('selectImages')" />
      <div v-if="images.length > 0" class="q-mt-md">
        <div v-for="(image, index) in images" :key="index" class="q-mb-md row items-center">
          <q-img :src="image.previewUrl" style="width: 100px; height: 100px; object-fit: cover;" />
          <q-checkbox v-model="image.isPreview" :label="t('setAsPreview')" class="q-ml-md"
            @update:model-value="onPreviewSelect(index)" />
          <q-btn icon="delete" color="negative" class="q-ml-md" @click="removeImage(index)" />
        </div>
      </div>
    </div>
    <div class="q-mt-md">
      <div class="q-gutter-sm row justify-end">
        <q-btn v-if="props.isUpdate" flat :label="t('cancel')" color="primary" @click="handleClose" />
        <q-btn type="submit" :label="t('submit')" :loading="props.isSubmiting" />
      </div>
    </div>
  </q-form>
</template>

<script setup>
import { ref, reactive, computed, onBeforeMount } from 'vue'
import { useI18n } from 'vue-i18n'
import anv from 'an-validator';
// import { useUserStore } from 'stores/user';
import { cityCodeToNameMap, cityCodeToAreaList } from 'src/infrastructure/configs/cityConfigs.js';
import articleConfigs from 'src/infrastructure/configs/articleConfigs.js';
import MapSelectorComponent from 'components/MapCoordinateSelectComponent.vue'; // Import your new component
const { rules, createI18nRules } = anv

const { t } = useI18n({ useScope: 'global' })

const emit = defineEmits(['articleSubmit', "close"]);
const props = defineProps({
  article: {
    type: Object,
    required: true,
  },
  images: {
    type: Array,
    required: true,
  },
  isSubmiting: {
    type: Boolean,
    required: true,
  },
  isUpdate: {
    type: Boolean,
    default: false
  }
})
const articleForm = reactive(JSON.parse(JSON.stringify(props.article)))
const images = ref(JSON.parse(JSON.stringify(props.images)));

const handleClose = () => {
  emit('close')
}
const handleSubmit = () => {
  // isSubmiting.value = true
  emit('articleSubmit', articleForm, images.value);
}


const datePickerRef = ref(null)
const uploaderRef = ref(null)
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

const onFileAdded = (files) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    images.value.push({
      file: files[0], // Store the file
      previewUrl: e.target.result, // Preview URL for displaying the image
      isPreview: images.value.length === 0, // Automatically set the first image as preview
    })
    uploaderRef.value.reset(); // Reset the uploader after an image is added
  }
  reader.readAsDataURL(files[0])
}
const onPreviewSelect = (selectedIndex) => {
  images.value.forEach((image, index) => {
    image.isPreview = index === selectedIndex
  })
}
const removeImage = (index) => {
  images.value.splice(index, 1)
  // Ensure there is always one preview image selected
  if (images.value.length > 0 && !images.value.some(image => image.isPreview)) {
    images.value[0].isPreview = true
  }
}
</script>

<style lang='sass' scoped>
.q-form
  margin: 20px
  max-width: 800px

.q-btn
  margin-top: 20px
</style>
