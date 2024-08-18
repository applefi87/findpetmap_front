import { store } from 'quasar/wrappers'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default store(() => {
  const pinia = createPinia()
  if (!import.meta.env.SSR) {
    // Only use piniaPluginPersistedstate on the client side
    pinia.use(piniaPluginPersistedstate);
    // if you set manualStoreHydration: true, uncomment below:
    // if (window.__INITIAL_STATE__) {
    //   //   // manualStoreHydration
    //   pinia.state.value = window.__INITIAL_STATE__;
    // }
  }
  return pinia;
})
