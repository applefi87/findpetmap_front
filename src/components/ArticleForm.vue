<!-- 新增文章的介面 -->
<template>
  <q-no-ssr>
    <q-form @submit.prevent="handleSubmit" style="width:100%">
      <div style="max-width:90%">

        <!-- a center circle image for diaplay the select isPreview image as it on map icon-->
        <div v-if="images.length > 0" class="q-mb-md row justify-center">
          <div class="text-center q-mb-sm">
            <span class="text-h6">{{ t("mapIconPreview") }}</span>
          </div>
          <div v-for="image in images.filter(i => i.isPreview)" :key="image.previewUrl" class="center-circle q-mx-sm">
            <q-img :src="image.previewUrl" class="marker-image" />
          </div>
        </div>
        <div class="q-mt-md">
          <q-uploader v-if="images.length < articleImageMaxAmount" ref="uploaderRef" @added="onFileAdded"
            :label="t('selectImages')" accept="image/jpeg, image/png, image/webp, image/tiff"
            :max-file-size="imageConfigs.articleImage.maxFileSize * 1024 * 1024" @rejected="onFileRejected" />
          <div v-if="images.length > 0" class="q-mt-md row q-col-gutter-md">
            <div v-for="(image, index) in images" :key="index" class="col-6 col-md-3 q-mb-md flex flex-center">
              <div class="image-item flex flex-column items-center justify-between">
                <q-img :src="image.previewUrl" style="object-fit: contain; width: 100%; max-width: 100%;"
                  class="q-mb-sm flex-grow-1" />
                <div class="image-actions q-mt-sm">
                  <q-checkbox v-model="image.isPreview" :label="t('setAsPreview')" class="q-mb-sm"
                    @update:model-value="onPreviewSelect(index)" />
                  <q-btn icon="delete" color="negative" class="q-mb-sm" @click="removeImage(index)" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <q-input v-model="articleForm.title" filled type="text"
          :rules="createI18nRules(rules.createLengthBetweenRule, t, titleMinLength, titleMaxLength)"
          :label="t('articleTitle')" />
        <q-select v-model="articleForm.petType" :options="articleConfigs.petType" :label="t('petType')"
          :rules="createI18nRules(rules.createMustInputRules, t)" @update:model-value="handleChangePetType" />
        <q-select v-model="articleForm.breed" :options="breedOptions" :label="t('breed')"
          :rules="createI18nRules(rules.createMustInputRules, t)" />
        <q-select v-model="articleForm.color" :options="colorOptions" :label="t('color')"
          :rules="createI18nRules(rules.createMustInputRules, t)" />
        <q-select v-model="articleForm.gender" :options="genderOptions" :label="t('gender')" emit-value map-options
          :option-label="(labelObj) => t(labelObj?.label || '')"
          :rules="createI18nRules(rules.createMustInputRules, t)" />
        <q-select v-model="articleForm.size" :options="sizeOptions" :label="t('size')" emit-value map-options
          :option-label="(labelObj) => t(labelObj?.label || '')"
          :rules="createI18nRules(rules.createMustInputRules, t)" />
        <q-input v-model.number="articleForm.age" :label="t('age')" type="number"
          :rules="[val => (val >= ageMin && val <= ageMax) || t('ageBetween', { min: ageMin, max: ageMax })]" />

        <q-checkbox v-model="articleForm.hasMicrochip" :label="t('hasMicrochip')" /><br />
        <q-checkbox v-model="articleForm.hasReward" :label="t('hasReward')" @update:model-value="updateRewardAmount" />
        <q-input v-model.number="articleForm.rewardAmount" :label="t('rewardAmount')" type="number"
          :rules="[val => (val >= 0) || t('rewardAmountMustBePositive')]" :disable="!articleForm.hasReward" />

        <div class="q-pa-md" style="max-width: 300px">
          <q-input filled v-model="articleForm.lostDate" mask="date" :rules="['date']" :label="t('lostDate')">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy ref="datePickerRef" cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="articleForm.lostDate" :options="dateOptions"
                    @update:model-value="() => { datePickerRef.hide() }">
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
          :rules="createI18nRules(rules.createMustInputRules, t)" />

        <MapSelectorComponent v-model="articleForm.coordinates" />

        <q-input v-model="articleForm.content" filled type="textarea"
          :rules="createI18nRules(rules.createLengthBetweenRule, t, contentMinLength, contentMaxLength)"
          :label="t('articleContent')" />

        <div class="q-mt-md">
          <div class="q-gutter-sm row justify-end">
            <q-btn v-if="props.isUpdate" flat :label="t('cancel')" color="primary" @click="handleClose" />
            <q-btn type="submit" :label="t('submit')" :loading="props.isSubmiting" />
          </div>
        </div>

      </div>
    </q-form>
  </q-no-ssr>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { cityCodeToNameMap, cityCodeToAreaList } from 'src/infrastructure/configs/cityConfigs.js';
