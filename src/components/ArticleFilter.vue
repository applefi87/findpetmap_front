<template>
  <div>
    <!-- Button to toggle the dialog -->
    <q-btn @click="toggleDialog" :label="t('filter')" color="primary" />

    <!-- Full-screen Dialog for the filter -->
    <q-dialog v-model="isDialogOpen" full-width full-height>
      <q-card>
        <q-card-section class="row justify-between">
          <div>{{ t('filter') }}</div>
          <q-btn icon="close" flat @click="toggleDialog" />
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="applyFilter">
            <!-- Pet Type Checkbox and Select -->
            <q-checkbox v-model="includePetType" :label="t('filterPetType')" @change="resetPetTypeFilter" />
            <q-select v-model="filter.petType" :options="articleConfigs.petType" :label="t('petType')"
              :rules="includePetType ? createI18nRules(rules.createMustInputRules, t) : []" :disable="!includePetType"
              @update:model-value="updateColorOptions" />

            <!-- Color Checkbox and Select -->
            <q-checkbox v-model="includeColor" :label="t('filterColor')" @change="resetColorFilter" />
            <q-select v-model="filter.color" :options="colorOptions" :label="t('color')"
              :rules="includeColor ? createI18nRules(rules.createMustInputRules, t) : []" :disable="!includeColor" />

            <!-- Lost Date Checkbox and Date Picker -->
            <q-checkbox v-model="includeLostDate" :label="t('filterLostDate')" @change="resetLostDateFilter" />
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

            <!-- Buttons -->
            <div class="row justify-end q-mt-md">
              <q-btn @click="applyFilter" :label="t('search')" type="submit" color="primary" />
              <q-btn @click="resetFilter" :label="t('reset')" color="secondary" flat />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import articleConfigs from 'src/infrastructure/configs/articleConfigs.js';
import an_validator from 'an-validator';
const { rules, createI18nRules } = an_validator

const { t } = useI18n({ useScope: 'global' })
const emit = defineEmits(['updateFilter']);

const datePicker = ref(null);

// State for dialog visibility
const isDialogOpen = ref(false);

// Function to toggle dialog visibility
const toggleDialog = () => {
  isDialogOpen.value = !isDialogOpen.value;
};


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
  emit('updateFilter', finalFilter);
  isExpanded.value = false;
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
  isExpanded.value = false;
}
</script>
