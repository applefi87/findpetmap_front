<template>
  test
  <q-layout view="hHh lpR fff">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style lang="sass" scoped>
/* Global styles */
body
  font-family: 'Roboto', sans-serif
  font-size: 14px
  color: #333

/* Quasar overrides */
.q-card
  margin-top: 10px

.q-page-container
  padding-top: 10px
  height: 100vh

/* Custom styles */
.custom-item
  background-color: #f5f5f5
  border-radius: 5px
  margin: 10px 0

.custom-label
  color: #333
  font-weight: 500
</style>
