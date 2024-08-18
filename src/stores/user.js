import { defineStore } from 'pinia';
import initInterfaceLanguage from "src/utils/initInterfaceLanguage.js"
import { getReorderLanguagesObjByPlainArr, languagesListObj2str } from "src/utils/languageListTool.js"
import { updateDataToLocalStorageAndCookie, removeCookie } from 'src/utils/updateLocalStorageCookies.js'

const initUsersState = {
  // 跟登入無關
  loginDisplayState: false,
  //
  token: "",
  _id: null,
  nickname: null,
  role: null,
  score: 0,
  badges: [],
  profileImageUrl: null,
  interfaceLanguage: [],
  publishLanguages: [],
  searchLanguages: languagesListObj2str(getReorderLanguagesObjByPlainArr()),
  notifications: []
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
      updateDataToLocalStorageAndCookie("interfaceLanguage", userInfo.interfaceLanguage);
      updateDataToLocalStorageAndCookie("searchLanguages", userInfo.searchLanguages)
      updateDataToLocalStorageAndCookie("publishLanguages", userInfo.publishLanguages)
    },
    clearLocalStorageAndCookie() {
      removeCookie("interfaceLanguage")
      removeCookie("searchLanguages")
      removeCookie("publishLanguages")
      removeCookie("token")
      localStorage.removeItem("users")
    },
    markAllNotiSeen() {
      this.notifications.forEach(notification => {
        notification.state = 'seen';
      });
    },
    markNotiRead(id) {
      const notification = this.notifications.find(n => n._id === id);
      if (notification) {
        notification.state = 'read';
      }
    },
    markAllNotiRead() {
      this.notifications.forEach(notification => {
        notification.state = 'read';
      });
    }
  },
  persist: {
    key: 'users'
  }
})
