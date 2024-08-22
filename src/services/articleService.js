import { api, apiAuth } from 'src/boot/axios';

export async function createArticle(form) {
  try {
    return await apiAuth.post('/article/create', JSON.parse(JSON.stringify(form)))
  } catch (error) {
    console.log("article-err");
    throw error
  }
}

export const getArticleByRegion = async (bottomLeft, topRight) => {
  return await api.post('/article/', {
    bottomLeft,
    topRight
  })
};


// export async function editArticle(id, form) {
//   try {
//     const res = await apiAuth.post(`/article/edit/${id}`, form)
//     return res
//   } catch (error) {
//     console.log("article-err");
//     throw error
//   }
// }
// export async function deleteArticle(id) {
//   try {
//     const res = await apiAuth.delete(`/article/${id}`)
//     return res
//   } catch (error) {
//     console.log("article-err");
//     throw error
//   }
// }

// export async function getArticleDetail(articleId, skip,
//   limit, navigationParams) {
//   try {
//     // apiAuth為了取他是否有按讚
//     const res = await apiAuth.post(`/article/${articleId}`, {
//       skip,
//       limit,
//       ...navigationParams
//     })
//     return res
//   } catch (error) {
//     console.log("article-err");
//     throw error
//   }
// }


// export async function getArticleList(filter, lang, skip, limit, navigationParams) {
//   try {
//     // const lang = langObj.map(o => o.value);
//     const res = await apiAuth.post('/article/', {
//       filter,
//       lang,
//       skip,
//       limit,
//       // ...navigationParams
//     });
//     return res;
//   } catch (error) {
//     console.log('article-err');
//     throw error;
//   }
// }