import articleConfigs from 'src/infrastructure/configs/articleConfigs.js';
import imageConfigs from 'src/infrastructure/configs/imageConfigs.js';
import MapSelectorComponent from 'components/MapCoordinateSelectComponent.vue'; // Import your new component
import { changePetType, sizeLabelValueOptions, genderLabelValueOptions } from 'src/utils/updateSelectOptions.js'
import notify from 'src/utils/notify.js'
import an_validator from 'an-validator';
const { rules, createI18nRules } = an_validator

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
const articleImageMaxAmount = imageConfigs.articleImage.maxAmount
const articleForm = reactive(JSON.parse(JSON.stringify(props.article)))
const images = ref(JSON.parse(JSON.stringify(props.images)) || []);

const handleClose = () => {
  emit('close')
}
const handleSubmit = () => {
  // isSubmiting.value = true
  emit('articleSubmit', articleForm, images.value);
}

const onFileRejected = async (rejectedEntries) => {
  if (rejectedEntries[0].failedPropValidation === "max-file-size") {
    await notify({ success: false, message: { title: t("maxImageSize", { size: imageConfigs.articleImage.maxFileSize }) } })
  }
  await notify({ success: false, message: { title: "image formatfail" } })
}

const datePickerRef = ref(null)
const dateOptions = (date) => {
  return new Date(date) <= new Date();
}

const uploaderRef = ref(null)
const updateRewardAmount = (value) => {
  if (!value) {
    articleForm.rewardAmount = 0;
  }
}

const breedOptions = ref([]);
const colorOptions = ref([]);
const handleChangePetType = (value) => {
  const { breedOptions: updatedBreedOptions, colorOptions: updatedColorOptions, updatedBreed, updatedColor } = changePetType(value, articleForm);
  breedOptions.value = updatedBreedOptions;
  colorOptions.value = updatedColorOptions;
  articleForm.breed = updatedBreed;
  articleForm.color = updatedColor;
}

const ageMin = articleConfigs.age.min
const ageMax = articleConfigs.age.max

const sizeOptions = sizeLabelValueOptions
const genderOptions = genderLabelValueOptions

const cityOptions = computed(() => {
  return Object.keys(cityCodeToNameMap).map(code => ({
    label: cityCodeToNameMap[code],
    value: code
  }));
});

const districtOptions = ref([]);
const updateDistrictOptions = (cityCode) => {
  districtOptions.value = cityCodeToAreaList[cityCode]?.map(district => district) || [];
  // 對應不到再清空，不然初始化就會把原有值被清空
  if (!districtOptions.value.includes(articleForm.lostDistrict)) {
    articleForm.lostDistrict = ""
  }
};

const titleMinLength = articleConfigs.title.minLength
const titleMaxLength = articleConfigs.title.maxLength
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

onMounted(() => {
  handleChangePetType(articleForm.petType)
  updateDistrictOptions(articleForm.lostCityCode)
})
</script>

<style lang='sass' scoped>
.q-form
  margin: 20px
  max-width: 800px

.q-btn
  margin-top: 20px

.center-circle
  position: relative
  display: flex
  justify-content: center
  align-items: center
  width: 100px /* Adjust the size as needed */
  height: 100px
  margin: auto


.marker-image
  width: 80px !important
  height: 80px !important
  border-radius: 40px !important
  border: 2px solid white


.image-item
  display: flex
  flex-direction: column
  justify-content: space-between /* Ensure checkbox and button are at the bottom */
  height: 100% /* Make the container fill the available space */
  padding: 8px
  box-sizing: border-box


.q-img
  object-fit: contain /* Ensure the image scales to fit without distortion */
  display: flex
  align-items: center /* Center image vertically */
  justify-content: center /* Center image horizontally */
  max-height: 200px /* Optional: set a maximum height */
  width: 100%


.image-actions
  width: 100% /* Ensure actions take up full width */

</style>
