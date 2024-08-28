import { useUserStore } from 'stores/user';

function requireAdmin(to, from, next) {
  const users = useUserStore();
  // 後端才檢查要有登入
  if (users.role === 'admin' || typeof window === "undefined") {
    next();
  } else {
    next({ path: '/' });
  }
}

function requireLogin(to, from, next) {
  const users = useUserStore();
  // 後端才檢查要有登入
  if (!!users.token || typeof window !== "undefined") {
    next();
  } else {
    next({ path: '/' });
  }
}

function requireNotLogin(to, from, next) {
  const users = useUserStore();
  // 後端才檢查要有登入
  if (!users.token || typeof window === "undefined") {
    next();
  } else {
    next({ path: '/' });
  }
}


const routes = [
  {
    path: '/article/',
    displayName: 'articleRoute',
    name: 'articleRoute',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      // { path: '', name: 'articles', displayName: 'articles', component: () => import('src/pages/article/ArticleListPage.vue') },
      { path: 'create', name: 'createArticle', displayName: 'createArticle', component: () => import('src/pages/article/CreateArticlePage.vue'), beforeEnter: requireLogin },
      { path: ':id', name: 'articleDetail', displayName: 'articleDetail', component: () => import('src/pages/article/ArticleDetailPage.vue') },
      // { path: 'edit/:id', name: 'articleEdit', displayName: 'articleDetail', component: () => import('src/components/ArticleUpdate.vue') }
    ]
  },
  {
    path: '/',
    displayName: 'home',
    name: 'home',
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
      // { path: '', name: 'userInfo', displayName: 'userInfo', component: () => import('src/pages/user/UserInfoPage.vue') },
      { path: '', name: 'userInfo', displayName: 'userInfo', component: () => import('src/pages/user/SettingPage.vue') },
      { path: 'changePWD', name: 'changePWD', displayName: 'changePWD', component: () => import('src/pages/user/ChangePWDPage.vue') },
      // { path: 'edit', name: 'editMe', displayName: 'editMe', component: () => import('src/pages/user/EditInfoPage.vue') },
    ],
    beforeEnter: requireLogin
  },
  // Handle 404 errors with ErrorNotFound component
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    component: () => import('src/pages/ErrorNotFound.vue')
  }
]

export default routes
