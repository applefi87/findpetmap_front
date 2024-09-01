<!-- 新增文章的介面 -->
<template>
  <q-page class="q-pa-md">
    <ArticleForm :article="articleForm" :images="images" :isSubmiting="isSubmiting"
      @articleSubmit="handleCreatArticle" />
  </q-page>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import ArticleForm from 'src/components/ArticleForm.vue';
import notify from 'src/utils/notify.js'
import * as  articleService from 'src/services/articleService.js';

const router = useRouter()
// const users = useUserStore();
const { t } = useI18n({ useScope: 'global' })

const emit = defineEmits(["close"]);

// const articleForm = reactive({
// title: "",
//   petType: '',
//   color: '',
//   gender: '',
//   size: '',
//   age: null,
//   hasMicrochip: false,
//   hasReward: false,
//   rewardAmount: 0,
//   lostDate: '',
//   lostCityCode: '',
//   lostDistrict: '',
//   coordinates: "",
//   content: '',
// })
const articleForm = reactive({
  title: "寶貝名",
  petType: '貓',
  breed: "波斯貓",
  color: '黑',
  gender: 'F',
  size: 'M',
  age: 1.5,
  hasMicrochip: false,
  hasReward: false,
  rewardAmount: 0,
  lostDate: "2024/08/10",
  lostCityCode: 'A',
  lostDistrict: '內湖區',
  coordinates: "[25.07603715,121.58028603]",
  content: '我的狗不建了',
})

const images = ref([]);
const isSubmiting = ref(false);

const handleClose = () => {
  emit('close')
}

const handleCreatArticle = async (articleForm, images) => {
  try {
    isSubmiting.value = true
    if (images.length === 0) {
      notify({ message: t('atLeastUploadOneImage'), color: 'negative' });
      return;
    }
    if (!images.some(img => img.isPreview)) {
      notify({ message: t('mustSelectPreviewImage'), color: 'negative' });
      return;
    }
    // Create the article first
    const res = await articleService.createArticle(articleForm)
    if (res.success) {
      // Upload each image
      for (const image of images) {
        const formData = new FormData()
        formData.append('image', image.file)
        formData.append('isPreview', image.isPreview)
        await articleService.uploadImage(res.data._id, formData)
      }
      await notify(res)
      router.push("/article/" + res.data._id)
    }
  } catch (error) {
    await notify(error)
  } finally {
    isSubmiting.value = false
  }
}
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
