<template>
  <q-form @submit.prevent="applyFilter">
    <q-checkbox v-model="includePetType" label="Filter by Pet Type" @change="resetPetTypeFilter" />

    <q-select v-model="filter.petType" :options="articleConfigs.petType" :label="t('petType')"
      :rules="includePetType ? createI18nRules(rules.createMustInputRules, t) : []" :disable="!includePetType"
      @update:model-value="updateColorOptions" />

    <q-checkbox v-model="includeColor" label="Filter by Color" @change="resetColorFilter" />

    <q-select v-model="filter.color" :options="colorOptions" :label="t('color')"
      :rules="includeColor ? createI18nRules(rules.createMustInputRules, t) : []" :disable="!includeColor" />

    <q-checkbox v-model="includeLostDate" label="Filter by Lost Date" @change="resetLostDateFilter" />

    <div class="q-pa-md" style="max-width: 300px">
      <q-input filled v-model="filter.lostDate" mask="date" :rules="includeLostDate ? ['date'] : []"
        :label="t('lostDate')" :disable="!includeLostDate">
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy ref="datePicker" cover transition-show="scale" transition-hide="scale">
              <q-date v-model="filter.lostDate" @update:model-value="() => { datePicker.hide() }">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup :label="t('close')" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>

    <q-btn :label="t('search')" type="submit" color="primary" />
    <q-btn @click="resetFilter" :label="t('reset')" color="secondary" flat />
  </q-form>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import anv from 'an-validator';
import articleConfigs from 'src/infrastructure/configs/articleConfigs.js';
const { rules, createI18nRules } = anv

const { t } = useI18n({ useScope: 'global' })
const emit = defineEmits(['updateFilter']);

const datePicker = ref(null);

const filter = ref({});
const includePetType = ref(false);
const includeColor = ref(false);
const includeLostDate = ref(false);

const colorOptions = ref([]);
const updateColorOptions = (petType) => {
  filter.value.color = ""
  if (petType === '貓') {
    colorOptions.value = articleConfigs.catColorEnum;
  } else if (petType === '狗') {
    colorOptions.value = articleConfigs.dogColorEnum;
  } else {
    colorOptions.value = [];
  }
};

const applyFilter = () => {
  const finalFilter = { ...filter.value };
  if (!includePetType.value) delete finalFilter.petType;
  if (!includeColor.value) delete finalFilter.color;
  if (!includeLostDate.value) delete finalFilter.lostDate;
  console.log("emit updateFilter:", finalFilter);
  emit('updateFilter', finalFilter);
};

function resetPetTypeFilter() {
  if (!includePetType.value) filter.value.petType = null;
}

function resetColorFilter() {
  if (!includeColor.value) filter.value.color = null;
}

function resetLostDateFilter() {
  if (!includeLostDate.value) filter.value.lostDate = null;
}

function resetFilter() {
  filter.value = {};
  includePetType.value = true;
  includeColor.value = true;
  includeLostDate.value = true;
  applyFilter();
}
</script>
