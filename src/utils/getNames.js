
import { useUserStore } from 'stores/user';


export default function (name) {
  const users = useUserStore()
  if (!name) return "";
  // currently set lgnore without interfaceLanguage/searchLanguages version,
  // Because server will auto handle it. Even user clear all, the runing web still store the data.
  if (name[users.interfaceLanguage]) return name[users.interfaceLanguage]
  // old version
  // for (const lang of users.searchLanguages) {
  //   if (name[lang.value]) {
  //     return name[lang.value];
  //   }
  // }
  // new version that users.searchLanguages each is string not object
  for (const lang of users.searchLanguages) {
    if (name[lang]) {
      return name[lang];
    }
  }
  const keys = Object.keys(name);
  for (let i = 0; i < keys.length; i++) {
    if (name[keys[i]]) {
      return name[keys[i]]
    }
  }
  return "";
}
