import { defineStore } from 'pinia';

export const useSSRStore = defineStore('ssr', {
  id: 'ssr',
  state() {
    return {
      // 跟登入無關
      articleDetailPage_datas: false,
      boardDetailPage_datas: false,
      articleListWithSearch_articles: false,
    };
  },
})
