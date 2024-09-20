<template>
  <q-dialog v-model="isDialogVisible" :maximized="$q.platform.is.mobile" @before-hide="handleBeforeHide">
    <q-card :style="{ maxWidth: '820px' }">
      <q-bar style="background: transparent; position: sticky; top: 0; z-index: 1;">
        <q-space />
        <q-btn dense flat icon="close" v-close-popup @click="handleClose" size="lg">
          <q-tooltip>{{ t('close') }}</q-tooltip>
        </q-btn>
      </q-bar>

      <!-- Lazy loaded article detail component -->
      <ArticleDetail v-if="articleId" :articleId="articleId" @articleDeleted="handleArticleDeleted"
        @updateArticleList="handleUpdateArticleList" @backPage="handleBackPage" />
    </q-card>
  </q-dialog>
</template>

<script setup>
import { defineProps, defineEmits, computed, defineAsyncComponent } from 'vue';
import { useI18n } from 'vue-i18n'
import ArticleDetail from 'components/ArticleDetail.vue';
const { t } = useI18n({ useScope: 'global' });

// Props accepted by the component
const props = defineProps({
  articleId: {
    type: String,
    required: true,
  },
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
});

const isDialogVisible = computed(() => { return props.isDialogVisible })
// Define events that the component will emit
const emit = defineEmits(['update:isDialogVisible', 'articleDeleted', 'updateArticleList', 'backPage']);

// Handles dialog close button
const handleClose = () => {
  emit('update:isDialogVisible', false); // Emit to close the dialog
};

// Emit before-hide event
const handleBeforeHide = () => {
  emit('backPage'); // Emit a custom event to notify the parent about the page navigation
};

// Handles article deleted event
const handleArticleDeleted = () => {
  emit('articleDeleted'); // Emit article deleted event
};

// Handles article list update event
const handleUpdateArticleList = (updatedList) => {
  emit('updateArticleList', updatedList); // Emit the updated article list
};

// Handles back navigation (can be customized further)
const handleBackPage = () => {
  emit('backPage'); // Emit back page event to parent
};
</script>

<style scoped>
/* Scoped styles for the component (optional) */
</style>
