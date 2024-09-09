import { useUserStore } from 'src/stores/user'
import { Cookies } from 'quasar'




export function updateDataToLocalStorageAndCookie(key, data) {
  const users = useUserStore()
  users[key] = data
  if (data && typeof data === 'object') {
    const stringifyData = encodeURIComponent(JSON.stringify(data))
    Cookies.set(key, stringifyData, { expires: 365, path: '/', sameSite: 'Strict', secure: true, domain: '.findpetmap.com' })
  } else {
    Cookies.set(key, data, { expires: 365, path: '/', sameSite: 'Strict', secure: true, domain: '.findpetmap.com' })
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
  Cookies.remove(key, { path: '/', sameSite: 'Strict' })
}
