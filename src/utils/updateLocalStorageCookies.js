import { useUserStore } from 'src/stores/user'
import { Cookies } from 'quasar'




export function updateDataToLocalStorageAndCookie(key, data) {
  const users = useUserStore()
  users[key] = data
  if (data && typeof data === 'object') {
    const stringifyData = encodeURIComponent(JSON.stringify(data))
    Cookies.set(key, stringifyData, { expires: 365, path: '/', sameSite: 'Strict' })
  } else {
    Cookies.set(key, data, { expires: 365, path: '/', sameSite: 'Strict' })
  }
}


export function doesCookieExist(key) {
  const regex = new RegExp('(?:^|;\\s*)' + encodeURIComponent(key) + '=');
  return regex.test(decodeURIComponent(document.cookie));
}

export function removeCookie(key) {
  Cookies.remove(key, { path: '/', sameSite: 'Strict' })
}
