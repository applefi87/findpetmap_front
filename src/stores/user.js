import { defineStore } from 'pinia';
import { updateDataToLocalStorageAndCookie, removeCookie } from 'src/utils/updateLocalStorageCookies.js'

const initUsersState = {
  // 跟登入無關
  loginDisplayState: false,
  //
  token: "",
  _id: null,
  nickname: null,
  role: null,
  interfaceLanguage: [],
};

// Tested no need for using JSON.parse(JSON.stringify()) for all run the same

export const useUserStore = defineStore('user', {
  id: 'user',
  state() {
    return { ...initUsersState };
  },
  actions: {
    updateUser(userInfo) {
      this._id = userInfo._id;
      this.nickname = userInfo.nickname;
      this.badges = userInfo.badges
      this.profileImageUrl = userInfo.profileImageUrl
      this.role = userInfo.role;
      this.score = userInfo.score
      this.notifications = userInfo.notifications
      updateDataToLocalStorageAndCookie("token", userInfo.token)
      this.updateLanguages(userInfo)
    },
    extendToken(token) {
      updateDataToLocalStorageAndCookie("token", token)
    },
    updateLanguages(userInfo) {
      updateDataToLocalStorageAndCookie("interfaceLanguage", userInfo.interfaceLanguage || this.interfaceLanguage);
    },
    clearLocalStorageAndCookie() {
      removeCookie("interfaceLanguage")
      removeCookie("searchLanguages")
      removeCookie("publishLanguages")
      removeCookie("token")
      localStorage.removeItem("users")
    },
  },
  persist: {
    key: 'users'
  }
})
