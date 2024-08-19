<!-- 編輯文章的介面 -->
<template>
  <div>
    <q-editor ref="editableContent" v-model="inputContent" @update:model-value="val => emits('input', val)"
      :toolbar="toolbarOptions($q, t)" @paste="evt => handlePasteCapture(evt)" style="min-height: 20rem">
      <template v-slot:colorSelector>
        <color-selector @colorChanged="onColorChanged" />
      </template>
    </q-editor>
    <input type="file" ref="fileInput" @change="evt => handleFileChange(evt, t)" style="display: none" accept="image/*">
    <q-btn :label="t('uploadImage')" @click="triggerFileUpload" />
  </div>
</template>

<script setup>
import { ref, onMounted, } from 'vue'
import { useI18n } from 'vue-i18n'
import ColorSelector from './ColorSelector.vue';
import { pasteCapture } from 'src/utils/image_PasteCapture.js'
import { processImage } from 'src/utils/image.js'
import toolbarOptions from 'src/utils/editorOptions.js'
import notify from 'src/utils/notify.js'
const { t } = useI18n({ useScope: 'global' })

const props = defineProps({
  content: {
    type: String,
    default: ''
  }
})
const emits = defineEmits(["input"])

let inputContent = ref("")
onMounted(() => {
  inputContent.value = props.content || ""
  emits('input', inputContent.value)
})
const editableContent = ref(null)
const fileInput = ref(null)

let pasteInProgress = false;

const handlePasteCapture = async (evt) => {
  if (pasteInProgress) {
    notify(t("articleObj.waitPaste"))
    return;
  }
  pasteInProgress = true;
  try {
    const imageUrl = await pasteCapture(evt, "draft", t);
    if (imageUrl) {
      insertURLIntoContent(imageUrl);
    }
  } finally {
    pasteInProgress = false;
  }
}


const handleFileChange = async (evt, t) => {
  const file = evt.target.files[0];
  if (file) {
    const imageUrl = await processImage(file, "draft", t);
    if (imageUrl) {
      insertURLIntoContent(imageUrl);
    }
  }
}

const insertURLIntoContent = (imageUrl) => {
  const editor = editableContent.value;
  const imgTag = `<img style="max-width:100%;" src="${imageUrl}" />`;
  editor.runCmd("insertHTML", imgTag);
}

const triggerFileUpload = () => {
  fileInput.value.click();
}
// Deal with colorSelector
function onColorChanged({ command, color }) {
  editableContent.value.runCmd(command, color);
  editableContent.value.focus();
}

</script>
<style lang="sass" scoped>
.q-editor
  &:deep(.q-editor__content)
    max-height: 85vh
.my-picker
  max-width: 150px
</style>
