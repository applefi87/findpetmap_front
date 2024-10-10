import { route } from 'quasar/wrappers'
import { useUserStore } from 'stores/user';
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */



export default route(function ({ ssrContext }) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  function requireLogin(to, from, next) {
    let users
    if (process.env.SERVER) {
      users = ssrContext
    } else {
      users = useUserStore();
    }
    if (!!users?.token) {
      next();
    } else {
      next({ path: '/' });
    }
  }

  function requireNotLogin(to, from, next) {
    let users
    if (process.env.SERVER) {
      users = ssrContext
    } else {
      users = useUserStore();
    }
    if (!users?.token) {
      next();
    } else {
      next({ path: '/' });
    }
  }

  const routes = [
    {
      path: '/article',
      displayName: 'articleRoute',
      name: 'articleRoute',
      component: () => import('layouts/MainLayout.vue'),
      children: [
        { path: '', name: "notFound", redirect: '/' },
        // { path: '', name: 'articles', displayName: 'articles', component: () => import('src/pages/article/ArticleListPage.vue') },
        { path: 'create', name: 'createArticle', displayName: 'createArticle', component: () => import('src/pages/article/CreateArticlePage.vue'), beforeEnter: requireLogin },
        { path: ':id', name: 'articleDetail', displayName: 'articleDetail', component: () => import('src/pages/article/ArticleDetailPage.vue') },
      ]
    },
    {
      path: '/',
      displayName: 'homeRoute',
      name: 'homeRoute',
      component: () => import('layouts/MainLayout.vue'),
      children: [
        { path: '', name: 'home', displayName: 'home', component: () => import('src/pages/HomePage.vue') },
        { path: 'forgetPWD', name: 'forgetPWD', displayName: 'forgetPWD', component: () => import('src/pages/user/ForgetPWDPage.vue'), beforeEnter: requireNotLogin },
      ]
    },
    {
      path: '/me',
      displayName: 'me',
      name: 'me',
      component: () => import('layouts/MainLayout.vue'),
      children: [
        { path: '', name: 'userInfo', displayName: 'userInfo', component: () => import('src/pages/user/SettingPage.vue') },
        { path: 'article', name: 'myArticle', displayName: 'myArticle', component: () => import('src/pages/article/ArticleListPage.vue') },
        { path: 'changePWD', name: 'changePWD', displayName: 'changePWD', component: () => import('src/pages/user/ChangePWDPage.vue') }],
      beforeEnter: requireLogin
    },
    // Handle 404 errors with ErrorNotFound component
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: () => import('src/pages/ErrorNotFound.vue')
    }
  ]

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })


  return Router
})
