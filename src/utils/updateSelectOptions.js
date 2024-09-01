
import articleConfigs from "src/infrastructure/configs/articleConfigs";

const breedConfigEnum = {
  catEnum: articleConfigs.catBreedEnum,
  dogEnum: articleConfigs.dogBreedEnum
}

const colorConfigEnum = {
  catEnum: articleConfigs.catColorEnum,
  dogEnum: articleConfigs.dogColorEnum
}

export const updateOptions = (petType, configEnum, currentValue) => {
  let options = [];
  if (petType === '貓') {
    options = configEnum.catEnum;
  } else if (petType === '狗') {
    options = configEnum.dogEnum;
  } else {
    options = [];
  }
  // 對應不到再清空，不然初始化就會把原有值被清空
  const updatedValue = options.includes(currentValue) ? currentValue : "";
  return { options, updatedValue };
};

export const updateBreedOptions = (petType, currentBreed) => {
  const { options, updatedValue } = updateOptions(petType, breedConfigEnum, currentBreed);
  return { breedOptions: options, updatedBreed: updatedValue };
};

export const updateColorOptions = (petType, currentColor) => {
  const { options, updatedValue } = updateOptions(petType, colorConfigEnum, currentColor);
  return { colorOptions: options, updatedColor: updatedValue };
};

export const changePetType = (value, articleForm) => {
  if (!value) {
    return {
      breedOptions: [],
      colorOptions: [],
      updatedBreed: "",
      updatedColor: ""
    }
  }
  const { breedOptions, updatedBreed } = updateBreedOptions(value, articleForm?.breed);
  const { colorOptions, updatedColor } = updateColorOptions(value, articleForm?.color);
  return {
    breedOptions,
    colorOptions,
    updatedBreed,
    updatedColor
  };
};

export const createLabelValueOptionsByMap = (map) => {
  return Object.entries(map).map(([value, label]) => ({ label, value }));
}

export const sizeLabelValueOptions = createLabelValueOptionsByMap(articleConfigs.sizeMap)
export const genderLabelValueOptions = createLabelValueOptionsByMap(articleConfigs.genderMap)
