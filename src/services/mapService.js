import { api, apiAuth } from 'src/boot/axios.js';


export const apiCallToPostRegion = async (bottomLeft, topRight) => {
  return await api.post('/article/', {
    bottomLeft,
    topRight
  })
};
