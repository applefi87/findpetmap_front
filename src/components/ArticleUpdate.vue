<!-- 編輯文章的介面 -->
<template>
  <div>
    <ArticleForm :article="articleForm" :images="images" :isSubmiting="isSubmiting" :isUpdate="true"
      @articleSubmit="handleUpdateArticle" @close="handleClose" style="width:90vw" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeMount } from 'vue'
import { useI18n } from 'vue-i18n'
import ArticleForm from 'src/components/ArticleForm.vue';
import notify from 'src/utils/notify.js'
import * as articleService from 'src/services/articleService.js';

const emit = defineEmits(['articleUpdate', "close"]);
const props = defineProps({
  article: {
    type: Object,
    required: true,
  },
})
const articleForm = reactive(JSON.parse(JSON.stringify(props.article)))
const images = ref([]);

const isSubmiting = ref(false)
// const users = useUserStore();
const { t } = useI18n({ useScope: 'global' })

const handleUpdateArticle = async (articleForm, images) => {
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
    // 抓 images 為了處理要保留那些舊有圖片&是否有調整預覽圖片
    const res = await articleService.updateArticle(props.article._id, articleForm, images)
    if (res.success) {
      for (const image of images) {
        // 只有新圖片才需要上傳(不會有id)
        if (!image.id) {
          const formData = new FormData()
          formData.append('image', image.file)
          formData.append('isPreview', image.isPreview)
          await articleService.uploadImage(props.article._id, formData)
        }
      }
      await notify(res)
      emit('articleUpdate')
    }
  } catch (error) {
    await notify(error)
  } finally {
    isSubmiting.value = false
  }
}

const handleClose = () => {
  emit('close')
}
// 部分要放入介面的先跑
onBeforeMount(() => {
  // 經緯相反
  const articleCoordinates = props.article?.location.coordinates
  articleForm.coordinates = JSON.stringify([articleCoordinates[1], articleCoordinates[0]])
  articleForm.lostDate = props.article?.lostDate ? new Date(props.article?.lostDate).toISOString().slice(0, 10).replace(/-/g, '/') : null
  // 預先把舊圖片的放到選擇的元件裡
  if (props.article?.images?.length > 0) {
    props.article?.images.forEach(image => {
      images.value.push({
        previewUrl: `https://production-petfinder-private.s3.ap-northeast-1.amazonaws.com/${image.fullPath}`, // Preview URL for displaying the image
        isPreview: image.isPreview,
        id: image._id
      })
    });
  }
})
onMounted(() => {

})
</script>
