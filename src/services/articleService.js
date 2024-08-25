import { api, apiAuth } from 'src/boot/axios';

export async function createArticle(form) {
  try {
    const sendForm = JSON.parse(JSON.stringify(form))
    console.log(form);
    const objectCoordinates = JSON.parse(sendForm.coordinates)
    sendForm.location = {
      type: "Point",
      // 後台統一是先經再緯
      coordinates: [objectCoordinates[1], objectCoordinates[0]]
    }
    delete sendForm.coordinates
    return await apiAuth.post('/article/create', sendForm)
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

export const uploadImage = async (articleId, formData) => {
  return await apiAuth.post(`/image/upload/article/${articleId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
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

export async function deleteArticle(id) {
  try {
    const res = await apiAuth.delete(`/article/${id}`)
    return res
  } catch (error) {
    console.log("article-err");
    throw error
  }
}

export async function getArticleDetail(articleId) {
  try {
    // apiAuth為了取他是否有按讚
    const res = await apiAuth.post(`/article/${articleId}`)
    return res
  } catch (error) {
    console.log("article-err");
    throw error
  }
}


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
