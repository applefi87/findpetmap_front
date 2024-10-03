<!-- 註冊框 -->
<template>
  <q-dialog>
    <q-card>
      <div class="text-h4">{{ t('contactUs:') }}</div>
      <div class="text-h5">{{ t('bugReport') }}</div>
      <div class="text-body-1">
        FB:
        <a href="https://www.facebook.com/profile.php?id=61564180080937&locale=zh_TW" target="_blank"
          rel="noopener noreferrer">
          {{ t('petFinder') }}
        </a>
      </div>
      <div class="text-body-1">applefi87@gmail.com</div>
    </q-card>
  </q-dialog>
</template>

<script setup>
// Imports and initializations
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<style lang="sass" scoped>
.dialog-content
  padding: 20px
  text-align: center
  background: #fff

.text-h2
  margin-bottom: 20px
  font-weight: bold

.text-body-1
  margin-bottom: 15px
  font-size: 16px

a
  color: #1e88e5
  text-decoration: none

a:hover
  text-decoration: underline

/* Optional: Style for the email text */
.text-body-1:last-child
  font-style: italic
</style>
