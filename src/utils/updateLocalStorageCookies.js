import { useUserStore } from 'src/stores/user'
import { Cookies } from 'quasar'
import { normalCookieOptions } from 'src/utils/getCookieOption.js'



export function updateDataToLocalStorageAndCookie(key, data) {
  const users = useUserStore()
  users[key] = data
  if (data && typeof data === 'object') {
    const stringifyData = encodeURIComponent(JSON.stringify(data))
    Cookies.set(key, stringifyData, normalCookieOptions)
  } else {
    Cookies.set(key, data, normalCookieOptions)
  }
}


export function doesCookieExist(key) {
  // Create a regex to match the cookie by key
  const regex = new RegExp('(?:^|;\\s*)' + encodeURIComponent(key) + '=([^;]*)');
  // Match the cookie in the document.cookie string
  const match = regex.exec(decodeURIComponent(document.cookie));
  // Check if the cookie exists and has a defined, non-empty value
  return match !== null && match[1] !== "undefined" && match[1] !== '';
}

export function removeCookie(key) {
  Cookies.remove(key, normalCookieOptions)
}
