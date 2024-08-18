import { languageOptions } from 'src/infrastructure/configs/languageOptions.js'

export function getReorderLanguagesObjByPlainArr(defaultLanguages) {
  if (!defaultLanguages || defaultLanguages.length < 1) return languageOptions
  return [...languageOptions].sort((a, b) => {
    const aIndex = defaultLanguages.indexOf(a.value);
    const bIndex = defaultLanguages.indexOf(b.value);

    if (aIndex === -1 && bIndex === -1) {
      return 0;
    } else if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    } else {
      return aIndex !== -1 ? -1 : 1;
    }
  });
}
export function languagesListObj2str(languagesObj) {
  return languagesObj.map(o => o.value)
}
export function languagesListstr2Obj(languagesStr) {
  // console.log(languagesStr);
  return languagesStr.map((language) => {
    return languageOptions.find((opt) => opt.value === language);
  });
}
